"""FACTOR: energy_costs — Average US retail electricity price (PRD §3.2.7).

High energy cost = high risk (AI infra margin compression).
score = percentile_rank(price_cents_per_kwh).
"""
from __future__ import annotations

from datetime import datetime

from ..clients.fred import get_fred_data
from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "energy_costs"
SERIES_ID = "APUS000072610"  # Average retail electricity price, US city average


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="FRED fetch failed"))
def fetch_energy_costs() -> RawFetch:
    """
    Fetch latest US average retail electricity price (cents per kWh).
    PRD ref: §3.2.7
    """
    price_cents_per_kwh = get_fred_data(SERIES_ID)
    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=round(price_cents_per_kwh, 4),
        fetched_at=datetime.utcnow(),
    )
