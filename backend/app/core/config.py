# app/core/config.py
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "briefly API"
    
    # ---------General-----------
    ENVIRONMENT: str = "development"

    # --- Security ---
    # Used to sign the JWT tokens (your app's session wristband)
    # Generate one using: openssl rand -hex 32
    JWT_SECRET_KEY: str 
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE: int = 24 # 24 hours

    #database for storage
    DATABASE_URL: str

    DEBUG: bool = True

    GEMINI_API_KEY: str
    GEMINI_MODEL_NAME: str = "gemini-2.5-flash" 

    ELEVENLABS_API_KEY: str

    GCS_BUCKET_NAME: str
    GCP_PROJECT_ID: str
    GCS_SERVICE_ACCOUNT_KEY_PATH: str

settings = Settings()
