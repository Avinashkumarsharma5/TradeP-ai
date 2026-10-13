from .health import router as health_router
from .market import router as market_router
from .orders import router as orders_router
from .portfolio import router as portfolio_router
from .risk import router as risk_router
from .assistant import router as assistant_router

__all__ = [
    "health_router",
    "market_router",
    "orders_router",
    "portfolio_router",
    "risk_router",
    "assistant_router",
]
