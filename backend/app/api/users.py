#app/api/users.py

from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from datetime import timedelta
from uuid import UUID


from app.core.db import get_db
from app.models.user import User
from app.models.audio_briefing import AudioBriefing
from app.core.config import settings
from app.schemas.user import UserInfoRequest, UserUpdateModel, UserHistoryResponse
from app.api.deps import get_current_user


router = APIRouter()

@router.get('/me', response_model=UserInfoRequest)
async def get_user_info(current_user: User = Depends(get_current_user)):
    """    
    :current_user: depedency to check authorization/ log in status
    :type current_user: User

    :return current_user
    """
    return current_user



@router.patch('/me', response_model=UserInfoRequest)
async def edit_user_info(
    request: UserUpdateModel,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    
    """    
    :param current_user: depedency to check authorization/ log in status
    :type current_user: User
    :param db: connection to database
    :type db: AsyncSession
    :param request: JSON field with optional user data(s)
    :type db: UserUpdateModal

    :return current_user
    """

    for class_field, user_value in request.model_dump(exclude_unset=True).items():
        setattr(current_user, class_field, user_value)


    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get('/{id}/briefings')
async def get_user_briefings(
    id: UUID = Path(..., description="User ID", example="550e8400-e29b-41d4-a716-446655440000"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    
    """    
    :param current_user: depedency to check authorization/ log in status
    :type current_user: User
    :param db: connection to database
    :type db: AsyncSession

    :return UserHistoryModel:/ a list of all searches/ audio briefings to users name
    """
    

    if id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this user")
    
    stmt = select(AudioBriefing).where(AudioBriefing.user_id == id)
    result = await db.execute(stmt)
    briefings_list = result.scalars().all()
    
    return UserHistoryResponse(briefings=briefings_list)


