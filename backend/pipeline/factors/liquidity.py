"""FACTOR: m2_liquidity — M2 Money Supply YoY change (PRD §3.2.4).

Contracting M2 = high risk. score = 100 - percentile_rank(yoy_change).
"""
from __future__ import annotations

from datetime import datetime

from ..clients.fred import get_fred_series
from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "m2_liquidity"
SERIES_ID = "WM2NS"  # Weekly M2, seasonally adjusted


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="fetch failed"))
def fetch_m2_liquidity() -> RawFetch:
    """
    Fetch M2 and compute YoY % change (52-week).
    PRD ref: §3.2.4
    """
    # Fetch last 56 weeks of data (52 + buffer for missing dates)
    series = get_fred_series(SERIES_ID, days=400)
    if len(series) < 53:
        raise ValueError(f"Insufficient M2 data: only {len(series)} observations")

    sorted_dates = sorted(series.keys())
    latest_val = series[sorted_dates[-1]]
    year_ago_val = series[sorted_dates[-53]] if len(sorted_dates) >= 53 else series[sorted_dates[0]]

    if year_ago_val == 0:
        raise ValueError("M2 year-ago value is zero")

    yoy_change = round((latest_val - year_ago_val) / abs(year_ago_val) * 100, 4)

    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=yoy_change,
        fetched_at=datetime.utcnow(),
    )
