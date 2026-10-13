"""
SQLAlchemy models for paper trading persistence:
- Users: Account profile, liquid cash balance, starting capital, and portfolio controls.
- Positions: Current open holdings, volume-weighted average price (VWAP), and P&L tracking.
- Orders: Order routing, execution lifecycle, limit pricing, fees/taxes, and audit trail.
- Trades: Individual transaction execution records and realized returns.
"""
from datetime import datetime
import enum
from typing import Any, Dict, Optional
import uuid

from .database import Base

try:
    from sqlalchemy import (
        Boolean,
        Column,
        DateTime,
        Enum as SQLEnum,
        Float,
        ForeignKey,
        Index,
        Integer,
        Numeric,
        String,
        Text,
    )
    from sqlalchemy.orm import relationship
    _HAS_SQLALCHEMY = True
except ImportError:
    _HAS_SQLALCHEMY = False
    # Graceful shim for runtime environments where SQLAlchemy is not pre-installed
    def Column(*args, **kwargs):
        return None

    def relationship(*args, **kwargs):
        return None

    class Integer: pass
    class String: 
        def __init__(self, *args, **kwargs): pass
    class Float: pass
    class Numeric:
        def __init__(self, *args, **kwargs): pass
    class DateTime: pass
    class ForeignKey:
        def __init__(self, *args, **kwargs): pass
    class Boolean: pass
    class Text: pass
    class Index:
        def __init__(self, *args, **kwargs): pass
    class SQLEnum:
        def __init__(self, *args, **kwargs): pass


class OrderSide(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderType(str, enum.Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    FILLED = "FILLED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class User(Base):
    """
    User entity representing a paper trading account holder.
    Maintains liquid cash balance, starting capital, and active state.
    """
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:12]}")
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    starting_capital = Column(Float, nullable=False, default=100000.0)  # Standard ₹1,00,000 INR
    available_cash = Column(Float, nullable=False, default=100000.0)
    currency = Column(String(10), nullable=False, default="INR")
    is_paper = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    positions = relationship("Position", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    trades = relationship("Trade", back_populates="user", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        if "id" not in kwargs or not kwargs["id"]:
            kwargs["id"] = f"usr_{uuid.uuid4().hex[:12]}"
        if "starting_capital" not in kwargs:
            kwargs["starting_capital"] = 100000.0
        if "available_cash" not in kwargs:
            kwargs["available_cash"] = kwargs.get("starting_capital", 100000.0)
        if "currency" not in kwargs:
            kwargs["currency"] = "INR"
        if "is_paper" not in kwargs:
            kwargs["is_paper"] = True
        if "is_active" not in kwargs:
            kwargs["is_active"] = True
        if "created_at" not in kwargs:
            kwargs["created_at"] = datetime.utcnow()
        if "updated_at" not in kwargs:
            kwargs["updated_at"] = datetime.utcnow()
        for k, v in kwargs.items():
            setattr(self, k, v)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": getattr(self, "id", None),
            "username": getattr(self, "username", None),
            "email": getattr(self, "email", None),
            "starting_capital": getattr(self, "starting_capital", 100000.0),
            "available_cash": getattr(self, "available_cash", 100000.0),
            "currency": getattr(self, "currency", "INR"),
            "is_paper": getattr(self, "is_paper", True),
            "is_active": getattr(self, "is_active", True),
            "created_at": getattr(self, "created_at", datetime.utcnow()).isoformat() if isinstance(getattr(self, "created_at", None), datetime) else str(getattr(self, "created_at", "")),
            "updated_at": getattr(self, "updated_at", datetime.utcnow()).isoformat() if isinstance(getattr(self, "updated_at", None), datetime) else str(getattr(self, "updated_at", "")),
        }

    def __repr__(self) -> str:
        return f"<User(id='{getattr(self, 'id', None)}', username='{getattr(self, 'username', None)}', cash={getattr(self, 'available_cash', 0.0)})>"


class Position(Base):
    """
    Position entity representing current portfolio holdings for a specific user and instrument.
    Tracks volume-weighted average price, mark-to-market valuations, and profit/loss.
    """
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    exchange = Column(String(10), nullable=False, default="NSE")
    quantity = Column(Integer, nullable=False, default=0)
    average_price = Column(Float, nullable=False, default=0.0)
    total_cost = Column(Float, nullable=False, default=0.0)
    current_price = Column(Float, nullable=False, default=0.0)
    current_value = Column(Float, nullable=False, default=0.0)
    unrealized_pnl = Column(Float, nullable=False, default=0.0)
    unrealized_pnl_percent = Column(Float, nullable=False, default=0.0)
    realized_pnl = Column(Float, nullable=False, default=0.0)
    is_paper = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="positions")

    if _HAS_SQLALCHEMY:
        __table_args__ = (
            Index("ix_positions_user_symbol_exchange", "user_id", "symbol", "exchange"),
        )

    def __init__(self, **kwargs):
        if "exchange" not in kwargs:
            kwargs["exchange"] = "NSE"
        if "quantity" not in kwargs:
            kwargs["quantity"] = 0
        if "average_price" not in kwargs:
            kwargs["average_price"] = 0.0
        if "total_cost" not in kwargs:
            kwargs["total_cost"] = 0.0
        if "current_price" not in kwargs:
            kwargs["current_price"] = 0.0
        if "current_value" not in kwargs:
            kwargs["current_value"] = 0.0
        if "unrealized_pnl" not in kwargs:
            kwargs["unrealized_pnl"] = 0.0
        if "unrealized_pnl_percent" not in kwargs:
            kwargs["unrealized_pnl_percent"] = 0.0
        if "realized_pnl" not in kwargs:
            kwargs["realized_pnl"] = 0.0
        if "is_paper" not in kwargs:
            kwargs["is_paper"] = True
        if "created_at" not in kwargs:
            kwargs["created_at"] = datetime.utcnow()
        if "updated_at" not in kwargs:
            kwargs["updated_at"] = datetime.utcnow()
        for k, v in kwargs.items():
            setattr(self, k, v)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": getattr(self, "id", None),
            "user_id": getattr(self, "user_id", None),
            "symbol": getattr(self, "symbol", None),
            "exchange": getattr(self, "exchange", "NSE"),
            "quantity": getattr(self, "quantity", 0),
            "average_price": getattr(self, "average_price", 0.0),
            "total_cost": getattr(self, "total_cost", 0.0),
            "current_price": getattr(self, "current_price", 0.0),
            "current_value": getattr(self, "current_value", 0.0),
            "unrealized_pnl": getattr(self, "unrealized_pnl", 0.0),
            "unrealized_pnl_percent": getattr(self, "unrealized_pnl_percent", 0.0),
            "realized_pnl": getattr(self, "realized_pnl", 0.0),
            "is_paper": getattr(self, "is_paper", True),
            "created_at": getattr(self, "created_at", datetime.utcnow()).isoformat() if isinstance(getattr(self, "created_at", None), datetime) else str(getattr(self, "created_at", "")),
            "updated_at": getattr(self, "updated_at", datetime.utcnow()).isoformat() if isinstance(getattr(self, "updated_at", None), datetime) else str(getattr(self, "updated_at", "")),
        }

    def __repr__(self) -> str:
        return f"<Position(user_id='{getattr(self, 'user_id', None)}', symbol='{getattr(self, 'symbol', None)}', qty={getattr(self, 'quantity', 0)}, avg_price={getattr(self, 'average_price', 0.0)})>"


