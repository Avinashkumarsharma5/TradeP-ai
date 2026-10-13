import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import { MASTER_INSTRUMENTS, generateCandlesForSymbol } from './server/data/instruments.js';
import { TradingEngine } from './server/services/tradingEngine.js';
import { storage } from './server/services/storage.js';
import { BacktestingEngine } from './server/services/backtestingEngine.js';
import { GeminiAssistantService } from './server/services/geminiAssistant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable CORS for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 1. Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TRADEAI Core API',
    mode: 'PAPER_TRADING',
    version: '1.0.0',
    exchanges: ['NSE', 'BSE'],
  });
});

// Market Status (Indian market hours: Monday-Friday 9:15 AM to 3:30 PM IST)
app.get('/api/market/status', (req: Request, res: Response) => {
  const now = new Date();
  // IST is UTC + 5:30
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  
  const day = istDate.getUTCDay(); // 0 is Sunday, 6 is Saturday
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const currentMinuteOfDay = hours * 60 + minutes;

  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = isWeekday && currentMinuteOfDay >= (9 * 60 + 15) && currentMinuteOfDay <= (15 * 60 + 30);

  res.json({
    isOpen: isMarketHours,
    exchange: 'NSE / BSE',
    currentTimeIST: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} IST`,
    marketHours: '09:15 AM - 03:30 PM IST (Mon-Fri)',
    statusText: isMarketHours ? 'Market Open (Regular Trading)' : 'Market Closed (After Hours)',
    dataSource: 'TRADEAI Sample Market Feed (Simulated Realistic Indian Equities)',
    isSampleData: true,
  });
});

// 2. Market Overview & Instruments
app.get('/api/market/overview', (req: Request, res: Response) => {
  const indices = MASTER_INSTRUMENTS.filter(i => i.isIndex);
  const topGainers = [...MASTER_INSTRUMENTS.filter(i => !i.isIndex)].sort((a, b) => b.pChange - a.pChange).slice(0, 5);
  const topLosers = [...MASTER_INSTRUMENTS.filter(i => !i.isIndex)].sort((a, b) => a.pChange - b.pChange).slice(0, 5);
  const mostActive = [...MASTER_INSTRUMENTS.filter(i => !i.isIndex)].sort((a, b) => b.volume - a.volume).slice(0, 5);

  res.json({
    indices,
    topGainers,
    topLosers,
    mostActive,
    totalInstruments: MASTER_INSTRUMENTS.length,
    timestamp: new Date().toISOString(),
    dataSource: 'TRADEAI Sample Indian Market Feed (NSE / BSE)',
    isSampleData: true,
  });
});

app.get('/api/market/instruments', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  const exchange = req.query.exchange as string;
  const sector = req.query.sector as string;

  let filtered = MASTER_INSTRUMENTS;

  if (query) {
    filtered = filtered.filter(i => 
      i.symbol.toLowerCase().includes(query) || 
      i.name.toLowerCase().includes(query)
    );
  }
  if (exchange) {
    filtered = filtered.filter(i => i.exchange.toUpperCase() === exchange.toUpperCase());
  }
  if (sector) {
    filtered = filtered.filter(i => i.sector.toLowerCase().includes(sector.toLowerCase()));
  }

  res.json({
    instruments: filtered,
    count: filtered.length,
    timestamp: new Date().toISOString(),
    dataSource: 'TRADEAI Market Master (NSE/BSE)',
  });
});

app.get('/api/market/instruments/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const inst = MASTER_INSTRUMENTS.find(i => i.symbol === symbol);
  if (!inst) {
    return res.status(404).json({ error: `Instrument '${symbol}' not found.` });
  }
  res.json({
    instrument: inst,
    dataSource: 'TRADEAI Sample Data Feed',
    isSampleData: true,
  });
});

app.get('/api/market/history/:symbol', (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const days = parseInt(req.query.days as string, 10) || 90;
  const candles = generateCandlesForSymbol(symbol, days);

  res.json({
    symbol,
    candles,
    count: candles.length,
    dataSource: 'TRADEAI Historical Simulation Engine',
    isSampleData: true,
  });
});

// 3. Portfolio, Positions, Trades, Orders
app.get('/api/portfolio', (req: Request, res: Response) => {
  const portfolio = TradingEngine.calculatePortfolio();
  res.json({ portfolio });
});

app.get('/api/positions', (req: Request, res: Response) => {
  TradingEngine.calculatePortfolio(); // Triggers price & PnL re-calculation
  const state = storage.getState();
  const positions = Object.values(state.positions);
  res.json({ 
    positions,
    count: positions.length,
    activeCount: positions.filter(p => p.quantity > 0).length,
  });
});

app.get('/api/trades', (req: Request, res: Response) => {
  const state = storage.getState();
  res.json({ 
    trades: state.trades,
    count: state.trades.length,
  });
});

app.get('/api/orders', (req: Request, res: Response) => {
  const state = storage.getState();
  res.json({ 
    orders: state.orders,
    count: state.orders.length,
  });
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { symbol, exchange, side, type, quantity, limitPrice } = req.body;
    const result = await TradingEngine.placeOrder({
      symbol,
      exchange,
      side,
      type,
      quantity: Number(quantity),
      limitPrice: limitPrice ? Number(limitPrice) : undefined,
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Order execution rejected.' });
  }
});

app.post('/api/orders/:order_id/cancel', async (req: Request, res: Response) => {
  try {
    const orderId = req.params.order_id;
    const cancelled = await TradingEngine.cancelOrder(orderId);
    res.json({ order: cancelled });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to cancel order.' });
  }
});

app.post('/api/account/reset', (req: Request, res: Response) => {
  storage.resetToDefault();
  const portfolio = TradingEngine.calculatePortfolio();
  res.json({ 
    message: 'Paper trading account reset successfully to initial capital of ₹1,00,000.',
    portfolio,
  });
});

// 4. Watchlists
app.get('/api/watchlists', (req: Request, res: Response) => {
  const state = storage.getState();
  res.json({ watchlists: state.watchlists });
});

app.post('/api/watchlists', async (req: Request, res: Response) => {
  const { name, symbols } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Watchlist name is required.' });
  }
  const result = await storage.withLock(state => {
    const newWl = {
      id: `wl_${Date.now()}`,
      name,
      symbols: Array.isArray(symbols) ? symbols : [],
      createdAt: new Date().toISOString(),
    };
    state.watchlists.push(newWl);
    return newWl;
  });
  res.status(201).json({ watchlist: result });
});

app.put('/api/watchlists/:watchlist_id', async (req: Request, res: Response) => {
  const id = req.params.watchlist_id;
  const { name, symbols } = req.body;
  const result = await storage.withLock(state => {
    const wl = state.watchlists.find(w => w.id === id);
    if (!wl) throw new Error(`Watchlist ${id} not found.`);
    if (name) wl.name = name;
    if (Array.isArray(symbols)) wl.symbols = symbols;
    return wl;
  });
  res.json({ watchlist: result });
});

app.delete('/api/watchlists/:watchlist_id', async (req: Request, res: Response) => {
  const id = req.params.watchlist_id;
  await storage.withLock(state => {
    state.watchlists = state.watchlists.filter(w => w.id !== id);
  });
  res.json({ message: 'Watchlist deleted.' });
});

// 5. Risk Settings
app.get('/api/risk/settings', (req: Request, res: Response) => {
  const state = storage.getState();
  res.json({ riskSettings: state.riskSettings });
});

app.put('/api/risk/settings', async (req: Request, res: Response) => {
  const { 
    maxOrderValue, 
    maxExposurePerInstrument, 
    dailyLossLimit, 
    perTradeRiskPercent, 
    killSwitchActive,
    simulatedBrokerageFlat,
    simulatedSlippagePercent
  } = req.body;

  const updated = await storage.withLock(state => {
    if (maxOrderValue !== undefined) state.riskSettings.maxOrderValue = Number(maxOrderValue);
    if (maxExposurePerInstrument !== undefined) state.riskSettings.maxExposurePerInstrument = Number(maxExposurePerInstrument);
    if (dailyLossLimit !== undefined) state.riskSettings.dailyLossLimit = Number(dailyLossLimit);
    if (perTradeRiskPercent !== undefined) state.riskSettings.perTradeRiskPercent = Number(perTradeRiskPercent);
    if (killSwitchActive !== undefined) state.riskSettings.killSwitchActive = Boolean(killSwitchActive);
    if (simulatedBrokerageFlat !== undefined) state.riskSettings.simulatedBrokerageFlat = Number(simulatedBrokerageFlat);
    if (simulatedSlippagePercent !== undefined) state.riskSettings.simulatedSlippagePercent = Number(simulatedSlippagePercent);

    state.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'RISK_SETTINGS_UPDATED',
      details: `Risk rules updated. Kill switch: ${state.riskSettings.killSwitchActive}`,
      actor: 'USER',
      ip: '127.0.0.1',
    });

    return state.riskSettings;
  });

  res.json({ riskSettings: updated });
});

// 6. Strategies & Backtests
app.get('/api/strategies', (req: Request, res: Response) => {
  const state = storage.getState();
  res.json({ strategies: state.strategies });
});

app.post('/api/strategies', async (req: Request, res: Response) => {
  const { name, description, symbols, timeframe, entryRules, exitRules, stopLossPercent, takeProfitPercent, positionSizeCash } = req.body;
  if (!name) return res.status(400).json({ error: 'Strategy name is required.' });

  const strat = await storage.withLock(state => {
    const newStrat = {
      id: `strat_${Date.now()}`,
      name,
      description: description || '',
      symbols: symbols || ['RELIANCE'],
      timeframe: timeframe || '1D',
      entryRules: entryRules || [],
      exitRules: exitRules || [],
      stopLossPercent: Number(stopLossPercent) || 2.5,
      takeProfitPercent: Number(takeProfitPercent) || 6.0,
      positionSizeCash: Number(positionSizeCash) || 10000,
      createdAt: new Date().toISOString(),
    };
    state.strategies.push(newStrat);
    return newStrat;
  });

  res.status(201).json({ strategy: strat });
});

app.delete('/api/strategies/:strategy_id', async (req: Request, res: Response) => {
  const id = req.params.strategy_id;
  await storage.withLock(state => {
    state.strategies = state.strategies.filter(s => s.id !== id);
  });
  res.json({ message: 'Strategy deleted.' });
});

app.post('/api/backtests', async (req: Request, res: Response) => {
  try {
    const { strategyId, symbol, initialCapital, days } = req.body;
    const state = storage.getState();
    const strat = state.strategies.find(s => s.id === strategyId) || state.strategies[0];
    if (!strat) {
      return res.status(404).json({ error: 'Strategy not found.' });
    }

    const result = BacktestingEngine.runBacktest({
      strategy: strat,
      symbol: symbol || strat.symbols[0] || 'RELIANCE',
      initialCapital: initialCapital ? Number(initialCapital) : 100000,
      days: days ? Number(days) : 120,
    });

    await storage.withLock(s => {
      s.backtests.unshift(result);
    });

    res.json({ backtest: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Backtesting execution failed.' });
  }
});

app.get('/api/backtests/:backtest_id', (req: Request, res: Response) => {
  const state = storage.getState();
  const bt = state.backtests.find(b => b.id === req.params.backtest_id);
  if (!bt) return res.status(404).json({ error: 'Backtest result not found.' });
  res.json({ backtest: bt });
});

// 7. AI Assistant
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, role, model } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message prompt is required.' });
    }
    const response = await GeminiAssistantService.chat({ message, history, role, model });
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Assistant processing failed.' });
  }
});

// 8. Alerts
app.get('/api/alerts', (req: Request, res: Response) => {
  const state = storage.getState();
  // Evaluate alerts against current prices
  state.alerts.forEach(alert => {
    const inst = MASTER_INSTRUMENTS.find(i => i.symbol === alert.symbol);
    if (inst) {
      alert.currentPrice = inst.lastPrice;
      if (!alert.triggered) {
        if (alert.condition === 'ABOVE' && inst.lastPrice >= alert.targetPrice) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
        } else if (alert.condition === 'BELOW' && inst.lastPrice <= alert.targetPrice) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString();
        }
      }
    }
  });
  res.json({ alerts: state.alerts });
});

app.post('/api/alerts', async (req: Request, res: Response) => {
  const { symbol, condition, targetPrice, notes } = req.body;
  if (!symbol || !targetPrice) {
    return res.status(400).json({ error: 'Symbol and target price are required.' });
  }
  const inst = MASTER_INSTRUMENTS.find(i => i.symbol === symbol.toUpperCase());
  const currentPrice = inst ? inst.lastPrice : Number(targetPrice);

  const alert = await storage.withLock(state => {
    const newAlert = {
      id: `alt_${Date.now()}`,
      symbol: symbol.toUpperCase(),
      condition: condition || 'ABOVE',
      targetPrice: Number(targetPrice),
      currentPrice,
      triggered: false,
      createdAt: new Date().toISOString(),
      notes: notes || '',
    };
    state.alerts.unshift(newAlert);
    return newAlert;
  });

  res.status(201).json({ alert });
});

app.delete('/api/alerts/:alert_id', async (req: Request, res: Response) => {
  const id = req.params.alert_id;
  await storage.withLock(state => {
    state.alerts = state.alerts.filter(a => a.id !== id);
  });
  res.json({ message: 'Alert deleted.' });
});

// 9. Audit Logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const state = storage.getState();
  res.json({ logs: state.auditLogs.slice(0, 50) });
});

// Vite Integration (Dev server middleware or Production Static Serve)
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRADEAI] Terminal server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
