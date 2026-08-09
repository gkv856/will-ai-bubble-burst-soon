"""Confidence interval calculation — PRD §4.6.

Base variance from weighted signal variances, multiplied by degradation
factors for stale data, missing signals, insufficient history, and
high correlation.
"""
from __future__ import annotations

import math
from typing import Optional


def compute_composite(
    scores: dict[str, Optional[int]],
    weights: dict[str, float],
    corr_penalty: float,
) -> dict:
    """
    PRD §4.5 — Weighted composite with renormalization for missing signals.
    """
    available = {fid: scores[fid] for fid in scores if scores[fid] is not None}

    if not available:
        return {
            "composite_score": None,
            "correlation_penalty": corr_penalty,
            "weights_used": weights,
            "signals_available": 0,
            "signals_total": len(scores),
        }

    if len(available) < len(scores):
        # Renormalize weights across available signals only
        avail_weight_sum = sum(weights[fid] for fid in available)
        weighted_sum = sum(
            available[fid] * (weights[fid] / avail_weight_sum)
            for fid in available
        )
    else:
        weighted_sum = sum(available[fid] * weights[fid] for fid in available)

    composite = weighted_sum + corr_penalty
    composite = min(max(composite, 0), 100)  # clamp

    return {
        "composite_score": round(composite, 1),
        "correlation_penalty": round(corr_penalty, 2),
        "weights_used": weights,
        "signals_available": len(available),
        "signals_total": len(scores),
    }


def compute_confidence_interval(
    composite_score: float,
    base_variance: float,
    stale_count: int,
    missing_count: int,
    history_weeks: int,
    corr_penalty: float,
) -> dict:
    """
    PRD §4.6 — Apply degradation multipliers to widen the CI honestly.

    Multipliers:
        1.5× per stale signal
        2.0× per missing signal
        3.0× if < 12 weeks of history
        1.3× if correlation penalty > 5
    """
    multiplier = 1.0
    multiplier *= 1.5 ** stale_count
    multiplier *= 2.0 ** missing_count

    if history_weeks < 12:
        multiplier *= 3.0
    if corr_penalty > 5:
        multiplier *= 1.3

    # Guard: base_variance must be >= 1 so we never produce absurdly narrow CIs
    effective_variance = max(base_variance, 1.0)
    std_dev = math.sqrt(effective_variance) * multiplier

    lower = max(0.0, composite_score - 1.96 * std_dev)
    upper = min(100.0, composite_score + 1.96 * std_dev)

    return {
        "lower": round(lower, 1),
        "upper": round(upper, 1),
        "std_dev": round(std_dev, 2),
        "degradation_multiplier": round(multiplier, 2),
        "confidence_level": "95%",
    }


def compute_base_variance(scores: dict[str, Optional[int]], weights: dict[str, float]) -> float:
    """
    Weighted sum of individual signal score uncertainties.
    We use score / 50 as a rough proxy for variance (higher score = more uncertain regime).
    In production this would use rolling 12-week score variance from the DB.
    """
    total_var = 0.0
    for fid, score in scores.items():
        if score is not None:
            # Proxy: assume variance proportional to distance from neutral (50)
            signal_variance = (abs(score - 50) / 50) * 25.0  # 0..25 range
            total_var += weights.get(fid, 1 / 9) * signal_variance
    return max(total_var, 1.0)
