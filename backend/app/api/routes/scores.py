"""GET /api/v1/scores/latest — most recent composite score with all signal details."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.db.models import AnalogMatch, PipelineRun, SignalScore

router = APIRouter()

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


@router.get("/scores/latest")
def get_latest_scores(db: Session = Depends(get_db)):
    run: PipelineRun | None = (
        db.query(PipelineRun).order_by(PipelineRun.run_date.desc()).first()
    )
    if run is None:
        raise HTTPException(status_code=503, detail={"code": "NO_DATA", "message": "No pipeline runs exist yet", "status": 503})

    signals = db.query(SignalScore).filter(SignalScore.run_id == run.id).all()
    analogs = db.query(AnalogMatch).filter(AnalogMatch.run_id == run.id).all()

    bubble_analogs = [
        {
            "episode_name": a.episode_name,
            "similarity": a.similarity,
            "weeks_to_peak": a.weeks_to_peak,
            "max_drawdown_pct": a.max_drawdown_pct,
        }
        for a in analogs if a.library_type == "bubble"
    ]
    boom_analogs = [
        {
            "episode_name": a.episode_name,
            "similarity": a.similarity,
            "weeks_to_peak": a.weeks_to_peak,
            "max_drawdown_pct": a.max_drawdown_pct,
        }
        for a in analogs if a.library_type == "boom"
    ]

    # Compute adjusted risk from analog similarities
    best_bubble = max((a["similarity"] for a in bubble_analogs), default=0)
    best_boom = max((a["similarity"] for a in boom_analogs), default=0)
    adjusted_risk, adjustment_reason = _compute_adjusted_risk(best_bubble, best_boom, run.composite_score)

    # Stale signals for quality reporting
    stale_signals = [s.factor_id for s in signals if s.stale]

    return {
        "run_id": run.id,
        "run_date": run.run_date.isoformat() + "Z",
        "composite_score": run.composite_score,
        "confidence_interval": {
            "lower": run.composite_lower,
            "upper": run.composite_upper,
            "std_dev": run.composite_std_dev,
            "degradation_multiplier": getattr(run, "degradation_multiplier", None),
            "confidence_level": "95%",
        },
        "correlation_penalty": run.correlation_penalty,
        "quality_verdict": run.quality_verdict,
        "low_confidence": run.low_confidence,
        "stale_signals": stale_signals,
        "weights_used": run.weights_used,
        "signals": [
            {
                "factor_id": s.factor_id,
                "name": SIGNAL_NAMES.get(s.factor_id, s.factor_id),
                "score": s.score,
                "raw_value": s.raw_value,
                "velocity_4wk": s.velocity_4wk,
                "velocity_12wk": s.velocity_12wk,
                "stale": s.stale,
                "error_message": s.error_message,
                "weight_used": (run.weights_used or {}).get(s.factor_id),
            }
            for s in signals
        ],
        "analogs": {
            "bubble": bubble_analogs,
            "boom": boom_analogs,
            "adjusted_risk": adjusted_risk,
            "adjustment_reason": adjustment_reason,
        },
    }


def _compute_adjusted_risk(best_bubble: float, best_boom: float, score: float | None) -> tuple[str, str]:
    """Map analog similarities + composite score to an adjusted risk label."""
    base = score or 0
    if base < 30:
        tier = "LOW"
    elif base < 50:
        tier = "MODERATE"
    elif base < 70:
        tier = "MODERATE-HIGH"
    else:
        tier = "HIGH"

    tiers = ["LOW", "MODERATE", "MODERATE-HIGH", "HIGH", "EXTREME"]

    if best_boom > best_bubble:
        # Reduce by 2 tiers
        idx = max(0, tiers.index(tier) - 2)
        reason = f"Boom analog dominates (similarity {best_boom:.2f} vs bubble {best_bubble:.2f}). Current state resembles a real boom, not a bubble."
    elif best_bubble > 0.70 and best_boom > 0.60:
        # Reduce by 1 tier
        idx = max(0, tiers.index(tier) - 1)
        reason = f"Bubble similarity is high ({best_bubble:.2f}) but boom similarity is non-trivial ({best_boom:.2f}), indicating uncertainty."
    else:
        idx = tiers.index(tier)
        reason = f"Strong bubble pattern match ({best_bubble:.2f}); no significant boom analog detected."

    return tiers[idx], reason
