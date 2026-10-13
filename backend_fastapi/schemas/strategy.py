from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class StrategyRuleSchema(BaseModel):
    indicator: Literal['SMA', 'EMA', 'RSI', 'MACD', 'BOLLINGER']
    period: int
    operator: Literal['>', '<', 'CROSSES_ABOVE', 'CROSSES_BELOW']
    value: float

class StrategySchema(BaseModel):
    id: str
    name: str
    description: str
    symbols: List[str]
    timeframe: Literal['1D', '1H', '15M']
    entryRules: List[StrategyRuleSchema]
    exitRules: List[StrategyRuleSchema]
    stopLossPercent: float
    takeProfitPercent: float
    positionSizeCash: float
    createdAt: str

class BacktestRequestSchema(BaseModel):
    strategyId: str
    symbol: str
    initialCapital: Optional[float] = 100000.0
    days: Optional[int] = 120

class BacktestTradeSchema(BaseModel):
    entryDate: str
    exitDate: str
    symbol: str
    type: Literal['LONG'] = 'LONG'
    entryPrice: float
    exitPrice: float
    quantity: int
    pnl: float
    pnlPercent: float
    exitReason: Literal['TAKE_PROFIT', 'STOP_LOSS', 'SIGNAL_EXIT']

class EquityCurvePoint(BaseModel):
    date: str
    equity: float
    benchmarkEquity: float

class BacktestResultSchema(BaseModel):
    id: str
    strategyId: str
    strategyName: str
    symbol: str
    startDate: str
    endDate: str
    initialCapital: float
    finalCapital: float
    totalReturn: float
    totalReturnPercent: float
    cagr: float
    winRate: float
    totalTrades: int
    winningTrades: int
    losingTrades: int
    maxDrawdownPercent: float
    profitFactor: float
    sharpeRatio: float
    trades: List[BacktestTradeSchema]
    equityCurve: List[EquityCurvePoint]
    benchmarkReturnPercent: float
    createdAt: str
