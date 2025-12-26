# Briefly

Briefly is a personal news and audio briefing assistant. It takes a user’s interests and location, fetches relevant news, and returns short text and audio briefings that can be played in a mobile app 

> Backend: FastAPI + SQLModel + PostgreSQL  
> Frontend: Flutter  
> Audio: ElevenLabs (TTS) → MP3 stored in private Google Cloud Storage (GCS) with signed URLs

---

## Features

- Turn natural language queries (e.g. “What’s happening in Lagos today?”) into structured **intents**.
- Fetch and summarize relevant news into brief text summaries.
- Generate **audio briefings** with ElevenLabs and store them as MP3 in a private GCS bucket (`briefly007`).
- Serve audio securely via **short‑lived signed URLs** (bucket stays private; no public ACLs).


---

## Tech Stack

### Backend

- Python 3.11+
- FastAPI
- SQLModel + PostgreSQL (e.g. Neon) an online db
- Google Cloud Storage (private bucket with public access prevention)
- ElevenLabs Text‑to‑Speech API
- JWT / magic‑link authentication

### Frontend

-Flutter


