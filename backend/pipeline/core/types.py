"""Shared type definitions for the pipeline (v2 — PRD-aligned)."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class RawFetch:
    """Raw output from a factor's data-fetch step (before normalization)."""
    factor_id: str
    raw_value: Optional[float]          # The actual measured metric
    fetched_at: datetime = field(default_factory=datetime.utcnow)
    error_message: Optional[str] = None


@dataclass
class SignalOutput:
    """Fully processed output for one signal after normalization + velocity."""
    factor_id: str
    raw_value: Optional[float]
    score: Optional[int]                # 0-100 normalized, or None on failure
    velocity_4wk: Optional[float] = None
    velocity_12wk: Optional[float] = None
    fetched_at: Optional[datetime] = None
    stale: bool = False
    error_message: Optional[str] = None


# ── Signal registry metadata ──────────────────────────────────────────────────

SIGNAL_REGISTRY: dict[str, dict] = {
    "demand_reality": {
        "name": "Demand Reality",
        "category": "Demand",
        "weight_default": 1 / 9,
        "velocity_safe": True,
        "invert": True,  # low ratio = high risk
    },
    "erp_valuation": {
        "name": "ERP Valuation",
        "category": "Valuation",
        "weight_default": 1 / 9,
        "velocity_safe": True,
        "invert": True,  # low/negative ERP = high risk
    },
    "retail_fomo": {
        "name": "Retail FOMO",
        "category": "Speculation",
        "weight_default": 1 / 9,
        "velocity_safe": False,  # spikey signal — NO velocity
        "invert": False,  # high interest = high risk
    },
    "m2_liquidity": {
        "name": "M2 Liquidity",
        "category": "Monetary",
        "weight_default": 1 / 9,
        "velocity_safe": True,
        "invert": True,  # contracting M2 = high risk
    },
    "gpu_spot": {
        "name": "GPU Spot Prices",
        "category": "Supply",
        "weight_default": 1 / 9,
        "velocity_safe": True,
        "invert": True,  # low GPU price = high risk (supply caught up)
    },
    "credit_spreads": {
        "name": "Credit Spreads",
        "category": "Credit",
        "weight_default": 1 / 9,
        "velocity_safe": True,
        "invert": False,  # widening spreads = high risk
    },
    "energy_costs": {
        "name": "Energy Costs",
        "category": "Physical",
        "weight_default": 1 / 9,
        "velocity_safe": True,
        "invert": False,  # high energy cost = high risk
    },
    "data_wall": {
        "name": "Data Wall",
        "category": "Scaling",
        "weight_default": 1 / 9,
        "velocity_safe": True,
        "invert": True,  # low/negative growth = high risk
    },
    "narrative": {
        "name": "Narrative Dominance",
        "category": "Sentiment",
        "weight_default": 1 / 9,
        "velocity_safe": False,  # spikey — NO velocity
        "invert": False,  # high narrative fraction = high risk
    },
}

FACTOR_IDS = list(SIGNAL_REGISTRY.keys())


# ── Legacy compat ─────────────────────────────────────────────────────────────

class FactorScores(dict):
    """Backward-compat alias. Old code used FactorScores TypedDict."""
    pass
