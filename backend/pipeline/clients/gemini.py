"""Google Gemini AI analysis client — trend summary from factor history."""
from __future__ import annotations

import json
import logging

import requests

from ..core.config import GEMINI_API_KEY

_GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-3-pro-preview:generateContent"
)

_SYSTEM_PROMPT = (
    "You are an analyst reading a daily time-series of 8 macroeconomic risk "
    "factors tracking the AI investment bubble. Each factor is scored 0-100 "
    "(0 = no risk, 100 = maximum risk). The factors are: demand, valuation, "
    "behavioral, liquidity, gpu, credit, energy, and datawall.\n\n"
    "Given the previous days of data, predict the scores for the NEXT 3 DAYS "
    "(Day 1, Day 2, Day 3) for all 8 factors individually, as well as a 'composite' "
    "score for each of the 3 days. Also provide a 1-3 sentence reason for each prediction.\n"
    "You must return ONLY a JSON object with this exact structure (each 'scores' array must have exactly 3 integers):\n"
    "{\n"
    '  "composite": {"scores": [80, 81, 83], "reason": "..."},\n'
    '  "demand": {"scores": [85, 85, 86], "reason": "..."},\n'
    '  "valuation": {"scores": [60, 61, 61], "reason": "..."},\n'
    '  "behavioral": {"scores": [90, 93, 95], "reason": "..."},\n'
    '  "liquidity": {"scores": [30, 30, 31], "reason": "..."},\n'
    '  "gpu": {"scores": [75, 75, 75], "reason": "..."},\n'
    '  "credit": {"scores": [40, 42, 44], "reason": "..."},\n'
    '  "energy": {"scores": [50, 50, 49], "reason": "..."},\n'
    '  "datawall": {"scores": [95, 96, 96], "reason": "..."}\n'
    "}"
)

def get_ai_predictions(history_window: list[dict]) -> dict | None:
    """Sends recent factor history to Gemini 1.5 Pro and returns structured predictions.

    Returns a parsed JSON dict, or None on failure.
    """
    if not GEMINI_API_KEY:
        logging.warning("[Gemini] GEMINI_API_KEY not set — skipping AI predictions.")
        return None

    data_text = json.dumps(history_window, indent=2)

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
            "maxOutputTokens": 1024,
            "response_mime_type": "application/json"
        },
    }

    try:
        response = requests.post(
            f"{_GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
            timeout=45,
        )
        if response.status_code != 200:
            logging.error(f"[Gemini] API returned {response.status_code}: {response.text[:200]}")
            return None

        candidates = response.json().get("candidates", [])
        if not candidates:
            logging.warning("[Gemini] No candidates in response.")
            return None

        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        if not text.strip():
            return None
            
        return json.loads(text)

    except Exception as exc:
        logging.error(f"[Gemini] Request failed: {exc}")
        return None
