"""GET /api/v1/analogs — latest historical pattern matching results."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.models import AnalogMatch, PipelineRun

router = APIRouter()


@router.get("/analogs")
def get_analogs(db: Session = Depends(get_db)):
    run = db.query(PipelineRun).order_by(PipelineRun.run_date.desc()).first()
    if run is None:
        raise HTTPException(status_code=503, detail={"code": "NO_DATA", "message": "No pipeline runs exist yet", "status": 503})

    analogs = db.query(AnalogMatch).filter(AnalogMatch.run_id == run.id).all()

    bubble = [
        {
            "episode_name": a.episode_name,
            "similarity": a.similarity,
            "weeks_to_peak": a.weeks_to_peak,
            "max_drawdown_pct": a.max_drawdown_pct,
        }
        for a in analogs if a.library_type == "bubble"
    ]
    boom = [
        {
            "episode_name": a.episode_name,
            "similarity": a.similarity,
            "weeks_to_peak": a.weeks_to_peak,
            "max_drawdown_pct": a.max_drawdown_pct,
        }
        for a in analogs if a.library_type == "boom"
    ]

    best_bubble = max((a["similarity"] for a in bubble), default=0)
    best_boom = max((a["similarity"] for a in boom), default=0)

    if best_boom > best_bubble:
        adjusted_risk = "LOW-MODERATE"
        reason = f"Boom analog dominates ({best_boom:.2f} vs {best_bubble:.2f}) — current signals resemble a real boom."
    elif best_bubble > 0.70 and best_boom > 0.60:
        adjusted_risk = "MODERATE-HIGH"
        reason = f"Bubble similarity high ({best_bubble:.2f}) but boom non-trivial ({best_boom:.2f}) — uncertain."
    elif best_bubble > 0.80:
        adjusted_risk = "HIGH"
        reason = f"Strong bubble analog ({best_bubble:.2f}); boom similarity low ({best_boom:.2f})."
    else:
        adjusted_risk = "MODERATE"
        reason = "No dominant analog match. Monitor signals."

    return {
        "run_date": run.run_date.date().isoformat(),
        "bubble_analogs": bubble,
        "boom_analogs": boom,
        "adjusted_risk": adjusted_risk,
        "adjustment_reason": reason,
    }
