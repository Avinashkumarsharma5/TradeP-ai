import threading
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple

class PythonTradingEngine:
    def __init__(self, starting_capital: float = 100000.0):
        self.lock = threading.Lock()
        self.starting_capital = starting_capital
        self.available_cash = starting_capital
        self.positions: Dict[str, dict] = {}
        self.orders: List[dict] = []
        self.trades: List[dict] = []
        self.risk_settings = {
            "maxOrderValue": 10000.0,
            "maxExposurePerInstrument": 20000.0,
            "dailyLossLimit": 5000.0,
            "perTradeRiskPercent": 2.0,
            "killSwitchActive": False,
            "simulatedBrokerageFlat": 20.0,
            "simulatedSlippagePercent": 0.05
        }
        self.instruments = {
            "RELIANCE": {"symbol": "RELIANCE", "lastPrice": 2742.50, "exchange": "NSE", "sector": "Energy"},
            "TCS": {"symbol": "TCS", "lastPrice": 4125.80, "exchange": "NSE", "sector": "IT"},
            "HDFCBANK": {"symbol": "HDFCBANK", "lastPrice": 1682.40, "exchange": "NSE", "sector": "Banking"},
            "INFY": {"symbol": "INFY", "lastPrice": 1895.10, "exchange": "NSE", "sector": "IT"},
            "TATAMOTORS": {"symbol": "TATAMOTORS", "lastPrice": 918.25, "exchange": "NSE", "sector": "Auto"},
            "SBIN": {"symbol": "SBIN", "lastPrice": 798.50, "exchange": "NSE", "sector": "Banking"},
        }

    def get_portfolio(self) -> dict:
        with self.lock:
            invested_value = 0.0
            current_market_value = 0.0
            total_unrealized_pnl = 0.0
            total_realized_pnl = 0.0

            for symbol, pos in self.positions.items():
                qty = pos["quantity"]
                if qty > 0:
                    inst = self.instruments.get(symbol, {"lastPrice": pos["currentPrice"]})
                    cur_price = inst["lastPrice"]
                    pos["currentPrice"] = cur_price
                    pos["currentValue"] = round(qty * cur_price, 2)
                    pos["totalCost"] = round(qty * pos["averagePrice"], 2)
                    pos["unrealizedPnL"] = round(pos["currentValue"] - pos["totalCost"], 2)
                    pos["unrealizedPnLPercent"] = round((pos["unrealizedPnL"] / pos["totalCost"]) * 100, 2) if pos["totalCost"] > 0 else 0.0

                    invested_value += pos["totalCost"]
                    current_market_value += pos["currentValue"]
                    total_unrealized_pnl += pos["unrealizedPnL"]

                total_realized_pnl += pos.get("realizedPnL", 0.0)

            total_portfolio_value = round(self.available_cash + current_market_value, 2)
            total_pnl = round(total_portfolio_value - self.starting_capital, 2)
            total_return_pct = round((total_pnl / self.starting_capital) * 100, 2)

            return {
                "startingCapital": self.starting_capital,
                "availableCash": round(self.available_cash, 2),
                "investedValue": round(invested_value, 2),
                "totalPortfolioValue": total_portfolio_value,
                "totalRealizedPnL": round(total_realized_pnl, 2),
                "totalUnrealizedPnL": round(total_unrealized_pnl, 2),
                "totalPnL": total_pnl,
                "totalReturnPercent": total_return_pct,
                "dayPnL": 0.0,
                "dayPnLPercent": 0.0,
                "openPositionsCount": len([p for p in self.positions.values() if p["quantity"] > 0]),
                "totalTradesCount": len(self.trades),
                "isPaper": True,
                "lastUpdated": datetime.utcnow().isoformat(),
                "accountingFormula": "Total Value = Available Cash + Current Market Value of Open Positions"
            }

    def place_order(self, symbol: str, side: str, order_type: str, quantity: int, limit_price: Optional[float] = None) -> Tuple[dict, Optional[dict]]:
        with self.lock:
            sym = symbol.upper()
            inst = self.instruments.get(sym)
            if not inst:
                raise ValueError(f"Unknown symbol: {symbol}")

            if quantity <= 0:
                raise ValueError("Quantity must be positive whole number")

            if self.risk_settings["killSwitchActive"]:
                raise ValueError("Trading disabled: Kill switch is active")

            raw_price = limit_price if order_type == 'LIMIT' and limit_price else inst["lastPrice"]
            slippage_rate = self.risk_settings["simulatedSlippagePercent"] / 100.0
            slippage = raw_price * slippage_rate if side == 'BUY' else -raw_price * slippage_rate
            exec_price = round(raw_price + slippage, 2)

            gross_value = round(quantity * exec_price, 2)
            brokerage = self.risk_settings["simulatedBrokerageFlat"]
            stt = round(gross_value * 0.001, 2)
            total_cost = gross_value + brokerage + stt if side == 'BUY' else gross_value - brokerage - stt

            if gross_value > self.risk_settings["maxOrderValue"]:
                raise ValueError(f"Max order value limit ₹{self.risk_settings['maxOrderValue']} exceeded (Order was ₹{gross_value})")

            pos = self.positions.get(sym, {
                "symbol": sym, "exchange": inst["exchange"], "quantity": 0, "averagePrice": 0.0,
                "totalCost": 0.0, "currentPrice": exec_price, "currentValue": 0.0, "unrealizedPnL": 0.0,
                "unrealizedPnLPercent": 0.0, "realizedPnL": 0.0, "updatedAt": datetime.utcnow().isoformat()
            })

            if side == 'BUY':
                if self.available_cash < total_cost:
                    raise ValueError(f"Insufficient cash: Required ₹{total_cost}, available ₹{round(self.available_cash, 2)}")
                new_exposure = (pos["quantity"] + quantity) * exec_price
                if new_exposure > self.risk_settings["maxExposurePerInstrument"]:
                    raise ValueError(f"Max exposure ₹{self.risk_settings['maxExposurePerInstrument']} exceeded for {sym}")
            elif side == 'SELL':
                if pos["quantity"] < quantity:
                    raise ValueError(f"Insufficient holdings: Owned {pos['quantity']}, requested to sell {quantity}")

            now_str = datetime.utcnow().isoformat()
            order_id = f"ord_{int(time.time()*1000)}"

            order = {
                "id": order_id, "symbol": sym, "exchange": inst["exchange"], "side": side,
                "type": order_type, "quantity": quantity, "price": exec_price, "limitPrice": limit_price,
                "status": "FILLED", "statusReason": "Filled in simulation", "grossValue": gross_value,
                "brokerageFee": brokerage, "sttTax": stt, "totalCost": total_cost, "isPaper": True,
                "createdAt": now_str, "filledAt": now_str
            }
            self.orders.insert(0, order)

            realized_pnl = 0.0
            trade_id = f"trd_{int(time.time()*1000)}"

            if side == 'BUY':
                self.available_cash -= total_cost
                new_qty = pos["quantity"] + quantity
                new_cost = pos["totalCost"] + gross_value
                pos["averagePrice"] = round(new_cost / new_qty, 2)
                pos["quantity"] = new_qty
                pos["totalCost"] = round(new_cost, 2)
                pos["currentPrice"] = exec_price
                pos["currentValue"] = round(new_qty * exec_price, 2)
                pos["unrealizedPnL"] = round(pos["currentValue"] - pos["totalCost"], 2)
            else:
                self.available_cash += (gross_value - brokerage - stt)
                cost_basis = pos["averagePrice"] * quantity
                realized_pnl = round(gross_value - cost_basis - brokerage - stt, 2)
                pos["quantity"] -= quantity
                pos["totalCost"] = round(pos["averagePrice"] * pos["quantity"], 2)
                pos["currentPrice"] = exec_price
                pos["currentValue"] = round(pos["quantity"] * exec_price, 2)
                pos["unrealizedPnL"] = round(pos["currentValue"] - pos["totalCost"], 2)
                pos["realizedPnL"] = round(pos.get("realizedPnL", 0.0) + realized_pnl, 2)

            pos["updatedAt"] = now_str
            self.positions[sym] = pos

            trade = {
                "id": trade_id, "orderId": order_id, "symbol": sym, "exchange": inst["exchange"],
                "side": side, "quantity": quantity, "executionPrice": exec_price, "grossValue": gross_value,
                "brokerage": brokerage, "taxes": stt, "netValue": total_cost if side == 'BUY' else gross_value - brokerage - stt,
                "realizedPnL": realized_pnl if side == 'SELL' else None,
                "timestamp": now_str, "isPaper": True
            }
            self.trades.insert(0, trade)

            return order, trade

    def reset_account(self):
        with self.lock:
            self.available_cash = self.starting_capital
            self.positions.clear()
            self.orders.clear()
            self.trades.clear()
