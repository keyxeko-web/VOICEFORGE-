from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None
    full_name: Optional[str] = None

    def get_username(self) -> str:
        return self.username or self.email.split("@")[0]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    is_active: bool
    rate_limit_tier: str = "free"
    api_key: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class VoiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    language: str = "vi"
    engine: str = "piper"
    is_public: bool = False

class VoiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class VoiceResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    language: str
    engine: str
    is_public: bool
    is_cloned: bool
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class VoiceListResponse(BaseModel):
    items: List[VoiceResponse]
    total: int
    page: int
    per_page: int

class VoiceCloneRequest(BaseModel):
    name: str
    description: Optional[str] = None
    language: str = "vi"

class GenerationCreate(BaseModel):
    text: str
    voice_id: Optional[UUID] = None
    engine: str = "piper"
    language: str = "vi"
    speed: float = 1.0
    pitch: float = 0.0
    volume: float = 1.0
    emotion: Optional[str] = None
    output_format: str = "mp3"

class GenerationUpdate(BaseModel):
    title: Optional[str] = None

class GenerationResponse(BaseModel):
    id: UUID
    text: str
    status: str
    audio_url: Optional[str] = None
    duration: Optional[float] = None
    engine: str
    language: str
    created_at: datetime
    class Config:
        from_attributes = True

class GenerationListResponse(BaseModel):
    items: List[GenerationResponse]
    total: int
    page: int
    per_page: int

class BatchGenerationRequest(BaseModel):
    items: List[GenerationCreate]

class BatchGenerationResponse(BaseModel):
    batch_id: str
    total: int
    queued: int

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True
