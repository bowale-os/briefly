#app/api/briefings.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from google.cloud import storage

from app.core.db import get_db
from app.core.config import settings

from app.models.user import User
from app.models.audio_briefing import AudioBriefing

from app.api.deps import get_current_user



router = APIRouter()

@router.get("/{id}/audio-url")
async def get_signed_url(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    audio_briefing = await db.get(AudioBriefing, id)

    if audio_briefing is None:
        raise HTTPException(status_code=404, detail="Briefing not found")

    if current_user.id != audio_briefing.user_id:
        raise HTTPException(status_code=400, detail="You don't have access to this briefing")


    def generate_gcs_signed_url(
    bucket_name: str,
    blob_name: str,
    minutes_valid: int = 15,
) -> str:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=minutes_valid),
            method="GET",
        )
        return url

    signed_url = generate_gcs_signed_url(
        bucket_name=settings.GCS_BUCKET_NAME,
        blob_name=audio_briefing.audio_filename,
        minutes_valid=15
        )
    
    return {
        "signed_url": signed_url
    }
    


