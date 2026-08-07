"""Daily AI bubble metrics pipeline — entrypoint."""
from __future__ import annotations

import argparse

from pipeline.orchestrator import run_backfill, run_daily_pipeline

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Bubble Tracker data pipeline.")
    parser.add_argument("--no-push", action="store_true", help="Skip committing/pushing data.json to GitHub.")
    parser.add_argument("--backfill", type=int, metavar="N", help="Backfill N days of historical data instead of running the daily pipeline.")
    args = parser.parse_args()

    if args.backfill:
        run_backfill(days=args.backfill, push=not args.no_push)
    else:
        run_daily_pipeline(push=not args.no_push)

