"""Environment configuration and shared constants for the pipeline."""
from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR: Path = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT: Path = BACKEND_DIR.parent
OUTPUT_FILE: Path = PROJECT_ROOT / "frontend" / "public" / "data.json"

# Load .env from backend/ first (local dev), then pipeline/ subdir as fallback
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(BACKEND_DIR / "pipeline" / ".env")

FRED_API_KEY: str | None = os.getenv("FRED_API_KEY")
SERPAPI_KEY: str | None = os.getenv("SERPAPI_KEY")
GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
