from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.voices import router as voices_router
from app.api.v1.generations import router as generations_router
from app.api.v1.projects import router as projects_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(voices_router)
api_router.include_router(generations_router)
api_router.include_router(projects_router)
