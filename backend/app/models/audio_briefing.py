# app/models/audio_briefing.py
from __future__ import annotations

from datetime import datetime, timezone
import uuid
from typing import Optional

from sqlmodel import SQLModel, Field


class AudioBriefing(SQLModel, table=True):
    __tablename__ = "audio_briefings"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True, nullable=False)

    search_history_id: Optional[uuid.UUID] = Field(
        default=None, foreign_key="search_history.id", index=True, nullable=True
    )

    persona: str = Field(nullable=False)         # e.g. "streetwise"
    city: Optional[str] = Field(default=None)
    country: Optional[str] = Field(default=None)

    script: str = Field(nullable=False)          # intro + narration text
    audio_url: str = Field(nullable=False)       # GCS URL

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
