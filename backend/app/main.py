# app/main.py
from fastapi import FastAPI
import app.core.event_loop

from app.core.db import init_db
from app.api import api_router

app = FastAPI(title="briefly API")


@app.on_event("startup")
async def on_startup():
    # await init_db()
    pass


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(api_router)
