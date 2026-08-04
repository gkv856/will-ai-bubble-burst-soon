"""Shared scoring helpers used by every factor module."""
from __future__ import annotations

import logging
from functools import wraps
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
T = TypeVar("T")


def normalize_score(value: float, healthy_baseline: float, danger_threshold: float) -> int:
    """Converts a raw metric into a 0-100 risk score."""
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


def safe_execute(default_val: T) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator applying DRY try/except logic to a factor function."""
    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            try:
                return func(*args, **kwargs)
            except Exception as exc:
                logging.error(f"Error in {func.__name__}: {exc}")
                return default_val
        return wrapper
    return decorator
