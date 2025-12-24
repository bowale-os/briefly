# app/api/__init__.py
from fastapi import APIRouter

from app.api import breakdown, auth

api_router = APIRouter()
api_router.include_router(breakdown.router, prefix="/breakdown", tags=["breakdown"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])





