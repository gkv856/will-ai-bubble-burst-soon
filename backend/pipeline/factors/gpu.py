"""FACTOR 1: GPU spot prices (Vast.ai free API)."""
from __future__ import annotations

import logging

import requests

from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_gpu_risk() -> int:
    params = {"q": '{"external":{"eq":false},"gpu_name":{"eq":"RTX_4090"}}'}
    url = "https://console.vast.ai/api/v0/bundles/"
    res = requests.get(url, params=params).json()
    if "offers" not in res:
        logging.error(f"Unexpected API response: {res}")
        return 50
    prices = [offer["dph_base"] for offer in res["offers"]]
    avg_price = sum(prices) / len(prices) if prices else 0.50
    return normalize_score(avg_price, healthy_baseline=0.50, danger_threshold=0.20)
