"""FACTOR: erp_valuation — Equity Risk Premium (PRD §3.2.2).

ERP = S&P 500 earnings yield - 10Y Treasury yield.
Low/negative ERP = high risk. score = 100 - percentile_rank(erp).
"""
from __future__ import annotations

from datetime import datetime

import yfinance as yf

from ..clients.fred import get_fred_data
from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "erp_valuation"


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="fetch failed"))
def fetch_erp_valuation() -> RawFetch:
    """
    Compute ERP = earnings_yield - treasury_yield.
    Floors: ERP < -2% → score=100; Ceiling: ERP > 6% → score=0.
    PRD ref: §3.2.2
    """
    # Use SPY trailing P/E as a proxy for S&P 500 P/E
    info = yf.Ticker("SPY").info
    trailing_pe = info.get("trailingPE")
    if not trailing_pe:
        raise ValueError("SPY trailingPE missing from yfinance response")

    earnings_yield = (1 / trailing_pe) * 100  # percent
    treasury_yield = get_fred_data("DGS10")    # percent
    erp = round(earnings_yield - treasury_yield, 4)

    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=erp,
        fetched_at=datetime.utcnow(),
    )
