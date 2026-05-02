"""
VoiceForge AI - Core Configuration
"""
import os
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "VoiceForge AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://voiceforge:voiceforge@localhost:5432/voiceforge"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    STORAGE_TYPE: str = "local"  # local, s3, minio
    STORAGE_BUCKET: str = "voiceforge-audio"
    STORAGE_ENDPOINT: Optional[str] = None
    STORAGE_ACCESS_KEY: Optional[str] = None
    STORAGE_SECRET_KEY: Optional[str] = None
    STORAGE_REGION: str = "us-east-1"
    LOCAL_STORAGE_PATH: str = "./storage/audio"

    # Audio Processing
    AUDIO_OUTPUT_FORMAT: str = "mp3"
    AUDIO_SAMPLE_RATE: int = 44100
    AUDIO_BITRATE: str = "192k"
    MAX_AUDIO_LENGTH_SECONDS: int = 300  # 5 minutes

    # TTS Engines
    DEFAULT_TTS_ENGINE: str = "coqui"
    ENABLE_CLOUD_FALLBACK: bool = True
    COQUI_MODEL_PATH: Optional[str] = None
    PIPER_MODEL_PATH: Optional[str] = None

    # Google Cloud TTS
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None

    # Azure Speech
    AZURE_SPEECH_KEY: Optional[str] = None
    AZURE_SPEECH_REGION: Optional[str] = None

    # AWS Polly
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10

    # Voice Cloning
    VOICE_CLONE_MIN_DURATION: int = 30  # seconds
    VOICE_CLONE_MAX_DURATION: int = 300  # seconds
    MAX_VOICES_PER_USER: int = 10

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
