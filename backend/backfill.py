"""
backfill.py - One-time script to populate data.json with daily data.

Run from the backend/ directory:
    python backfill.py              # backfill last 14 trading days
    python backfill.py --days 20   # backfill last 20 trading days

Rate limits respected:
    FRED:    120 req/min  -> 0.6s sleep between calls (8 series * safe margin)
    yfinance: no hard limit -> fetched once for 1-month window, sliced per day
    SerpApi: 100/month free -> 1 call total for behavioral (14-day window)
    Vast.ai: no documented limit -> 1 call, today only
    Epoch AI: CSV download -> 1 call

No --no-push flag here - script always writes locally only.
Push manually when satisfied: git add frontend/public/data.json && git commit -m "data: backfill daily history"
"""
from __future__ import annotations

import argparse
import datetime
import json
import sys
import time
from pathlib import Path

# -- Make sure we can import the pipeline package ------------------------------
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from pipeline.core.config import (  # noqa: E402 - after sys.path fix
    FRED_API_KEY,
    GEMINI_API_KEY,
    OUTPUT_FILE,
    SERPAPI_KEY,
)

print("-" * 60)
print("AI Bubble Tracker - Daily Backfill Script")
print("-" * 60)
print(f"  FRED key:    {'[OK]' if FRED_API_KEY else '[MISSING] - set FRED_API_KEY in .env'}")
print(f"  SerpApi key: {'[OK]' if SERPAPI_KEY else '[MISSING] - set SERPAPI_KEY in .env'}")
print(f"  Gemini key:  {'[OK]' if GEMINI_API_KEY else '[MISSING] - AI analysis will be skipped'}")
print(f"  Output file: {OUTPUT_FILE}")
print()

if not FRED_API_KEY or not SERPAPI_KEY:
    print("ERROR: FRED_API_KEY and SERPAPI_KEY are required. Add them to backend/.env")
    sys.exit(1)

from pipeline.core.scoring import normalize_score  # noqa: E402
from pipeline.storage.history import load_history, save_history, upsert_bulk  # noqa: E402
from pipeline.clients.gemini import get_ai_predictions  # noqa: E402

# -- Helpers -------------------------------------------------------------------

def _pause(seconds: float, reason: str) -> None:
    print(f"    [WAIT] Rate-limit pause {seconds}s ({reason})...")
    time.sleep(seconds)


def _composite(factors: dict) -> int:
    weights = {
        "demand": 0.20, "valuation": 0.20, "behavioral": 0.15,
        "liquidity": 0.15, "gpu": 0.10, "credit": 0.10,
        "datawall": 0.05, "energy": 0.05,
    }
    return int(sum(factors.get(k, 50) * w for k, w in weights.items()))


# -- Step 1: Fetch all series --------------------------------------------------

