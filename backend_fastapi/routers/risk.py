from fastapi import APIRouter
from backend_fastapi.schemas.risk import RiskSettingsSchema

router = APIRouter(prefix="/api/risk", tags=["Risk Management"])

def get_engine():
    from backend_fastapi.main import engine
    return engine

@router.get("/settings")
def get_risk_settings():
    return {"riskSettings": get_engine().risk_settings}

@router.put("/settings")
def update_risk_settings(settings: RiskSettingsSchema):
    get_engine().risk_settings = settings.dict()
    return {"riskSettings": get_engine().risk_settings}
