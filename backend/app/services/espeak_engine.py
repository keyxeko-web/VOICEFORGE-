"""
ESpeak-NG TTS Engine — offline, no model download needed.
"""
import asyncio
import subprocess
import tempfile
import os
from app.services.tts_base import BaseTTSEngine, TTSParams, TTSResult

LANG_MAP = {
    "vi": "vi", "en": "en", "zh": "cmn", "ja": "ja",
    "ko": "ko", "fr": "fr", "de": "de", "es": "es",
}

class ESpeakEngine(BaseTTSEngine):
    engine_name = "espeak"

    async def initialize(self) -> bool:
        result = subprocess.run(["espeak-ng", "--version"], capture_output=True)
        self._initialized = result.returncode == 0
        return self._initialized

    async def synthesize(self, params: TTSParams) -> TTSResult:
        lang = LANG_MAP.get(params.language, "en")
        speed_wpm = int(175 * params.speed)  # espeak uses words-per-minute
        pitch_val = int(50 + params.pitch * 50)  # 0-100, default 50

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            out_path = f.name

        cmd = [
            "espeak-ng",
            "-v", lang,
            "-s", str(speed_wpm),
            "-p", str(max(0, min(99, pitch_val))),
            "-a", str(int(params.volume * 100)),
            "-w", out_path,
            params.text,
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await proc.communicate()

        if proc.returncode != 0:
            return TTSResult(success=False, error=stderr.decode())

        with open(out_path, "rb") as f:
            audio_data = f.read()
        os.unlink(out_path)

        return TTSResult(
            audio_data=audio_data,
            format="wav",
            sample_rate=22050,
            duration=len(audio_data) / (22050 * 2),
            processing_time=0.0,
            engine="espeak",
        )

    async def generate(self, params: TTSParams) -> TTSResult:
        return await self.synthesize(params)

    async def generate_stream(self, params: TTSParams):
        result = await self.synthesize(params)
        yield result.audio_data

    async def get_voices(self) -> list:
        return [
            {"id": "vi-espeak", "name": "Tiếng Việt (eSpeak)", "language": "vi", "engine": "espeak"},
            {"id": "en-espeak", "name": "English (eSpeak)", "language": "en", "engine": "espeak"},
        ]

    async def clone_voice(self, audio_samples: list, voice_name: str, language: str = "en") -> str:
        raise NotImplementedError("eSpeak does not support voice cloning")

    async def cleanup(self):
        pass
