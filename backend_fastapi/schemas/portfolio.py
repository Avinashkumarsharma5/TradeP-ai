from pydantic import BaseModel, Field
from typing import List, Optional

class PositionSchema(BaseModel):
    symbol: str = Field(..., description="Held equity symbol")
    exchange: str
    quantity: int = Field(..., description="Currently owned share quantity")
    averagePrice: float = Field(..., description="Volume weighted average entry price")
    totalCost: float = Field(..., description="Total cost basis of holding")
    currentPrice: float = Field(..., description="Current reference market price")
    currentValue: float = Field(..., description="Current holding market value")
    unrealizedPnL: float = Field(..., description="Current market value minus cost basis")
    unrealizedPnLPercent: float = Field(..., description="Unrealized return percentage")
    realizedPnL: float = Field(default=0.0, description="Cumulative realized gains on liquidated shares")
    updatedAt: str

class PortfolioSummarySchema(BaseModel):
    startingCapital: float = Field(default=100000.0, description="Initial virtual capital in INR")
    availableCash: float = Field(..., description="Liquid unencumbered virtual cash")
    investedValue: float = Field(..., description="Total deployed capital in equity positions")
    totalPortfolioValue: float = Field(..., description="Available cash + Current market value")
    totalRealizedPnL: float = Field(..., description="Sum of realized profits across all closed positions")
    totalUnrealizedPnL: float = Field(..., description="Current mark-to-market unrealized paper gains/losses")
    totalPnL: float = Field(..., description="Total Portfolio Value minus Starting Capital")
    totalReturnPercent: float = Field(..., description="Total percentage return on initial capital")
    dayPnL: float = Field(default=0.0, description="Intraday portfolio profit/loss")
    dayPnLPercent: float = Field(default=0.0)
    openPositionsCount: int = Field(..., description="Number of currently active holdings")
    totalTradesCount: int = Field(..., description="Lifetime executed trade count")
    isPaper: bool = True
    lastUpdated: str
    accountingFormula: str = Field(
        default="Total Portfolio Value = Available Cash + Sum(Quantity × Current Market Price). Total PnL = Total Portfolio Value - Starting Capital (₹1,00,000)."
    )

class WatchlistSchema(BaseModel):
    id: str
    name: str
    symbols: List[str]
    createdAt: str
