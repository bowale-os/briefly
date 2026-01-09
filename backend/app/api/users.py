#app/api/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import timedelta


from app.core.db import get_db
from app.models.user import User
from app.core.config import settings
from app.schemas.user import UserInfoRequest, UserUpdateModel
from app.api.deps import get_current_user


router = APIRouter()

@router.get('/me', response_model=UserInfoRequest)
async def get_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch('/me', response_model=UserInfoRequest)
async def edit_user_info(
    request: UserUpdateModel,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    for class_field, user_value in request.model_dump(exclude_unset=True).items():
        setattr(current_user, class_field, user_value)


    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

