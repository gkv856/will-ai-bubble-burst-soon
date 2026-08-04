"""FACTOR 4: Demand reality — software (IGV) vs. hardware (SMH) via yfinance."""
from __future__ import annotations

import yfinance as yf

from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_demand_risk() -> int:
    igv = yf.Ticker("IGV").history(period="1mo")["Close"].dropna().iloc[-1]
    smh = yf.Ticker("SMH").history(period="1mo")["Close"].dropna().iloc[-1]
    ratio = igv / smh
    return normalize_score(ratio, healthy_baseline=0.45, danger_threshold=0.35)
