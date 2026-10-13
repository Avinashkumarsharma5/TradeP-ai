from pydantic import BaseModel, Field
from typing import List, Optional

class HealthCheckResponse(BaseModel):
    status: str = Field(default="healthy", description="Service health state")
    service: str = Field(default="TRADEAI FastAPI Core", description="Service identifier")
    mode: str = Field(default="PAPER_TRADING", description="Execution mode: PAPER_TRADING or LIVE")
    version: str = Field(default="1.0.0", description="Backend service version")
    exchanges: List[str] = Field(default=["NSE", "BSE"], description="Supported exchange feeds")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")

class StatusResponse(BaseModel):
    success: bool = True
    message: str
