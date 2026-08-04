"""FACTOR 7: Behavioral exuberance / retail FOMO (SerpApi Google Trends)."""
from __future__ import annotations

import requests

from ..core.config import SERPAPI_KEY
from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_behavioral_risk() -> int:
    if not SERPAPI_KEY:
        raise ValueError("SERPAPI_KEY is not set.")
    params = {
        "engine": "google_trends",
        "q": "Nvidia options,AI investing",
        "data_type": "TIMESERIES",
        "date": "now 7-d",
        "api_key": SERPAPI_KEY,
    }
    response = requests.get("https://serpapi.com/search", params=params)
    if response.status_code != 200:
        raise Exception(f"SerpApi request failed: {response.status_code} {response.text}")
    timeline = response.json().get("interest_over_time", {}).get("timeline_data", [])
    complete_points = [t for t in timeline if not t.get("partial_data")]
    if not complete_points:
        return 50
    latest_values = complete_points[-1]["values"]
    fomo_score = sum(v["extracted_value"] for v in latest_values)
    return normalize_score(fomo_score, healthy_baseline=50, danger_threshold=150)
