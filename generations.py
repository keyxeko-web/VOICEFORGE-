"""
VoiceForge AI - Generation API Routes
"""
from typing import Optional
from uuid import UUID
import hashlib

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from app.core.database import get_db, User, Generation, Voice, Project
from app.core.security import get_current_active_user
from app.core.exceptions import NotFoundException, ValidationException, RateLimitException
from app.core.config import settings
from app.schemas import (
    GenerationCreate, GenerationResponse, GenerationListResponse,
    GenerationUpdate, BatchGenerationRequest, BatchGenerationResponse
)
from app.services.engine_manager import get_engine_manager
from app.services.audio_processor import AudioProcessor, StorageService
from app.services.tts_base import TTSParams
from app.tasks.tts_tasks import generate_speech_task

router = APIRouter(prefix="/generations", tags=["Generations"])


@router.get("", response_model=GenerationListResponse)
async def list_generations(
    project_id: Optional[UUID] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List user's generation history."""
    query = select(Generation).where(Generation.user_id == current_user.id)

    if project_id:
        query = query.where(Generation.project_id == project_id)
    if status:
        query = query.where(Generation.status == status)

    query = query.order_by(Generation.created_at.desc())

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    generations = result.scalars().all()

    return GenerationListResponse(
        items=generations,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=GenerationResponse, status_code=status.HTTP_201_CREATED)
async def create_generation(
    gen_data: GenerationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new TTS generation."""
    # Validate voice exists
    result = await db.execute(select(Voice).where(Voice.id == gen_data.voice_id))
    voice = result.scalar_one_or_none()
    if not voice:
        raise NotFoundException("Voice", str(gen_data.voice_id))

    # Validate project if provided
    if gen_data.project_id:
        result = await db.execute(
            select(Project).where(Project.id == gen_data.project_id, Project.user_id == current_user.id)
        )
        if not result.scalar_one_or_none():
            raise NotFoundException("Project", str(gen_data.project_id))

    # Validate text length
    if len(gen_data.text) > 50000:
        raise ValidationException("Text too long. Maximum 50,000 characters.")

    # Check rate limit
    from datetime import datetime, timedelta
    one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
    result = await db.execute(
        select(func.count())
        .where(Generation.user_id == current_user.id)
        .where(Generation.created_at > one_minute_ago)
    )
    recent_count = result.scalar()

    if recent_count >= settings.RATE_LIMIT_PER_MINUTE:
        raise RateLimitException()

    # Create generation record
    text_hash = hashlib.sha256(gen_data.text.encode()).hexdigest()
    generation = Generation(
        user_id=current_user.id,
        project_id=gen_data.project_id,
        voice_id=gen_data.voice_id,
        text=gen_data.text,
        text_hash=text_hash,
        ssml=gen_data.ssml,
        speed=gen_data.speed,
        pitch=gen_data.pitch,
        volume=gen_data.volume,
        emotion=gen_data.emotion,
        language=gen_data.language,
        audio_format=gen_data.audio_format,
        status="pending"
    )

    db.add(generation)
    await db.commit()
    await db.refresh(generation)

    if gen_data.stream:
        # Streaming mode - generate synchronously
        return await _stream_generation(generation, gen_data, db)
    else:
        # Async mode - queue background task
        params_dict = {
            "text": gen_data.text,
            "voice_id": str(gen_data.voice_id),
            "speed": gen_data.speed,
            "pitch": gen_data.pitch,
            "volume": gen_data.volume,
            "emotion": gen_data.emotion,
            "language": gen_data.language,
            "ssml": gen_data.ssml,
            "audio_format": gen_data.audio_format,
            "engine": voice.engine if hasattr(voice, 'engine') else None
        }

        generate_speech_task.delay(str(generation.id), params_dict)

        return generation


async def _stream_generation(generation, gen_data, db):
    """Handle streaming generation."""
    manager = await get_engine_manager()
    params = TTSParams(
        text=gen_data.text,
        voice_id=str(gen_data.voice_id),
        speed=gen_data.speed,
        pitch=gen_data.pitch,
        volume=gen_data.volume,
        emotion=gen_data.emotion,
        language=gen_data.language,
        audio_format=gen_data.audio_format
    )

    result = await manager.generate(params)

    # Process audio
    processor = AudioProcessor()
    processed = processor.process_audio(
        result.audio_data,
        speed=params.speed,
        pitch=params.pitch,
        volume=params.volume,
        target_format=params.audio_format
    )

    # Update generation
    await db.execute(
        update(Generation)
        .where(Generation.id == generation.id)
        .values(
            status="completed",
            audio_duration=result.duration,
            audio_format=params.audio_format,
            file_size=len(processed),
            sample_rate=result.sample_rate,
            processing_time=result.processing_time,
            engine=result.engine
        )
    )
    await db.commit()

    # Upload
    storage = StorageService()
    filename = f"{generation.id}.{params.audio_format}"
    audio_url = await storage.upload(processed, filename)

    await db.execute(
        update(Generation)
        .where(Generation.id == generation.id)
        .values(audio_url=audio_url)
    )
    await db.commit()

    # Return updated generation
    result = await db.execute(select(Generation).where(Generation.id == generation.id))
    return result.scalar_one()


@router.get("/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get generation details."""
    result = await db.execute(
        select(Generation).where(Generation.id == generation_id, Generation.user_id == current_user.id)
    )
    generation = result.scalar_one_or_none()

    if not generation:
        raise NotFoundException("Generation", str(generation_id))

    return generation


@router.get("/{generation_id}/audio")
async def get_audio(
    generation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Stream audio file."""
    result = await db.execute(
        select(Generation).where(Generation.id == generation_id, Generation.user_id == current_user.id)
    )
    generation = result.scalar_one_or_none()

    if not generation or not generation.audio_url:
        raise NotFoundException("Audio", str(generation_id))

    # For local storage, serve file directly
    if generation.audio_url.startswith("/audio/"):
        from fastapi.responses import FileResponse
        filepath = f"{settings.LOCAL_STORAGE_PATH}/{generation.audio_url.split('/')[-1]}"
        return FileResponse(filepath, media_type=f"audio/{generation.audio_format}")

    # For cloud storage, redirect
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=generation.audio_url)


@router.delete("/{generation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_generation(
    generation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a generation."""
    result = await db.execute(
        select(Generation).where(Generation.id == generation_id, Generation.user_id == current_user.id)
    )
    generation = result.scalar_one_or_none()

    if not generation:
        raise NotFoundException("Generation", str(generation_id))

    # Delete file
    if generation.audio_url:
        storage = StorageService()
        filename = generation.audio_url.split("/")[-1]
        await storage.delete(filename)

    await db.delete(generation)
    await db.commit()

    return None


@router.post("/batch", response_model=BatchGenerationResponse, status_code=status.HTTP_202_ACCEPTED)
async def batch_generate(
    batch_data: BatchGenerationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Batch generate multiple texts."""
    if len(batch_data.texts) > 100:
        raise ValidationException("Maximum 100 texts per batch")

    # Validate voice
    result = await db.execute(select(Voice).where(Voice.id == batch_data.voice_id))
    if not result.scalar_one_or_none():
        raise NotFoundException("Voice", str(batch_data.voice_id))

    generations = []
    batch_id = f"batch_{hashlib.sha256(str(batch_data.texts).encode()).hexdigest()[:16]}"

    for text in batch_data.texts:
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        generation = Generation(
            user_id=current_user.id,
            project_id=batch_data.project_id,
            voice_id=batch_data.voice_id,
            text=text,
            text_hash=text_hash,
            speed=batch_data.speed,
            pitch=batch_data.pitch,
            emotion=batch_data.emotion,
            language=batch_data.language,
            audio_format=batch_data.audio_format,
            status="pending",
            metadata={"batch_id": batch_id}
        )
        db.add(generation)
        generations.append(generation)

    await db.commit()

    # Queue all tasks
    for gen in generations:
        params_dict = {
            "text": gen.text,
            "voice_id": str(batch_data.voice_id),
            "speed": batch_data.speed,
            "pitch": batch_data.pitch,
            "emotion": batch_data.emotion,
            "language": batch_data.language,
            "audio_format": batch_data.audio_format
        }
        generate_speech_task.delay(str(gen.id), params_dict)

    return BatchGenerationResponse(
        batch_id=batch_id,
        total=len(batch_data.texts),
        status="queued",
        generations=generations
    )
