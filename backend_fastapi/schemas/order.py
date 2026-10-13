from pydantic import BaseModel, Field
from typing import Optional, Literal

class OrderCreateSchema(BaseModel):
    symbol: str = Field(..., description="Stock symbol to trade, e.g. RELIANCE, TCS")
    exchange: Optional[Literal['NSE', 'BSE']] = Field(default='NSE', description="Target exchange")
    side: Literal['BUY', 'SELL'] = Field(..., description="Order transaction side: BUY or SELL")
    type: Literal['MARKET', 'LIMIT'] = Field(..., description="Execution type: MARKET or LIMIT")
    quantity: int = Field(gt=0, description="Order quantity (must be positive integer)")
    limitPrice: Optional[float] = Field(default=None, description="Required for LIMIT orders")

class OrderSchema(BaseModel):
    id: str = Field(..., description="Unique order identifier")
    symbol: str
    exchange: str
    side: str
    type: str
    quantity: int
    price: float = Field(..., description="Execution fill price or limit target")
    limitPrice: Optional[float] = None
    status: Literal['PENDING', 'FILLED', 'REJECTED', 'CANCELLED']
    statusReason: Optional[str] = None
    grossValue: float
    brokerageFee: float = Field(default=20.0, description="Simulated flat brokerage fee")
    sttTax: float = Field(..., description="Securities Transaction Tax (0.1%)")
    totalCost: float = Field(..., description="Net cash impact of the order")
    isPaper: bool = True
    createdAt: str
    filledAt: Optional[str] = None

class TradeSchema(BaseModel):
    id: str
    orderId: str
    symbol: str
    exchange: str
    side: str
    quantity: int
    executionPrice: float
    grossValue: float
    brokerage: float
    taxes: float
    netValue: float
    realizedPnL: Optional[float] = None
    timestamp: str
    isPaper: bool = True

class OrderExecutionResponse(BaseModel):
    order: OrderSchema
    trade: Optional[TradeSchema] = None
