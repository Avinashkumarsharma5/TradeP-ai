export interface Instrument {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  lastPrice: number;
  change: number;
  pChange: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  high52: number;
  low52: number;
  marketCapCr: number;
  peRatio: number;
  dividendYield: number;
  isIndex?: boolean;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'REJECTED' | 'CANCELLED';

export interface Order {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price: number;
  limitPrice?: number;
  status: OrderStatus;
  statusReason?: string;
  grossValue: number;
  brokerageFee: number;
  sttTax: number;
  totalCost: number;
  isPaper: boolean;
  createdAt: string;
  filledAt?: string;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  side: OrderSide;
  quantity: number;
  executionPrice: number;
  grossValue: number;
  brokerage: number;
  taxes: number;
  netValue: number;
  realizedPnL?: number;
  timestamp: string;
  isPaper: boolean;
}

export interface Position {
  symbol: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averagePrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  updatedAt: string;
}

export interface PortfolioSummary {
  startingCapital: number;
  availableCash: number;
  investedValue: number;
  totalPortfolioValue: number;
  totalRealizedPnL: number;
  totalUnrealizedPnL: number;
  totalPnL: number;
  totalReturnPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
  openPositionsCount: number;
  totalTradesCount: number;
  isPaper: boolean;
  lastUpdated: string;
  accountingFormula: string;
}

export interface RiskSettings {
  maxOrderValue: number;
  maxExposurePerInstrument: number;
  dailyLossLimit: number;
  perTradeRiskPercent: number;
  killSwitchActive: boolean;
  simulatedBrokerageFlat: number;
  simulatedSlippagePercent: number;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

export interface StrategyRule {
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BOLLINGER';
  period: number;
  operator: '>' | '<' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';
  value: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  symbols: string[];
  timeframe: '1D' | '1H' | '15M';
  entryRules: StrategyRule[];
  exitRules: StrategyRule[];
  stopLossPercent: number;
  takeProfitPercent: number;
  positionSizeCash: number;
  createdAt: string;
}

export interface BacktestTrade {
  entryDate: string;
  exitDate: string;
  symbol: string;
  type: 'LONG';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'SIGNAL_EXIT';
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  strategyName: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  cagr: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxDrawdownPercent: number;
  profitFactor: number;
  sharpeRatio: number;
  trades: BacktestTrade[];
  equityCurve: { date: string; equity: number; benchmarkEquity: number }[];
  benchmarkReturnPercent: number;
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  currentPrice: number;
  triggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  notes?: string;
}

export interface MarketStatus {
  isOpen: boolean;
  exchange: string;
  currentTimeIST: string;
  marketHours: string;
  statusText: string;
  dataSource: string;
  isSampleData: boolean;
}
