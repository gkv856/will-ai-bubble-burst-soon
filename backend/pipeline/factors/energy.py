"""FACTOR 3: Energy constraints — US retail electricity price (FRED)."""
from __future__ import annotations

from ..clients.fred import get_fred_data
from ..core.scoring import normalize_score, safe_execute


@safe_execute(default_val=50)
def get_energy_risk() -> int:
    price_per_kwh = get_fred_data("APU000072610")
    return normalize_score(price_per_kwh, healthy_baseline=0.15, danger_threshold=0.22)
