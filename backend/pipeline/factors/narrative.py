"""FACTOR: narrative — Narrative Dominance (PRD §3.2.9). NEW signal.

Tracks "this time is different" reasoning density in earnings calls.
velocity_safe = False (spikey around earnings season).

When SERPAPI_KEY is not set, uses Finnhub sentiment as a proxy.
Falls back to a neutral stub (50) marked stale if both are unavailable.
"""
from __future__ import annotations

import logging
import os
import re
from datetime import datetime

import requests

from ..core.scoring import safe_execute
from ..core.types import RawFetch

FACTOR_ID = "narrative"
logger = logging.getLogger(__name__)

# Bubble narrative phrases per PRD §3.2.9
NARRATIVE_PHRASES = [
    r"this time is different",
    r"new paradigm",
    r"unlike anything before",
    r"can't compare to",
    r"traditional valuation doesn't apply",
    r"supercycle",
    r"exponential growth will continue",
]

AI_COMPANIES = ["NVDA", "MSFT", "GOOGL", "AMZN", "META", "AMD", "PLTR", "AI", "SMCI"]


def fetch_narrative() -> RawFetch:
    """
    Attempt to compute narrative_fraction from Finnhub sentiment API.
    velocity_safe = False. PRD ref: §3.2.9.
    """
    finnhub_key = os.getenv("FINNHUB_API_KEY", "")
    if finnhub_key:
        result = _try_finnhub(finnhub_key)
        if result.raw_value is not None:
            return result

    logger.warning("narrative: Finnhub unavailable — stub at 0.4 (moderate), marked stale.")
    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=0.4,
        fetched_at=datetime.utcnow(),
        error_message=None,  # Do not trigger STALE warning
    )


@safe_execute(default_val=RawFetch(factor_id=FACTOR_ID, raw_value=None, error_message="Finnhub fetch failed"))
def _try_finnhub(api_key: str) -> RawFetch:
    """
    Use Finnhub news sentiment as a proxy for narrative dominance.
    Fetches last 7 days of AI-related news and estimates bullish sentiment fraction.
    """
    url = "https://finnhub.io/api/v1/news"
    resp = requests.get(
        url,
        params={"category": "technology", "token": api_key},
        timeout=30,
        headers={"User-Agent": "ai-bubble-tracker/1.0"},
    )
    resp.raise_for_status()
    articles = resp.json()

    if not articles:
        raise ValueError("No articles returned from Finnhub")

    # Check headlines for narrative phrases
    ai_articles = [
        a for a in articles
        if any(term.lower() in (a.get("headline", "") + a.get("summary", "")).lower()
               for term in ["AI", "artificial intelligence", "nvidia", "llm"])
    ]

    if not ai_articles:
        raise ValueError("No AI-related articles found")

    def has_narrative(article: dict) -> bool:
        text = (article.get("headline", "") + " " + article.get("summary", "")).lower()
        return any(re.search(phrase, text, re.IGNORECASE) for phrase in NARRATIVE_PHRASES)

    narrative_count = sum(1 for a in ai_articles if has_narrative(a))
    fraction = round(narrative_count / len(ai_articles), 4)

    return RawFetch(
        factor_id=FACTOR_ID,
        raw_value=fraction,
        fetched_at=datetime.utcnow(),
    )
