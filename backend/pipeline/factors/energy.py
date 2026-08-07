"""FACTOR 3: Energy constraints — WTI crude oil price as daily proxy (FRED DCOILWTICO)."""
from __future__ import annotations

from ..clients.fred import get_fred_data, get_fred_series
from ..core.scoring import normalize_score, safe_execute

# Switched from APU000072610 (monthly retail electricity) to DCOILWTICO
# (daily WTI crude oil $/barrel) for daily resolution. Both track energy
# cost pressure on data centres; oil is noisier but updates every business day.
_SERIES_ID = "DCOILWTICO"
_HEALTHY = 65.0   # $/barrel — moderate price, no pressure
_DANGER = 90.0    # $/barrel — high price, grid + cooling cost stress


@safe_execute(default_val=50)
def get_energy_risk() -> int:
    price = get_fred_data(_SERIES_ID)
    return normalize_score(price, healthy_baseline=_HEALTHY, danger_threshold=_DANGER)


@safe_execute(default_val={})
def get_energy_risk_series(days: int = 14) -> dict[str, int]:
    """Daily energy cost scores from WTI crude oil prices."""
    series = get_fred_series(_SERIES_ID, days=days)
    return {
        date_str: normalize_score(val, healthy_baseline=_HEALTHY, danger_threshold=_DANGER)
        for date_str, val in series.items()
    }
