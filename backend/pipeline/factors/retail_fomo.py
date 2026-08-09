"""FACTOR: retail_fomo — Google Trends search interest (PRD §3.2.3).

velocity_safe = False (spikey). Uses SerpApi if SERPAPI_KEY is set,
otherwise stubs with a neutral value marked stale.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime

import requests

from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "retail_fomo"
SEARCH_TERMS = "Nvidia options,AI investing,AI stocks buy"
logger = logging.getLogger(__name__)


def fetch_retail_fomo() -> RawFetch:
    """
    Returns average Google Trends interest (0-100 scale).
    High interest = high risk. velocity_safe = False.
    PRD ref: §3.2.3
    """
    api_key = os.getenv("SERPAPI_KEY", "")
    if not api_key:
        logger.warning("SERPAPI_KEY not set — retail_fomo stubbed at 50 (neutral), marked stale.")
        return RawFetch(
            factor_id=FACTOR_ID,
            raw_value=50.0,
            fetched_at=datetime.utcnow(),
            error_message="SERPAPI_KEY not configured — stub value",
        )

    return _fetch_from_serpapi(api_key)


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="SerpApi fetch failed"))
def _fetch_from_serpapi(api_key: str) -> RawFetch:
    url = "https://serpapi.com/search"
    params = {
        "engine": "google_trends",
        "q": SEARCH_TERMS,
        "api_key": api_key,
        "date": "now 7-d",
        "geo": "US",
    }
    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    # Sum and average the interest values across search terms
    interest_values = []
    for item in data.get("interest_over_time", {}).get("timeline_data", []):
        for v in item.get("values", []):
            val = v.get("extracted_value")
            if val is not None:
                interest_values.append(float(val))

    if not interest_values:
        raise ValueError("No interest data returned from SerpApi")

    avg_interest = round(sum(interest_values) / len(interest_values), 2)
    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=avg_interest,
        fetched_at=datetime.utcnow(),
    )
