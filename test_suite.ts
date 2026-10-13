import { TradingEngine } from './server/services/tradingEngine.js';
import { storage } from './server/services/storage.js';
import { BacktestingEngine } from './server/services/backtestingEngine.js';

async function runTests() {
  console.log('=== RUNNING TRADEAI TEST SUITE ===');

  // 1. Reset account
  storage.resetToDefault();
  let portfolio = TradingEngine.calculatePortfolio();
  if (portfolio.availableCash !== 100000 || portfolio.totalPortfolioValue !== 100000) {
    throw new Error(`Initial capital mismatch: ${JSON.stringify(portfolio)}`);
  }
  console.log('✔ Initial account test passed: Virtual capital ₹1,00,000.00');

  // 2. Buy Order Test (2 shares of RELIANCE)
  const buyRes = await TradingEngine.placeOrder({
    symbol: 'RELIANCE',
    side: 'BUY',
    type: 'MARKET',
    quantity: 2,
  });
  if (buyRes.order.status !== 'FILLED' || buyRes.order.quantity !== 2) {
    throw new Error(`Buy order execution failed: ${JSON.stringify(buyRes)}`);
  }
  portfolio = TradingEngine.calculatePortfolio();
  if (portfolio.availableCash >= 100000 || portfolio.investedValue <= 0) {
    throw new Error('Cash deduction or invested value failed on Buy order');
  }
  console.log('✔ Buy order execution test passed: Bought 2 RELIANCE, Cash remaining: ₹' + portfolio.availableCash);

  // 3. Sell Order Test (1 share of RELIANCE)
  const sellRes = await TradingEngine.placeOrder({
    symbol: 'RELIANCE',
    side: 'SELL',
    type: 'MARKET',
    quantity: 1,
  });
  if (sellRes.order.status !== 'FILLED' || !sellRes.trade) {
    throw new Error(`Sell order execution failed: ${JSON.stringify(sellRes)}`);
  }
  const pos = storage.getState().positions['RELIANCE'];
  if (pos.quantity !== 1) {
    throw new Error(`Expected remaining position quantity 1, got ${pos.quantity}`);
  }
  console.log('✔ Sell order execution test passed: Sold 1 RELIANCE, Remaining quantity: 1, Realized P&L: ₹' + sellRes.trade.realizedPnL);

  // 4. Risk Limit Test: Max Order Value (trying to buy 10 shares of TCS > ₹10,000)
  try {
    await TradingEngine.placeOrder({
      symbol: 'TCS',
      side: 'BUY',
      type: 'MARKET',
      quantity: 10, // ~₹41,250
    });
    throw new Error('Risk limit test failed: Order > ₹10,000 was not rejected!');
  } catch (err: any) {
    if (!err.message.includes('exceeds the maximum allowed order limit')) {
      throw err;
    }
    console.log('✔ Server-side risk check passed: Rejected order exceeding ₹10,000 limit');
  }

  // 5. Holding Ownership Test (trying to sell what is not owned)
  try {
    await TradingEngine.placeOrder({
      symbol: 'INFY',
      side: 'SELL',
      type: 'MARKET',
      quantity: 5,
    });
    throw new Error('Holding ownership test failed: Sold unowned stock!');
  } catch (err: any) {
    if (!err.message.includes('Insufficient Holdings')) {
      throw err;
    }
    console.log('✔ Holding ownership check passed: Blocked selling unowned stock');
  }

  // 6. Quantitative Backtest Test
  const state = storage.getState();
  const strat = state.strategies[0];
  const btRes = BacktestingEngine.runBacktest({
    strategy: strat,
    symbol: 'RELIANCE',
    initialCapital: 100000,
    days: 90,
  });
  if (!btRes.trades || btRes.equityCurve.length === 0) {
    throw new Error('Backtesting calculation returned empty results');
  }
  console.log(`✔ Backtesting engine test passed: ${btRes.trades.length} trades simulated, Win Rate: ${btRes.winRate}%, Final Equity: ₹${btRes.finalCapital}`);

  // 7. Reset Account Test
  storage.resetToDefault();
  portfolio = TradingEngine.calculatePortfolio();
  if (portfolio.availableCash !== 100000 || Object.keys(storage.getState().positions).length > 0) {
    throw new Error('Reset failed');
  }
  console.log('✔ Account reset test passed: Ledger reset to initial state');

  console.log('=== ALL 7 AUTOMATED INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
