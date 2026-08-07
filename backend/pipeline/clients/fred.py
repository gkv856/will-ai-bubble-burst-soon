"""FRED (Federal Reserve Economic Data) API client."""
from __future__ import annotations

import datetime

import requests

from ..core.config import FRED_API_KEY


def _require_key() -> str:
    if not FRED_API_KEY:
        raise ValueError("FRED_API_KEY is not set.")
    return FRED_API_KEY


def get_fred_data(series_id: str) -> float:
    """Fetches the latest published (non-missing) data point from FRED for the given series."""
    key = _require_key()
    url = (
        "https://api.stlouisfed.org/fred/series/observations"
        f"?series_id={series_id}&api_key={key}&file_type=json&sort_order=desc&limit=10"
    )
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch FRED data for {series_id}")
    for observation in response.json()["observations"]:
        if observation["value"] != ".":
            return float(observation["value"])
    raise ValueError(f"No published observations found for {series_id} in the last 10 data points.")


def get_fred_series(series_id: str, days: int = 14) -> dict[str, float]:
    """Fetches the last *days* worth of published observations as {date_str: value}.

    Returns dates as ISO strings (e.g. "2026-08-01"). Missing/unpublished
    dates are omitted — callers should expect gaps on weekends/holidays.
    """
    key = _require_key()
    start = (datetime.date.today() - datetime.timedelta(days=days + 5)).isoformat()
    url = (
        "https://api.stlouisfed.org/fred/series/observations"
        f"?series_id={series_id}&api_key={key}&file_type=json"
        f"&sort_order=desc&observation_start={start}&limit={days + 10}"
    )
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch FRED series for {series_id}")
    result: dict[str, float] = {}
    for obs in response.json()["observations"]:
        if obs["value"] != ".":
            result[obs["date"]] = float(obs["value"])
    return result
