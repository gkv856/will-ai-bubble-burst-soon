"""Pipeline core — scoring, weights, correlation, confidence, pattern matching."""
from .confidence import compute_base_variance, compute_composite, compute_confidence_interval
from .correlation import correlation_penalty
from .pattern_match import run_pattern_matching
from .scoring import compute_velocity, percentile_rank_score, safe_execute
from .types import FACTOR_IDS, SIGNAL_REGISTRY, RawFetch, SignalOutput
from .weights import compute_adaptive_weights

__all__ = [
    "percentile_rank_score",
    "compute_velocity",
    "safe_execute",
    "compute_adaptive_weights",
    "correlation_penalty",
    "compute_composite",
    "compute_confidence_interval",
    "compute_base_variance",
    "run_pattern_matching",
    "RawFetch",
    "SignalOutput",
    "FACTOR_IDS",
    "SIGNAL_REGISTRY",
]
