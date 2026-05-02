"""
VoiceForge AI - Voice API Routes
"""
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db, User, Voice
from app.core.security import get_current_active_user
from app.core.exceptions import NotFoundException, ValidationException
from app.schemas import (
    VoiceCreate, VoiceUpdate, VoiceResponse, VoiceListResponse,
    VoiceCloneRequest
)
from app.services.engine_manager import get_engine_manager
from app.services.audio_processor import StorageService
from app.tasks.tts_tasks import clone_voice_task

router = APIRouter(prefix="/voices", tags=["Voices"])


@router.get("", response_model=VoiceListResponse)
async def list_voices(
    language: Optional[str] = None,
    voice_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List available voices (user's + public + system)."""
    query = select(Voice).where(
        (Voice.user_id == current_user.id) | (Voice.is_public == True) | (Voice.voice_type == "system")
    )

    if language:
        query = query.where(Voice.language == language)
    if voice_type:
        query = query.where(Voice.voice_type == voice_type)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    voices = result.scalars().all()

    return VoiceListResponse(
        items=voices,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/system", response_model=VoiceListResponse)
async def list_system_voices(
    language: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List system voices from all TTS engines."""
    manager = await get_engine_manager()
    voices = await manager.get_all_voices()

    if language:
        voices = [v for v in voices if v.get("language", "").startswith(language)]

    return VoiceListResponse(
        items=voices,
        total=len(voices),
        page=1,
        page_size=len(voices)
    )


@router.post("", response_model=VoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_voice(
    voice_data: VoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new custom voice entry."""
    voice = Voice(
        user_id=current_user.id,
        name=voice_data.name,
        description=voice_data.description,
        voice_type=voice_data.voice_type,
        language=voice_data.language,
        gender=voice_data.gender,
        age_group=voice_data.age_group,
        is_public=voice_data.is_public,
        tags=voice_data.tags or []
    )

    db.add(voice)
    await db.commit()
    await db.refresh(voice)

    return voice


@router.get("/{voice_id}", response_model=VoiceResponse)
async def get_voice(
    voice_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get voice details."""
    result = await db.execute(
        select(Voice).where(Voice.id == voice_id)
    )
    voice = result.scalar_one_or_none()

    if not voice:
        raise NotFoundException("Voice", str(voice_id))

    if voice.user_id != current_user.id and not voice.is_public and voice.voice_type != "system":
        raise HTTPException(status_code=403, detail="Not authorized to access this voice")

    return voice


@router.patch("/{voice_id}", response_model=VoiceResponse)
async def update_voice(
    voice_id: UUID,
    voice_data: VoiceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update voice metadata."""
    result = await db.execute(
        select(Voice).where(Voice.id == voice_id, Voice.user_id == current_user.id)
    )
    voice = result.scalar_one_or_none()

    if not voice:
        raise NotFoundException("Voice", str(voice_id))

    if voice_data.name is not None:
        voice.name = voice_data.name
    if voice_data.description is not None:
        voice.description = voice_data.description
    if voice_data.is_public is not None:
        voice.is_public = voice_data.is_public
    if voice_data.tags is not None:
        voice.tags = voice_data.tags

    await db.commit()
    await db.refresh(voice)
    return voice


@router.delete("/{voice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voice(
    voice_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a voice."""
    result = await db.execute(
        select(Voice).where(Voice.id == voice_id, Voice.user_id == current_user.id)
    )
    voice = result.scalar_one_or_none()

    if not voice:
        raise NotFoundException("Voice", str(voice_id))

    # Delete associated files
    if voice.sample_url:
        storage = StorageService()
        filename = voice.sample_url.split("/")[-1]
        await storage.delete(filename)

    await db.delete(voice)
    await db.commit()

    return None


@router.post("/{voice_id}/clone", response_model=VoiceResponse)
async def clone_voice(
    voice_id: UUID,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    language: str = Form("en"),
    sample_files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Clone a voice from audio samples."""
    # Check voice limit
    result = await db.execute(
        select(func.count()).where(Voice.user_id == current_user.id, Voice.voice_type == "cloned")
    )
    voice_count = result.scalar()

    from app.core.config import settings
    if voice_count >= settings.MAX_VOICES_PER_USER:
        raise ValidationException(f"Maximum {settings.MAX_VOICES_PER_USER} cloned voices allowed")

    # Save uploaded files temporarily
    import tempfile, os
    temp_paths = []
    total_duration = 0

    for file in sample_files:
        if not file.content_type.startswith("audio/"):
            raise ValidationException(f"Invalid file type: {file.content_type}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await file.read()
            tmp.write(content)
            temp_paths.append(tmp.name)

            # Check duration
            from pydub import AudioSegment
            audio = AudioSegment.from_file(tmp.name)
            total_duration += len(audio) / 1000

    if total_duration < settings.VOICE_CLONE_MIN_DURATION:
        raise ValidationException(f"Total audio duration must be at least {settings.VOICE_CLONE_MIN_DURATION}s")

    if total_duration > settings.VOICE_CLONE_MAX_DURATION:
        raise ValidationException(f"Total audio duration must not exceed {settings.VOICE_CLONE_MAX_DURATION}s")

    # Create voice record
    voice = Voice(
        user_id=current_user.id,
        name=name,
        description=description,
        voice_type="cloned",
        language=language,
        metadata={"status": "processing", "progress": 0}
    )
    db.add(voice)
    await db.commit()
    await db.refresh(voice)

    # Queue background task
    clone_voice_task.delay(str(voice.id), temp_paths, name, language)

    return voice
