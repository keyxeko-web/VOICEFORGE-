"""
VoiceForge AI - Piper TTS Engine
Fast, lightweight neural TTS optimized for edge devices.
"""
import os
import io
import time
import tempfile
import asyncio
import subprocess
from typing import Optional, List

from app.services.tts_base import BaseTTSEngine, TTSResult, TTSParams
from app.core.config import settings


class PiperTTSEngine(BaseTTSEngine):
    """Piper TTS engine - fast local neural synthesis."""

    name = "piper"
    supports_streaming = True
    supports_ssml = False
    supports_emotions = False
    max_text_length = 10000

    def __init__(self):
        self._model_dir = settings.PIPER_MODEL_PATH or "./models/piper"
        self._default_model = "en_US-lessac-medium"
        self._voices = {}

    def _get_model_path(self, voice_id: str) -> str:
        """Get model path for voice."""
        model_name = voice_id.replace("piper_", "")
        model_path = os.path.join(self._model_dir, f"{model_name}.onnx")
        if not os.path.exists(model_path):
            # Fallback to default
            model_path = os.path.join(self._model_dir, f"{self._default_model}.onnx")
        return model_path

    async def generate(self, params: TTSParams) -> TTSResult:
        """Generate speech using Piper TTS."""
        self.validate_params(params)

        start_time = time.time()
        model_path = self._get_model_path(params.voice_id)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
            tmp_in.write(params.text.encode("utf-8"))
            input_path = tmp_in.name

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_out:
            output_path = tmp_out.name

        try:
            # Run piper as subprocess
            cmd = [
                "piper",
                "--model", model_path,
                "--file", input_path,
                "--output_file", output_path
            ]

            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()

            if proc.returncode != 0:
                raise RuntimeError(f"Piper TTS failed: {stderr.decode()}")

            # Read output
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
            for p in [input_path, output_path]:
                if os.path.exists(p):
                    os.remove(p)

    async def generate_stream(self, params: TTSParams):
        """Stream audio chunks using Piper."""
        model_path = self._get_model_path(params.voice_id)

        proc = await asyncio.create_subprocess_exec(
            "piper",
            "--model", model_path,
            "--output_raw",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        proc.stdin.write(params.text.encode("utf-8"))
        await proc.stdin.drain()
        proc.stdin.close()

        chunk_size = 4096
        while True:
            chunk = await proc.stdout.read(chunk_size)
            if not chunk:
                break
            yield chunk

        await proc.wait()

    async def get_voices(self) -> list:
        """Get available Piper voices."""
        voices = []
        if os.path.exists(self._model_dir):
            for f in os.listdir(self._model_dir):
                if f.endswith(".onnx"):
                    voice_id = f.replace(".onnx", "")
                    voices.append({
                        "id": f"piper_{voice_id}",
                        "name": voice_id,
                        "language": voice_id.split("-")[0] if "-" in voice_id else "en",
                        "gender": "unknown",
                        "type": "system"
                    })
        return voices

    async def clone_voice(self, audio_samples: List[str], voice_name: str, language: str = "en") -> str:
        """Piper does not support voice cloning natively."""
        raise NotImplementedError("Piper TTS does not support voice cloning. Use Coqui TTS instead.")
