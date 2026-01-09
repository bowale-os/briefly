from __future__ import annotations
from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
import uuid 



class SearchHistory(SQLModel, table=True):
    __tablename__ = "search_history"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    user_id: uuid.UUID = Field(
        default=None,
        foreign_key="users.id",
        index=True,
        nullable=False,
    )

    raw_query: str = Field(nullable=False)

    city: Optional[str] = Field(default=None, index=True, nullable=True)
    country: Optional[str] = Field(default=None, index=True, nullable=True)
    country_code: Optional[str] = Field(nullable=False)
    timeframe: Optional[str] = Field(default=None, nullable=True)
    focus: Optional[str] = Field(default=None, nullable=True)
    intent_label: str = Field(nullable=False)

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
    )
