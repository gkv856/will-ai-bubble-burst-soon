"""Composes all factor scores into daily data.json entries."""
from __future__ import annotations

import datetime
import logging
import time

from .clients.gemini import get_ai_predictions
from .core.config import OUTPUT_FILE
from .core.types import FactorScores
from .factors import (
    get_behavioral_risk,
    get_behavioral_risk_series,
    get_credit_risk,
    get_credit_risk_series,
    get_datawall_risk,
    get_datawall_risk_series,
    get_demand_risk,
    get_demand_risk_series,
    get_energy_risk,
    get_energy_risk_series,
    get_gpu_risk,
    get_gpu_risk_series,
    get_liquidity_risk,
    get_liquidity_risk_series,
    get_valuation_risk,
    get_valuation_risk_series,
)
from .storage.history import load_history, save_history, upsert_bulk, upsert_entry
from .storage.publisher import push_to_github

# Weights for composite score — must sum to 1.0
_WEIGHTS: dict[str, float] = {
    "demand": 0.20,
    "valuation": 0.20,
    "behavioral": 0.15,
    "liquidity": 0.15,
    "gpu": 0.10,
    "credit": 0.10,
    "datawall": 0.05,
    "energy": 0.05,
}


def _composite(factors: FactorScores) -> int:
    """Compute the weighted composite risk score."""
    return int(sum(factors[k] * w for k, w in _WEIGHTS.items()))


def _current_day_id() -> str:
    return datetime.date.today().isoformat()


def run_daily_pipeline(push: bool = True) -> None:
    """Daily run: fetch today's scores, compute composite, add AI analysis."""
    logging.info("Fetching daily AI bubble metrics...")

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

    composite = _composite(factors)

    entry: dict = {
        "dayId": _current_day_id(),
        "timestamp": int(time.time()),
        "factors": factors,
        "score": composite,
    }

    history = upsert_entry(load_history(), entry)

    # AI predictions based on the 15-day window
    ai_preds = get_ai_predictions(history[-15:])
    if ai_preds:
        entry["aiPredictions"] = ai_preds
    
    # Re-upsert with the predictions attached
    history = upsert_entry(history, entry)

    save_history(history)
    logging.info(f"Saved to {OUTPUT_FILE}. Composite: {composite}%. AI analysis: {len(ai_text)} chars.")

    if push:
        push_to_github()
    else:
        logging.info("Skipping push to GitHub (--no-push).")


def run_backfill(days: int = 14, push: bool = True) -> None:
    """One-time backfill: fetch historical daily scores for all factors."""
    logging.info(f"Backfilling {days} days of historical data...")

    # Collect daily series from each factor
    series_by_factor = {
        "gpu": get_gpu_risk_series(days),
        "credit": get_credit_risk_series(days),
        "energy": get_energy_risk_series(days),
        "demand": get_demand_risk_series(days),
        "datawall": get_datawall_risk_series(days),
        "valuation": get_valuation_risk_series(days),
        "behavioral": get_behavioral_risk_series(days),
        "liquidity": get_liquidity_risk_series(days),
    }

    # Collect all dates across all factors
    all_dates: set[str] = set()
    for series in series_by_factor.values():
        all_dates.update(series.keys())

    # Build an entry per date, filling missing factors with 50 (neutral default)
    entries: list[dict] = []
    for date_str in sorted(all_dates):
        factors: FactorScores = {
            factor: series.get(date_str, 50)
            for factor, series in series_by_factor.items()
        }
        entries.append({
            "dayId": date_str,
            "timestamp": int(datetime.datetime.fromisoformat(date_str).timestamp()),
            "factors": factors,
            "score": _composite(factors),
        })

    history = upsert_bulk(load_history(), entries)
    save_history(history)
    logging.info(f"Backfilled {len(entries)} entries to {OUTPUT_FILE}.")

    if push:
        push_to_github()
    else:
        logging.info("Skipping push to GitHub (--no-push).")

