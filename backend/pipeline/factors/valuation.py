"""FACTOR 6: Valuation — equity risk premium (S&P 500 earnings yield vs. 10Y Treasury)."""
from __future__ import annotations

import yfinance as yf

from ..clients.fred import get_fred_data, get_fred_series
from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_valuation_risk() -> int:
    trailing_pe = yf.Ticker("SPY").info.get("trailingPE")
    if not trailing_pe:
        raise ValueError("SPY trailingPE is missing from yfinance response.")
    earnings_yield = (1 / trailing_pe) * 100
    treasury_yield = get_fred_data("DGS10")
    erp = earnings_yield - treasury_yield
    return normalize_score(erp, healthy_baseline=4.0, danger_threshold=0.0)


@safe_execute(default_val={})
def get_valuation_risk_series(days: int = 14) -> dict[str, int]:
    """Daily ERP scores. Uses current trailing P/E (shifts slowly) with daily DGS10."""
    trailing_pe = yf.Ticker("SPY").info.get("trailingPE")
    if not trailing_pe:
        raise ValueError("SPY trailingPE is missing from yfinance response.")
    earnings_yield = (1 / trailing_pe) * 100
    treasury_series = get_fred_series("DGS10", days=days)
    result: dict[str, int] = {}
    for date_str, treasury_yield in treasury_series.items():
        erp = earnings_yield - treasury_yield
        result[date_str] = normalize_score(erp, healthy_baseline=4.0, danger_threshold=0.0)
    return result
