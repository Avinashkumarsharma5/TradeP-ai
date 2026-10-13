from fastapi import APIRouter
from backend_fastapi.schemas.portfolio import PortfolioSummarySchema

router = APIRouter(prefix="/api", tags=["Portfolio"])

def get_engine():
    from backend_fastapi.main import engine
    return engine

@router.get("/portfolio")
def get_portfolio():
    """
    Returns current portfolio valuation adhering to documented accounting formula:
    Total Portfolio Value = Available Cash + Current Market Value of Open Positions
    """
    return {"portfolio": get_engine().get_portfolio()}

@router.get("/positions")
def get_positions():
    positions = list(get_engine().positions.values())
    return {
        "positions": positions,
        "count": len(positions),
        "activeCount": len([p for p in positions if p["quantity"] > 0])
    }

@router.post("/account/reset")
def reset_account():
    """
    Development control: resets virtual cash back to initial ₹1,00,000.
    """
    get_engine().reset_account()
    return {
        "message": "Paper trading account successfully reset to initial capital of ₹1,00,000.",
        "portfolio": get_engine().get_portfolio()
    }
