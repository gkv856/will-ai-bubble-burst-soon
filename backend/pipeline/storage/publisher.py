"""Commits and pushes the updated data.json to GitHub."""
from __future__ import annotations

import logging
import subprocess

from ..core.config import OUTPUT_FILE, PROJECT_ROOT


def push_to_github() -> None:
    relative_output = OUTPUT_FILE.relative_to(PROJECT_ROOT).as_posix()
    try:
        logging.info("Pushing latest data to GitHub...")
        subprocess.run(
            ["git", "add", relative_output],
            cwd=PROJECT_ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )

        status = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=PROJECT_ROOT, capture_output=True, text=True,
        )
        if relative_output in status.stdout:
            subprocess.run(
                ["git", "commit", "-m", "data: automated weekly update of bubble metrics"],
                cwd=PROJECT_ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            )
            subprocess.run(
                ["git", "push"],
                cwd=PROJECT_ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            )
            logging.info("Successfully pushed to GitHub! Vercel will now deploy the update.")
        else:
            logging.info("No new changes detected in data.json to push.")
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.decode("utf-8") if e.stderr else str(e)
        logging.error(f"Failed to push to GitHub: {stderr}")
