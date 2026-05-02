"""
VoiceForge AI - TTS Engine Manager
Orchestrates multiple TTS engines with fallback support.
"""
import asyncio
from typing import Optional, Dict, Any
from enum import Enum

from app.core.config import settings
from app.core.exceptions import TTSProcessingException
from app.services.tts_base import BaseTTSEngine, TTSParams, TTSResult
from app.services.espeak_engine import ESpeakEngine

try:
    from app.services.coqui_engine import CoquiTTSEngine
except Exception:
    CoquiTTSEngine = None

try:
    from app.services.piper_engine import PiperTTSEngine
except Exception:
    PiperTTSEngine = None


class EngineType(str, Enum):
    ESPEAK = "espeak"
    COQUI = "coqui"
    PIPER = "piper"
    GOOGLE = "google"
    AZURE = "azure"
    AWS = "aws"


class TTSEngineManager:
    """Manages multiple TTS engines with automatic fallback."""

    def __init__(self):
        self._engines: Dict[str, BaseTTSEngine] = {}
        self._init_engines()

    def _init_engines(self):
        """Initialize available engines."""
        # Always initialize espeak (no model download required)
        try:
            self._engines[EngineType.ESPEAK] = ESpeakEngine()
            print("✅ eSpeak-NG TTS initialized")
        except Exception as e:
            print(f"⚠️ eSpeak-NG not available: {e}")

        if CoquiTTSEngine:
            try:
                self._engines[EngineType.COQUI] = CoquiTTSEngine()
                print("✅ Coqui TTS initialized")
            except Exception as e:
                print(f"⚠️ Coqui TTS not available: {e}")

        if PiperTTSEngine:
            try:
                self._engines[EngineType.PIPER] = PiperTTSEngine()
                print("✅ Piper TTS initialized")
            except Exception as e:
                print(f"⚠️ Piper TTS not available: {e}")

        if settings.GOOGLE_APPLICATION_CREDENTIALS:
            try:
                from app.services.google_engine import GoogleTTSEngine
                self._engines[EngineType.GOOGLE] = GoogleTTSEngine()
                print("✅ Google Cloud TTS initialized")
            except Exception as e:
                print(f"⚠️ Google Cloud TTS not available: {e}")

        if settings.AZURE_SPEECH_KEY:
            try:
                from app.services.azure_engine import AzureTTSEngine
                self._engines[EngineType.AZURE] = AzureTTSEngine()
                print("✅ Azure Speech TTS initialized")
            except Exception as e:
                print(f"⚠️ Azure Speech TTS not available: {e}")

        if settings.AWS_ACCESS_KEY_ID:
            try:
                from app.services.aws_engine import AWSTTSEngine
                self._engines[EngineType.AWS] = AWSTTSEngine()
                print("✅ AWS Polly TTS initialized")
            except Exception as e:
                print(f"⚠️ AWS Polly TTS not available: {e}")

    def get_engine(self, engine_name: Optional[str] = None) -> BaseTTSEngine:
        if engine_name and engine_name in self._engines:
            return self._engines[engine_name]
        for priority in [EngineType.COQUI, EngineType.PIPER]:
            if priority in self._engines:
                return self._engines[priority]
        for cloud in [EngineType.GOOGLE, EngineType.AZURE, EngineType.AWS]:
            if cloud in self._engines:
                return self._engines[cloud]
        raise TTSProcessingException("No TTS engine available")

    async def generate(self, params: TTSParams, engine_name: Optional[str] = None) -> TTSResult:
        engines_to_try = []
        if engine_name:
            engines_to_try.append(engine_name)
        for e in [EngineType.COQUI, EngineType.PIPER, EngineType.GOOGLE, EngineType.AZURE, EngineType.AWS]:
            if e.value not in engines_to_try and e in self._engines:
                engines_to_try.append(e.value)
        last_error = None
        for engine_id in engines_to_try:
            try:
                engine = self._engines[engine_id]
                result = await engine.generate(params)
                result.engine = engine_id
                return result
            except Exception as e:
                last_error = e
                print(f"⚠️ Engine {engine_id} failed: {e}")
                continue
        raise TTSProcessingException(f"All TTS engines failed. Last error: {last_error}")

    async def generate_stream(self, params: TTSParams, engine_name: Optional[str] = None):
        engine = self.get_engine(engine_name)
        if not engine.supports_streaming:
            raise TTSProcessingException(f"Engine {engine.name} does not support streaming")
        async for chunk in engine.generate_stream(params):
            yield chunk

    async def get_all_voices(self) -> list:
        all_voices = []
        for engine_id, engine in self._engines.items():
            try:
                voices = await engine.get_voices()
                for v in voices:
                    v["engine"] = engine_id
                all_voices.extend(voices)
            except Exception as e:
                print(f"⚠️ Failed to get voices from {engine_id}: {e}")
        return all_voices

    async def clone_voice(self, audio_samples: list, voice_name: str, language: str = "en") -> str:
        for engine_id in [EngineType.COQUI, EngineType.PIPER]:
            if engine_id in self._engines:
                try:
                    return await self._engines[engine_id].clone_voice(audio_samples, voice_name, language)
                except Exception as e:
                    print(f"⚠️ Voice clone failed on {engine_id}: {e}")
                    continue
        raise TTSProcessingException("No engine available for voice cloning")


_engine_manager: Optional[TTSEngineManager] = None

async def get_engine_manager() -> TTSEngineManager:
    global _engine_manager
    if _engine_manager is None:
        _engine_manager = TTSEngineManager()
    return _engine_manager
