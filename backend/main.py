"""Weekly AI bubble metrics pipeline — entrypoint."""
from __future__ import annotations

import argparse

from pipeline.orchestrator import run_weekly_pipeline

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-push", action="store_true", help="Skip committing/pushing history.json to GitHub.")
    args = parser.parse_args()

    run_weekly_pipeline(push=not args.no_push)
