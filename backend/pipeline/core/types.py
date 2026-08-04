"""Shared type definitions for the pipeline."""
from __future__ import annotations

from typing import TypedDict


class FactorScores(TypedDict):
    gpu: int
    credit: int
    energy: int
    demand: int
    datawall: int
    valuation: int
    behavioral: int
    liquidity: int


class HistoryEntry(TypedDict):
    weekId: str
    timestamp: int
    factors: FactorScores
    score: int
