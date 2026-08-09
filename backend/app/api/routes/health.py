"""GET /api/v1/health — system health check."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.models import PipelineRun, SignalScore

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        run = db.query(PipelineRun).order_by(PipelineRun.run_date.desc()).first()
        db_connected = True
    except Exception:
        db_connected = False
        run = None

    stale_signals: list[str] = []
    if run:
        stale_scores = (
            db.query(SignalScore.factor_id)
            .filter(SignalScore.run_id == run.id, SignalScore.stale == True)  # noqa: E712
            .all()
        )
        stale_signals = [s.factor_id for s in stale_scores]

    return {
        "status": "healthy" if db_connected else "degraded",
        "last_pipeline_run": run.run_date.isoformat() + "Z" if run else None,
        "last_run_quality": run.quality_verdict if run else None,
        "stale_signals": stale_signals,
        "database_connected": db_connected,
        "server_time": datetime.now(timezone.utc).isoformat(),
    }
