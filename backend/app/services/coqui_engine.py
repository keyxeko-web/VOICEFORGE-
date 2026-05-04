"""
VoiceForge AI - Coqui TTS Engine
Supports XTTS v2 for voice cloning and multi-lingual TTS.
"""
import os
import io
import time
import tempfile
import asyncio
from typing import Optional, List

from app.services.tts_base import BaseTTSEngine, TTSResult, TTSParams
from app.core.config import settings


class CoquiTTSEngine(BaseTTSEngine):
    """Coqui TTS engine with XTTS v2 support."""

    name = "coqui"
    supports_streaming = False
    supports_ssml = False
    supports_emotions = True
    max_text_length = 5000

    def __init__(self):
        self._tts = None
        self._model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        self._device = "cpu"
        self._voice_cache = {}

    def _get_tts(self):
        """Lazy initialization of TTS model."""
        if self._tts is None:
            try:
                import torch
                from TTS.api import TTS

                self._device = "cuda" if torch.cuda.is_available() else "cpu"
                self._tts = TTS(self._model_name).to(self._device)
                print(f"✅ Coqui TTS loaded on {self._device}")
            except ImportError:
                raise RuntimeError("Coqui TTS not installed. Run: pip install coqui-tts")
            except Exception as e:
                raise RuntimeError(f"Failed to load Coqui TTS: {e}")
        return self._tts

    def _apply_emotion(self, text: str, emotion: str) -> str:
        """Apply emotional markers to text."""
        emotion_prefixes = {
            "happy": "[happily] ",
            "sad": "[sadly] ",
            "angry": "[angrily] ",
            "excited": "[excitedly] ",
            "whisper": "[whispers] ",
            "shouting": "[shouts] ",
            "neutral": ""
        }
        prefix = emotion_prefixes.get(emotion.lower(), "")
        return prefix + text

    async def generate(self, params: TTSParams) -> TTSResult:
        """Generate speech using Coqui TTS."""
        self.validate_params(params)

        start_time = time.time()

        # Apply emotion
        text = self._apply_emotion(params.text, params.emotion)

        # Create temp file for output
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            output_path = tmp.name

        try:
            tts = self._get_tts()

            # Run in thread pool to not block async event loop
            loop = asyncio.get_event_loop()

            if params.voice_id and params.voice_id.startswith("cloned_"):
                # Voice cloning mode
                speaker_wav = params.voice_id.replace("cloned_", "")
                await loop.run_in_executor(
                    None,
                    lambda: tts.tts_to_file(
                        text=text,
                        speaker_wav=speaker_wav,
                        language=params.language,
                        file_path=output_path
                    )
                )
            else:
                # Default speaker
                await loop.run_in_executor(
                    None,
                    lambda: tts.tts_to_file(
                        text=text,
                        speaker="Craig Gutsy",
                        language=params.language,
                        file_path=output_path
                    )
                )

            # Read generated audio
            with open(output_path, "rb") as f:
                audio_data = f.read()

            # Get audio info
            import wave
            with wave.open(output_path, "rb") as wf:
                sample_rate = wf.getframerate()
                n_frames = wf.getnframes()
                duration = n_frames / sample_rate

            processing_time = time.time() - start_time

            return TTSResult(
                audio_data=audio_data,
                sample_rate=sample_rate,
                duration=duration,
                format="wav",
                processing_time=processing_time,
                engine=self.name
            )

        finally:
            if os.path.exists(output_path):
                os.remove(output_path)

    async def generate_stream(self, params: TTSParams):
        """Coqui TTS does not support true streaming."""
        raise NotImplementedError("Coqui TTS does not support streaming")

    async def get_voices(self) -> list:
        """Get available preset voices."""
        try:
            tts = self._get_tts()
            speakers = tts.speakers or []
            return [
                {
                    "id": f"coqui_{s}",
                    "name": s,
                    "language": "multilingual",
                    "gender": "unknown",
                    "type": "system"
                }
                for s in speakers
            ]
        except Exception:
            return []

    async def clone_voice(self, audio_samples: List[str], voice_name: str, language: str = "en") -> str:
        """Clone a voice from audio samples.

        For Coqui XTTS, voice cloning is done on-the-fly during generation
        by passing speaker_wav. This method just validates the samples.
        """
        if not audio_samples:
            raise ValueError("At least one audio sample required")

        # Validate audio files
        for sample in audio_samples:
            if not os.path.exists(sample):
                raise ValueError(f"Audio sample not found: {sample}")

        # Return the first sample path as voice identifier
        return f"cloned_{audio_samples[0]}"
