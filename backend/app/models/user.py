from __future__ import annotations
from enum import Enum
from datetime import datetime
from typing import Optional, List
import uuid
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

from sqlmodel import SQLModel, Field

class AuthMethod(str, Enum):
    PASSWORD = "password"
    GOOGLE = "google"


class User(SQLModel, table=True):
    """
    model for user of this service.
    items for identification, authentication, and preferences present...
    """
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    email: str = Field(index=True, unique=True, nullable=False)
    username: Optional[str] = Field(default=None, index=True, unique=True)

    # Auth fields
    hashed_password: Optional[str] = Field(default=None, nullable=True)
    google_sub: Optional[str] = Field(
        default=None,
        index=True,
        unique=True,
        nullable=True,
        description="Google OAuth 'sub' (subject) identifier",
    )

    # Comma-separated list: e.g. 'password', or 'google'
    auth_methods: str = Field(
        default=AuthMethod.PASSWORD,
        nullable=False,
        description="password or google from enum",
    )

    full_name: Optional[str] = Field(default=None)
    interests: list[str] | None = Field(
            default=None,
            sa_column=Column(JSONB, nullable=True),
        )    
    
    avoid_topics: list[str] | None = Field(
            default=None,
            sa_column=Column(JSONB, nullable=True),
        )        

    is_active: bool = Field(default=True, nullable=False)

    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
