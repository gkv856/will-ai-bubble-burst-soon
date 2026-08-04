"""FACTOR 2: Credit spreads (FRED)."""
from __future__ import annotations

from ..clients.fred import get_fred_data
from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_credit_risk() -> int:
    credit_spread = get_fred_data("BAMLC0A0CM")
    return normalize_score(credit_spread, healthy_baseline=3.5, danger_threshold=5.5)
