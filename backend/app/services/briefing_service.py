# app/services/briefing_service.py
import json
from typing import List

from app.models.intent import Intent
from app.models.news_article import Article
from app.services.llm_client import call_llm_text
from app.models.persona import PersonaConfig  # where PERSONAS lives


def _articles_to_payload(articles: List[Article]) -> list[dict]:
    return [
        {
            "id": str(a.id),
            "title": a.title,
            "source": a.source,
            "published_at": a.published_at.isoformat() if a.published_at else None,
            "snippet": a.snippet,
            "url": a.url,
        }
        for a in articles
    ]


def build_brief_intro(intent: Intent, persona: PersonaConfig) -> str:
    system_prompt = (
        persona.gemini_system_prompt
        + "\n\nYou are generating only a short intro (1–2 sentences) to a news briefing. "
        "Mention the city, timeframe, and focus from the intent if available. "
        "Output plain text only."
    )

    user_prompt = f"Intent:\n{intent.model_dump_json(indent=2)}\n\nWrite the intro."
    return call_llm_text(system_prompt, user_prompt)


def build_narration_text(
    intent: Intent,
    articles: List[Article],
    persona: PersonaConfig,
) -> str:
    base_style = """
    there has been a short intro, so start this narration like you are continuing what you were saying..
You are generating an approximately 2 minute spoken news briefing (about 250 words, 5000 characters max).
Use ONLY the information from the provided articles.
Do NOT invent facts, locations, dates, or events that are not clearly supported by the articles.

Tone and voice:
- Sound like a smart, relaxed friend talking directly to one person.
- Use natural contractions (you're, it's, there's, don't).
- Mix short punchy sentences with a few longer ones.
- Occasionally start sentences with “And”, “But”, or “So” when it feels natural.
- Avoid stiff phrases like “in conclusion”, “moreover”, or “additionally”.

Structure:
- Open with 1–2 sentences that hook the listener and name the city/country and rough timeframe.
- Group related points into clear mini-sections with smooth transitions.
- End with a simple human-sounding wrap-up, not a formal summary.

If the articles do not clearly match the user's requested location or topic,
say that directly and explain that you cannot provide a reliable briefing on that request.
If different articles disagree, mention that briefly instead of choosing a side.
"""



    system_prompt = persona.gemini_system_prompt + "\n\n" + base_style

    articles_payload = _articles_to_payload(articles)

    user_prompt = (
        "Intent:\n"
        f"{intent.model_dump_json(indent=2)}\n\n"
        "Articles:\n"
        f"{json.dumps(articles_payload, indent=2)}\n\n"
        "Write the full spoken narration script."
    )

    return call_llm_text(system_prompt, user_prompt)
