"""FACTOR: credit_spreads — ICE BofA HY Option-Adjusted Spread (PRD §3.2.6).

Widening spreads = high risk. score = percentile_rank(spread_bps).
"""
from __future__ import annotations

from datetime import datetime

from ..clients.fred import get_fred_data
from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "credit_spreads"
SERIES_ID = "BAMLH0A0HYM2"


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="FRED fetch failed"))
def fetch_credit_spreads() -> RawFetch:
    """
    Fetch latest high-yield credit spread from FRED.
    PRD ref: §3.2.6
    """
    spread_bps = get_fred_data(SERIES_ID)
    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=round(spread_bps, 4),
        fetched_at=datetime.utcnow(),
    )
