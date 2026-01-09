# app/services/news_service.py
from __future__ import annotations

from datetime import datetime, timezone
from typing import List
import random

from pygooglenews import GoogleNews

from app.schemas.intent import Intent
from app.models.news_article import NewsSearchResponse, Article


FOCUS_KEYWORDS = {
    "general": "",
    "politics": "politics OR elections OR government OR parliament OR policy",
    "economy": "economy OR inflation OR jobs OR markets OR business",
    "crime": "crime OR police OR investigation OR shooting OR robbery",
    "weather": "weather OR forecast OR storm OR heatwave OR flood",
    "local_life": "events OR nightlife OR festivals OR community OR culture",
    "sports_entertainment": "sports OR football OR basketball OR concert OR entertainment OR movies OR music",
    "mixed": "news",
}


def pick_random_articles(articles: list[Article], max_count: int = 40) -> list[Article]:
    if not articles:
        return []
    k = min(max_count, len(articles))
    return random.sample(articles, k=k)



def _fallback_build_query_from_intent(intent: Intent) -> str:
    parts: list[str] = []

    # Location
    if intent.country:
        if intent.city:
            parts.append(f"{intent.city} {intent.country}")
        else:
            parts.append(intent.country)
    else:
        if intent.intent_label in {"economy_and_jobs", "politics_and_governance"}:
            parts.append("global")

    # Topic
    if intent.topic:
        parts.append(intent.topic)

    # Tags
    if intent.tags:
        tag_expr = " OR ".join(intent.tags[:6])
        parts.append(f"({tag_expr})")

    # Focus expansion
    focus = intent.focus or "general"
    extra = FOCUS_KEYWORDS.get(focus, "")
    if extra:
        parts.append(f"({extra})")

    query = " ".join(p for p in parts if p)
    return query or (intent.raw_query or "top news")



async def fetch_articles_for_intent(intent: Intent) -> NewsSearchResponse:
    country_code = intent.country_code.upper() if intent.country_code else ""
    
    try:
        gn = GoogleNews(lang='en', country=country_code)
        
        query = _fallback_build_query_from_intent(intent)

        # 2) Fallback builder if Gemini didn't provide one
        if not query:
            query = _fallback_build_query_from_intent(intent)
        
        print(f"🔍 Searching: query='{query}', country={country_code}, when={intent.timeframe}")
        
        if intent.timeframe == "unspecified":
            intent.timeframe = None
            
        # Try with timeframe first
        search_result = gn.search(query, when=intent.timeframe)
        entries = search_result.get('entries', [])
        
        # If no results with timeframe, try without it
        if not entries and intent.timeframe:
            print(f"⚠️ No results with timeframe '{intent.timeframe}', trying without...")
            search_result = gn.search(query)
            entries = search_result.get('entries', [])
        
        # If still no results, try broader query (just city name)
        if not entries and intent.city:
            print(f"⚠️ No results for '{query}', trying just city name...")
            search_result = gn.search(intent.city)
            entries = search_result.get('entries', [])
        
        print(f"✅ Found {len(entries)} articles")
        
        
        articles: List[Article] = []
        k = min(60, len(entries))
        sampled_entries = random.sample(entries, k)

        for entry in sampled_entries:
            published_raw = getattr(entry, "published", None)
            published_at = datetime.now(timezone.utc)
            
            if published_raw:
                try:
                    published_at = datetime.strptime(
                        published_raw, "%a, %d %b %Y %H:%M:%S %Z"
                    ).replace(tzinfo=timezone.utc)
                except Exception as e:
                    print(f"Date parse error: {e}")
            
            # Handle source - it can be a dict or a string
            source = getattr(entry, 'source', None)
            if isinstance(source, dict):
                source_title = source.get('title', 'Google News')
            elif isinstance(source, str):
                source_title = source
            else:
                source_title = 'Google News'
            
            # Get description/summary
            snippet = (
                getattr(entry, 'summary', '') or 
                getattr(entry, 'description', '') or 
                ''
            )
            
            articles.append(Article(
                title=entry.title,
                url=entry.link,
                source=source_title,
                published_at=published_at,
                snippet=snippet
            ))
        
        return NewsSearchResponse(
            city=intent.city or "",
            country=intent.country or "",
            timeframe=intent.timeframe,
            focus=intent.focus,
            query_used=query,
            articles=articles
        )
    
    except Exception as e:
        print(f"❌ Error fetching articles: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        
        return NewsSearchResponse(
            city=intent.city,
            country=intent.country,
            timeframe=intent.timeframe,
            focus=intent.focus,
            query_used=_fallback_build_query_from_intent(intent),
            articles=[]
        )
    

