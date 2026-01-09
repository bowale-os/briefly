# app/services/intent_service.py
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.intent import Intent
from app.models.search_history import SearchHistory


async def build_intent_and_log(
    db: AsyncSession,
    raw_query: str,
    user_id: str | None,
    create_intent_from_query,
) -> Intent:
    intent = await create_intent_from_query(raw_query)
    print(intent) #for log purposes

    search_history = SearchHistory(
        user_id=user_id,
        raw_query=intent.raw_query,
        intent_label=intent.intent_label,
        city=intent.city,
        country=intent.country,
        country_code=intent.country_code,
        timeframe=intent.timeframe,
        focus=intent.focus,
    )
    db.add(search_history)
    await db.commit()
    await db.refresh(search_history)

    return intent, search_history.id