"""GET /api/v1/signals/{factor_id}/history?weeks=52 — single signal history."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.models import PipelineRun, SignalScore

SIGNAL_NAMES = {
    "demand_reality": "Demand Reality",
    "erp_valuation": "ERP Valuation",
    "retail_fomo": "Retail FOMO",
    "m2_liquidity": "M2 Liquidity",
    "gpu_spot": "GPU Spot Prices",
    "credit_spreads": "Credit Spreads",
    "energy_costs": "Energy Costs",
    "data_wall": "Data Wall",
    "narrative": "Narrative Dominance",
}

VALID_FACTOR_IDS = set(SIGNAL_NAMES.keys())

router = APIRouter()


@router.get("/signals/{factor_id}/history")
def get_signal_history(
    factor_id: str = Path(...),
    weeks: int = Query(default=52, ge=1, le=260),
    db: Session = Depends(get_db),
):
    if factor_id not in VALID_FACTOR_IDS:
        raise HTTPException(
            status_code=404,
            detail={"code": "SIGNAL_NOT_FOUND", "message": f"Factor '{factor_id}' not found in registry", "status": 404},
        )

    # Join signal_scores with pipeline_runs to get the date
    rows = (
        db.query(SignalScore, PipelineRun.run_date)
        .join(PipelineRun, SignalScore.run_id == PipelineRun.id)
        .filter(SignalScore.factor_id == factor_id)
        .order_by(PipelineRun.run_date.desc())
        .limit(weeks)
        .all()
    )

    if not rows:
        raise HTTPException(status_code=503, detail={"code": "NO_DATA", "message": "No data available", "status": 503})

    data = [
        {
            "run_date": run_date.date().isoformat(),
            "score": signal.score,
            "raw_value": signal.raw_value,
            "velocity_4wk": signal.velocity_4wk,
            "velocity_12wk": signal.velocity_12wk,
            "stale": signal.stale,
        }
        for signal, run_date in reversed(rows)
    ]

    return {
        "factor_id": factor_id,
        "name": SIGNAL_NAMES[factor_id],
        "data": data,
    }
