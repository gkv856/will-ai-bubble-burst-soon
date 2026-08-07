"""Google Gemini AI analysis client — trend summary from factor history."""
from __future__ import annotations

import json
import logging

import requests

from ..core.config import GEMINI_API_KEY

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)

_SYSTEM_PROMPT = (
    "You are an analyst reading a daily time-series of 8 macroeconomic risk "
    "factors tracking the AI investment bubble. Each factor is scored 0-100 "
    "(0 = no risk, 100 = maximum risk). The factors are: demand (software vs "
    "hardware ETF ratio), valuation (equity risk premium), behavioral (retail "
    "FOMO via Google Trends), liquidity (reverse repo volume), gpu (GPU spot "
    "prices), credit (corporate bond spreads), energy (oil prices), and "
    "datawall (AI training compute growth).\n\n"
    "Given the data, identify cross-factor trends, flag any hidden "
    "correlations, and summarize the overall direction (rising risk, falling "
    "risk, or stable). Keep your response to 3-4 sentences. Be specific — "
    "name the factors driving the trend. Do NOT give financial advice."
)

_FALLBACK = "AI analysis unavailable."


def get_ai_analysis(history: list[dict]) -> str:
    """Sends recent factor history to Gemini Flash and returns a trend summary.

    Returns a plain-text string. On any failure, returns a fallback message
    rather than crashing the pipeline.
    """
    if not GEMINI_API_KEY:
        logging.warning("[Gemini] GEMINI_API_KEY not set — skipping AI analysis.")
        return _FALLBACK

    # Send only the last 14 entries to keep the payload small
    recent = history[-14:] if len(history) > 14 else history
    data_text = json.dumps(recent, indent=2)

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{_SYSTEM_PROMPT}\n\nDATA:\n{data_text}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 256,
        },
    }

    try:
        response = requests.post(
            f"{_GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
            timeout=30,
        )
        if response.status_code != 200:
            logging.error(f"[Gemini] API returned {response.status_code}: {response.text[:200]}")
            return _FALLBACK

        candidates = response.json().get("candidates", [])
        if not candidates:
            logging.warning("[Gemini] No candidates in response.")
            return _FALLBACK

        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return text.strip() if text.strip() else _FALLBACK

    except Exception as exc:
        logging.error(f"[Gemini] Request failed: {exc}")
        return _FALLBACK
