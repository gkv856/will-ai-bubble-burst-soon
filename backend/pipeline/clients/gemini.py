"""Google Gemini AI analysis client — trend summary from factor history."""

from __future__ import annotations

import json
import logging

import requests

from ..core.config import GEMINI_API_KEY, GEMINI_MODEL
from .system_prompt import _SYSTEM_PROMPT

_GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)


def get_ai_predictions(history_window: list[dict]) -> dict | None:
    """Sends recent factor history to Gemini and returns structured predictions.

    Returns a parsed JSON dict, or None on failure.
    """
    if not GEMINI_API_KEY:
        logging.warning("[Gemini] GEMINI_API_KEY not set — skipping AI predictions.")
        return None

    data_text = json.dumps(history_window, indent=2)

    payload = {
        "contents": [{"parts": [{"text": f"{_SYSTEM_PROMPT}\n\nDATA:\n{data_text}"}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json",
        },
    }

    try:
        response = requests.post(
            f"{_GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
            timeout=45,
        )
        if response.status_code != 200:
            logging.error(
                f"[Gemini] API returned {response.status_code}: {response.text[:200]}"
            )
            return None

        candidates = response.json().get("candidates", [])
        if not candidates:
            logging.warning("[Gemini] No candidates in response.")
            return None

        candidate = candidates[0]
        finish_reason = candidate.get("finishReason")
        if finish_reason not in (None, "STOP"):
            logging.warning(f"[Gemini] Unexpected finishReason: {finish_reason}")

        # Responses can be split across multiple parts (e.g. interleaved with
        # thoughtSignature blocks) — concatenate all of them, not just parts[0].
        parts = candidate.get("content", {}).get("parts", [])
        text = "".join(part.get("text", "") for part in parts)
        if not text.strip():
            return None

        return json.loads(text)

    except Exception as exc:
        logging.error(f"[Gemini] Request failed: {exc}")
        return None
