from pydantic import BaseModel, Field

class RiskSettingsSchema(BaseModel):
    maxOrderValue: float = Field(default=10000.0, description="Maximum allowed gross value for a single order in INR")
    maxExposurePerInstrument: float = Field(default=20000.0, description="Maximum total exposure permitted for a single instrument in INR")
    dailyLossLimit: float = Field(default=5000.0, description="Daily stop-loss limit triggering circuit restrictions")
    perTradeRiskPercent: float = Field(default=2.0, description="Maximum suggested risk percent per position")
    killSwitchActive: bool = Field(default=False, description="Emergency lock preventing any incoming orders")
    simulatedBrokerageFlat: float = Field(default=20.0, description="Flat brokerage fee per executed order")
    simulatedSlippagePercent: float = Field(default=0.05, description="Simulated execution slippage rate percentage")

class RiskCheckResult(BaseModel):
    allowed: bool
    reason: str = "Order compliant with risk boundaries"
