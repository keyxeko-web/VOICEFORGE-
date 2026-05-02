"""
VoiceForge AI — Public endpoints (no authentication required)
"""
import asyncio
import subprocess
import tempfile
import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

router = APIRouter(prefix="/public", tags=["Public TTS"])

LANG_MAP = {
    "vi": "vi", "en": "en", "zh": "cmn", "ja": "ja",
    "ko": "ko", "fr": "fr", "de": "de", "es": "es",
}

MAX_CHARS = 500


@router.post("/tts")
async def public_tts(
    text: str = Query(..., max_length=MAX_CHARS, description="Văn bản cần đọc"),
    language: str = Query("vi", description="Ngôn ngữ: vi, en, zh, ja, ko, fr, de, es"),
    speed: float = Query(1.0, ge=0.5, le=2.0, description="Tốc độ đọc"),
    pitch: float = Query(0.0, ge=-1.0, le=1.0, description="Cao độ"),
):
    """Chuyển văn bản thành giọng nói — không cần đăng nhập."""
    if not text.strip():
        raise HTTPException(status_code=400, detail="Văn bản không được để trống")

    lang = LANG_MAP.get(language, "en")
    speed_wpm = int(175 * speed)
    pitch_val = max(0, min(99, int(50 + pitch * 50)))

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        out_path = f.name

    cmd = [
        "espeak-ng",
        "-v", lang,
        "-s", str(speed_wpm),
        "-p", str(pitch_val),
        "-w", out_path,
        text.strip(),
    ]

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()

    if proc.returncode != 0:
        raise HTTPException(status_code=500, detail=f"TTS error: {stderr.decode()}")

    with open(out_path, "rb") as f:
        audio = f.read()
    os.unlink(out_path)

    return Response(
        content=audio,
        media_type="audio/wav",
        headers={"Content-Disposition": 'attachment; filename="voiceforge.wav"'},
    )


@router.get("/voices")
async def public_voices():
    """Danh sách giọng đọc có sẵn."""
    return [
        {"code": "vi", "label": "🇻🇳 Tiếng Việt"},
        {"code": "en", "label": "🇬🇧 English"},
        {"code": "zh", "label": "🇨🇳 中文"},
        {"code": "ja", "label": "🇯🇵 日本語"},
        {"code": "ko", "label": "🇰🇷 한국어"},
        {"code": "fr", "label": "🇫🇷 Français"},
        {"code": "de", "label": "🇩🇪 Deutsch"},
        {"code": "es", "label": "🇪🇸 Español"},
    ]
