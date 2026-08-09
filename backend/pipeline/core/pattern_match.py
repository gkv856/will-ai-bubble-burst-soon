"""Historical analog matching — PRD §5.

Uses cosine similarity to match the current signal vector against weekly
vectors in the bubble and boom libraries.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent.parent / "data"
_BUBBLE_LIB_PATH = _DATA_DIR / "bubble_library.json"
_BOOM_LIB_PATH = _DATA_DIR / "boom_library.json"

FACTOR_IDS = [
    "demand_reality", "erp_valuation", "retail_fomo", "m2_liquidity",
    "gpu_spot", "credit_spreads", "energy_costs", "data_wall", "narrative",
]


def _load_library(path: Path) -> list[dict]:
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.warning(f"Could not load library {path}: {e}")
        return []


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def match_analogs(
    current_vector: dict[str, Optional[int]],
    library: list[dict],
    top_k: int = 3,
) -> list[dict]:
    """
    PRD §5.3 — Find top-K closest historical analogs using cosine similarity.

    current_vector: {factor_id: score} — None values are replaced with 50 (neutral).
    library: loaded bubble_library or boom_library.
    """
    # Build current vector (fill None with 50)
    current_arr = np.array(
        [current_vector.get(fid, 50) or 50 for fid in sorted(FACTOR_IDS)],
        dtype=float,
    )

    results = []
    for episode in library:
        peak_date = episode.get("peak_date")  # may be None for boom episodes

        for week_data in episode.get("weekly_vectors", []):
            signals = week_data.get("signals", {})
            historical_arr = np.array(
                [signals.get(fid, 50) for fid in sorted(FACTOR_IDS)],
                dtype=float,
            )
            similarity = _cosine_similarity(current_arr, historical_arr)

            # Compute weeks to peak
            weeks_to_peak: Optional[int] = None
            if peak_date and week_data.get("week"):
                try:
                    from datetime import date
                    peak = date.fromisoformat(peak_date)
                    wk = date.fromisoformat(week_data["week"])
                    weeks_to_peak = max(0, (peak - wk).days // 7)
                except Exception:
                    pass

            results.append({
                "episode_id": episode["episode_id"],
                "episode_name": episode["name"],
                "week_matched": week_data.get("week"),
                "similarity": round(similarity, 3),
                "weeks_to_peak": weeks_to_peak,
                "max_drawdown_pct": episode.get("max_drawdown_pct"),
            })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]


def run_pattern_matching(
    current_vector: dict[str, Optional[int]],
    top_k: int = 3,
) -> dict:
    """Load both libraries and return top matches + adjusted risk."""
    bubble_lib = _load_library(_BUBBLE_LIB_PATH)
    boom_lib = _load_library(_BOOM_LIB_PATH)

    bubble_analogs = match_analogs(current_vector, bubble_lib, top_k)
    boom_analogs = match_analogs(current_vector, boom_lib, top_k)

    best_bubble = bubble_analogs[0]["similarity"] if bubble_analogs else 0.0
    best_boom = boom_analogs[0]["similarity"] if boom_analogs else 0.0

    if best_boom > best_bubble:
        adjusted_risk = "BOOM"
        reason = f"Boom analog dominates ({best_boom:.2f} vs {best_bubble:.2f})."
    elif best_bubble > 0.80 and best_boom < 0.50:
        adjusted_risk = "BUBBLE"
        reason = f"Strong bubble match ({best_bubble:.2f}); boom signal weak ({best_boom:.2f})."
    elif best_bubble > 0.70 and best_boom > 0.60:
        adjusted_risk = "UNCERTAIN"
        reason = f"Bubble ({best_bubble:.2f}) and boom ({best_boom:.2f}) both plausible."
    else:
        adjusted_risk = "NEUTRAL"
        reason = "No dominant analog match."

    return {
        "bubble_analogs": bubble_analogs,
        "boom_analogs": boom_analogs,
        "adjusted_risk": adjusted_risk,
        "adjustment_reason": reason,
    }
