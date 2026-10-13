"""
Database entities for Orders, Trades, and Execution Records
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class OrderModel:
    id: str
    symbol: str
    exchange: str
    side: str  # BUY or SELL
    type: str  # MARKET or LIMIT
    quantity: int
    price: float
    status: str  # PENDING, FILLED, REJECTED, CANCELLED
    gross_value: float
    brokerage_fee: float
    stt_tax: float
    total_cost: float
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    limit_price: Optional[float] = None
    filled_at: Optional[str] = None
    status_reason: Optional[str] = None
    is_paper: bool = True

@dataclass
class TradeModel:
    id: str
    order_id: str
    symbol: str
    exchange: str
    side: str
    quantity: int
    execution_price: float
    gross_value: float
    brokerage: float
    taxes: float
    net_value: float
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    realized_pnl: Optional[float] = None
    is_paper: bool = True
