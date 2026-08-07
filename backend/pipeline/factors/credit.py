"""FACTOR 2: Credit spreads (FRED)."""
from __future__ import annotations

from ..clients.fred import get_fred_data, get_fred_series
from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_credit_risk() -> int:
    credit_spread = get_fred_data("BAMLC0A0CM")
    return normalize_score(credit_spread, healthy_baseline=3.5, danger_threshold=5.5)


@safe_execute(default_val={})
def get_credit_risk_series(days: int = 14) -> dict[str, int]:
    """Daily credit spread scores from FRED BAMLC0A0CM (published daily)."""
    series = get_fred_series("BAMLC0A0CM", days=days)
    return {
        date_str: normalize_score(val, healthy_baseline=3.5, danger_threshold=5.5)
        for date_str, val in series.items()
    }
