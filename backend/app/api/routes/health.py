from fastapi import APIRouter, HTTPException, status

from app.core.config import get_settings
from app.db.mongodb import ping_database


router = APIRouter()

settings = get_settings()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "environment": settings.app_env,
        "version": settings.app_version,
    }


@router.get("/health/db")
def database_health_check():
    database_healthy = ping_database()

    if not database_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )

    return {
        "status": "healthy",
        "database": "mongodb",
    }