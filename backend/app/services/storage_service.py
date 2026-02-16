from __future__ import annotations

from typing import Final
from datetime import datetime, timezone, timedelta
from google.cloud import storage
from google.oauth2 import service_account

from app.core.config import settings

_BUCKET_NAME: Final[str] = settings.GCS_BUCKET_NAME

_client: storage.Client | None = None
_credentials = service_account.Credentials.from_service_account_file(
    settings.GCS_SERVICE_ACCOUNT_KEY_PATH
)

def _get_gcs_client() -> storage.Client:
    global _client
    if _client is None:
        _client = storage.Client(
            project=settings.GCP_PROJECT_ID,
            credentials=_credentials,
        )
    return _client

async def upload_audio_and_get_signed_url(data: bytes, filename: str, minutes_valid: int = 60) -> str:
    """
    Upload MP3 bytes to GCS and return a signed URL (expires in specified minutes).
    """
    if not data:
        raise RuntimeError("No audio data generated (empty bytes)")
    
    client = _get_gcs_client()
    bucket = client.bucket(_BUCKET_NAME)
    blob = bucket.blob(filename)

    print("UPLOAD bucket:", _BUCKET_NAME)
    print("UPLOAD filename:", filename)
    print("UPLOAD size:", len(data))

    # Upload from memory
    blob.upload_from_string(data, content_type="audio/mpeg")

    # Generate signed URL instead of public URL
    signed_url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.now(timezone.utc) + timedelta(minutes=minutes_valid),
        method="GET",
    )
    
    print("SIGNED URL:", signed_url)
    return signed_url
