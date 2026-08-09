"""Factor module exports — all 9 PRD signals."""
from .credit import fetch_credit_spreads
from .datawall import fetch_data_wall
from .demand import fetch_demand_reality
from .energy import fetch_energy_costs
from .gpu import fetch_gpu_spot
from .liquidity import fetch_m2_liquidity
from .narrative import fetch_narrative
from .retail_fomo import fetch_retail_fomo
from .valuation import fetch_erp_valuation

FACTOR_FETCHERS = {
    "demand_reality": fetch_demand_reality,
    "erp_valuation": fetch_erp_valuation,
    "retail_fomo": fetch_retail_fomo,
    "m2_liquidity": fetch_m2_liquidity,
    "gpu_spot": fetch_gpu_spot,
    "credit_spreads": fetch_credit_spreads,
    "energy_costs": fetch_energy_costs,
    "data_wall": fetch_data_wall,
    "narrative": fetch_narrative,
}

__all__ = [
    "fetch_demand_reality",
    "fetch_erp_valuation",
    "fetch_retail_fomo",
    "fetch_m2_liquidity",
    "fetch_gpu_spot",
    "fetch_credit_spreads",
    "fetch_energy_costs",
    "fetch_data_wall",
    "fetch_narrative",
    "FACTOR_FETCHERS",
]
