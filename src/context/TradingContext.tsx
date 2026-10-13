import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  PortfolioSummary,
  Position,
  Order,
  Trade,
  Instrument,
  MarketStatus,
  Watchlist,
  RiskSettings,
  PriceAlert,
} from '../types';
import { api } from '../services/api';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number; // duration in ms, default 5000ms. 0 or Infinity makes it persistent
  action?: ToastAction;
  dismissible?: boolean;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: ToastAction;
  timestamp?: string;
  dismissible?: boolean;
}

export interface ToastHelperMethods {
  success: (title: string, message: string, options?: ToastOptions) => string;
  error: (title: string, message: string, options?: ToastOptions) => string;
  warning: (title: string, message: string, options?: ToastOptions) => string;
  info: (title: string, message: string, options?: ToastOptions) => string;
}

interface TradingContextType {
  // Navigation & Active item
  activePage: string;
  setActivePage: (page: string) => void;
  activeSymbol: string;
  setActiveSymbol: (sym: string) => void;

  // Data
  portfolio: PortfolioSummary | null;
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  instruments: Instrument[];
  marketStatus: MarketStatus | null;
  watchlists: Watchlist[];
  riskSettings: RiskSettings | null;
  alerts: PriceAlert[];

  // Status & Actions
  loading: boolean;
  error: string | null;
  isRetrying: boolean;
  refreshAllData: () => Promise<void>;
  placeOrder: (data: {
    symbol: string;
    exchange?: 'NSE' | 'BSE';
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
  }) => Promise<{ order: Order; trade?: Trade }>;
  cancelOrder: (orderId: string) => Promise<void>;
  resetAccount: () => Promise<void>;

  // Toast Notification System
  toasts: ToastMessage[];
  addToast: (
    typeOrConfig: ToastType | (Omit<ToastMessage, 'id'> & { id?: string }),
    title?: string,
    message?: string,
    options?: ToastOptions
  ) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toast: ToastHelperMethods;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [activeSymbol, setActiveSymbol] = useState<string>('RELIANCE');

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [riskSettings, setRiskSettings] = useState<RiskSettings | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((
    typeOrConfig: ToastType | (Omit<ToastMessage, 'id'> & { id?: string }),
    title?: string,
    message?: string,
    options?: ToastOptions
  ): string => {
    let toastItem: ToastMessage;

    if (typeof typeOrConfig === 'object') {
      const id = typeOrConfig.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      toastItem = {
        id,
        type: typeOrConfig.type || 'info',
        title: typeOrConfig.title || '',
        message: typeOrConfig.message || '',
        duration: typeOrConfig.duration !== undefined ? typeOrConfig.duration : 5000,
        action: typeOrConfig.action,
        timestamp: typeOrConfig.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dismissible: typeOrConfig.dismissible !== false,
      };
    } else {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      toastItem = {
        id,
        type: typeOrConfig,
        title: title || '',
        message: message || '',
        duration: options?.duration !== undefined ? options.duration : 5000,
        action: options?.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dismissible: options?.dismissible !== false,
      };
    }

    setToasts(prev => {
      // Maintain maximum 5 simultaneous notifications
      const updated = [...prev, toastItem];
      return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
    });

    return toastItem.id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toastHelpers = useMemo<ToastHelperMethods>(() => ({
    success: (title: string, message: string, options?: ToastOptions) => addToast('success', title, message, options),
    error: (title: string, message: string, options?: ToastOptions) => addToast('error', title, message, options),
    warning: (title: string, message: string, options?: ToastOptions) => addToast('warning', title, message, options),
    info: (title: string, message: string, options?: ToastOptions) => addToast('info', title, message, options),
  }), [addToast]);

  const refreshAllData = useCallback(async () => {
    try {
      setError(null);
      const [
        portRes,
        posRes,
        ordRes,
        trdRes,
        instRes,
        statRes,
        wlRes,
        riskRes,
        altRes
      ] = await Promise.all([
        api.getPortfolio(),
        api.getPositions(),
        api.getOrders(),
        api.getTrades(),
        api.getInstruments(),
        api.getMarketStatus(),
        api.getWatchlists(),
        api.getRiskSettings(),
        api.getAlerts()
      ]);

      setPortfolio(portRes.portfolio);
      setPositions(posRes.positions);
      setOrders(ordRes.orders);
      setTrades(trdRes.trades);
      setInstruments(instRes.instruments);
      setMarketStatus(statRes);
      setWatchlists(wlRes.watchlists);
      setRiskSettings(riskRes.riskSettings);
      setAlerts(altRes.alerts);
    } catch (err: any) {
      console.error('Failed to load trading state:', err);
      setError(err.message || 'Unable to connect to TRADEAI backend service.');
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    // Poll updates every 10 seconds for real-time market sync
    const interval = setInterval(() => {
      refreshAllData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  const placeOrder = async (data: {
    symbol: string;
    exchange?: 'NSE' | 'BSE';
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    limitPrice?: number;
  }) => {
    try {
      const result = await api.placeOrder(data);
      addToast({
        type: 'success',
        title: `${data.side} Order Executed`,
        message: `Successfully executed ${data.side} ${data.quantity} shares of ${data.symbol} @ ₹${result.order.price.toFixed(2)}.`,
        action: {
          label: 'View Position',
          onClick: () => setActivePage('positions'),
        },
      });
      await refreshAllData();
      return result;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Order Rejected',
        message: err.message || 'Server rejected order submission.',
        action: err.message?.includes('Risk Limit') ? {
          label: 'Review Risk Limits',
          onClick: () => setActivePage('risk'),
        } : undefined,
      });
      throw err;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await api.cancelOrder(orderId);
      addToast('info', 'Order Cancelled', `Pending order #${orderId} was cancelled.`);
      await refreshAllData();
    } catch (err: any) {
      addToast('error', 'Cancellation Failed', err.message);
      throw err;
    }
  };

  const resetAccount = async () => {
    try {
      await api.resetAccount();
      addToast({
        type: 'warning',
        title: 'Paper Account Reset',
        message: 'Virtual cash restored to ₹1,00,000. All simulated positions and orders cleared.',
        action: {
          label: 'Dashboard',
          onClick: () => setActivePage('dashboard'),
        },
      });
      await refreshAllData();
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
      throw err;
    }
  };

  return (
    <TradingContext.Provider
      value={{
        activePage,
        setActivePage,
        activeSymbol,
        setActiveSymbol,
        portfolio,
        positions,
        orders,
        trades,
        instruments,
        marketStatus,
        watchlists,
        riskSettings,
        alerts,
        loading,
        error,
        isRetrying,
        refreshAllData,
        placeOrder,
        cancelOrder,
        resetAccount,
        toasts,
        addToast,
        removeToast,
        clearToasts,
        toast: toastHelpers,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
