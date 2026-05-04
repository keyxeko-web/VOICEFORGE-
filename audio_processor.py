"""
VoiceForge AI - Audio Processing Service
FFmpeg-based audio processing, normalization, and format conversion.
"""
import os
import io
import subprocess
import tempfile
from typing import Optional
from pydub import AudioSegment
from pydub.effects import normalize

from app.core.config import settings


class AudioProcessor:
    """Audio processing utilities."""

    @staticmethod
    def convert_format(
        audio_data: bytes,
        target_format: str = "mp3",
        sample_rate: int = 44100,
        bitrate: str = "192k"
    ) -> bytes:
        """Convert audio to target format using FFmpeg."""
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
            tmp_in.write(audio_data)
            input_path = tmp_in.name

        with tempfile.NamedTemporaryFile(suffix=f".{target_format}", delete=False) as tmp_out:
            output_path = tmp_out.name

        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-ar", str(sample_rate),
                "-b:a", bitrate,
                "-f", target_format,
                output_path
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True
            )

            if result.returncode != 0:
                raise RuntimeError(f"FFmpeg conversion failed: {result.stderr}")

            with open(output_path, "rb") as f:
                return f.read()

        finally:
            for p in [input_path, output_path]:
                if os.path.exists(p):
                    os.remove(p)

    @staticmethod
    def normalize_audio(audio_data: bytes, target_db: float = -14.0) -> bytes:
        """Normalize audio to target dB."""
        audio = AudioSegment.from_wav(io.BytesIO(audio_data))
        normalized = normalize(audio)

        # Adjust to target dB
        change_in_db = target_db - normalized.dBFS
        adjusted = normalized.apply_gain(change_in_db)

        buffer = io.BytesIO()
        adjusted.export(buffer, format="wav")
        return buffer.getvalue()

    @staticmethod
    def adjust_speed(audio_data: bytes, speed: float) -> bytes:
        """Adjust audio speed."""
        audio = AudioSegment.from_wav(io.BytesIO(audio_data))

        # pydub speedup changes pitch, use ffmpeg for better quality
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
            tmp_in.write(audio_data)
            input_path = tmp_in.name

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_out:
            output_path = tmp_out.name

        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-filter:a", f"atempo={speed}",
                "-vn",
                output_path
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                raise RuntimeError(f"Speed adjustment failed: {result.stderr}")

            with open(output_path, "rb") as f:
                return f.read()

        finally:
            for p in [input_path, output_path]:
                if os.path.exists(p):
                    os.remove(p)

    @staticmethod
    def adjust_pitch(audio_data: bytes, pitch: float) -> bytes:
        """Adjust audio pitch while maintaining speed."""
        # pitch factor: 1.0 = no change, 0.5 = octave down, 2.0 = octave up
        semitones = 12 * (pitch - 1.0)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
            tmp_in.write(audio_data)
            input_path = tmp_in.name

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_out:
            output_path = tmp_out.name

        try:
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-filter:a", f"rubberband=pitch={semitones}",
                "-vn",
                output_path
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode != 0:
                raise RuntimeError(f"Pitch adjustment failed: {result.stderr}")

            with open(output_path, "rb") as f:
                return f.read()

        finally:
            for p in [input_path, output_path]:
                if os.path.exists(p):
                    os.remove(p)

    @staticmethod
    def adjust_volume(audio_data: bytes, volume: float) -> bytes:
        """Adjust audio volume."""
        audio = AudioSegment.from_wav(io.BytesIO(audio_data))
        # volume: 0.0 to 2.0, convert to dB
        db_change = 20 * (volume - 1.0)
        adjusted = audio.apply_gain(db_change)

        buffer = io.BytesIO()
        adjusted.export(buffer, format="wav")
        return buffer.getvalue()

    @staticmethod
    def get_duration(audio_data: bytes) -> float:
        """Get audio duration in seconds."""
        audio = AudioSegment.from_wav(io.BytesIO(audio_data))
        return len(audio) / 1000.0

    @staticmethod
    def apply_watermark(audio_data: bytes, watermark_text: str = "VoiceForge") -> bytes:
        """Apply subtle audio watermark."""
        # Simple approach: embed inaudible metadata
        # For production, use proper audio watermarking library
        return audio_data

    @staticmethod
    def process_audio(
        audio_data: bytes,
        speed: float = 1.0,
        pitch: float = 1.0,
        volume: float = 1.0,
        target_format: str = "mp3",
        normalize: bool = True
    ) -> bytes:
        """Full audio processing pipeline."""
        # Apply adjustments
        if speed != 1.0:
            audio_data = AudioProcessor.adjust_speed(audio_data, speed)

        if pitch != 1.0:
            audio_data = AudioProcessor.adjust_pitch(audio_data, pitch)

        if volume != 1.0:
            audio_data = AudioProcessor.adjust_volume(audio_data, volume)

        if normalize:
            audio_data = AudioProcessor.normalize_audio(audio_data)

        # Convert to target format
        if target_format != "wav":
            audio_data = AudioProcessor.convert_format(
                audio_data,
                target_format=target_format,
                sample_rate=settings.AUDIO_SAMPLE_RATE,
                bitrate=settings.AUDIO_BITRATE
            )

        return audio_data


# Storage Service
class StorageService:
    """File storage service (local or cloud)."""

    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        self.bucket = settings.STORAGE_BUCKET
        self.local_path = settings.LOCAL_STORAGE_PATH

        if self.storage_type == "s3":
            import boto3
            self.client = boto3.client(
                "s3",
                endpoint_url=settings.STORAGE_ENDPOINT,
                aws_access_key_id=settings.STORAGE_ACCESS_KEY,
                aws_secret_access_key=settings.STORAGE_SECRET_KEY,
                region_name=settings.STORAGE_REGION
            )
        elif self.storage_type == "minio":
            from minio import Minio
            self.client = Minio(
                settings.STORAGE_ENDPOINT.replace("http://", "").replace("https://", ""),
                access_key=settings.STORAGE_ACCESS_KEY,
                secret_key=settings.STORAGE_SECRET_KEY,
                secure=settings.STORAGE_ENDPOINT.startswith("https")
            )
            # Ensure bucket exists
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)

    async def upload(self, file_data: bytes, filename: str, content_type: str = "audio/mpeg") -> str:
        """Upload file and return URL."""
        if self.storage_type == "local":
            os.makedirs(self.local_path, exist_ok=True)
            filepath = os.path.join(self.local_path, filename)
            with open(filepath, "wb") as f:
                f.write(file_data)
            return f"/audio/{filename}"

        elif self.storage_type == "s3":
            import boto3
            self.client.put_object(
                Bucket=self.bucket,
                Key=filename,
                Body=file_data,
                ContentType=content_type
            )
            return f"https://{self.bucket}.s3.{settings.STORAGE_REGION}.amazonaws.com/{filename}"

        elif self.storage_type == "minio":
            from minio import S3Error
            from io import BytesIO
            self.client.put_object(
                self.bucket,
                filename,
                BytesIO(file_data),
                len(file_data),
                content_type=content_type
            )
            return f"{settings.STORAGE_ENDPOINT}/{self.bucket}/{filename}"

    async def delete(self, filename: str) -> bool:
        """Delete file from storage."""
        try:
            if self.storage_type == "local":
                filepath = os.path.join(self.local_path, filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
                return True
            elif self.storage_type in ["s3", "minio"]:
                self.client.delete_object(self.bucket, filename)
                return True
        except Exception:
            return False
        return False
