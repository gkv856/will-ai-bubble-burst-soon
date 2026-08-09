"""Weekly pipeline orchestrator — PRD §6.

Steps 1-10 as specified. Runs every Sunday at 02:00 UTC.
Stores all results to SQLite/PostgreSQL via SQLAlchemy.
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import numpy as np

from pipeline.core.confidence import compute_base_variance, compute_composite, compute_confidence_interval
from pipeline.core.correlation import correlation_penalty
from pipeline.core.pattern_match import run_pattern_matching
from pipeline.core.scoring import compute_velocity, percentile_rank_score
from pipeline.core.types import FACTOR_IDS, SIGNAL_REGISTRY, RawFetch, SignalOutput
from pipeline.core.weights import compute_adaptive_weights
from pipeline.factors import FACTOR_FETCHERS

logger = logging.getLogger(__name__)

STALENESS_DAYS = 14  # PRD §3.3


def _get_db_session():
    from app.db.session import SessionLocal
    return SessionLocal()


# ── Step 9: Store results ─────────────────────────────────────────────────────

def _store_pipeline_run(
    run_id: str,
    run_date: datetime,
    signal_outputs: dict[str, SignalOutput],
    composite_result: dict,
    confidence: dict,
    analog_result: dict,
    weights: dict,
    corr_penalty: float,
    quality_verdict: str,
) -> None:
    from app.db.models import AnalogMatch, PipelineRun, SignalScore

    db = _get_db_session()
    try:
        run = PipelineRun(
            id=run_id,
            run_date=run_date,
            composite_score=composite_result.get("composite_score"),
            composite_lower=confidence.get("lower"),
            composite_upper=confidence.get("upper"),
            composite_std_dev=confidence.get("std_dev"),
            degradation_multiplier=confidence.get("degradation_multiplier"),
            correlation_penalty=round(corr_penalty, 2),
            weights_used=weights,
            quality_verdict=quality_verdict,
            low_confidence=(quality_verdict == "RED"),
        )
        db.add(run)

        for fid, output in signal_outputs.items():
            ss = SignalScore(
                id=str(uuid.uuid4()),
                run_id=run_id,
                factor_id=fid,
                raw_value=output.raw_value,
                score=output.score,
                velocity_4wk=output.velocity_4wk,
                velocity_12wk=output.velocity_12wk,
                fetched_at=output.fetched_at,
                stale=output.stale,
                error_message=output.error_message,
            )
            db.add(ss)

        # Store analogs
        for atype in ("bubble", "boom"):
            for a in analog_result.get(f"{atype}_analogs", []):
                am = AnalogMatch(
                    id=str(uuid.uuid4()),
                    run_id=run_id,
                    library_type=atype,
                    episode_id=a.get("episode_id"),
                    episode_name=a.get("episode_name"),
                    week_matched=a.get("week_matched"),
                    similarity=a.get("similarity"),
                    weeks_to_peak=a.get("weeks_to_peak"),
                    max_drawdown_pct=a.get("max_drawdown_pct"),
                )
                db.add(am)

        db.commit()
        logger.info(f"Pipeline run {run_id[:8]}… stored to DB.")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to store pipeline run: {e}")
        raise
    finally:
        db.close()


# ── Historical data helpers ───────────────────────────────────────────────────

def _load_raw_history(factor_id: str, limit: int = 260) -> list[float]:
    """Load historical raw_values for a factor from the DB (oldest first)."""
    from app.db.models import PipelineRun, SignalScore
    db = _get_db_session()
    try:
        rows = (
            db.query(SignalScore.raw_value, PipelineRun.run_date)
            .join(PipelineRun, SignalScore.run_id == PipelineRun.id)
            .filter(SignalScore.factor_id == factor_id, SignalScore.raw_value.isnot(None))
            .order_by(PipelineRun.run_date.asc())
            .limit(limit)
            .all()
        )
        return [float(r.raw_value) for r in rows]
    finally:
        db.close()


def _load_score_history(factor_id: str, limit: int = 52) -> list[float]:
    """Load historical scores for velocity computation (oldest first)."""
    from app.db.models import PipelineRun, SignalScore
    db = _get_db_session()
    try:
        rows = (
            db.query(SignalScore.score, PipelineRun.run_date)
            .join(PipelineRun, SignalScore.run_id == PipelineRun.id)
            .filter(SignalScore.factor_id == factor_id, SignalScore.score.isnot(None))
            .order_by(PipelineRun.run_date.asc())
            .limit(limit)
            .all()
        )
        return [float(r.score) for r in rows]
    finally:
        db.close()


def _load_scores_matrix(limit: int = 12) -> np.ndarray:
    """Load last N weeks of all 9 signal scores as a (N, 9) matrix."""
    from app.db.models import PipelineRun, SignalScore
    db = _get_db_session()
    try:
        runs = (
            db.query(PipelineRun.id)
            .order_by(PipelineRun.run_date.desc())
            .limit(limit)
            .all()
        )
        run_ids = [r.id for r in runs]
        if not run_ids:
            return np.array([])

        all_scores = (
            db.query(SignalScore)
            .filter(SignalScore.run_id.in_(run_ids))
            .all()
        )
        # Build matrix
        by_run: dict[str, dict[str, float]] = {rid: {} for rid in run_ids}
        for s in all_scores:
            if s.score is not None:
                by_run[s.run_id][s.factor_id] = float(s.score)

        matrix_rows = []
        for rid in reversed(run_ids):  # oldest first
            row = [by_run[rid].get(fid, float("nan")) for fid in FACTOR_IDS]
            matrix_rows.append(row)

        return np.array(matrix_rows)
    finally:
        db.close()


def _count_history_weeks() -> int:
    from app.db.models import PipelineRun
    db = _get_db_session()
    try:
        return db.query(PipelineRun).count()
    finally:
        db.close()


# ── Quality verdict ────────────────────────────────────────────────────────────

def _quality_verdict(stale_count: int, missing_count: int) -> str:
    total_bad = stale_count + missing_count
    if total_bad == 0:
        return "GREEN"
    elif total_bad <= 2:
        return "YELLOW"
    else:
        return "RED"


# ── Main pipeline ─────────────────────────────────────────────────────────────

async def run_weekly_pipeline() -> None:
    """
    PRD §6.2 — Main weekly pipeline. Called by APScheduler.
    Steps 1-10.
    """
    run_id = str(uuid.uuid4())
    run_date = datetime.now(timezone.utc).replace(tzinfo=None)
    logger.info(f"=== Weekly pipeline starting. run_id={run_id[:8]} ===")

    # ── Step 1: Fetch all 9 signals in parallel ───────────────────────────────
    loop = asyncio.get_event_loop()

    async def _fetch_one(fid: str) -> tuple[str, RawFetch]:
        fetcher = FACTOR_FETCHERS[fid]
        result = await loop.run_in_executor(None, fetcher)
        return fid, result

    tasks = [_fetch_one(fid) for fid in FACTOR_IDS]
    raw_results: dict[str, RawFetch] = {}
    for coro in asyncio.as_completed(tasks):
        fid, result = await coro
        raw_results[fid] = result
        logger.info(f"  [{fid}] raw_value={result.raw_value}, error={result.error_message}")

    # ── Steps 2-3: Normalize + velocity ──────────────────────────────────────
    signal_outputs: dict[str, SignalOutput] = {}

    for fid in FACTOR_IDS:
        raw = raw_results[fid]
        meta = SIGNAL_REGISTRY[fid]

        if raw.raw_value is None:
            signal_outputs[fid] = SignalOutput(
                factor_id=fid,
                raw_value=None,
                score=None,
                stale=True,
                error_message=raw.error_message,
                fetched_at=raw.fetched_at,
            )
            continue

        # Check staleness
        now = datetime.utcnow()
        age_days = (now - raw.fetched_at).days if raw.fetched_at else 0
        is_stale = age_days > STALENESS_DAYS or (raw.error_message is not None)

        # Normalize using historical raw values from DB
        raw_history = _load_raw_history(fid, limit=260)
        raw_history.append(raw.raw_value)  # include current
        score = percentile_rank_score(
            current_value=raw.raw_value,
            history=raw_history,
            invert=meta["invert"],
        )

        # Narrative bonus: +10 if fraction > 0.70 (PRD §3.2.9)
        if fid == "narrative" and raw.raw_value is not None and raw.raw_value > 0.70:
            score = min(100, score + 10)

        # Velocity (only for velocity-safe signals)
        velocity_4wk: Optional[float] = None
        velocity_12wk: Optional[float] = None
        if meta["velocity_safe"]:
            score_hist = _load_score_history(fid, limit=52)
            score_hist.append(float(score))
            velocity_4wk = compute_velocity(score_hist, weeks=4)
            velocity_12wk = compute_velocity(score_hist, weeks=12)

        signal_outputs[fid] = SignalOutput(
            factor_id=fid,
            raw_value=raw.raw_value,
            score=score,
            velocity_4wk=velocity_4wk,
            velocity_12wk=velocity_12wk,
            fetched_at=raw.fetched_at,
            stale=is_stale,
            error_message=raw.error_message,
        )

    # ── Step 4: Adaptive weights ──────────────────────────────────────────────
    scores_map = {fid: s.score for fid, s in signal_outputs.items()}
    velocities_map = {fid: s.velocity_4wk for fid, s in signal_outputs.items()}
    weights = compute_adaptive_weights(scores_map, velocities_map)

    # ── Step 5: Correlation penalty ───────────────────────────────────────────
    scores_matrix = _load_scores_matrix(limit=12)
    corr_penalty = correlation_penalty(scores_matrix) if scores_matrix.size > 0 else 0.0

    # ── Step 6: Composite score ───────────────────────────────────────────────
    composite_result = compute_composite(scores_map, weights, corr_penalty)

    composite_score = composite_result.get("composite_score")
    if composite_score is None:
        logger.error("Composite score could not be computed — aborting run.")
        return

    # ── Step 7: Confidence interval ───────────────────────────────────────────
    stale_count = sum(1 for s in signal_outputs.values() if s.stale)
    missing_count = sum(1 for s in signal_outputs.values() if s.score is None)
    history_weeks = _count_history_weeks()

    base_variance = compute_base_variance(scores_map, weights)
    confidence = compute_confidence_interval(
        composite_score=composite_score,
        base_variance=base_variance,
        stale_count=stale_count,
        missing_count=missing_count,
        history_weeks=history_weeks,
        corr_penalty=corr_penalty,
    )

    # ── Step 8: Pattern matching ──────────────────────────────────────────────
    current_vector = {fid: s.score for fid, s in signal_outputs.items()}
    analog_result = run_pattern_matching(current_vector, top_k=3)

    # ── Step 9: Store ─────────────────────────────────────────────────────────
    quality = _quality_verdict(stale_count, missing_count)
    _store_pipeline_run(
        run_id=run_id,
        run_date=run_date,
        signal_outputs=signal_outputs,
        composite_result=composite_result,
        confidence=confidence,
        analog_result=analog_result,
        weights=weights,
        corr_penalty=corr_penalty,
        quality_verdict=quality,
    )

    # ── Step 10: Quality report ───────────────────────────────────────────────
    logger.info(
        f"=== Pipeline complete ==="
        f"\n  composite_score = {composite_score}"
        f"\n  CI = [{confidence['lower']}, {confidence['upper']}]"
        f"\n  signals_fresh={len(FACTOR_IDS) - stale_count - missing_count}"
        f"\n  signals_stale={stale_count}"
        f"\n  signals_missing={missing_count}"
        f"\n  quality_verdict={quality}"
        f"\n  corr_penalty={corr_penalty}"
        f"\n  analog_risk={analog_result.get('adjusted_risk')}"
    )


def run_pipeline_sync() -> None:
    """Convenience wrapper to run the async pipeline synchronously (for CLI use)."""
    asyncio.run(run_weekly_pipeline())