class Order(Base):
    """
    Order entity representing trading instructions submitted by a user.
    Maintains status, limit price target, execution records, regulatory charges (STT, brokerage), and timestamps.
    """
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, default=lambda: f"ord_{uuid.uuid4().hex[:12]}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    exchange = Column(String(10), nullable=False, default="NSE")
    side = Column(String(10), nullable=False)  # BUY or SELL
    order_type = Column(String(10), nullable=False, default="MARKET")  # MARKET or LIMIT
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    limit_price = Column(Float, nullable=True)
    status = Column(String(20), nullable=False, default="PENDING", index=True)  # PENDING, FILLED, REJECTED, CANCELLED
    status_reason = Column(String(255), nullable=True)
    gross_value = Column(Float, nullable=False, default=0.0)
    brokerage_fee = Column(Float, nullable=False, default=20.0)  # Standard ₹20 simulated flat fee
    stt_tax = Column(Float, nullable=False, default=0.0)         # 0.1% Securities Transaction Tax
    total_cost = Column(Float, nullable=False, default=0.0)
    is_paper = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    filled_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")
    trades = relationship("Trade", back_populates="order", cascade="all, delete-orphan")

    if _HAS_SQLALCHEMY:
        __table_args__ = (
            Index("ix_orders_user_status_created", "user_id", "status", "created_at"),
        )

    def __init__(self, **kwargs):
        if "id" not in kwargs or not kwargs["id"]:
            kwargs["id"] = f"ord_{uuid.uuid4().hex[:12]}"
        if "exchange" not in kwargs:
            kwargs["exchange"] = "NSE"
        if "order_type" not in kwargs and "type" in kwargs:
            kwargs["order_type"] = kwargs.pop("type")
        if "order_type" not in kwargs:
            kwargs["order_type"] = "MARKET"
        if "status" not in kwargs:
            kwargs["status"] = "PENDING"
        if "brokerage_fee" not in kwargs:
            kwargs["brokerage_fee"] = 20.0
        if "stt_tax" not in kwargs:
            kwargs["stt_tax"] = 0.0
        if "is_paper" not in kwargs:
            kwargs["is_paper"] = True
        if "created_at" not in kwargs:
            kwargs["created_at"] = datetime.utcnow()
        for k, v in kwargs.items():
            setattr(self, k, v)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": getattr(self, "id", None),
            "user_id": getattr(self, "user_id", None),
            "symbol": getattr(self, "symbol", None),
            "exchange": getattr(self, "exchange", "NSE"),
            "side": getattr(self, "side", None),
            "type": getattr(self, "order_type", "MARKET"),
            "order_type": getattr(self, "order_type", "MARKET"),
            "quantity": getattr(self, "quantity", 0),
            "price": getattr(self, "price", 0.0),
            "limit_price": getattr(self, "limit_price", None),
            "status": getattr(self, "status", "PENDING"),
            "status_reason": getattr(self, "status_reason", None),
            "gross_value": getattr(self, "gross_value", 0.0),
            "brokerage_fee": getattr(self, "brokerage_fee", 20.0),
            "stt_tax": getattr(self, "stt_tax", 0.0),
            "total_cost": getattr(self, "total_cost", 0.0),
            "is_paper": getattr(self, "is_paper", True),
            "created_at": getattr(self, "created_at", datetime.utcnow()).isoformat() if isinstance(getattr(self, "created_at", None), datetime) else str(getattr(self, "created_at", "")),
            "filled_at": getattr(self, "filled_at", None).isoformat() if isinstance(getattr(self, "filled_at", None), datetime) else (str(getattr(self, "filled_at", "")) if getattr(self, "filled_at", None) else None),
        }

    def __repr__(self) -> str:
        return f"<Order(id='{getattr(self, 'id', None)}', symbol='{getattr(self, 'symbol', None)}', side='{getattr(self, 'side', None)}', qty={getattr(self, 'quantity', 0)}, status='{getattr(self, 'status', None)}')>"


