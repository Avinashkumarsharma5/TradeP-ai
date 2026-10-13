import fs from 'fs';
import path from 'path';
import { 
  Order, 
  Trade, 
  Position, 
  RiskSettings, 
  Watchlist, 
  Strategy, 
  BacktestResult, 
  PriceAlert, 
  AuditLog 
} from '../types.js';

export interface StorageState {
  startingCapital: number;
  availableCash: number;
  positions: Record<string, Position>;
  orders: Order[];
  trades: Trade[];
  watchlists: Watchlist[];
  riskSettings: RiskSettings;
  strategies: Strategy[];
  backtests: BacktestResult[];
  alerts: PriceAlert[];
  auditLogs: AuditLog[];
}

const DATA_FILE = path.resolve(process.cwd(), 'tradeai_data.json');

const DEFAULT_RISK_SETTINGS: RiskSettings = {
  maxOrderValue: 10000, // ₹10,000 per order
  maxExposurePerInstrument: 20000, // ₹20,000 per instrument
  dailyLossLimit: 5000, // ₹5,000 daily loss limit
  perTradeRiskPercent: 2, // 2% of capital
  killSwitchActive: false,
  simulatedBrokerageFlat: 20, // ₹20 per executed order (standard discount broker rate)
  simulatedSlippagePercent: 0.05, // 0.05% slippage
};

const DEFAULT_STATE: StorageState = {
  startingCapital: 100000,
  availableCash: 100000,
  positions: {},
  orders: [],
  trades: [],
  watchlists: [
    {
      id: 'wl_default',
      name: 'NIFTY Bluechips',
      symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'TATAMOTORS'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'wl_banking',
      name: 'Banking & Financials',
      symbols: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'BAJFINANCE', 'KOTAKBANK'],
      createdAt: new Date().toISOString(),
    }
  ],
  riskSettings: DEFAULT_RISK_SETTINGS,
  strategies: [
    {
      id: 'strat_ma_cross',
      name: 'Golden Cross (SMA 20/50)',
      description: 'Trend following strategy entering when 20-day SMA crosses above 50-day SMA',
      symbols: ['RELIANCE', 'TCS', 'INFY'],
      timeframe: '1D',
      entryRules: [
        { indicator: 'SMA', period: 20, operator: '>', value: 50 }
      ],
      exitRules: [
        { indicator: 'SMA', period: 20, operator: '<', value: 50 }
      ],
      stopLossPercent: 2.5,
      takeProfitPercent: 6.0,
      positionSizeCash: 10000,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'strat_rsi_reversal',
      name: 'RSI Oversold Mean Reversion',
      description: 'Contrarian setup buying stocks with RSI(14) below 30 and selling when RSI exceeds 65',
      symbols: ['TATAMOTORS', 'SBIN', 'LT'],
      timeframe: '1D',
      entryRules: [
        { indicator: 'RSI', period: 14, operator: '<', value: 30 }
      ],
      exitRules: [
        { indicator: 'RSI', period: 14, operator: '>', value: 65 }
      ],
      stopLossPercent: 3.0,
      takeProfitPercent: 7.5,
      positionSizeCash: 10000,
      createdAt: new Date().toISOString(),
    }
  ],
  backtests: [],
  alerts: [
    {
      id: 'alt_1',
      symbol: 'RELIANCE',
      condition: 'ABOVE',
      targetPrice: 2800,
      currentPrice: 2742.50,
      triggered: false,
      createdAt: new Date().toISOString(),
      notes: 'Breakout watch level above 2800 resistance',
    },
    {
      id: 'alt_2',
      symbol: 'TCS',
      condition: 'BELOW',
      targetPrice: 4000,
      currentPrice: 4125.80,
      triggered: false,
      createdAt: new Date().toISOString(),
      notes: 'Dip buying support zone near 4000 psychological mark',
    }
  ],
  auditLogs: [
    {
      id: 'log_init',
      timestamp: new Date().toISOString(),
      action: 'SYSTEM_BOOT',
      details: 'TRADEAI terminal initialized with starting virtual capital of ₹1,00,000.',
      actor: 'SYSTEM',
      ip: '127.0.0.1',
    }
  ],
};

class StorageManager {
  private state: StorageState;
  private lockPromise: Promise<void> = Promise.resolve();

  constructor() {
    this.state = this.loadFromFile();
  }

  private loadFromFile(): StorageState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          riskSettings: { ...DEFAULT_RISK_SETTINGS, ...(parsed.riskSettings || {}) },
        };
      }
    } catch (err) {
      console.warn('Could not read existing data file, initializing default state:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  private persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write state file:', err);
    }
  }

  // Mutex to ensure atomic order processing & cash balance updates
  public async withLock<T>(operation: (state: StorageState) => Promise<T> | T): Promise<T> {
    const prevLock = this.lockPromise;
    let release: () => void = () => {};
    this.lockPromise = new Promise(resolve => {
      release = resolve;
    });

    await prevLock;
    try {
      const result = await operation(this.state);
      this.persist();
      return result;
    } finally {
      release();
    }
  }

  public getState(): StorageState {
    return this.state;
  }

  public resetToDefault(): void {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.state.auditLogs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ACCOUNT_RESET',
      details: 'Paper trading account reset to initial capital of ₹1,00,000.',
      actor: 'USER',
      ip: '127.0.0.1',
    });
    this.persist();
  }
}

export const storage = new StorageManager();
