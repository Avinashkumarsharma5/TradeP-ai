import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "TRADEAI FastAPI Backend"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Intelligent Indian Stock Market Paper Trading & Quantitative Engine"
    API_V1_STR: str = "/api"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",
    ]
    
    # Market & Capital Defaults
    STARTING_CAPITAL: float = 100000.0  # ₹1,00,000 INR
    PRIMARY_EXCHANGES: List[str] = ["NSE", "BSE"]
    CURRENCY: str = "INR"

    # API Keys & External Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
