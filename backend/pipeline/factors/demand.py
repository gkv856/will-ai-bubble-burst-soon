"""FACTOR: demand_reality — IGV/SMH ratio (PRD §3.2.1).

Returns the raw IGV/SMH ratio as a RawFetch. Normalization (percentile rank)
is applied centrally by the orchestrator using historical data from the DB.
"""
from __future__ import annotations

from datetime import datetime

import yfinance as yf

from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "demand_reality"


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="fetch failed"))
def fetch_demand_reality() -> RawFetch:
    """
    Fetch latest IGV and SMH closing prices and return the ratio.
    Low ratio (software lagging hardware) = high risk.
    PRD: score = 100 - percentile_rank(ratio, window=5yr)
    """
    igv = yf.Ticker("IGV").history(period="1mo")["Close"].dropna()
    smh = yf.Ticker("SMH").history(period="1mo")["Close"].dropna()

    if igv.empty or smh.empty:
        raise ValueError("IGV or SMH data is empty")

    igv_latest = float(igv.iloc[-1])
    smh_latest = float(smh.iloc[-1])
    ratio = igv_latest / smh_latest

    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=round(ratio, 4),
        fetched_at=datetime.utcnow(),
    )
