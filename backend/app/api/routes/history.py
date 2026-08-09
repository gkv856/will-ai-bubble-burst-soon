"""GET /api/v1/history?weeks=52 — weekly composite + per-signal scores."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.models import PipelineRun, SignalScore

router = APIRouter()


@router.get("/history")
def get_history(
    weeks: int = Query(default=52, ge=1, le=260),
    db: Session = Depends(get_db),
):
    runs = (
        db.query(PipelineRun)
        .order_by(PipelineRun.run_date.desc())
        .limit(weeks)
        .all()
    )
    if not runs:
        raise HTTPException(status_code=503, detail={"code": "NO_DATA", "message": "No pipeline runs exist yet", "status": 503})

    # Fetch all signal scores for these runs in one query
    run_ids = [r.id for r in runs]
    all_signals = db.query(SignalScore).filter(SignalScore.run_id.in_(run_ids)).all()

    # Group signals by run_id
    signals_by_run: dict[str, dict] = {r.id: {} for r in runs}
    for s in all_signals:
        if s.run_id in signals_by_run:
            signals_by_run[s.run_id][s.factor_id] = s.score

    data = [
        {
            "run_date": run.run_date.date().isoformat(),
            "composite_score": run.composite_score,
            "composite_lower": run.composite_lower,
            "composite_upper": run.composite_upper,
            "quality_verdict": run.quality_verdict,
            "signals": signals_by_run.get(run.id, {}),
        }
        for run in reversed(runs)  # oldest first
    ]

    return {"data": data}
