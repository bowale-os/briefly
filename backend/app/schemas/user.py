from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from app.models.audio_briefing import AudioBriefing



class UserInfoRequest(BaseModel):
    id: UUID
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    interests: Optional[list[str]] = None
    avoid_topics: Optional[list[str]] = None

    class Config:
        from_attributes = True


class UserUpdateModel(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    interests: Optional[list[str]] = None
    avoid_topics: Optional[list[str]] = None



class UserHistoryResponse(BaseModel):
    briefings: List[AudioBriefing] = []
