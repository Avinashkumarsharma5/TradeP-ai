try:
    import pytest
except ImportError:
    pytest = None

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from backend_fastapi.trading_engine import PythonTradingEngine
except ImportError:
    from trading_engine import PythonTradingEngine

from contextlib import contextmanager

@contextmanager
def raises_error(exc_type, match=None, match_str=None):
    expected_match = match or match_str
    if pytest is not None:
        with pytest.raises(exc_type, match=expected_match):
            yield
    else:
        try:
            yield
        except exc_type as e:
            if expected_match and expected_match not in str(e):
                raise AssertionError(f"Expected error message containing '{expected_match}', got '{e}'")
            return
        raise AssertionError(f"Expected {exc_type.__name__} to be raised, but no exception occurred")

def test_initial_account():
    engine = PythonTradingEngine()
    port = engine.get_portfolio()
    assert port["startingCapital"] == 100000.0
    assert port["availableCash"] == 100000.0
    assert port["totalPortfolioValue"] == 100000.0
    assert port["investedValue"] == 0.0
    assert port["totalPnL"] == 0.0

def test_buy_order_success():
    engine = PythonTradingEngine()
    # Buy 2 shares of RELIANCE (~₹2,742 each = ~₹5,484 gross, under ₹10k limit)
    order, trade = engine.place_order("RELIANCE", "BUY", "MARKET", 2)
    assert order["status"] == "FILLED"
    assert order["quantity"] == 2
    assert trade is not None
    assert engine.available_cash < 100000.0
    assert "RELIANCE" in engine.positions
    assert engine.positions["RELIANCE"]["quantity"] == 2

def test_sell_order_success():
    engine = PythonTradingEngine()
    engine.place_order("TATAMOTORS", "BUY", "MARKET", 5)
    cash_after_buy = engine.available_cash
    order, trade = engine.place_order("TATAMOTORS", "SELL", "MARKET", 2)
    assert order["status"] == "FILLED"
    assert engine.positions["TATAMOTORS"]["quantity"] == 3
    assert engine.available_cash > cash_after_buy

def test_insufficient_holdings_error():
    engine = PythonTradingEngine()
    with raises_error(ValueError, match="Insufficient holdings"):
        engine.place_order("TCS", "SELL", "MARKET", 1)

def test_max_order_value_risk_limit():
    engine = PythonTradingEngine()
    # Buying 10 shares of TCS (~₹4,125 * 10 = ₹41,250 > ₹10,000 max order limit)
    with raises_error(ValueError, match="Max order value limit"):
        engine.place_order("TCS", "BUY", "MARKET", 10)

def test_invalid_symbol():
    engine = PythonTradingEngine()
    with raises_error(ValueError, match="Unknown symbol"):
        engine.place_order("INVALID_STOCK", "BUY", "MARKET", 1)

def test_invalid_quantity():
    engine = PythonTradingEngine()
    with raises_error(ValueError, match="Quantity must be positive"):
        engine.place_order("RELIANCE", "BUY", "MARKET", 0)

def test_account_reset():
    engine = PythonTradingEngine()
    engine.place_order("RELIANCE", "BUY", "MARKET", 1)
    assert len(engine.orders) == 1
    engine.reset_account()
    assert engine.available_cash == 100000.0
    assert len(engine.orders) == 0
    assert len(engine.positions) == 0

class TradingEngineTestCase(unittest.TestCase):
    def test_all_scenarios(self):
        test_initial_account()
        test_buy_order_success()
        test_sell_order_success()
        test_insufficient_holdings_error()
        test_max_order_value_risk_limit()
        test_invalid_symbol()
        test_invalid_quantity()
        test_account_reset()

if __name__ == '__main__':
    unittest.main()
