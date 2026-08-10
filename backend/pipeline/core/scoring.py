"""Core scoring utilities — percentile-rank normalization + velocity.

Replaces the old linear normalize_score() with proper rolling percentile rank
as specified in PRD §4.1 and §4.2.
"""
from __future__ import annotations

import logging
from functools import wraps
from typing import Callable, Optional, ParamSpec, TypeVar

import numpy as np
from tenacity import retry, stop_after_attempt, wait_exponential

P = ParamSpec("P")
T = TypeVar("T")

logger = logging.getLogger(__name__)


# ── Percentile-rank normalization ─────────────────────────────────────────────

def percentile_rank_score(
    current_value: float,
    history: list[float],
    invert: bool = False,
) -> int:
    """
    Normalize *current_value* using rolling percentile rank against *history*.

    Args:
        current_value: The raw metric reading for this period.
        history: Ordered list of historical raw values (oldest first).
                 Should cover up to 5 years (260 weeks). Must have >= 2 entries.
        invert: If True, HIGH value → LOW risk (e.g. ERP, demand ratio).
                If False, HIGH value → HIGH risk (e.g. credit spreads, FOMO).

    Returns:
        Integer in [0, 100]. 100 = highest risk.

    PRD ref: §4.1 — `score = 100 - percentile_rank(value, window=5yr)` for inverted signals.
    """
    if not history or len(history) < 2:
        return 50  # not enough data — neutral

    arr = np.array(history, dtype=float)

    # Standard percentile rank with tie-handling (fractional ranking)
    count_lt = int(np.sum(arr < current_value))
    count_eq = int(np.sum(arr == current_value))
    percentile = (count_lt + 0.5 * count_eq) / len(arr) * 100  # 0..100

    score = 100 - percentile if invert else percentile
    return int(np.clip(round(score), 0, 100))


# ── Velocity ──────────────────────────────────────────────────────────────────

def compute_velocity(scores: list[float], weeks: int) -> Optional[float]:
    """
    Rate of change of scores over *weeks* periods.

    PRD ref: §4.2
        scores: ordered oldest-first. Last element is current.
        Returns percentage change, or None if insufficient data.
    """
    if len(scores) < weeks + 1:
        return None
    current = scores[-1]
    past = scores[-(weeks + 1)]
    if past == 0:
        return None
    return round((current - past) / abs(past) * 100, 2)


# ── Safe executor decorator ───────────────────────────────────────────────────

def safe_execute(default_val: T) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator — catches all exceptions and returns *default_val* on failure, after retrying 3 times."""
    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        # Inner retry-wrapped function that will raise RetryError if it exhausts attempts
        @retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            reraise=True
        )
        def _retriable_func(*args: P.args, **kwargs: P.kwargs) -> T:
            return func(*args, **kwargs)

        @wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            try:
                return _retriable_func(*args, **kwargs)
            except Exception as exc:
                logger.error(f"Error in {func.__name__} after retries: {exc}")
                return default_val
        return wrapper
    return decorator


# ── Legacy shim ───────────────────────────────────────────────────────────────
# Old factor modules called normalize_score(value, healthy_baseline, danger_threshold).
# Keep this so nothing breaks if old code is still present during migration.

def normalize_score(value: float, healthy_baseline: float, danger_threshold: float) -> int:
    """Legacy linear normalizer. Preserved for backward compatibility."""
    if healthy_baseline < danger_threshold:
        if value <= healthy_baseline:
            return 0
        if value >= danger_threshold:
            return 100
        return int(((value - healthy_baseline) / (danger_threshold - healthy_baseline)) * 100)
    else:
        if value >= healthy_baseline:
            return 0
        if value <= danger_threshold:
            return 100
        return int(((healthy_baseline - value) / (healthy_baseline - danger_threshold)) * 100)
