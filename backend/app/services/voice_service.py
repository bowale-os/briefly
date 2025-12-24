# app/services/voice_service.py
from __future__ import annotations

import io
import uuid
from typing import Optional

from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings

from app.core.config import settings


# The ElevenLabs client reads api_key from settings.ELEVENLABS_API_KEY
client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)


def synthesize_briefing_to_bytes(
    full_script: str,
    voice_id: str,
    *,
    stability: float = 0.45,
    similarity_boost: float = 0.9,
    style: float = 0.4,
    use_speaker_boost: bool = True,
    model_id: str = "eleven_multilingual_v2",
    output_format: str = "mp3_44100_128",
) -> bytes:
    """
    Convert a full briefing script (intro + narration) into audio bytes with ElevenLabs.

    Returns raw MP3 bytes (or empty bytes if text is blank).
    """
    text = (full_script or "").strip()
    if not text:
        return b""

    # Streaming generator from ElevenLabs API
    audio_stream = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=model_id,
        output_format=output_format,  # 44.1kHz, 128kbps MP3
        voice_settings=VoiceSettings(
            stability=stability,
            similarity_boost=similarity_boost,
            style=style,
            use_speaker_boost=use_speaker_boost,
        ),
    )

    # Collect chunks into a single bytes object
    buf = io.BytesIO()
    for chunk in audio_stream:
        if chunk:
            buf.write(chunk)

    return buf.getvalue()


def make_briefing_filename(prefix: str = "briefing", ext: str = "mp3") -> str:
    """
    Generate a unique filename for a synthesized briefing.
    You can use this with S3 / GCS / local storage.
    """
    return f"{prefix}_{uuid.uuid4()}.{ext}"
