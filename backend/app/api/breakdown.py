# app/api/breakdown.py
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.db import get_db

from app.models.user import User
from app.schemas.intent import IntentRequest, Intent
from app.models.news_article import Article
from app.models.persona import PERSONAS
from app.models.audio_briefing import AudioBriefing

from app.services.intent_service import build_intent_and_log
from app.services.intent_creator import create_intent_from_query
from app.services.news_service import fetch_articles_for_intent
from app.services.briefing_service import build_brief_intro, build_narration_text
from app.services.voice_service import synthesize_briefing_to_bytes, make_briefing_filename
from app.services.storage_service import upload_audio_and_get_url

from app.api.deps import get_current_user


router = APIRouter()


def select_top_articles(articles: list[Article], max_count: int = 10) -> list[Article]:
    sorted_by_time = sorted(
        articles,
        key=lambda a: a.published_at,
        reverse=True,
    )

    seen_urls = set()
    seen_sources: dict[str, int] = {}
    selected: list[Article] = []

    for art in sorted_by_time:
        if art.url in seen_urls:
            continue
        seen_urls.add(art.url)

        # Basic quality filter: skip obvious junk
        if not art.title or len(art.title) < 10:
            continue
        if "live blog" in art.title.lower():
            continue

        count_for_source = seen_sources.get(art.source, 0)
        if count_for_source >= 2:
            continue
        seen_sources[art.source] = count_for_source + 1

        selected.append(art)
        if len(selected) >= max_count:
            break

    return selected


@router.post("/narration")
async def intent_to_voice(
    payload: IntentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    print("THIS IS THE CURRENT USER:", current_user)
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    user_id = str(current_user.id)

    intent, search_history_id = await build_intent_and_log(
        db=db,
        raw_query=query,
        user_id=user_id,
        create_intent_from_query=create_intent_from_query,
    )

    news_response = await fetch_articles_for_intent(intent)

    top_articles = select_top_articles(news_response.articles)
    
    print(top_articles)
    print(payload.persona)
    persona_cfg = PERSONAS[payload.persona]

    intro = build_brief_intro(intent, persona_cfg)
    narration = build_narration_text(intent, top_articles, persona_cfg)

    full_script = f"{intro.strip()}\n\n{narration.strip()}"

    audio_bytes = synthesize_briefing_to_bytes(
        full_script=full_script,
        voice_id=persona_cfg.elevenlabs_voice_id,
    )

    filename = make_briefing_filename()
    audio_url = await upload_audio_and_get_url(audio_bytes, filename)
    intent = intent

    audio_briefing = AudioBriefing(
        query=query,
        user_id=current_user.id,
        persona=payload.persona,
        city=intent.city,
        country=intent.country,
        audio_url=audio_url,
        audio_filename=filename,
        script=full_script,
        search_history_id=search_history_id
    )

    db.add(audio_briefing)
    await db.commit()
    await db.refresh(audio_briefing)


    return {
        "id": str(audio_briefing.id),
        "query": audio_briefing.query,
        "persona_name": persona_cfg.display_name,
        "script": full_script,
        "city": audio_briefing.city,
        "country": audio_briefing.country,
        "created_at": audio_briefing.created_at.isoformat(),
        "has_audio": True
    }

