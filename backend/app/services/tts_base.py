"""
VoiceForge AI - TTS Engine Base Interface
"""
from abc import ABC, abstractmethod
from typing import Optional, BinaryIO, Dict, Any
from dataclasses import dataclass
import numpy as np


@dataclass
class TTSResult:
    """Result from TTS generation."""
    audio_data: bytes
    sample_rate: int
    duration: float
    format: str
    processing_time: float
    engine: str


@dataclass
class TTSParams:
    """Parameters for TTS generation."""
    text: str
    voice_id: str
    speed: float = 1.0
    pitch: float = 1.0
    volume: float = 1.0
    emotion: str = "neutral"
    language: str = "en"
    ssml: Optional[str] = None
    audio_format: str = "mp3"


class BaseTTSEngine(ABC):
    """Base class for all TTS engines."""

    name: str = "base"
    supports_streaming: bool = False
    supports_ssml: bool = False
    supports_emotions: bool = False
    max_text_length: int = 5000

    @abstractmethod
    async def generate(self, params: TTSParams) -> TTSResult:
        """Generate speech from text."""
        pass

    @abstractmethod
    async def generate_stream(self, params: TTSParams):
        """Generate speech as a stream (generator)."""
        pass

    @abstractmethod
    async def get_voices(self) -> list:
        """Get available voices."""
        pass

    @abstractmethod
    async def clone_voice(self, audio_samples: list, voice_name: str, language: str = "en") -> str:
        """Clone a voice from audio samples."""
        pass

    def validate_params(self, params: TTSParams) -> None:
        """Validate generation parameters."""
        if len(params.text) > self.max_text_length:
            raise ValueError(f"Text too long. Max {self.max_text_length} characters.")
        if params.speed < 0.5 or params.speed > 2.0:
            raise ValueError("Speed must be between 0.5 and 2.0")
        if params.pitch < 0.5 or params.pitch > 2.0:
            raise ValueError("Pitch must be between 0.5 and 2.0")

    def apply_post_processing(self, audio_data: bytes, params: TTSParams) -> bytes:
        """Apply post-processing effects."""
        return audio_data
