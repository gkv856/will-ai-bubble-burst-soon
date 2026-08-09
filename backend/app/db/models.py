"""SQLAlchemy ORM models for pipeline_runs, signal_scores, analog_matches."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import DeclarativeBase, relationship


def _uuid() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


class PipelineRun(Base):
    """One row per weekly pipeline execution."""

    __tablename__ = "pipeline_runs"
    __table_args__ = (
        CheckConstraint("composite_score >= 0 AND composite_score <= 100", name="ck_score_range"),
        CheckConstraint("quality_verdict IN ('GREEN','YELLOW','RED')", name="ck_quality"),
    )

    id = Column(String(36), primary_key=True, default=_uuid)
    run_date = Column(DateTime, nullable=False, index=True)
    composite_score = Column(Float)
    composite_lower = Column(Float)
    composite_upper = Column(Float)
    composite_std_dev = Column(Float)
    correlation_penalty = Column(Float, default=0.0)
    degradation_multiplier = Column(Float, default=1.0)
    weights_used = Column(JSON, nullable=False)
    quality_verdict = Column(String(10))  # GREEN / YELLOW / RED
    low_confidence = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    signal_scores = relationship("SignalScore", back_populates="run", cascade="all, delete-orphan")
    analog_matches = relationship("AnalogMatch", back_populates="run", cascade="all, delete-orphan")


class SignalScore(Base):
    """One row per signal per pipeline run."""

    __tablename__ = "signal_scores"
    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 100", name="ck_signal_score_range"),
    )

    id = Column(String(36), primary_key=True, default=_uuid)
    run_id = Column(String(36), ForeignKey("pipeline_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    factor_id = Column(String(30), nullable=False, index=True)
    raw_value = Column(Float)
    score = Column(Integer)          # 0-100 or NULL if fetch failed
    velocity_4wk = Column(Float)
    velocity_12wk = Column(Float)
    fetched_at = Column(DateTime)
    stale = Column(Boolean, default=False)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("PipelineRun", back_populates="signal_scores")


class AnalogMatch(Base):
    """Historical analog matches for one pipeline run."""

    __tablename__ = "analog_matches"

    id = Column(String(36), primary_key=True, default=_uuid)
    run_id = Column(String(36), ForeignKey("pipeline_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    library_type = Column(String(10))   # 'bubble' or 'boom'
    episode_id = Column(String(50))
    episode_name = Column(String(100))
    week_matched = Column(String(10))   # ISO date string
    similarity = Column(Float)
    weeks_to_peak = Column(Integer)
    max_drawdown_pct = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("PipelineRun", back_populates="analog_matches")
