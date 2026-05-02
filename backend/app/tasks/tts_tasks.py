"""
VoiceForge AI - Celery Background Tasks
Handles long-running TTS generation and voice cloning.
"""
import os
import time
import hashlib
from datetime import datetime
from uuid import UUID

from celery import Celery
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.config import settings
from app.core.database import AsyncSessionLocal, Generation, Voice
from app.services.engine_manager import TTSEngineManager
from app.services.audio_processor import AudioProcessor, StorageService
from app.services.tts_base import TTSParams

# Celery app
celery_app = Celery(
    "voiceforge",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.tts_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes max
    worker_prefetch_multiplier=1,
    broker_connection_retry_on_startup=True,
)


async def get_db_session():
    async with AsyncSessionLocal() as session:
        return session


@celery_app.task(bind=True, max_retries=3)
def generate_speech_task(self, generation_id: str, params_dict: dict):
    """Background task for speech generation."""
    import asyncio
    return asyncio.run(_generate_speech_async(self, generation_id, params_dict))


async def _generate_speech_async(task, generation_id: str, params_dict: dict):
    """Async implementation of speech generation."""
    session = None
    try:
        session = AsyncSessionLocal()

        # Update status to processing
        await session.execute(
            update(Generation)
            .where(Generation.id == UUID(generation_id))
            .values(status="processing")
        )
        await session.commit()

        # Prepare params
        params = TTSParams(
            text=params_dict["text"],
            voice_id=params_dict["voice_id"],
            speed=params_dict.get("speed", 1.0),
            pitch=params_dict.get("pitch", 1.0),
            volume=params_dict.get("volume", 1.0),
            emotion=params_dict.get("emotion", "neutral"),
            language=params_dict.get("language", "en"),
            ssml=params_dict.get("ssml"),
            audio_format=params_dict.get("audio_format", "mp3")
        )

        # Generate speech
        manager = TTSEngineManager()
        result = await manager.generate(params, params_dict.get("engine"))

        # Post-process audio
        processor = AudioProcessor()
        processed_audio = processor.process_audio(
            result.audio_data,
            speed=params.speed,
            pitch=params.pitch,
            volume=params.volume,
            target_format=params.audio_format,
            normalize=True
        )

        # Upload to storage
        storage = StorageService()
        text_hash = hashlib.sha256(params.text.encode()).hexdigest()[:16]
        filename = f"{generation_id}_{text_hash}.{params.audio_format}"
        audio_url = await storage.upload(
            processed_audio,
            filename,
            content_type=f"audio/{params.audio_format}"
        )

        # Update generation record
        await session.execute(
            update(Generation)
            .where(Generation.id == UUID(generation_id))
            .values(
                status="completed",
                audio_url=audio_url,
                audio_duration=result.duration,
                audio_format=params.audio_format,
                file_size=len(processed_audio),
                sample_rate=result.sample_rate,
                processing_time=result.processing_time,
                engine=result.engine,
                completed_at=datetime.utcnow()
            )
        )
        await session.commit()

        # Trigger webhooks
        await _trigger_webhooks(session, UUID(generation_id), "generation.completed")

        return {
            "generation_id": generation_id,
            "status": "completed",
            "audio_url": audio_url,
            "duration": result.duration
        }

    except Exception as e:
        if session:
            await session.execute(
                update(Generation)
                .where(Generation.id == UUID(generation_id))
                .values(
                    status="failed",
                    error_message=str(e)[:500]
                )
            )
            await session.commit()

        # Retry logic
        if task.request.retries < 3:
            raise task.retry(exc=e, countdown=10)

        return {
            "generation_id": generation_id,
            "status": "failed",
            "error": str(e)
        }
    finally:
        if session:
            await session.close()


@celery_app.task(bind=True, max_retries=2)
def clone_voice_task(self, voice_id: str, audio_paths: list, voice_name: str, language: str):
    """Background task for voice cloning."""
    import asyncio
    return asyncio.run(_clone_voice_async(self, voice_id, audio_paths, voice_name, language))


async def _clone_voice_async(task, voice_id: str, audio_paths: list, voice_name: str, language: str):
    session = None
    try:
        session = AsyncSessionLocal()

        # Update voice status
        await session.execute(
            update(Voice)
            .where(Voice.id == UUID(voice_id))
            .values(
                metadata={"status": "processing", "progress": 0}
            )
        )
        await session.commit()

        # Clone voice
        manager = TTSEngineManager()
        model_path = await manager.clone_voice(audio_paths, voice_name, language)

        # Update voice record
        await session.execute(
            update(Voice)
            .where(Voice.id == UUID(voice_id))
            .values(
                model_path=model_path,
                metadata={"status": "ready", "progress": 100},
                quality_score=4.2  # Estimated
            )
        )
        await session.commit()

        return {
            "voice_id": voice_id,
            "status": "completed",
            "model_path": model_path
        }

    except Exception as e:
        if session:
            await session.execute(
                update(Voice)
                .where(Voice.id == UUID(voice_id))
                .values(
                    metadata={"status": "failed", "error": str(e)}
                )
            )
            await session.commit()

        if task.request.retries < 2:
            raise task.retry(exc=e, countdown=30)

        return {
            "voice_id": voice_id,
            "status": "failed",
            "error": str(e)
        }
    finally:
        if session:
            await session.close()


@celery_app.task
def cleanup_old_generations(days: int = 30):
    """Clean up old generation files."""
    import asyncio
    return asyncio.run(_cleanup_async(days))


async def _cleanup_async(days: int):
    from datetime import timedelta

    session = AsyncSessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)

        result = await session.execute(
            select(Generation)
            .where(Generation.created_at < cutoff)
            .where(Generation.status == "completed")
        )
        old_generations = result.scalars().all()

        storage = StorageService()
        deleted = 0

        for gen in old_generations:
            if gen.audio_url:
                filename = gen.audio_url.split("/")[-1]
                if await storage.delete(filename):
                    deleted += 1

        return {"deleted_files": deleted}
    finally:
        await session.close()


async def _trigger_webhooks(session, generation_id: UUID, event: str):
    """Trigger user webhooks for events."""
    from app.core.database import Webhook
    import aiohttp

    result = await session.execute(
        select(Webhook)
        .where(Webhook.events.contains([event]))
        .where(Webhook.is_active == True)
    )
    webhooks = result.scalars().all()

    for webhook in webhooks:
        try:
            async with aiohttp.ClientSession() as client:
                payload = {
                    "event": event,
                    "generation_id": str(generation_id),
                    "timestamp": datetime.utcnow().isoformat()
                }
                headers = {"Content-Type": "application/json"}
                if webhook.secret:
                    import hmac, hashlib
                    signature = hmac.new(
                        webhook.secret.encode(),
                        str(payload).encode(),
                        hashlib.sha256
                    ).hexdigest()
                    headers["X-Webhook-Signature"] = signature

                await client.post(webhook.url, json=payload, headers=headers)
        except Exception as e:
            print(f"Webhook failed for {webhook.url}: {e}")
