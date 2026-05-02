"""
VoiceForge AI - AWS Polly TTS Engine
"""
import os
import time
import io
from typing import Optional, List

import boto3

from app.services.tts_base import BaseTTSEngine, TTSResult, TTSParams
from app.core.config import settings


class AWSTTSEngine(BaseTTSEngine):
    """AWS Polly Text-to-Speech engine."""

    name = "aws"
    supports_streaming = True
    supports_ssml = True
    supports_emotions = False
    max_text_length = 3000

    def __init__(self):
        self.client = boto3.client(
            "polly",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

        self._voice_map = {
            "en": "Joanna",
            "vi": "N/A",  # AWS Polly không hỗ trợ tiếng Việt
            "ja": "Mizuki",
            "ko": "Seoyeon",
            "zh": "Zhiyu",
            "fr": "Celine",
            "de": "Marlene",
            "es": "Penelope",
            "it": "Bianca",
            "pt": "Camila",
            "ru": "Tatyana",
            "ar": "Zeina",
            "hi": "Aditi",
            "th": "N/A",
        }

    def _get_voice_id(self, language: str, voice_id: Optional[str] = None) -> str:
        if voice_id and voice_id.startswith("aws_"):
            return voice_id.replace("aws_", "")
        return self._voice_map.get(language, "Joanna")

    async def generate(self, params: TTSParams) -> TTSResult:
        self.validate_params(params)
        start_time = time.time()

        voice_id = self._get_voice_id(params.language, params.voice_id)

        # Build SSML with prosody
        text = params.text
        if params.speed != 1.0 or params.pitch != 1.0 or params.volume != 1.0:
            rate = f"{(params.speed - 1) * 100:.0f}%"
            pitch = f"{(params.pitch - 1) * 12:.0f}%"
            volume = f"{(params.volume - 1) * 10:.0f}dB"
            text = f'<speak><prosody rate="{rate}" pitch="{pitch}" volume="{volume}">{params.text}</prosody></speak>'

        if params.ssml:
            text = params.ssml

        response = self.client.synthesize_speech(
            Text=text,
            TextType="ssml" if text.startswith("<speak>") else "text",
            OutputFormat="mp3",
            VoiceId=voice_id,
            Engine="neural"
        )

        audio_data = response["AudioStream"].read()
        processing_time = time.time() - start_time

        return TTSResult(
            audio_data=audio_data,
            sample_rate=24000,
            duration=len(audio_data) / 48000,
            format="mp3",
            processing_time=processing_time,
            engine=self.name
        )

    async def generate_stream(self, params: TTSParams):
        result = await self.generate(params)
        chunk_size = 4096
        for i in range(0, len(result.audio_data), chunk_size):
            yield result.audio_data[i:i + chunk_size]

    async def get_voices(self) -> list:
        response = self.client.describe_voices(Engine="neural")
        voices = []
        for voice in response["Voices"]:
            for lang in voice.get("LanguageCodes", []):
                voices.append({
                    "id": f"aws_{voice['Id']}",
                    "name": voice["Name"],
                    "language": lang,
                    "gender": voice.get("Gender", "Unknown").lower(),
                    "type": "system"
                })
        return voices

    async def clone_voice(self, audio_samples: List[str], voice_name: str, language: str = "en") -> str:
        raise NotImplementedError("AWS Polly does not support voice cloning")