def fetch_all_series(days: int) -> dict[str, dict[str, int]]:
    """Returns {factor_name: {date_str: score}}."""
    from pipeline.factors import (
        get_behavioral_risk_series,
        get_credit_risk_series,
        get_datawall_risk_series,
        get_demand_risk_series,
        get_energy_risk_series,
        get_gpu_risk_series,
        get_liquidity_risk_series,
        get_valuation_risk_series,
    )

    series: dict[str, dict[str, int]] = {}

    # -- yfinance: demand (IGV/SMH) -----------------------------------------
    print("  [1/8] Demand (IGV/SMH via yfinance)...")
    series["demand"] = get_demand_risk_series(days)
    print(f"        -> {len(series['demand'])} days")
    _pause(1.0, "yfinance courtesy delay")

    # -- FRED: credit spreads (BAMLC0A0CM) ---------------------------------
    print("  [2/8] Credit spreads (FRED BAMLC0A0CM)...")
    series["credit"] = get_credit_risk_series(days)
    print(f"        -> {len(series['credit'])} days")
    _pause(0.6, "FRED rate limit")

    # -- FRED + yfinance: valuation (ERP) ----------------------------------
    print("  [3/8] Valuation ERP (FRED DGS10 + yfinance SPY P/E)...")
    series["valuation"] = get_valuation_risk_series(days)
    print(f"        -> {len(series['valuation'])} days")
    _pause(0.6, "FRED rate limit")

    # -- FRED: energy (DCOILWTICO daily oil) -------------------------------
    print("  [4/8] Energy (FRED DCOILWTICO - WTI oil)...")
    series["energy"] = get_energy_risk_series(days)
    print(f"        -> {len(series['energy'])} days")
    _pause(0.6, "FRED rate limit")

    # -- FRED: liquidity (RRPONTSYD reverse repo) --------------------------
    print("  [5/8] Liquidity (FRED RRPONTSYD - reverse repo)...")
    series["liquidity"] = get_liquidity_risk_series(days)
    print(f"        -> {len(series['liquidity'])} days")
    _pause(0.6, "FRED rate limit")

    # -- SerpApi: behavioral FOMO (1 call for full 14-day window) ----------
    print(f"  [6/8] Behavioral FOMO (SerpApi - 1 call covers {days} days)...")
    series["behavioral"] = get_behavioral_risk_series(days)
    print(f"        -> {len(series['behavioral'])} days  [1 SerpApi credit used]")
    _pause(1.0, "SerpApi courtesy delay")

    # -- Vast.ai: GPU spot price (today only - no history API) -------------
    print("  [7/8] GPU spot price (Vast.ai - today only, no history)...")
    series["gpu"] = get_gpu_risk_series(days)
    print(f"        -> {len(series['gpu'])} days  [today only]")
    _pause(0.5, "Vast.ai courtesy delay")

    # -- Epoch AI: datawall (1 CSV download, today score only) -------------
    print("  [8/8] Data wall (Epoch AI CSV - slow-moving, today score only)...")
    series["datawall"] = get_datawall_risk_series(days)
    print(f"        -> {len(series['datawall'])} days  [today only]")

    return series


# -- Step 2: Merge into daily entries -----------------------------------------

def build_entries(series: dict[str, dict[str, int]]) -> list[dict]:
    all_dates: set[str] = set()
    for s in series.values():
        all_dates.update(s.keys())

    entries = []
    for date_str in sorted(all_dates):
        # Skip weekends (5 = Saturday, 6 = Sunday)
        if datetime.datetime.fromisoformat(date_str).weekday() >= 5:
            continue
            
        factors = {
            factor: s.get(date_str, 50)
            for factor, s in series.items()
        }
        entries.append({
            "dayId": date_str,
            "timestamp": int(
                datetime.datetime.fromisoformat(date_str)
                .replace(tzinfo=datetime.timezone.utc)
                .timestamp()
            ),
            "factors": factors,
            "score": _composite(factors),
        })

    return entries


# -- Main ----------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill daily bubble metrics.")
    parser.add_argument("--days", type=int, default=14,
                        help="Number of trading days to backfill (default: 14)")
    args = parser.parse_args()

    days = args.days
    print(f"Backfilling last {days} trading days of data...\n")

    # Step 1: fetch
    series = fetch_all_series(days)

    # Step 2: build entries
    print(f"\nBuilding {len(set().union(*[s.keys() for s in series.values()]))} daily entries...")
    entries = build_entries(series)
    print(f"  -> {len(entries)} entries built")

    # Step 3: merge with existing history (keeps old weekly entries)
    print("\nMerging with existing data.json...")
    history = load_history()
    old_count = len(history)
    history = upsert_bulk(history, entries)
    print(f"  -> {old_count} existing -> {len(history)} total entries")

    # Step 4: optional Gemini analysis on the merged history
    if GEMINI_API_KEY:
        print("\nRequesting AI predictions from Gemini 1.5 Pro for the most recent day...")
        ai_preds = get_ai_predictions(history[-15:])
        if ai_preds:
            # Attach to the most recent entry
            history[-1]["aiPredictions"] = ai_preds
            print(f"  -> Generated {len(ai_preds)} category predictions.")
        else:
            print("  -> AI predictions unavailable (API error or key issue)")
    else:
        print("\nSkipping AI analysis (GEMINI_API_KEY not set)")

    # Step 5: write
    save_history(history)
    print(f"\n[DONE] Saved {len(history)} entries to {OUTPUT_FILE}")
    print("\nNext steps:")
    print("  1. Review frontend/public/data.json")
    print("  2. Run:  cd frontend && npm run dev  (to verify the dashboard)")
    print("  3. When happy: git add frontend/public/data.json && git commit -m 'data: backfill daily history' && git push")
    print("-" * 60)


if __name__ == "__main__":
    main()
