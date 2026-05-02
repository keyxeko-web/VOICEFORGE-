"""
VoiceForge AI - Azure Speech TTS Engine
"""
import os
import time
import tempfile
from typing import Optional, List

import azure.cognitiveservices.speech as speechsdk

from app.services.tts_base import BaseTTSEngine, TTSResult, TTSParams
from app.core.config import settings


class AzureTTSEngine(BaseTTSEngine):
    """Azure Cognitive Services Speech engine."""

    name = "azure"
    supports_streaming = True
    supports_ssml = True
    supports_emotions = True
    max_text_length = 10000

    def __init__(self):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=settings.AZURE_SPEECH_KEY,
            region=settings.AZURE_SPEECH_REGION
        )
        self.speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3
        )

    def _get_voice_name(self, language: str, voice_id: Optional[str] = None) -> str:
        if voice_id and voice_id.startswith("azure_"):
            return voice_id.replace("azure_", "")
        voice_map = {
            "en": "en-US-JennyNeural",
            "vi": "vi-VN-HoaiMyNeural",
            "ja": "ja-JP-NanamiNeural",
            "ko": "ko-KR-SunHiNeural",
            "zh": "zh-CN-XiaoxiaoNeural",
            "fr": "fr-FR-DeniseNeural",
            "de": "de-DE-KatjaNeural",
            "es": "es-ES-ElviraNeural",
            "it": "it-IT-ElsaNeural",
            "pt": "pt-BR-FranciscaNeural",
            "ru": "ru-RU-SvetlanaNeural",
            "ar": "ar-SA-ZariyahNeural",
            "hi": "hi-IN-SwaraNeural",
            "th": "th-TH-PremwadeeNeural",
        }
        return voice_map.get(language, "en-US-JennyNeural")

    def _apply_emotion(self, text: str, emotion: str) -> str:
        """Apply SSML emotion tags."""
        if emotion == "neutral":
            return text

        style_map = {
            "happy": "cheerful",
            "sad": "sad",
            "angry": "angry",
            "excited": "excited",
            "whisper": "whispering",
            "shouting": "shouting"
        }

        style = style_map.get(emotion.lower(), "default")
        return f'<mstts:express-as style="{style}">{text}</mstts:express-as>'

    async def generate(self, params: TTSParams) -> TTSResult:
        self.validate_params(params)
        start_time = time.time()

        voice_name = self._get_voice_name(params.language, params.voice_id)

        # Build SSML with emotion and prosody
        text_content = self._apply_emotion(params.text, params.emotion)
        ssml = f"""<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
            xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="{params.language}">
            <voice name="{voice_name}">
                <prosody rate="{(params.speed - 1) * 100:.0f}%" 
                         pitch="{(params.pitch - 1) * 12:.0f}st"
                         volume="{(params.volume - 1) * 10:.0f}dB">
                    {text_content}
                </prosody>
            </voice>
        </speak>"""

        if params.ssml:
            ssml = params.ssml

        # Synthesize
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config, audio_config=None)
        result = synthesizer.speak_ssml_async(ssml).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            audio_data = result.audio_data
            processing_time = time.time() - start_time

            return TTSResult(
                audio_data=audio_data,
                sample_rate=48000,
                duration=len(audio_data) / 96000,
                format="mp3",
                processing_time=processing_time,
                engine=self.name
            )
        else:
            raise RuntimeError(f"Azure TTS failed: {result.reason}")

    async def generate_stream(self, params: TTSParams):
        result = await self.generate(params)
        chunk_size = 4096
        for i in range(0, len(result.audio_data), chunk_size):
            yield result.audio_data[i:i + chunk_size]

    async def get_voices(self) -> list:
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config, audio_config=None)
        result = synthesizer.get_voices_async().get()
        voices = []
        for voice in result.voices:
            voices.append({
                "id": f"azure_{voice.short_name}",
                "name": voice.short_name,
                "language": voice.locale,
                "gender": str(voice.gender).lower(),
                "type": "system"
            })
        return voices

    async def clone_voice(self, audio_samples: List[str], voice_name: str, language: str = "en") -> str:
        raise NotImplementedError("Azure TTS does not support voice cloning")
