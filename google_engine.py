"""
VoiceForge AI - Google Cloud TTS Engine
"""
import os
import time
from typing import Optional, List

from google.cloud import texttospeech
from google.oauth2 import service_account

from app.services.tts_base import BaseTTSEngine, TTSResult, TTSParams
from app.core.config import settings


class GoogleTTSEngine(BaseTTSEngine):
    """Google Cloud Text-to-Speech engine."""

    name = "google"
    supports_streaming = True
    supports_ssml = True
    supports_emotions = False
    max_text_length = 5000

    def __init__(self):
        credentials = service_account.Credentials.from_service_account_file(
            settings.GOOGLE_APPLICATION_CREDENTIALS
        )
        self.client = texttospeech.TextToSpeechClient(credentials=credentials)

        self._voice_map = {
            "en": "en-US-Neural2-J",
            "vi": "vi-VN-Neural2-A",
            "ja": "ja-JP-Neural2-B",
            "ko": "ko-KR-Neural2-A",
            "zh": "cmn-CN-Neural2-A",
            "fr": "fr-FR-Neural2-A",
            "de": "de-DE-Neural2-A",
            "es": "es-ES-Neural2-A",
            "it": "it-IT-Neural2-A",
            "pt": "pt-BR-Neural2-A",
            "ru": "ru-RU-Standard-A",
            "ar": "ar-XA-Standard-A",
            "hi": "hi-IN-Neural2-A",
            "th": "th-TH-Standard-A",
        }

    def _get_voice_name(self, language: str, voice_id: Optional[str] = None) -> str:
        if voice_id and voice_id.startswith("google_"):
            return voice_id.replace("google_", "")
        return self._voice_map.get(language, "en-US-Neural2-J")

    async def generate(self, params: TTSParams) -> TTSResult:
        self.validate_params(params)
        start_time = time.time()

        voice_name = self._get_voice_name(params.language, params.voice_id)

        synthesis_input = texttospeech.SynthesisInput(text=params.text)
        if params.ssml:
            synthesis_input = texttospeech.SynthesisInput(ssml=params.ssml)

        voice = texttospeech.VoiceSelectionParams(
            name=voice_name,
            language_code=voice_name[:5]
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=params.speed,
            pitch=params.pitch * 10 - 10,  # Convert 0.5-2.0 to -5 to +10
            volume_gain_db=(params.volume - 1.0) * 10
        )

        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        processing_time = time.time() - start_time

        return TTSResult(
            audio_data=response.audio_content,
            sample_rate=24000,
            duration=len(response.audio_content) / 48000,  # Approximate
            format="mp3",
            processing_time=processing_time,
            engine=self.name
        )

    async def generate_stream(self, params: TTSParams):
        """Google TTS streaming via chunks."""
        result = await self.generate(params)
        chunk_size = 4096
        for i in range(0, len(result.audio_data), chunk_size):
            yield result.audio_data[i:i + chunk_size]

    async def get_voices(self) -> list:
        voices = self.client.list_voices()
        result = []
        for voice in voices.voices:
            for lang in voice.language_codes:
                result.append({
                    "id": f"google_{voice.name}",
                    "name": voice.name,
                    "language": lang,
                    "gender": str(voice.ssml_gender).lower(),
                    "type": "system"
                })
        return result

    async def clone_voice(self, audio_samples: List[str], voice_name: str, language: str = "en") -> str:
        raise NotImplementedError("Google Cloud TTS does not support voice cloning")
