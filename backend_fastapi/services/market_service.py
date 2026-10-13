from typing import List, Dict, Optional
from datetime import datetime

class MarketService:
    """
    Indian Market Data Service (NSE & BSE Equities and Benchmark Indices).
    Provides quotes, market hours evaluation, and sample historical candles.
    """
    MASTER_INSTRUMENTS: List[Dict] = [
        {
            "symbol": "NIFTY 50",
            "name": "NIFTY 50 Benchmark Index",
            "exchange": "NSE",
            "sector": "Indices",
            "lastPrice": 24852.30,
            "change": 142.60,
            "pChange": 0.58,
            "open": 24730.10,
            "high": 24895.00,
            "low": 24715.40,
            "close": 24709.70,
            "volume": 245000000,
            "high52": 26277.35,
            "low52": 18837.85,
            "marketCapCr": 18500000.0,
            "peRatio": 22.8,
            "dividendYield": 1.25,
            "isIndex": True
        },
        {
            "symbol": "SENSEX",
            "name": "BSE SENSEX Benchmark Index",
            "exchange": "BSE",
            "sector": "Indices",
            "lastPrice": 81381.36,
            "change": 494.20,
            "pChange": 0.61,
            "open": 80920.15,
            "high": 81490.80,
            "low": 80890.00,
            "close": 80887.16,
            "volume": 18000000,
            "high52": 85978.25,
            "low52": 63583.07,
            "marketCapCr": 16200000.0,
            "peRatio": 23.4,
            "dividendYield": 1.18,
            "isIndex": True
        },
        {
            "symbol": "RELIANCE",
            "name": "Reliance Industries Ltd",
            "exchange": "NSE",
            "sector": "Energy & Petrochemicals",
            "lastPrice": 2742.50,
            "change": 18.20,
            "pChange": 0.67,
            "open": 2728.00,
            "high": 2755.00,
            "low": 2721.10,
            "close": 2724.30,
            "volume": 5820400,
            "high52": 3217.90,
            "low52": 2221.05,
            "marketCapCr": 1855000.0,
            "peRatio": 26.8,
            "dividendYield": 0.36,
            "isIndex": False
        },
        {
            "symbol": "TCS",
            "name": "Tata Consultancy Services Ltd",
            "exchange": "NSE",
            "sector": "Information Technology",
            "lastPrice": 4125.80,
            "change": 62.40,
            "pChange": 1.54,
            "open": 4075.00,
            "high": 4140.00,
            "low": 4065.20,
            "close": 4063.40,
            "volume": 2150300,
            "high52": 4592.25,
            "low52": 3311.00,
            "marketCapCr": 1492000.0,
            "peRatio": 31.2,
            "dividendYield": 1.82,
            "isIndex": False
        },
        {
            "symbol": "HDFCBANK",
            "name": "HDFC Bank Ltd",
            "exchange": "NSE",
            "sector": "Banking & Finance",
            "lastPrice": 1682.40,
            "change": -8.10,
            "pChange": -0.48,
            "open": 1695.00,
            "high": 1698.80,
            "low": 1675.20,
            "close": 1690.50,
            "volume": 12450800,
            "high52": 1794.00,
            "low52": 1363.45,
            "marketCapCr": 1280000.0,
            "peRatio": 18.6,
            "dividendYield": 1.16,
            "isIndex": False
        },
        {
            "symbol": "TATAMOTORS",
            "name": "Tata Motors Ltd",
            "exchange": "NSE",
            "sector": "Automobile",
            "lastPrice": 918.25,
            "change": -12.40,
            "pChange": -1.33,
            "open": 932.00,
            "high": 936.50,
            "low": 914.00,
            "close": 930.65,
            "volume": 9812400,
            "high52": 1179.05,
            "low52": 621.75,
            "marketCapCr": 338000.0,
            "peRatio": 10.4,
            "dividendYield": 0.65,
            "isIndex": False
        }
    ]

    @classmethod
    def get_instruments(cls, query: Optional[str] = None, exchange: Optional[str] = None) -> List[Dict]:
        results = cls.MASTER_INSTRUMENTS
        if query:
            q = query.lower()
            results = [i for i in results if q in i["symbol"].lower() or q in i["name"].lower()]
        if exchange:
            results = [i for i in results if i["exchange"].upper() == exchange.upper()]
        return results

    @classmethod
    def get_instrument_by_symbol(cls, symbol: str) -> Optional[Dict]:
        sym = symbol.upper()
        for i in cls.MASTER_INSTRUMENTS:
            if i["symbol"] == sym:
                return i
        return None
