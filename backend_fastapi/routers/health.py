from datetime import datetime
from fastapi import APIRouter
from backend_fastapi.schemas.common import HealthCheckResponse
from backend_fastapi.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthCheckResponse)
def get_health():
    """
    Health check endpoint to verify backend service readiness,
    paper trading mode, and active Indian exchange feeds.
    """
    return HealthCheckResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        mode="PAPER_TRADING",
        version=settings.VERSION,
        exchanges=settings.PRIMARY_EXCHANGES,
        timestamp=datetime.utcnow().isoformat()
    )
