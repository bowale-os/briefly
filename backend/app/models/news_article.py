from datetime import datetime
from typing import Optional, List
import uuid
from sqlmodel import SQLModel, Field


class Article(SQLModel):

    """
    Search tool browses the internet and find articles related to user search
    it makes an Article model for each article it finds..
    """

    __tablename__ = "articles"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )

    title: str = Field(nullable=False)
    url: str = Field(nullable=False)
    source: str = Field(nullable=False)
    published_at: datetime = Field(nullable=False)
    snippet: str = Field(nullable=False)




class NewsSearchResponse(SQLModel):
    """
    this model aggregates all artices found based on the user's intent
    and passes it to breakdown
    """
    city: Optional[str] = None
    country: str 
    timeframe: str 
    focus: str
    query_used: str
    articles: List[Article] 
