"""Application configuration — reads from environment variables."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend root
load_dotenv(Path(__file__).parent.parent.parent / ".env")

# ── Database ─────────────────────────────────────────────────────────────────
# Default: SQLite (local dev). Set DATABASE_URL to postgresql+psycopg2://...
# for production.
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{Path(__file__).parent.parent.parent / 'data' / 'bubble_tracker.db'}",
)

# ── API Keys ──────────────────────────────────────────────────────────────────
FRED_API_KEY: str = os.getenv("FRED_API_KEY", "")
SERPAPI_KEY: str = os.getenv("SERPAPI_KEY", "")  # optional; narrative signal stubs if empty

# ── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", ""),
]

# ── Pipeline schedule ─────────────────────────────────────────────────────────
# Cron: every Sunday at 02:00 UTC
PIPELINE_CRON_DAY_OF_WEEK: str = "sun"
PIPELINE_CRON_HOUR: int = 2
PIPELINE_CRON_MINUTE: int = 0
