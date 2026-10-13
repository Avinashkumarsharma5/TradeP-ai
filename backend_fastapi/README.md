# TRADEAI FastAPI Backend

This directory contains the Python FastAPI backend for TRADEAI — Intelligent Indian Stock Market Trading Terminal.

## Directory Structure

```text
backend_fastapi/
├── main.py               # FastAPI entry point, CORS middleware, root & router registration
├── config.py             # Settings, environment variables, and CORS origins
├── trading_engine.py     # Thread-safe in-memory paper trading execution engine
├── test_trading.py       # Comprehensive unit test suite (supports pytest & unittest)
├── requirements.txt      # Python dependencies (FastAPI, Uvicorn, Pydantic, etc.)
│
├── schemas/              # Pydantic validation schemas for core trading entities
│   ├── __init__.py       # Re-exports all schemas for clean importing
│   ├── common.py         # HealthCheckResponse, StatusResponse
│   ├── order.py          # OrderCreateSchema, OrderSchema, TradeSchema, OrderExecutionResponse
│   ├── portfolio.py      # PositionSchema, PortfolioSummarySchema, WatchlistSchema
│   ├── market.py         # InstrumentSchema, CandleSchema, MarketStatusResponse
│   ├── risk.py           # RiskSettingsSchema, RiskCheckResult
│   ├── strategy.py       # StrategySchema, BacktestRequestSchema, BacktestResultSchema
│   └── assistant.py      # ChatMessagePart, MultiTurnChatRequest, MultiTurnChatResponse
│
├── routers/              # Modular API route controllers
│   ├── __init__.py       # Consolidated router exports
│   ├── health.py         # GET /health - Service readiness & market session status
│   ├── orders.py         # POST /api/orders, GET /api/orders, GET /api/trades
│   ├── portfolio.py      # GET /api/portfolio, GET /api/positions, POST /api/account/reset
│   ├── market.py         # GET /api/market/overview, GET /api/market/instruments
│   ├── risk.py           # GET /api/risk/settings, POST /api/risk/settings
│   └── assistant.py      # POST /api/assistant/chat (Gemini trading assistant)
│
├── models/               # Declarative database models (SQLAlchemy / PostgreSQL)
│   ├── __init__.py       # Database session and model exports
│   ├── database.py       # Engine creation, SessionLocal, and get_db dependency
│   ├── order.py          # OrderModel and TradeModel entity definitions
│   ├── position.py       # PositionModel entity definition
│   └── account.py        # AccountModel and RiskSettingsModel
│
└── services/             # Core business logic services
    ├── __init__.py       # Service exports
    ├── market_service.py # NSE/BSE quotes, historical candles, technical indicators
    └── risk_manager.py   # Margin validation, exposure limits, kill switch enforcement
```

## Core Features & Design

1. **CORS Configuration (`main.py`)**:
   - Pre-configured with `CORSMiddleware` supporting `http://localhost:3000`, `http://localhost:5173`, and frontend clients.
   - Allows all standard methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`) and request headers.

2. **Health Check Endpoint (`/health`)**:
   - Validates service health, paper trading execution mode, supported exchanges (NSE, BSE), and UTC timestamp.
   - Also includes a root metadata endpoint at `/` with links to `/docs` (Swagger UI) and `/redoc`.

3. **Pydantic Schemas (`schemas/`)**:
   - Strictly typed schemas enforcing Indian equity market conventions (INR values, STT tax calculations, brokerage limits, NSE/BSE symbols).

4. **Testing**:
   - Run unit tests with `python3 backend_fastapi/test_trading.py` or `pytest backend_fastapi/test_trading.py`.

## Quick Start (Linux / macOS)
```bash
cd backend_fastapi
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

## Quick Start (Windows PowerShell)
```powershell
cd backend_fastapi
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

## Environment Variables (.env)
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8001
HOST=127.0.0.1
DATABASE_URL=sqlite:///./tradeai_dev.db
```
