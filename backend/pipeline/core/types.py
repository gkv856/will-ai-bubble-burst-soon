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
    """Legacy weekly entry format — kept for backward compatibility."""
    weekId: str
    timestamp: int
    factors: FactorScores
    score: int


class DailyHistoryEntry(TypedDict, total=False):
    """Daily entry format — new default."""
    dayId: str          # Required: ISO date e.g. "2026-08-07"
    timestamp: int      # Required: Unix epoch seconds
    factors: FactorScores  # Required
    score: int          # Required: 0-100 composite
    aiAnalysis: str     # Optional: Gemini trend summary

