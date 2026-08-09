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
    sub.add_parser("serve", help="Start the FastAPI server with uvicorn")
    sub.add_parser("init-db", help="Create database tables")

    args = parser.parse_args()

    if args.command == "run-pipeline":
        from app.db.init_db import init_db
        init_db()
        from pipeline.orchestrator import run_pipeline_sync
        run_pipeline_sync()

    elif args.command == "init-db":
        from app.db.init_db import init_db
        init_db()
        logging.info("Database tables created.")

    elif args.command == "serve":
        import uvicorn
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
