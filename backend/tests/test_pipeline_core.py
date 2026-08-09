from __future__ import annotations

import numpy as np
import pytest

from pipeline.core.scoring import compute_velocity, percentile_rank_score
from pipeline.core.correlation import correlation_penalty
from pipeline.core.weights import compute_adaptive_weights
from pipeline.core.confidence import compute_base_variance, compute_composite


def test_compute_velocity():
    # If the trend is flat, velocity should be ~0
    history_flat = [50.0] * 10
    vel = compute_velocity(history_flat, weeks=4)
    assert vel == pytest.approx(0.0)

    # If trend is increasing, velocity should be positive
    history_up = [10.0, 20.0, 30.0, 40.0, 50.0]
    vel_up = compute_velocity(history_up, weeks=4)
    assert vel_up is not None
    assert vel_up > 0.0

    # If not enough data, returns None
    assert compute_velocity([10.0], weeks=4) is None


def test_percentile_rank_score():
    history = [10.0, 20.0, 30.0, 40.0, 50.0]
    
    # 30 is the 3rd element out of 5, so count_le = 3. 3/5 = 60%
    score = percentile_rank_score(30.0, history, invert=False)
    assert score == pytest.approx(60.0)
    
    # Inverted: 100 - 60 = 40
    score_inv = percentile_rank_score(30.0, history, invert=True)
    assert score_inv == pytest.approx(40.0)
    
    # 50 is at the top, should be 100 score
    assert percentile_rank_score(50.0, history, invert=False) == pytest.approx(100.0)
    # If inverted, high value = low risk, should be 0 score
    assert percentile_rank_score(50.0, history, invert=True) == pytest.approx(0.0)


def test_correlation_penalty():
    # Identical rows mean high correlation -> high penalty
    # 3 weeks of 9 factors
    matrix = np.array([
        [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0],
        [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0],
        [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0],
    ])
    penalty = correlation_penalty(matrix)
    assert isinstance(penalty, float)
    assert penalty >= 0.0


def test_compute_adaptive_weights():
    # If everything is neutral, weights should be distributed normally
    scores = {"demand": 50.0, "valuation": 50.0, "credit": 50.0}
    velocities = {"demand": 0.0, "valuation": 0.0, "credit": 0.0}
    
    weights = compute_adaptive_weights(scores, velocities)
    assert isinstance(weights, dict)
    assert sum(weights.values()) == pytest.approx(1.0)


def test_compute_composite():
    scores = {"f1": 80.0, "f2": 20.0}
    weights = {"f1": 0.5, "f2": 0.5}
    corr_penalty = 5.0
    
    result = compute_composite(scores, weights, corr_penalty)
    assert result["composite_score"] == pytest.approx(55.0)
