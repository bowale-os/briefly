from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Feedback(SQLModel, table=True):
    __tablename__ = "feedback"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    user_id: Optional[uuid.UUID] = Field(default=None, nullable=True, index=True)
    rating: Optional[int] = Field(default=None, nullable=True)  # 1–5
    message: str = Field(nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
