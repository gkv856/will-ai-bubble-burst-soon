"""FACTOR 7: Behavioral exuberance / retail FOMO (SerpApi Google Trends)."""
from __future__ import annotations

import requests

from ..core.config import SERPAPI_KEY
from ..core.scoring import normalize_score, safe_execute


def _fetch_trends_timeline(date_range: str) -> list[dict]:
    """Shared helper to fetch Google Trends timeline from SerpApi."""
    if not SERPAPI_KEY:
        raise ValueError("SERPAPI_KEY is not set.")
    params = {
        "engine": "google_trends",
        "q": "Nvidia options,AI investing",
        "data_type": "TIMESERIES",
        "date": date_range,
        "api_key": SERPAPI_KEY,
    }
    response = requests.get("https://serpapi.com/search", params=params)
    if response.status_code != 200:
        raise Exception(f"SerpApi request failed: {response.status_code} {response.text}")
    return response.json().get("interest_over_time", {}).get("timeline_data", [])


def _score_point(point: dict) -> int:
    """Score a single timeline data point."""
    values = point["values"]
    fomo_score = sum(v["extracted_value"] for v in values)
    return normalize_score(fomo_score, healthy_baseline=50, danger_threshold=150)


@safe_execute(default_val=50)
def get_behavioral_risk() -> int:
    timeline = _fetch_trends_timeline("now 7-d")
    complete_points = [t for t in timeline if not t.get("partial_data")]
    if not complete_points:
        return 50
    return _score_point(complete_points[-1])


@safe_execute(default_val={})
def get_behavioral_risk_series(days: int = 14) -> dict[str, int]:
    """Daily behavioral FOMO scores from Google Trends (1 SerpApi search)."""
    # Google Trends date parameter only accepts specific values like 'now 7-d' or 'today 1-m'
    date_param = "now 7-d" if days <= 7 else "today 1-m"
    timeline = _fetch_trends_timeline(date_param)
    result: dict[str, int] = {}
    for point in timeline:
        if point.get("partial_data"):
            continue
        # SerpApi returns date as "Aug 1, 2026" or a timestamp string
        date_str = point.get("date", "")
        # Extract the date from the timestamp (Unix epoch in the "values")
        import datetime
        ts = int(point.get("timestamp", "0"))
        if ts:
            date_str = datetime.date.fromtimestamp(ts).isoformat()
        if date_str:
            result[date_str] = _score_point(point)
            
    # Slice the result to only return the requested number of days
    sorted_dates = sorted(result.keys())
    return {d: result[d] for d in sorted_dates[-days:]}

