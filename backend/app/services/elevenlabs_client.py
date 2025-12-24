# app/clients/elevenlabs_client.py
from __future__ import annotations

from elevenlabs.client import ElevenLabs
from elevenlabs.environment import ElevenLabsEnvironment

from app.core.config import settings


def get_elevenlabs_client() -> ElevenLabs:
    """
    Singleton-style accessor for the ElevenLabs client.

    - Reads API key from settings.ELEVENLABS_API_KEY (or ELEVENLABS_API_KEY env).
    - Uses production environment and default timeout.
    """
    # ElevenLabs client defaults api_key to os.getenv("ELEVENLABS_API_KEY")
    # but we pass it explicitly from your settings for clarity. [web:294][web:298]
    client = ElevenLabs(
        api_key=settings.ELEVENLABS_API_KEY,
        environment=ElevenLabsEnvironment.PRODUCTION,
        timeout=240.0,
    )
    return client
