from fastapi import APIRouter, HTTPException, status
from backend_fastapi.schemas.order import OrderCreateSchema, OrderExecutionResponse
from backend_fastapi.trading_engine import PythonTradingEngine

router = APIRouter(prefix="/api", tags=["Orders & Trading"])

# Shared engine instance initialized in main or passed
def get_engine():
    from backend_fastapi.main import engine
    return engine

@router.get("/orders")
def get_orders():
    return {"orders": get_engine().orders, "count": len(get_engine().orders)}

@router.get("/trades")
def get_trades():
    return {"trades": get_engine().trades, "count": len(get_engine().trades)}

@router.post("/orders", status_code=status.HTTP_201_CREATED)
def place_order(order_in: OrderCreateSchema):
    """
    Submits a simulated paper trading order.
    Enforces atomic mutex execution, cash balance verification,
    and server-side risk limit validations.
    """
    try:
        order, trade = get_engine().place_order(
            symbol=order_in.symbol,
            side=order_in.side,
            order_type=order_in.type,
            quantity=order_in.quantity,
            limit_price=order_in.limitPrice
        )
        return {"order": order, "trade": trade}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
