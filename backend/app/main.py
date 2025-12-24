# app/main.py
from fastapi import FastAPI

from app.core.db import init_db
from app.api import api_router

app = FastAPI(title="News Persona API")


@app.on_event("startup")
async def on_startup():
    await init_db()


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(api_router)
