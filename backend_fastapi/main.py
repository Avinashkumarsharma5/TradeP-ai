import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend_fastapi.config import settings
from backend_fastapi.trading_engine import PythonTradingEngine
from backend_fastapi.routers import (
    health_router,
    market_router,
    orders_router,
    portfolio_router,
    risk_router,
    assistant_router,
)

# Initialize FastAPI instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
# Enables secure cross-origin resource sharing from React/Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Stateful in-memory trading engine instance
engine = PythonTradingEngine(starting_capital=settings.STARTING_CAPITAL)

@app.get("/", tags=["Root"])
def root_status():
    """
    Root status endpoint providing API metadata and documentation links.
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "description": settings.DESCRIPTION,
        "docs": "/docs",
        "health": "/health",
        "mode": "PAPER_TRADING",
        "exchanges": settings.PRIMARY_EXCHANGES,
    }

# Register modular routers
app.include_router(health_router)
app.include_router(market_router)
app.include_router(orders_router)
app.include_router(portfolio_router)
app.include_router(risk_router)
app.include_router(assistant_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_fastapi.main:app", host="127.0.0.1", port=8001, reload=True)
