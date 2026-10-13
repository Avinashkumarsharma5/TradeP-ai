import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import {
  Instrument,
  Candle,
  PortfolioSummary,
  Position,
  Order,
  Trade,
  Watchlist,
  RiskSettings,
  Strategy,
  BacktestResult,
  PriceAlert,
  MarketStatus,
} from '../types';

// Read API base URL from Vite environment variable (VITE_API_BASE_URL) or default to relative path
const ENV_API_URL = import.meta.env.VITE_API_BASE_URL;
let customApiBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
  if (customApiBaseUrl !== null) {
    return customApiBaseUrl;
  }
  return ENV_API_URL || '';
}

export function setCustomApiBaseUrl(url: string | null): void {
  customApiBaseUrl = url;
  apiClient.defaults.baseURL = (url !== null ? url : (ENV_API_URL || '')).replace(/\/$/, '');
}

/**
 * Standardized API Error structure
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
  details?: any;
}

/**
 * Create centralized Axios instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl().replace(/\/$/, ''),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30-second timeout
});

// Request interceptor: ensure up-to-date baseURL and timestamp tracking
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl().replace(/\/$/, '');
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean error messages
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    let errorMsg = 'An unexpected error occurred while communicating with the server.';
    let isNetworkError = false;

    if (error.response) {
      // Server responded with 4xx or 5xx
      const data = error.response.data;
      if (data?.error) {
        errorMsg = data.error;
      } else if (data?.detail) {
        errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      } else if (typeof data === 'string' && data.length > 0) {
        errorMsg = data;
      } else {
        errorMsg = `Server responded with status code ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g. server offline or CORS failure)
      errorMsg = `Network connection failed. Unable to reach backend service at ${apiClient.defaults.baseURL || 'local server'}.`;
      isNetworkError = true;
    } else {
      errorMsg = error.message || errorMsg;
    }

    const customError: any = new Error(errorMsg);
    customError.statusCode = error.response?.status;
    customError.isNetworkError = isNetworkError;
    customError.details = error.response?.data;
    return Promise.reject(customError);
  }
);

/**
 * Common fetch helper functions
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

/**
 * Resilient fetch helper with retry capability
 */
export async function fetchWithRetry<T>(
  requestFn: () => Promise<T>,
  maxRetries = 2,
  delayMs = 1000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

/**
 * Domain-specific backend service methods
 */
export const api = {
  // 1. Health
  getHealth: () => 
    get<{ status: string; mode: string; service?: string }>('/health'),

  // 2. Market Data
  getMarketStatus: () => 
    get<MarketStatus>('/api/market/status'),

  getMarketOverview: () => 
    get<{
      indices: Instrument[];
      topGainers: Instrument[];
      topLosers: Instrument[];
      mostActive: Instrument[];
      dataSource: string;
    }>('/api/market/overview'),

  getInstruments: (q?: string, exchange?: string, sector?: string) => {
    const params: Record<string, string> = {};
    if (q) params.q = q;
    if (exchange) params.exchange = exchange;
    if (sector) params.sector = sector;
    return get<{ instruments: Instrument[]; count: number }>('/api/market/instruments', { params });
  },

  getInstrument: (symbol: string) => 
    get<{ instrument: Instrument; dataSource: string }>(`/api/market/instruments/${encodeURIComponent(symbol)}`),

  getHistory: (symbol: string, days = 90) => 
    get<{ symbol: string; candles: Candle[] }>(`/api/market/history/${encodeURIComponent(symbol)}`, {
      params: { days },
    }),

  // 3. Portfolio & Trading
  getPortfolio: () => 
    get<{ portfolio: PortfolioSummary }>('/api/portfolio'),

  getPositions: () => 
    get<{ positions: Position[]; count: number; activeCount: number }>('/api/positions'),

  getOrders: () => 
    get<{ orders: Order[]; count: number }>('/api/orders'),

  getTrades: () => 
    get<{ trades: Trade[]; count: number }>('/api/trades'),

  placeOrder: (data: {
    symbol: string;
    exchange?: 'NSE' | 'BSE';
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
  }) => 
    post<{ order: Order; trade?: Trade }>('/api/orders', data),

  cancelOrder: (orderId: string) => 
    post<{ order: Order }>(`/api/orders/${encodeURIComponent(orderId)}/cancel`),

  resetAccount: () => 
    post<{ message: string; portfolio: PortfolioSummary }>('/api/account/reset'),

  // 4. Watchlists
  getWatchlists: () => 
    get<{ watchlists: Watchlist[] }>('/api/watchlists'),

  createWatchlist: (name: string, symbols: string[]) => 
    post<{ watchlist: Watchlist }>('/api/watchlists', { name, symbols }),

  updateWatchlist: (id: string, name: string, symbols: string[]) => 
    put<{ watchlist: Watchlist }>(`/api/watchlists/${encodeURIComponent(id)}`, { name, symbols }),

  deleteWatchlist: (id: string) => 
    del<{ message: string }>(`/api/watchlists/${encodeURIComponent(id)}`),

  // 5. Risk Settings
  getRiskSettings: () => 
    get<{ riskSettings: RiskSettings }>('/api/risk/settings'),

  updateRiskSettings: (settings: Partial<RiskSettings>) => 
    put<{ riskSettings: RiskSettings }>('/api/risk/settings', settings),

  // 6. Strategies & Backtesting
  getStrategies: () => 
    get<{ strategies: Strategy[] }>('/api/strategies'),

  createStrategy: (strat: Partial<Strategy>) => 
    post<{ strategy: Strategy }>('/api/strategies', strat),

  deleteStrategy: (id: string) => 
    del<{ message: string }>(`/api/strategies/${encodeURIComponent(id)}`),

  runBacktest: (params: { strategyId: string; symbol: string; initialCapital?: number; days?: number }) => 
    post<{ backtest: BacktestResult }>('/api/backtests', params),

  getBacktest: (id: string) => 
    get<{ backtest: BacktestResult }>(`/api/backtests/${encodeURIComponent(id)}`),

  // 7. Multi-Turn Gemini AI Assistant
  askAssistant: (params: {
    message: string;
    history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
    role?: 'quant' | 'risk' | 'trader' | 'mentor';
    model?: string;
  }) => 
    post<{
      reply: string;
      isAiPowered: boolean;
      modelUsed: string;
      role: string;
      contextData?: any;
      disclaimer: string;
    }>('/api/assistant/chat', params),

  // 8. Price Alerts
  getAlerts: () => 
    get<{ alerts: PriceAlert[] }>('/api/alerts'),

  createAlert: (alert: { symbol: string; condition: 'ABOVE' | 'BELOW'; targetPrice: number; notes?: string }) => 
    post<{ alert: PriceAlert }>('/api/alerts', alert),

  deleteAlert: (id: string) => 
    del<{ message: string }>(`/api/alerts/${encodeURIComponent(id)}`),

  // 9. Security Audit Logs
  getAuditLogs: () => 
    get<{ logs: any[] }>('/api/audit-logs'),
};

export default api;
