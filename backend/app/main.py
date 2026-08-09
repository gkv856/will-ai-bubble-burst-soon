"""FastAPI application entrypoint."""
from __future__ import annotations

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analogs, health, history, scores, signals
from app.config import ALLOWED_ORIGINS, PIPELINE_CRON_DAY_OF_WEEK, PIPELINE_CRON_HOUR, PIPELINE_CRON_MINUTE
from app.db.init_db import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Bubble Tracker API",
    description="Data-driven early-warning system for AI investment bubble risk",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"
app.include_router(scores.router, prefix=PREFIX, tags=["scores"])
app.include_router(history.router, prefix=PREFIX, tags=["history"])
app.include_router(signals.router, prefix=PREFIX, tags=["signals"])
app.include_router(analogs.router, prefix=PREFIX, tags=["analogs"])
app.include_router(health.router, prefix=PREFIX, tags=["health"])

# ── Scheduler ─────────────────────────────────────────────────────────────────
scheduler = AsyncIOScheduler()


@app.on_event("startup")
async def startup_event():
    # Ensure tables exist
    init_db()
    logger.info("Database initialised.")

    # Schedule weekly pipeline
    from pipeline.orchestrator import run_weekly_pipeline  # lazy import

    scheduler.add_job(
        run_weekly_pipeline,
        trigger="cron",
        day_of_week=PIPELINE_CRON_DAY_OF_WEEK,
        hour=PIPELINE_CRON_HOUR,
        minute=PIPELINE_CRON_MINUTE,
        id="weekly_pipeline",
        replace_existing=True,
        misfire_grace_time=3600,
    )
    scheduler.start()
    logger.info(f"Pipeline scheduler started — runs every {PIPELINE_CRON_DAY_OF_WEEK} at {PIPELINE_CRON_HOUR:02d}:{PIPELINE_CRON_MINUTE:02d} UTC.")


@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown(wait=False)


@app.get("/")
def root():
    return {"message": "AI Bubble Tracker API v2. See /docs for endpoints."}
