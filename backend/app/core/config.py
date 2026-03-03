# app/core/config.py
from __future__ import annotations
import os
import base64
import json
from pydantic_settings import BaseSettings, SettingsConfigDict
from google.oauth2 import service_account

class Settings(BaseSettings):

    @property
    def gcs_credentials(self):
        """Get GCS credentials - supports local file OR Vercel base64 env var"""
        # Vercel base64 key (priority)
        b64_key = os.getenv("GCS_SERVICE_ACCOUNT_KEY_B64")
        if b64_key:
            try:
                key_data = base64.b64decode(b64_key)
                return service_account.Credentials.from_service_account_info(
                    json.loads(key_data)
                )
            except Exception as e:
                print(f"GCS base64 decode failed: {e}")
        
        # Local file fallback (development)
        if os.path.exists(self.GCS_SERVICE_ACCOUNT_KEY_PATH):
            return service_account.Credentials.from_service_account_file(
                self.GCS_SERVICE_ACCOUNT_KEY_PATH
            )
        
        raise ValueError("No GCS credentials found")


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
    GCS_SERVICE_ACCOUNT_KEY_PATH: str | None = None
    GCS_SERVICE_ACCOUNT_KEY_B64: str | None = None

settings = Settings()
