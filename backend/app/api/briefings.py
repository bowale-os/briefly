# app/api/briefings.py
from __future__ import annotations

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from google.cloud import storage
from google.oauth2 import service_account

from app.core.db import get_db
from app.core.config import settings
from app.models.user import User
from app.models.audio_briefing import AudioBriefing
from app.api.deps import get_current_user


router = APIRouter()


def generate_gcs_signed_url(
    bucket_name: str,
    blob_name: str,
    minutes_valid: int = 15,
) -> str:
    credentials = service_account.Credentials.from_service_account_file(
        settings.GCS_SERVICE_ACCOUNT_KEY_PATH
    )

    storage_client = storage.Client(
        project=settings.GCP_PROJECT_ID,
        credentials=credentials,
    )
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.now(timezone.utc) + timedelta(minutes=minutes_valid),
        method="GET",
    )
    return url


@router.get("/{id}/audio-url")
async def get_signed_url(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    audio_briefing = await db.get(AudioBriefing, id)

    if audio_briefing is None:
        raise HTTPException(status_code=404, detail="Briefing not found")

    if current_user.id != audio_briefing.user_id:
        raise HTTPException(status_code=400, detail="You don't have access to this briefing")

    print("BRIEFING audio_filename:", audio_briefing.audio_filename)
    print("BRIEFING audio_url:", audio_briefing.audio_url)

    if not audio_briefing.audio_filename:
        raise HTTPException(status_code=400, detail="No audio file stored for this briefing")

    signed_url = generate_gcs_signed_url(
        bucket_name=settings.GCS_BUCKET_NAME,
        blob_name=audio_briefing.audio_filename,
        minutes_valid=15,
    )

    print("SIGNED bucket:", settings.GCS_BUCKET_NAME)
    print("SIGNED blob:", audio_briefing.audio_filename)
    print("SIGNED url:", signed_url)

    return {"signed_url": signed_url}

