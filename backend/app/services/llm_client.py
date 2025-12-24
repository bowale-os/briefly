# app/services/llm_client.py
from __future__ import annotations

import json
from typing import Any, Dict

from google import genai
from google.genai import types

from app.core.config import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def call_llm_json(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    """
    Call Gemini and return parsed JSON for the intent.
    Expected JSON keys: intent_label, city, country, timeframe, focus, raw_query, etc.
    """
    
    contents = [
    types.Content(
        role="user",  # Gemini expects 'user' or 'model'
        parts=[types.Part(text=system_prompt)],
    ),
    types.Content(
        role="user",
        parts=[types.Part(text=user_prompt)],
    ),
]



    response = client.models.generate_content(
        model=settings.GEMINI_MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",  # tell Gemini to reply with JSON
        ),
    )

    text = response.text or ""

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM did not return valid JSON: {e}") from e



def call_llm_text(system_prompt: str, user_prompt: str) -> str:
    """
    Simple text generation: returns response.text.
    Uses system_prompt + user_prompt as the conversation.
    """
    contents = [
    types.Content(
        role="user",  # Gemini expects 'user' or 'model'
        parts=[types.Part(text=system_prompt)],
    ),
    types.Content(
        role="user",
        parts=[types.Part(text=user_prompt)],
    ),
]

    resp = client.models.generate_content(
        model=settings.GEMINI_MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.4,
            top_p=0.9,
            candidate_count=1,
        ),
    )

    text = getattr(resp, "text", "") or ""
    return text.strip()
