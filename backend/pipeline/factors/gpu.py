"""FACTOR: gpu_spot — Vast.ai RTX 4090 median rental price (PRD §3.2.5).

Low GPU price = high risk (supply caught up, demand softening).
score = 100 - percentile_rank(median_price, window=5yr)
"""
from __future__ import annotations

from datetime import datetime

import requests

from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "gpu_spot"
VAST_API_URL = "https://cloud.vast.ai/api/v0/bundles/"


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="Vast.ai fetch failed"))
def fetch_gpu_spot() -> RawFetch:
    """
    Fetch RTX 4090 spot prices from Vast.ai and return the median cost/hr.
    PRD ref: §3.2.5
    """
    # Vast.ai uses query params directly, not a JSON string
    params = {
        "gpu_name": "RTX 4090",
        "order": "score-",
        "limit": 50,
    }
    resp = requests.get(
        VAST_API_URL,
        params=params,
        headers={"User-Agent": "ai-bubble-tracker/1.0"},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    offers = data.get("offers", [])
    if not offers:
        raise ValueError("No RTX 4090 offers returned from Vast.ai")

    prices = sorted(
        float(o["dph_total"])
        for o in offers
        if o.get("dph_total") is not None
    )
    if not prices:
        raise ValueError("No valid price data in Vast.ai offers")

    mid = len(prices) // 2
    median_price = prices[mid] if len(prices) % 2 != 0 else (prices[mid - 1] + prices[mid]) / 2

    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=round(median_price, 4),
        fetched_at=datetime.utcnow(),
    )
