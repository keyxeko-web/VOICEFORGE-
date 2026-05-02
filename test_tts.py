"""
VoiceForge AI - TTS Generation Tests
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from main import app


@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_list_system_voices(client):
    with patch("app.services.engine_manager.TTSEngineManager.get_all_voices", new_callable=AsyncMock) as mock:
        mock.return_value = [
            {"id": "coqui_test", "name": "Test Voice", "language": "en", "gender": "female", "type": "system"}
        ]
        response = await client.get("/api/v1/voices/system")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "Test Voice"


@pytest.mark.asyncio
async def test_create_generation_unauthorized(client):
    response = await client.post("/api/v1/generations", json={
        "text": "Hello world",
        "voice_id": "123e4567-e89b-12d3-a456-426614174000"
    })
    assert response.status_code == 403
