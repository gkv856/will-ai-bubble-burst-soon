"""CLI entry point — run the pipeline manually or start the API server."""
from __future__ import annotations

import argparse
import logging
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s — %(message)s")


def main():
    parser = argparse.ArgumentParser(description="AI Bubble Tracker")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("run-pipeline", help="Run the weekly pipeline once (synchronously)")

    args = parser.parse_args()

    if args.command == "run-pipeline":
        from pipeline.orchestrator import run_pipeline_sync
        run_pipeline_sync()

    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
