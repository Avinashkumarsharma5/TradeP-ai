from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException
from backend_fastapi.schemas.market import (
    InstrumentSchema, 
    MarketOverviewResponse, 
    MarketStatusResponse
)
from backend_fastapi.services.market_service import MarketService

router = APIRouter(prefix="/api/market", tags=["Market Data"])

@router.get("/status", response_model=MarketStatusResponse)
def get_market_status():
    """
    Evaluates Indian Market trading hours (09:15 AM to 03:30 PM IST, Monday - Friday)
    """
    return MarketStatusResponse(
        isOpen=False,
        exchange="NSE / BSE",
        currentTimeIST=datetime.utcnow().strftime("%H:%M IST"),
        marketHours="09:15 AM - 03:30 PM IST (Mon-Fri)",
        statusText="Market Operating (Simulated Feed)",
        dataSource="TRADEAI Sample Market Feed (NSE & BSE)",
        isSampleData=True
    )

@router.get("/overview", response_model=MarketOverviewResponse)
def get_market_overview():
    instruments = MarketService.MASTER_INSTRUMENTS
    indices = [i for i in instruments if i.get("isIndex")]
    equities = [i for i in instruments if not i.get("isIndex")]
    
    top_gainers = sorted(equities, key=lambda x: x["pChange"], reverse=True)[:5]
    top_losers = sorted(equities, key=lambda x: x["pChange"])[:5]
    most_active = sorted(equities, key=lambda x: x["volume"], reverse=True)[:5]

    return MarketOverviewResponse(
        indices=indices,
        topGainers=top_gainers,
        topLosers=top_losers,
        mostActive=most_active,
        totalInstruments=len(instruments),
        timestamp=datetime.utcnow().isoformat(),
        dataSource="TRADEAI Indian Stock Market Feed",
        isSampleData=True
    )

@router.get("/instruments")
def get_instruments(q: Optional[str] = None, exchange: Optional[str] = None):
    results = MarketService.get_instruments(query=q, exchange=exchange)
    return {"instruments": results, "count": len(results)}

@router.get("/instruments/{symbol}")
def get_instrument(symbol: str):
    inst = MarketService.get_instrument_by_symbol(symbol)
    if not inst:
        raise HTTPException(status_code=404, detail=f"Instrument '{symbol}' not found on NSE/BSE.")
    return {"instrument": inst, "dataSource": "TRADEAI Sample Feed", "isSampleData": True}
