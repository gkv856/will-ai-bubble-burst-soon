"""Composes all factor scores into a weekly history.json entry."""
from __future__ import annotations

import datetime
import logging
import time

from .core.config import OUTPUT_FILE
from .core.types import FactorScores, HistoryEntry
from .factors import (
    get_behavioral_risk,
    get_credit_risk,
    get_datawall_risk,
    get_demand_risk,
    get_energy_risk,
    get_gpu_risk,
    get_liquidity_risk,
    get_valuation_risk,
)
from .storage.history import load_history, save_history, upsert_entry
from .storage.publisher import push_to_github


def _current_week_id() -> str:
    iso_year, iso_week, _ = datetime.date.today().isocalendar()
    return f"{iso_year}-W{iso_week}"


def run_weekly_pipeline(push: bool = True) -> None:
    logging.info("Fetching weekly AI bubble metrics...")

    factors: FactorScores = {
        "gpu": get_gpu_risk(),
        "credit": get_credit_risk(),
        "energy": get_energy_risk(),
        "demand": get_demand_risk(),
        "datawall": get_datawall_risk(),
        "valuation": get_valuation_risk(),
        "behavioral": get_behavioral_risk(),
        "liquidity": get_liquidity_risk(),
    }

    composite = int(
        (factors["demand"] * 0.20) + (factors["valuation"] * 0.20)
        + (factors["behavioral"] * 0.15) + (factors["liquidity"] * 0.15)
        + (factors["gpu"] * 0.10) + (factors["credit"] * 0.10)
        + (factors["datawall"] * 0.05) + (factors["energy"] * 0.05)
    )

    entry: HistoryEntry = {
        "weekId": _current_week_id(),
        "timestamp": int(time.time()),
        "factors": factors,
        "score": composite,
    }

    history = upsert_entry(load_history(), entry)
    save_history(history)
    logging.info(f"Successfully saved to {OUTPUT_FILE}. Composite Score: {composite}%")

    if push:
        push_to_github()
    else:
        logging.info("Skipping push to GitHub (--no-push).")
