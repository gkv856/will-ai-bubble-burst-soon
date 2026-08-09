"""Inter-signal correlation penalty — PRD §4.4.

Computes the rolling 12-week pairwise Pearson correlation among all 9 signal
scores and returns a penalty in [0, 15] to add to the composite score.
"""
from __future__ import annotations

import numpy as np


def correlation_penalty(scores_matrix: np.ndarray) -> float:
    """
    Args:
        scores_matrix: shape (num_weeks, 9) — each column is a signal's weekly scores.
                       Must have at least 2 rows.

    Returns:
        Penalty float in [0.0, 15.0]. Zero if avg |correlation| <= 0.5.

    PRD ref: §4.4
        Baseline: avg |correlation| ≈ 0.2-0.3 in normal times.
        In crisis, converges to 0.7+.
        Maps [0.5 → 0.0, 1.0 → 15.0].
    """
    if scores_matrix.ndim != 2 or scores_matrix.shape[0] < 2 or scores_matrix.shape[1] < 2:
        return 0.0

    # Drop columns that are all-NaN or constant (can't correlate)
    valid_cols = []
    for col_idx in range(scores_matrix.shape[1]):
        col = scores_matrix[:, col_idx]
        if not np.all(np.isnan(col)) and np.nanstd(col) > 0:
            valid_cols.append(col_idx)

    if len(valid_cols) < 2:
        return 0.0

    sub = scores_matrix[:, valid_cols]
    # Replace NaN with column means before computing correlation
    col_means = np.nanmean(sub, axis=0)
    inds = np.where(np.isnan(sub))
    sub[inds] = np.take(col_means, inds[1])

    corr_matrix = np.corrcoef(sub.T)  # shape (n_valid, n_valid)
    upper_tri = corr_matrix[np.triu_indices(corr_matrix.shape[0], k=1)]
    avg_correlation = float(np.mean(np.abs(upper_tri)))

    if avg_correlation > 0.5:
        penalty = (avg_correlation - 0.5) * 30  # maps 0.5→0, 1.0→15
        return round(min(penalty, 15.0), 2)

    return 0.0
