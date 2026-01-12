# Briefly

Briefly is a personal news and audio briefing assistant. It takes a user’s interests and location, parses natural language queries into structured intents, fetches relevant news, and returns short text and audio briefings.

> Backend: FastAPI + SQLModel + PostgreSQL  
> Frontend: Web (React/TypeScript) and/or Flutter client  
> LLM: Gemini (intent parsing, summaries)  
> News: Google News via `pygooglenews`  
> Audio: ElevenLabs (TTS) → MP3 stored in private Google Cloud Storage (GCS) with signed URLs

---

## Features

- Turn natural language queries (e.g. “What’s happening in Lagos today?” or “what’s going on with crude oil prices?”) into structured **intents** (`intent_label`, `focus`, `city/country`, `timeframe`, `topic`, `tags`).
- Fetch and summarize relevant news into short, conversational explanations and briefings.
- Generate **audio briefings** with ElevenLabs and store them as MP3 in a private GCS bucket (e.g. `briefly007`), served via short‑lived signed URLs.
- Personalize results using user **interests** and **avoid_topics** (e.g. filter out sensitive topics the user doesn’t want to hear about).
- Expose a `/breakdown/narration` endpoint that returns both the explanation text and (when available) an audio narration URL.

---

## Tech Stack

### Backend

- Python 3.11+
- FastAPI (HTTP API + narration endpoints)
- SQLModel + PostgreSQL (e.g. Neon) for users, search history, and audio briefing metadata
- Google Cloud Storage (private bucket with public access prevention; signed URLs for audio)
- Gemini API (JSON mode) for:
  - Intent parsing (classifying query into `IntentLabel` and extracting location/timeframe/topic/tags)
  - Generating briefing scripts and explanations
- `pygooglenews` for querying Google News based on parsed intents
- ElevenLabs Text‑to‑Speech API for turning scripts into audio briefings
- JWT / magic‑link authentication for user accounts

### Frontend

- Web app: React + TypeScript (e.g. Vite or Next.js), Tailwind CSS for styling
- Optional mobile client: Flutter consuming the same HTTP API
- Uses the `/breakdown/narration` API to:
  - Send user queries and persona selection
  - Display parsed intent, article list, and generated summary
  - Play audio briefings when an audio URL is available, with graceful fallback to text‑only when TTS quota is exhausted
