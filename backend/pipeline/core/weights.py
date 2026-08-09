"""Adaptive weight engine — PRD §4.3.

All weights start at 1/9 ≈ 0.1111.
Three deviation rules may increase a signal's weight; excess is redistributed
proportionally from lowest-velocity signals.
"""
from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)

FACTOR_IDS = [
    "demand_reality", "erp_valuation", "retail_fomo", "m2_liquidity",
    "gpu_spot", "credit_spreads", "energy_costs", "data_wall", "narrative",
]
DEFAULT_WEIGHT = 1 / 9  # ≈ 0.1111


def _equal_weights() -> dict[str, float]:
    return {fid: DEFAULT_WEIGHT for fid in FACTOR_IDS}


def _redistribute(
    weights: dict[str, float],
    boosted_signal: str,
    new_weight: float,
    velocities: dict[str, Optional[float]],
) -> dict[str, float]:
    """
    Increase *boosted_signal* to *new_weight* and redistribute the excess
    proportionally from signals with the lowest absolute velocity.

    PRD ref: §4.3 — Redistribution logic.
    """
    excess = new_weight - weights[boosted_signal]  # positive = weight gain
    if excess <= 0:
        return weights

    others = {k: v for k, v in weights.items() if k != boosted_signal}

    # Sort others by absolute velocity (ascending → lowest velocity donors first)
    def abs_vel(fid: str) -> float:
        v = velocities.get(fid)
        return abs(v) if v is not None else 0.0

    sorted_others = sorted(others.keys(), key=abs_vel)
    total_other = sum(others.values())

    new_weights = dict(weights)
    new_weights[boosted_signal] = new_weight

    for k in sorted_others:
        # Subtract proportionally
        proportion = others[k] / total_other if total_other > 0 else 1 / len(others)
        new_weights[k] = max(0.01, others[k] - excess * proportion)

    # Normalize to ensure exact sum of 1.0
    total = sum(new_weights.values())
    return {k: v / total for k, v in new_weights.items()}


def compute_adaptive_weights(
    scores: dict[str, Optional[int]],
    velocities: dict[str, Optional[float]],
) -> dict[str, float]:
    """
    Apply deviation rules from PRD §4.3.
    Returns a weight dict that sums to 1.0 (within floating-point epsilon).
    """
    weights = _equal_weights()
    triggered: list[str] = []

    credit_score = scores.get("credit_spreads")
    credit_vel = velocities.get("credit_spreads")
    demand_score = scores.get("demand_reality")
    narrative_score = scores.get("narrative")

    # Rule 1: credit_spreads > 75 AND velocity_4wk > 10
    if credit_score is not None and credit_score > 75:
        if credit_vel is not None and credit_vel > 10:
            weights = _redistribute(weights, "credit_spreads", 0.20, velocities)
            triggered.append("credit_spreads→0.20 (score>75, vel>10)")

    # Rule 2: demand_reality > 80
    if demand_score is not None and demand_score > 80:
        weights = _redistribute(weights, "demand_reality", 0.18, velocities)
        triggered.append("demand_reality→0.18 (score>80)")

    # Rule 3: narrative > 70 — redistribute from energy_costs and data_wall
    if narrative_score is not None and narrative_score > 70:
        weights = _redistribute(weights, "narrative", 0.16, velocities)
        triggered.append("narrative→0.16 (score>70)")

    if triggered:
        logger.info(f"Adaptive weights triggered: {', '.join(triggered)}")
    else:
        logger.info("No adaptive weight deviation — using equal priors.")

    # Final sanity check: re-normalize
    total = sum(weights.values())
    if abs(total - 1.0) > 1e-6:
        weights = {k: v / total for k, v in weights.items()}

    return weights
