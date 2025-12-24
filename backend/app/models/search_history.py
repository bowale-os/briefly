from __future__ import annotations
from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field
import uuid 



class SearchHistory(SQLModel, table=True):

    """
    mirror of intent class + the time it was created
    just for storage
    """

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

    # raw intent snapshot
    raw_query: str = Field(nullable=False)
    city: str = Field(default=None, index=True)
    country: str = Field(default=None, index=True)
    country_code: str =  Field(nullable=False)
    timeframe: str = Field(default=None)
    focus: str = Field(default=None)
    intent_label: str =  Field(nullable=False)


    created_at: datetime = Field(
        default_factory=datetime.utcnow,  # NOTE: no timezone, no lambda
        nullable=False,
    )