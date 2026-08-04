"""FACTOR 8: Liquidity / money supply (FRED)."""
from __future__ import annotations

from ..clients.fred import get_fred_data
from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_liquidity_risk() -> int:
    m2_supply = get_fred_data("WM2NS")
    return normalize_score(m2_supply, healthy_baseline=21000, danger_threshold=20600)
