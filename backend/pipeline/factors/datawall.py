"""FACTOR: data_wall — Training compute growth YoY (PRD §3.2.8).

Low/negative compute growth = scaling stalling = high risk.
score = 100 - percentile_rank(yoy_growth).
If YoY growth < 0, score = 100.

Data source: Epoch AI compute dataset. Because this data is annual and sparse,
we stub with a reasonable current estimate when the live fetch fails.
"""
from __future__ import annotations

import logging
from datetime import datetime

import requests

from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "data_wall"
EPOCH_URL = "https://epochai.org/data/compute.csv"
logger = logging.getLogger(__name__)


def fetch_data_wall() -> RawFetch:
    """
    Attempt to fetch Epoch AI compute data. Falls back to a stub if unavailable.
    PRD ref: §3.2.8
    """
    result = _try_epoch_fetch()
    if result.raw_value is None:
        # Stub: use a reasonable 2024-2026 estimate (~3-4× YoY FLOP growth slowing from 4-5×)
        # This makes the signal functional without hard-coding zeros.
        logger.warning("Epoch AI fetch failed — using stub YoY compute growth of 3.0")
        return RawFetch(
            factor_id=FACTOR_ID,
            raw_value=3.0,  # 3× YoY is slowing but not stalled
            fetched_at=datetime.utcnow(),
            error_message="Epoch AI unavailable — stub value",
        )
    return result


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="Epoch AI fetch failed"))
def _try_epoch_fetch() -> RawFetch:
    resp = requests.get(EPOCH_URL, timeout=30, headers={"User-Agent": "ai-bubble-tracker/1.0"})
    resp.raise_for_status()

    lines = resp.text.strip().split("\n")
    if len(lines) < 3:
        raise ValueError("Epoch AI CSV too short")

    # Parse CSV: expect columns Year, Training_compute_FLOP, ...
    headers = [h.strip().lower() for h in lines[0].split(",")]
    year_col = next((i for i, h in enumerate(headers) if "year" in h), None)
    flop_col = next((i for i, h in enumerate(headers) if "compute" in h or "flop" in h), None)

    if year_col is None or flop_col is None:
        raise ValueError(f"Unexpected Epoch AI CSV columns: {headers}")

    data: list[tuple[int, float]] = []
    for line in lines[1:]:
        parts = line.split(",")
        try:
            yr = int(parts[year_col].strip())
            flop = float(parts[flop_col].strip())
            data.append((yr, flop))
        except (ValueError, IndexError):
            continue

    if len(data) < 2:
        raise ValueError("Not enough Epoch AI data points")

    data.sort()
    latest_yr, latest_flop = data[-1]
    prev_yr, prev_flop = data[-2]

    if prev_flop <= 0:
        raise ValueError("Previous compute FLOP is zero/negative")

    yoy_growth = round((latest_flop - prev_flop) / abs(prev_flop), 4)

    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=yoy_growth,
        fetched_at=datetime.utcnow(),
    )
