"""
VoiceForge AI - Database Configuration
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import enum

from app.core.config import settings

# Async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DEBUG,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


# Enums
class TTSStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TTSEngine(str, enum.Enum):
    COQUI = "coqui"
    PIPER = "piper"
    BARK = "bark"
    GOOGLE = "google"
    AZURE = "azure"
    AWS = "aws"


class Emotion(str, enum.Enum):
    NEUTRAL = "neutral"
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    EXCITED = "excited"
    WHISPER = "whisper"
    SHOUTING = "shouting"


class AudioFormat(str, enum.Enum):
    MP3 = "mp3"
    WAV = "wav"
    OGG = "ogg"
    AAC = "aac"


# Models
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)
    api_key = Column(String(255), unique=True, nullable=True, index=True)
    rate_limit_tier = Column(String(20), default="free")  # free, pro, enterprise
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    voices = relationship("Voice", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    generations = relationship("Generation", back_populates="user")


class Voice(Base):
    __tablename__ = "voices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    voice_type = Column(String(50), default="system")  # system, cloned
    language = Column(String(10), default="en")
    gender = Column(String(20), nullable=True)
    age_group = Column(String(20), nullable=True)
    sample_url = Column(String(500), nullable=True)
    model_path = Column(String(500), nullable=True)
    is_public = Column(Boolean, default=False)
    quality_score = Column(Float, nullable=True)
    tags = Column(JSON, default=list)
    metadata = Column(JSON, default=dict)
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="voices")
    generations = relationship("Generation", back_populates="voice")


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(10), default="en")
    default_voice_id = Column(UUID(as_uuid=True), ForeignKey("voices.id"), nullable=True)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")
    generations = relationship("Generation", back_populates="project", cascade="all, delete-orphan")


class Generation(Base):
    __tablename__ = "generations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    voice_id = Column(UUID(as_uuid=True), ForeignKey("voices.id"), nullable=False)

    # Input
    text = Column(Text, nullable=False)
    text_hash = Column(String(64), nullable=False, index=True)
    ssml = Column(Text, nullable=True)

    # Parameters
    speed = Column(Float, default=1.0)
    pitch = Column(Float, default=1.0)
    volume = Column(Float, default=1.0)
    emotion = Column(String(20), default="neutral")
    language = Column(String(10), default="en")

    # Engine & Status
    engine = Column(String(50), default="coqui")
    status = Column(String(20), default="pending")

    # Output
    audio_url = Column(String(500), nullable=True)
    audio_duration = Column(Float, nullable=True)
    audio_format = Column(String(10), default="mp3")
    file_size = Column(Integer, nullable=True)
    sample_rate = Column(Integer, default=44100)

    # Quality
    mos_score = Column(Float, nullable=True)

    # Metadata
    processing_time = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    metadata = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="generations")
    project = relationship("Project", back_populates="generations")
    voice = relationship("Voice", back_populates="generations")


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    key_hash = Column(String(255), nullable=False)
    key_prefix = Column(String(20), nullable=False)
    permissions = Column(JSON, default=list)
    rate_limit = Column(Integer, default=100)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    events = Column(JSON, default=list)  # ["generation.completed", "generation.failed"]
    secret = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
