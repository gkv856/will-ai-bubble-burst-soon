"""Read/write access to the published data.json file."""
from __future__ import annotations

import json
import logging
import os

from ..core.config import OUTPUT_FILE


def load_history() -> list[dict]:
    try:
        with open(OUTPUT_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _entry_id(entry: dict) -> str:
    """Returns the unique identifier for an entry (dayId or legacy weekId)."""
    return entry.get("dayId") or entry.get("weekId", "")


def upsert_entry(history: list[dict], entry: dict) -> list[dict]:
    """Insert or update a single entry, matching on dayId/weekId."""
    entry_key = _entry_id(entry)
    for i, existing in enumerate(history):
        if _entry_id(existing) == entry_key:
            history[i] = entry
            logging.info(f"Updated existing entry for {entry_key}")
            return history
    history.append(entry)
    logging.info(f"Added new entry for {entry_key}")
    return history


def upsert_bulk(history: list[dict], entries: list[dict]) -> list[dict]:
    """Merge multiple entries into history, deduplicating by dayId."""
    existing_ids = {_entry_id(e): i for i, e in enumerate(history)}
    for entry in entries:
        key = _entry_id(entry)
        if key in existing_ids:
            history[existing_ids[key]] = entry
            logging.info(f"Updated existing entry for {key}")
        else:
            history.append(entry)
            existing_ids[key] = len(history) - 1
            logging.info(f"Added new entry for {key}")
    # Sort by dayId/weekId so the timeline is in order
    history.sort(key=lambda e: _entry_id(e))
    return history


def save_history(history: list[dict]) -> None:
    os.makedirs(OUTPUT_FILE.parent, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(history, f, indent=2)

