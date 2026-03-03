# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.core.event_loop

from app.core.db import init_db
from app.api import api_router

app = FastAPI(title="briefly API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://briefly-frontend-9rd4.onrender.com",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(api_router)
