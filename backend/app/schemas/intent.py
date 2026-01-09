from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlmodel import SQLModel, Field


class IntentRequest(SQLModel):
    """What the client sends to /api/intent."""
    query: str
    persona: str


class Intent(SQLModel):

    """
    User makes a search from frontend,
    and an LLM parses the words into the Intent format...
    helps search api and tool search the internet with INTENT
    """

    user_id: uuid.UUID = None
    city: Optional[str] = None
    country: Optional[str] = None
    country_code: str = None
    timeframe: Optional[str] = None
    focus: str
    topic: str | None = None 
    tags: list[str] | None = None
    raw_query: str
    intent_label: str