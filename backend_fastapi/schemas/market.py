from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class InstrumentSchema(BaseModel):
    symbol: str = Field(..., description="NSE/BSE trading symbol, e.g. RELIANCE, TCS")
    name: str = Field(..., description="Full legal name of the entity")
    exchange: Literal['NSE', 'BSE'] = Field(..., description="Exchange identifier")
    sector: str = Field(..., description="Industry or sector categorization")
    lastPrice: float = Field(..., description="Last traded reference price in INR")
    change: float = Field(..., description="Absolute intraday change in INR")
    pChange: float = Field(..., description="Percentage intraday change")
    open: float = Field(..., description="Opening price of trading session")
    high: float = Field(..., description="Intraday high price")
    low: float = Field(..., description="Intraday low price")
    close: float = Field(..., description="Previous session closing price")
    volume: int = Field(..., description="Session cumulative volume")
    high52: float = Field(..., description="52-week high price")
    low52: float = Field(..., description="52-week low price")
    marketCapCr: float = Field(..., description="Market capitalization in Crore INR")
    peRatio: float = Field(..., description="Price to Earnings ratio")
    dividendYield: float = Field(..., description="Annual dividend yield percentage")
    isIndex: Optional[bool] = Field(default=False, description="Flag indicating if symbol is an index")

class CandleSchema(BaseModel):
    time: str = Field(..., description="Date or timestamp string (YYYY-MM-DD)")
    open: float
    high: float
    low: float
    close: float
    volume: int

class MarketStatusResponse(BaseModel):
    isOpen: bool = Field(..., description="Indicates if NSE/BSE regular hours are active")
    exchange: str = "NSE / BSE"
    currentTimeIST: str
    marketHours: str = "09:15 AM - 03:30 PM IST (Mon-Fri)"
    statusText: str
    dataSource: str
    isSampleData: bool = True

class MarketOverviewResponse(BaseModel):
    indices: List[InstrumentSchema]
    topGainers: List[InstrumentSchema]
    topLosers: List[InstrumentSchema]
    mostActive: List[InstrumentSchema]
    totalInstruments: int
    timestamp: str
    dataSource: str
    isSampleData: bool = True
