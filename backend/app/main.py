# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.core.event_loop

from app.core.db import init_db
from app.api import api_router

app = FastAPI(title="briefly API")

# CORS configuration
origins = [
    "http://10.154.80.55:3000",
    "http://localhost:3000",  # Add localhost for local dev too
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
