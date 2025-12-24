from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlmodel import SQLModel, Field


class IntentRequest(SQLModel):
    """What the client sends to /api/intent."""
    query: str
    persona: str


class Intent(SQLModel, table=True):

    """
    User makes a search from frontend,
    and an LLM parses the words into the Intent format...
    helps search api and tool search the internet with INTENT
    """

    __tablename__ = "intents"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    # Link to User (nullable if you want to support anonymous searches) --- think about this...
    user_id: uuid.UUID = Field(
        default=None,
        foreign_key="users.id",
        index=True,
        nullable=True,
    )

    city: Optional[str] = Field(default=None, nullable=True)
    country: str = Field(nullable=False)
    country_code: str = Field(nullable=False)
    timeframe: Optional[str] = Field(nullable=False)   # e.g. "today"
    focus: str = Field(nullable=False)       # e.g. "general", "economy"
    raw_query: str = Field(nullable=False)
    intent_label: str =  Field(nullable=False)
    gn_search_query: str = Field(nullable=False)
