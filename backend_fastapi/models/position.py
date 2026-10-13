"""
Database entity for Positions and Holdings Ledger
"""
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class PositionModel:
    symbol: str
    exchange: str
    quantity: int
    average_price: float
    total_cost: float
    current_price: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    realized_pnl: float = 0.0
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
