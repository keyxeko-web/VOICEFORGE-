"""
VoiceForge AI - Custom Exceptions
"""
from fastapi import HTTPException, status


class VoiceForgeException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = None):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code


class NotFoundException(VoiceForgeException):
    def __init__(self, resource: str, identifier: str = None):
        detail = f"{resource} not found"
        if identifier:
            detail += f": {identifier}"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail, error_code="NOT_FOUND")


class ValidationException(VoiceForgeException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail, error_code="VALIDATION_ERROR")


class RateLimitException(VoiceForgeException):
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail, error_code="RATE_LIMIT_EXCEEDED")


class TTSProcessingException(VoiceForgeException):
    def __init__(self, detail: str = "TTS processing failed"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail, error_code="TTS_PROCESSING_FAILED")


class VoiceCloneException(VoiceForgeException):
    def __init__(self, detail: str = "Voice cloning failed"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail, error_code="VOICE_CLONE_FAILED")
