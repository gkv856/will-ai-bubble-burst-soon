"""FACTOR 1: GPU spot prices (Vast.ai free API)."""
from __future__ import annotations

import datetime
import logging

import requests

from ..core.scoring import normalize_score, safe_execute


def _fetch_gpu_score() -> int:
    """Shared fetch logic for current RTX 4090 spot price."""
    params = {"q": '{"external":{"eq":false},"gpu_name":{"eq":"RTX_4090"}}'}
    url = "https://console.vast.ai/api/v0/bundles/"
    res = requests.get(url, params=params).json()
    if "offers" not in res:
        logging.error(f"Unexpected API response: {res}")
        return 50
    prices = [offer["dph_base"] for offer in res["offers"]]
    avg_price = sum(prices) / len(prices) if prices else 0.50
    return normalize_score(avg_price, healthy_baseline=0.50, danger_threshold=0.20)


@safe_execute(default_val=50)
def get_gpu_risk() -> int:
    return _fetch_gpu_score()


@safe_execute(default_val={})
def get_gpu_risk_series(days: int = 14) -> dict[str, int]:
    """Returns only today's score — Vast.ai has no historical API."""
    today = datetime.date.today().isoformat()
    return {today: _fetch_gpu_score()}
