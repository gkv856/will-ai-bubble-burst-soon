"""FACTOR 5: AI data wall — deceleration in frontier training-compute scaling (Epoch AI)."""

from __future__ import annotations

import io

import numpy as np
import pandas as pd
import requests

from ..core.scoring import normalize_score, safe_execute

EPOCH_CSV_URL = "https://epoch.ai/data/notable_ai_models.csv"


@safe_execute(default_val=50)
def get_datawall_risk() -> int:
    response = requests.get(EPOCH_CSV_URL, timeout=30)
    response.raise_for_status()
    models = pd.read_csv(io.BytesIO(response.content))

    models["Publication date"] = pd.to_datetime(
        models["Publication date"], errors="coerce"
    )
    models = models.dropna(subset=["Publication date", "Training compute (FLOP)"])
    models = models[models["Training compute (FLOP)"] > 0].sort_values(
        "Publication date"
    )

    def frontier_log10_flop(cutoff: pd.Timestamp) -> float:
        return np.log10(
            models[models["Publication date"] <= cutoff][
                "Training compute (FLOP)"
            ].max()
        )

    latest_date = models["Publication date"].max()
    oom_growth_last_year = frontier_log10_flop(latest_date) - frontier_log10_flop(
        latest_date - pd.DateOffset(months=12)
    )
    return normalize_score(
        oom_growth_last_year, healthy_baseline=1.0, danger_threshold=0.0
    )
