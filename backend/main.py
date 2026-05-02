"""
VoiceForge AI - Main FastAPI Application
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import VoiceForgeException
from app.api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    print("✅ Database initialized")

    yield

    # Shutdown
    print("👋 Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="""
    VoiceForge AI - Professional Text-to-Speech API

    ## Features
    - **Multi-engine TTS**: Coqui TTS, Piper TTS, Google Cloud, Azure Speech, AWS Polly
    - **Voice Cloning**: Clone voices from audio samples
    - **30+ Languages**: Support for global languages
    - **Emotion Control**: Neutral, happy, sad, angry, excited, whisper, shouting
    - **SSML Support**: Advanced speech markup
    - **Streaming**: Real-time audio streaming
    - **Batch Processing**: Generate multiple audio files at once

    ## Authentication
    All endpoints require Bearer token authentication except `/auth/register` and `/auth/login`.

    ## Rate Limiting
    - Free tier: 60 requests/minute
    - Pro tier: 600 requests/minute
    - Enterprise: Custom limits
    """,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom exception handler
@app.exception_handler(VoiceForgeException)
async def voiceforge_exception_handler(request: Request, exc: VoiceForgeException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "error_code": exc.error_code,
            "path": str(request.url.path)
        }
    )

# Include routers
app.include_router(api_router)

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    from datetime import datetime
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "up",
            "database": "up",
            "redis": "up"
        }
    }


@app.get("/", tags=["Root"])
async def root():
    """API root."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "documentation": "/docs",
        "health": "/health"
    }


# Mount static files for local audio storage
import os
if settings.STORAGE_TYPE == "local":
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
    app.mount("/audio", StaticFiles(directory=settings.LOCAL_STORAGE_PATH), name="audio")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else 4
    )
