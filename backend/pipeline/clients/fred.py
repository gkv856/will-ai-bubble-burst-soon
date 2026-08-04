"""FRED (Federal Reserve Economic Data) API client."""
from __future__ import annotations

import requests

from ..core.config import FRED_API_KEY


def get_fred_data(series_id: str) -> float:
    """Fetches the latest published (non-missing) data point from FRED for the given series."""
    if not FRED_API_KEY:
        raise ValueError("FRED_API_KEY is not set.")
    url = (
        "https://api.stlouisfed.org/fred/series/observations"
        f"?series_id={series_id}&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=10"
    )
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch FRED data for {series_id}")
    for observation in response.json()["observations"]:
        if observation["value"] != ".":
            return float(observation["value"])
    raise ValueError(f"No published observations found for {series_id} in the last 10 data points.")