class Trade(Base):
    """
    Trade entity representing executed transactions derived from filled orders.
    Stores execution price, regulatory fees breakdown, and realized profit/loss.
    """
    __tablename__ = "trades"

    id = Column(String(64), primary_key=True, default=lambda: f"trd_{uuid.uuid4().hex[:12]}")
    order_id = Column(String(64), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    exchange = Column(String(10), nullable=False, default="NSE")
    side = Column(String(10), nullable=False)  # BUY or SELL
    quantity = Column(Integer, nullable=False)
    execution_price = Column(Float, nullable=False)
    gross_value = Column(Float, nullable=False)
    brokerage = Column(Float, nullable=False, default=20.0)
    taxes = Column(Float, nullable=False, default=0.0)
    net_value = Column(Float, nullable=False)
    realized_pnl = Column(Float, nullable=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    is_paper = Column(Boolean, nullable=False, default=True)

    # Relationships
    order = relationship("Order", back_populates="trades")
    user = relationship("User", back_populates="trades")

    def __init__(self, **kwargs):
        if "id" not in kwargs or not kwargs["id"]:
            kwargs["id"] = f"trd_{uuid.uuid4().hex[:12]}"
        if "exchange" not in kwargs:
            kwargs["exchange"] = "NSE"
        if "brokerage" not in kwargs:
            kwargs["brokerage"] = 20.0
        if "taxes" not in kwargs:
            kwargs["taxes"] = 0.0
        if "is_paper" not in kwargs:
            kwargs["is_paper"] = True
        if "timestamp" not in kwargs:
            kwargs["timestamp"] = datetime.utcnow()
        for k, v in kwargs.items():
            setattr(self, k, v)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": getattr(self, "id", None),
            "order_id": getattr(self, "order_id", None),
            "user_id": getattr(self, "user_id", None),
            "symbol": getattr(self, "symbol", None),
            "exchange": getattr(self, "exchange", "NSE"),
            "side": getattr(self, "side", None),
            "quantity": getattr(self, "quantity", 0),
            "execution_price": getattr(self, "execution_price", 0.0),
            "gross_value": getattr(self, "gross_value", 0.0),
            "brokerage": getattr(self, "brokerage", 20.0),
            "taxes": getattr(self, "taxes", 0.0),
            "net_value": getattr(self, "net_value", 0.0),
            "realized_pnl": getattr(self, "realized_pnl", None),
            "timestamp": getattr(self, "timestamp", datetime.utcnow()).isoformat() if isinstance(getattr(self, "timestamp", None), datetime) else str(getattr(self, "timestamp", "")),
            "is_paper": getattr(self, "is_paper", True),
        }

    def __repr__(self) -> str:
        return f"<Trade(id='{getattr(self, 'id', None)}', symbol='{getattr(self, 'symbol', None)}', side='{getattr(self, 'side', None)}', qty={getattr(self, 'quantity', 0)}, price={getattr(self, 'execution_price', 0.0)})>"


# Aliases for plural or singular access
Users = User
Positions = Position
Orders = Order
Trades = Trade

__all__ = [
    "Base",
    "User",
    "Users",
    "Position",
    "Positions",
    "Order",
    "Orders",
    "Trade",
    "Trades",
    "OrderSide",
    "OrderType",
    "OrderStatus",
]
