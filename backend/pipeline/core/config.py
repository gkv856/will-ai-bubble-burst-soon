"""Environment configuration and shared constants for the pipeline."""
from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

FRED_API_KEY: str | None = os.getenv("FRED_API_KEY")
SERPAPI_KEY: str | None = os.getenv("SERPAPI_KEY")

BACKEND_DIR: Path = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT: Path = BACKEND_DIR.parent
OUTPUT_FILE: Path = PROJECT_ROOT / "frontend" / "public" / "history.json"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
