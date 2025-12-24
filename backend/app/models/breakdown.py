# breakdown.py
from typing import List
import uuid
from sqlmodel import SQLModel, Field
from app.models.intent import Intent
from app.models.news_article import Article


class Topic(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    title: str = Field(nullable=False)
    headline_summary: str = Field(nullable=False)
    deep_explanation: str = Field(nullable=False)
    why_it_matters_locally: str = Field(nullable=False)


class BreakdownRequest(SQLModel):
    intent: Intent
    articles: List[Article]


class BreakdownResponse(SQLModel):
    city: str
    timeframe: str
    topics: List[Topic]
