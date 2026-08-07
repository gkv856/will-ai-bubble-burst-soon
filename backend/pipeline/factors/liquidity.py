"""FACTOR 8: Liquidity — overnight reverse repo volume as daily proxy (FRED RRPONTSYD)."""
from __future__ import annotations

from ..clients.fred import get_fred_data, get_fred_series
from ..core.scoring import normalize_score, safe_execute

# Switched from WM2NS (weekly M2 money supply) to RRPONTSYD (daily overnight
# reverse repo volume, in $ billions). Lower repo = more liquidity available
# for risk assets = higher bubble-fuel risk.
_SERIES_ID = "RRPONTSYD"
_HEALTHY = 500.0    # $500B parked in repo — plenty of drain, less loose cash
_DANGER = 100.0     # $100B — nearly all liquidity is loose in the system


@safe_execute(default_val=50)
def get_liquidity_risk() -> int:
    repo_volume = get_fred_data(_SERIES_ID)
    return normalize_score(repo_volume, healthy_baseline=_HEALTHY, danger_threshold=_DANGER)


@safe_execute(default_val={})
def get_liquidity_risk_series(days: int = 14) -> dict[str, int]:
    """Daily liquidity scores from overnight reverse repo volume."""
    series = get_fred_series(_SERIES_ID, days=days)
    return {
        date_str: normalize_score(val, healthy_baseline=_HEALTHY, danger_threshold=_DANGER)
        for date_str, val in series.items()
    }
