"""
Database entities for Trading Account, Risk Controls, and Watchlists
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import List

@dataclass
class AccountModel:
    id: str
    starting_capital: float = 100000.0  # ₹1,00,000 INR
    available_cash: float = 100000.0
    currency: str = "INR"
    is_paper: bool = True
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

@dataclass
class RiskSettingsModel:
    max_order_value: float = 10000.0
    max_exposure_per_instrument: float = 20000.0
    daily_loss_limit: float = 5000.0
    per_trade_risk_percent: float = 2.0
    kill_switch_active: bool = False
    simulated_brokerage_flat: float = 20.0
    simulated_slippage_percent: float = 0.05
