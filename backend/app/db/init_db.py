"""Create all tables on startup (idempotent)."""
from __future__ import annotations

from .models import Base
from .session import engine


def init_db() -> None:
    """Create all tables if they don't exist yet."""
    Base.metadata.create_all(bind=engine)
