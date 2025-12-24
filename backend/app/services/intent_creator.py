from __future__ import annotations

from enum import Enum
from typing import TypedDict

from app.models.intent import Intent
from app.services.llm_client import call_llm_json


# ---- Enums (single source of truth) ----

class FocusType(str, Enum):
    general = "general"
    politics = "politics"
    economy = "economy"
    crime = "crime"
    weather = "weather"
    local_life = "local_life"                # weather, traffic, services
    sports_entertainment = "sports_entertainment"
    mixed = "mixed"


class IntentLabel(str, Enum):
    local_news_overview = "local_news_overview"
    crime_and_security = "crime_and_security"
    economy_and_jobs = "economy_and_jobs"
    politics_and_governance = "politics_and_governance"
    events_and_fun = "events_and_fun"
    sports_updates = "sports_updates"
    weather = "weather"
    other = "other"


class IntentLLMResponse(TypedDict):
    intent_label: str
    city: str | None
    country_code: str | None
    country: str | None
    timeframe: str
    focus: str


def _format_enum_list(enum_cls: type[Enum]) -> str:
    return ",\n    ".join(f'"{m.value}"' for m in enum_cls)  # type: ignore[arg-type]


INTENT_SYSTEM_PROMPT = f"""
You are an intent parser for a local news explainer app.

Given a user's query, you must:
1) Identify the MAIN intent of the query.
2) Extract the location (city and country) if mentioned or clearly implied.
3) Identify the timeframe of interest.
4) Decide the main focus/topic of the query.

Return STRICT JSON with the following keys:

- intent_label: one of [
    {_format_enum_list(IntentLabel)}
  ]

- city: string or null, if the query doesnt specify a city

- country_code: 2-letter ISO 3166-1 alpha-2 country code or null.
  Examples: "US", "NG", "DE", "LU".

- country: full country name in English or null.
  Examples: "United States", "Nigeria", "Germany", "Luxembourg".

- timeframe: normalized string, for example:
  - "today" or "0d"
  - "1d"
  - "7d" (last week)
  - "1m" (last month)
  - "unspecified" if not clear.

- focus: one of [
    {_format_enum_list(FocusType)}
  ]

- search_query: a short keyword-only query string optimized for the pygooglenews
  Google News search.
  Rules:
  add the full country name to the beginning
  for example: Nigeria (tourism or crime or churches), Lebanon (crime OR fishes OR seas)
  - MUST include the city and/or country if known.
  - Use 3–8 focused keywords, not the whole user sentence.
  - You MAY use:
    - OR for synonyms (e.g. environment OR climate)
    - intitle: for very important words
  - Avoid unusual symbols; stick to letters, numbers, spaces, quotes, OR, intitle:.

Examples:

User: "tell me about the oceans in beirut, any good things happening?"
city: "Beirut", country: "Lebanon", country_code: "LB"
search_query: "Beirut Lebanon environment OR coast OR sea positive news"

User: "what's going on with crime in Lagos recently?"
city: "Lagos", country: "Nigeria", country_code: "NG"
search_query: "Lagos Nigeria crime recent incidents"

User: "sports updates in Berlin this week"
city: "Berlin", country: "Germany", country_code: "DE"
search_query: "Berlin Germany sports football basketball results"


Rules:
    all the fields must be provided. but city is not compulsory if not demanded..
- If the user just wants a general update about what's going on in a place,
  use intent_label = "local_news_overview" and focus = "general".
- If the question is mainly about safety, violence, protests or crime,
  use intent_label = "crime_and_security" and focus = "crime".
- If the question is mainly about jobs, prices, inflation or business,
  use intent_label = "economy_and_jobs" and focus = "economy".
- If the question is mainly about elections, politicians or policies,
  use intent_label = "politics_and_governance" and focus = "politics".
- If the question is about fun things to do, parties, concerts or festivals,
  use intent_label = "events_and_fun" and focus = "local_life".
- If the question is about sports, games or teams,
  use intent_label = "sports_updates" and focus = "sports_entertainment".
- If you are not sure, use intent_label = "other" and focus = "general".

- If the timeframe is not clearly specified, use 1m as in one month.
- If the city or country are not mentioned or clearly implied, use null.
- Never invent a country_code if you are unsure: use null for both code and name.
- Reply with JSON only, no explanations.
""".strip()



async def create_intent_from_query(raw_query: str) -> Intent:
    llm_result: IntentLLMResponse = await call_llm_json(
        system_prompt=INTENT_SYSTEM_PROMPT,
        user_prompt=f"User query: {raw_query}",
    )

    intent = Intent(
        raw_query=raw_query,
        intent_label=llm_result.get("intent_label", IntentLabel.local_news_overview.value),
        city=llm_result.get("city"),
        country=llm_result.get("country"), 
        country_code=llm_result.get("country_code"),
        timeframe=llm_result.get("timeframe"),
        focus=llm_result.get("focus", FocusType.general.value),
        gn_search_query=llm_result.get("search_query")
    )

    # If you want to persist the full country name, add a `country_name` field
    # on SearchHistory and set it there.

    return intent


