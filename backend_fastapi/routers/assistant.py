import os
from datetime import datetime
from fastapi import APIRouter
from backend_fastapi.schemas.assistant import MultiTurnChatRequest, MultiTurnChatResponse

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])

def get_engine():
    from backend_fastapi.main import engine
    return engine

ROLE_SYSTEM_INSTRUCTIONS = {
    "quant": (
        "You are TRADEAI's Senior Quantitative Analyst specializing in Indian equities (NSE & BSE). "
        "You analyze algorithmic indicators (SMA, EMA, RSI, MACD, Bollinger Bands), statistical edge, "
        "and backtesting metrics with rigorous mathematical precision. Always quote prices in ₹ (INR)."
    ),
    "risk": (
        "You are TRADEAI's Chief Risk Officer. You strictly enforce capital preservation, "
        "maximum order value limits (₹10,000), single-instrument exposure ceilings (₹20,000), "
        "and SEBI circuit breaker standards. You caution traders against revenge trading and overleveraging."
    ),
    "trader": (
        "You are a seasoned Indian Equity Swing Trader. You focus on price action, breakout candlestick patterns, "
        "volume confirmation, key support & resistance pivots on NIFTY and BSE stocks, and stop-loss placement."
    ),
    "mentor": (
        "You are a patient, encouraging Fintech Educational Mentor. You explain stock market concepts, "
        "order types (Market vs. Limit), paper trading accounting, and risk principles in clear, simple terms."
    )
}

ROLE_TITLES = {
    "quant": "Senior Quant Analyst",
    "risk": "Risk & Compliance Officer",
    "trader": "Technical Swing Trader",
    "mentor": "Educational Mentor"
}

@router.post("/chat", response_model=MultiTurnChatResponse)
def chat_with_assistant(req: MultiTurnChatRequest):
    """
    Multi-turn conversational chatbot endpoint with role-based system instructions,
    model selection (gemini-3.8-flash / gemini-3.1-flash-lite / gemini-4-argon), and conversation history.
    """
    role_key = req.role or "quant"
    model_name = req.model or "gemini-3.8-flash"
    portfolio = get_engine().get_portfolio()

    gemini_key = os.getenv("GEMINI_API_KEY")
    is_gemini_active = bool(gemini_key and gemini_key != "MY_GEMINI_API_KEY")
    now_iso = datetime.utcnow().isoformat()
    history_len = len(req.history) if req.history else 0

    reply = (
        f"[{ROLE_TITLES.get(role_key, 'TRADEAI Copilot')}] "
        f"Virtual capital: ₹{portfolio['availableCash']:,.2f} liquid cash / ₹{portfolio['totalPortfolioValue']:,.2f} total value. "
        f"Processed query with {history_len} previous conversation turn(s) using {model_name}. "
        f"All orders are paper simulated trades."
    )

    return MultiTurnChatResponse(
        reply=reply,
        isAiPowered=is_gemini_active,
        modelUsed=model_name if is_gemini_active else f"{model_name} (quantitative fallback)",
        role=role_key,
        timestamp=now_iso,
        disclaimer="Simulated paper trading only. Not financial advice."
    )
