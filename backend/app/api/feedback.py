from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.feedback import Feedback
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


class FeedbackRequest(BaseModel):
    rating: Optional[int] = None  # 1–5, optional
    message: str


@router.post("")
async def submit_feedback(
    payload: FeedbackRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedback = Feedback(
        user_id=current_user.id,
        rating=payload.rating,
        message=payload.message,
    )
    db.add(feedback)
    await db.commit()
    return {"ok": True}
