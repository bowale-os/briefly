from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlmodel import SQLModel, Field
from app.models.persona import Persona
from app.models.intent import Intent


class ElevenLabsRequest(SQLModel):
    """What the client sends to /api/breakdown/voice."""
    intro: str
    narration: str
    persona: Persona
    intent: Intent
    search_history_id:str