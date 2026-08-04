"""Read/write access to the published history.json file."""
from __future__ import annotations

import json
import logging
import os

from ..core.config import OUTPUT_FILE
from ..core.types import HistoryEntry


def load_history() -> list[HistoryEntry]:
    try:
        with open(OUTPUT_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def upsert_entry(history: list[HistoryEntry], entry: HistoryEntry) -> list[HistoryEntry]:
    if history and history[-1].get("weekId") == entry["weekId"]:
        history[-1] = entry
        logging.info(f"Updated existing entry for {entry['weekId']}")
    else:
        history.append(entry)
        logging.info(f"Added new entry for {entry['weekId']}")
    return history


def save_history(history: list[HistoryEntry]) -> None:
    os.makedirs(OUTPUT_FILE.parent, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(history, f, indent=2)
