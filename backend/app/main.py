# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.core.event_loop

from app.core.db import init_db
from app.api import api_router

app = FastAPI(title="briefly API")

# CORS configuration
# allow_origin_regex covers:
#   - every Vercel preview/production deployment (*.vercel.app)
#   - local dev on any machine
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://10\.\d+\.\d+\.\d+:\d+",
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
