# app/services/storage_service.py
from __future__ import annotations

from typing import Final
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


async def upload_audio_and_get_url(data: bytes, filename: str) -> str:
    """
    Upload MP3 bytes to GCS and return a public URL.
    """
    client = _get_gcs_client()
    bucket = client.bucket(_BUCKET_NAME)
    blob = bucket.blob(filename)

    # Upload from memory
    blob.upload_from_string(data, content_type="audio/mpeg")  

    return f"https://storage.googleapis.com/{_BUCKET_NAME}/{filename}"
