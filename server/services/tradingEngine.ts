import { storage } from './storage.js';
import { MASTER_INSTRUMENTS } from '../data/instruments.js';
import { 
  Order, 
  Trade, 
  Position, 
  PortfolioSummary, 
  OrderSide, 
  OrderType 
} from '../types.js';

export interface PlaceOrderInput {
  symbol: string;
  exchange?: 'NSE' | 'BSE';
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
}

export class TradingEngine {
  /**
   * Retrieves the current price for a symbol from our master instrument feed
   */
  public static getInstrument(symbol: string) {
    return MASTER_INSTRUMENTS.find(i => i.symbol.toUpperCase() === symbol.toUpperCase());
  }

  /**
   * Calculates the full portfolio summary following exact accounting formulas:
   * Total Portfolio Value = Available Cash + Current Market Value of Open Positions
   * Total PnL = Total Portfolio Value - Starting Capital (₹1,00,000)
   */
  public static calculatePortfolio(): PortfolioSummary {
    const state = storage.getState();
    const positions = Object.values(state.positions);

    let investedValue = 0;
    let currentMarketValue = 0;
    let totalUnrealizedPnL = 0;
    let totalRealizedPnL = 0;
    let dayPnL = 0;

    for (const pos of positions) {
      if (pos.quantity > 0) {
        const inst = this.getInstrument(pos.symbol);
        const curPrice = inst ? inst.lastPrice : pos.currentPrice;
        
        pos.currentPrice = curPrice;
        pos.currentValue = Math.round(pos.quantity * curPrice * 100) / 100;
        pos.totalCost = Math.round(pos.quantity * pos.averagePrice * 100) / 100;
        pos.unrealizedPnL = Math.round((pos.currentValue - pos.totalCost) * 100) / 100;
        pos.unrealizedPnLPercent = pos.totalCost > 0 
          ? Math.round((pos.unrealizedPnL / pos.totalCost) * 10000) / 100 
          : 0;

        investedValue += pos.totalCost;
        currentMarketValue += pos.currentValue;
        totalUnrealizedPnL += pos.unrealizedPnL;

        // Day PnL estimation based on instrument daily change
        if (inst) {
          dayPnL += Math.round(pos.quantity * inst.change * 100) / 100;
        }
      }
      totalRealizedPnL += pos.realizedPnL;
    }

    const availableCash = Math.round(state.availableCash * 100) / 100;
    const totalPortfolioValue = Math.round((availableCash + currentMarketValue) * 100) / 100;
    const startingCapital = state.startingCapital;
    const totalPnL = Math.round((totalPortfolioValue - startingCapital) * 100) / 100;
    const totalReturnPercent = startingCapital > 0 
      ? Math.round((totalPnL / startingCapital) * 10000) / 100 
      : 0;
    const dayPnLPercent = totalPortfolioValue > 0 
      ? Math.round((dayPnL / totalPortfolioValue) * 10000) / 100 
      : 0;

    return {
      startingCapital,
      availableCash,
      investedValue: Math.round(investedValue * 100) / 100,
      totalPortfolioValue,
      totalRealizedPnL: Math.round(totalRealizedPnL * 100) / 100,
      totalUnrealizedPnL: Math.round(totalUnrealizedPnL * 100) / 100,
      totalPnL,
      totalReturnPercent,
      dayPnL: Math.round(dayPnL * 100) / 100,
      dayPnLPercent,
      openPositionsCount: positions.filter(p => p.quantity > 0).length,
      totalTradesCount: state.trades.length,
      isPaper: true,
      lastUpdated: new Date().toISOString(),
      accountingFormula: 'Total Portfolio Value = Available Cash (₹) + Current Market Value of Open Positions (₹). Total PnL = Total Portfolio Value - Starting Capital (₹1,00,000).'
    };
  }

  /**
   * Atomically executes a paper order with full server-side validation and risk limits.
   */
  public static async placeOrder(input: PlaceOrderInput): Promise<{ order: Order; trade?: Trade }> {
    return await storage.withLock(async (state) => {
      const { symbol, side, type, quantity, limitPrice } = input;
      const exchange = input.exchange || 'NSE';

      // 1. Basic validation
      if (!symbol || typeof symbol !== 'string') {
        throw new Error('Invalid symbol: Symbol is required.');
      }
      const inst = this.getInstrument(symbol);
      if (!inst) {
        throw new Error(`Symbol '${symbol}' not recognized on ${exchange}.`);
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Invalid quantity: Quantity must be a positive whole integer.');
      }

      // Check kill switch
      if (state.riskSettings.killSwitchActive) {
        throw new Error('Risk Limit Violation: Emergency Kill Switch is currently ACTIVE. Trading is locked.');
      }

      // 2. Execution price calculation with simulated slippage
      const rawPrice = type === 'LIMIT' && limitPrice && limitPrice > 0 
        ? limitPrice 
        : inst.lastPrice;

      // Slippage simulation (buyers pay slightly more, sellers receive slightly less)
      const slippageRate = (state.riskSettings.simulatedSlippagePercent || 0.05) / 100;
      const slippage = side === 'BUY' ? rawPrice * slippageRate : -rawPrice * slippageRate;
      const executionPrice = Math.round((rawPrice + slippage) * 100) / 100;

      const grossValue = Math.round(quantity * executionPrice * 100) / 100;
      const brokerageFee = state.riskSettings.simulatedBrokerageFlat || 20; // flat ₹20
      const sttTax = Math.round(grossValue * 0.001 * 100) / 100; // 0.1% Securities Transaction Tax
      const totalCost = side === 'BUY' ? grossValue + brokerageFee + sttTax : grossValue - brokerageFee - sttTax;

      // 3. Server-side Risk Limit Checks
      // A. Max Order Value check (default ₹10,000)
      if (grossValue > state.riskSettings.maxOrderValue) {
        throw new Error(
          `Risk Limit Violation: Gross order value ₹${grossValue.toLocaleString('en-IN')} exceeds the maximum allowed order limit of ₹${state.riskSettings.maxOrderValue.toLocaleString('en-IN')}. Reduce quantity.`
        );
      }

      const existingPos = state.positions[symbol] || {
        symbol,
        exchange,
        quantity: 0,
        averagePrice: 0,
        totalCost: 0,
        currentPrice: executionPrice,
        currentValue: 0,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        realizedPnL: 0,
        updatedAt: new Date().toISOString()
      };

      // B. BUY checks: Cash balance & Max Exposure
      if (side === 'BUY') {
        if (state.availableCash < totalCost) {
          throw new Error(
            `Insufficient Virtual Cash: Required ₹${totalCost.toLocaleString('en-IN')} (including fees), but available balance is ₹${state.availableCash.toLocaleString('en-IN')}.`
          );
        }

        const projectedExposure = (existingPos.quantity + quantity) * executionPrice;
        if (projectedExposure > state.riskSettings.maxExposurePerInstrument) {
          throw new Error(
            `Risk Limit Violation: Projected instrument exposure ₹${projectedExposure.toLocaleString('en-IN')} exceeds the maximum limit of ₹${state.riskSettings.maxExposurePerInstrument.toLocaleString('en-IN')} for ${symbol}.`
          );
        }
      }

      // C. SELL checks: Holding ownership
      if (side === 'SELL') {
        if (existingPos.quantity < quantity) {
          throw new Error(
            `Insufficient Holdings: Cannot SELL ${quantity} shares of ${symbol}. You currently own ${existingPos.quantity} shares.`
          );
        }
      }

      // 4. Fill Logic (for Market orders, immediate fill; for Limit, check match)
      let isFilled = true;
      if (type === 'LIMIT' && limitPrice) {
        if (side === 'BUY' && inst.lastPrice > limitPrice) {
          isFilled = false; // Market price higher than buy limit
        } else if (side === 'SELL' && inst.lastPrice < limitPrice) {
          isFilled = false; // Market price lower than sell limit
        }
      }

      const now = new Date().toISOString();
      const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const order: Order = {
        id: orderId,
        symbol,
        exchange,
        side,
        type,
        quantity,
        price: executionPrice,
        limitPrice,
        status: isFilled ? 'FILLED' : 'PENDING',
        statusReason: isFilled ? 'Simulated execution fill' : 'Limit price awaiting market match',
        grossValue,
        brokerageFee,
        sttTax,
        totalCost,
        isPaper: true,
        createdAt: now,
        filledAt: isFilled ? now : undefined,
      };

      state.orders.unshift(order);

      // If pending, reserve cash if BUY
      if (!isFilled) {
        if (side === 'BUY') {
          state.availableCash -= totalCost;
        }
        return { order };
      }

      // 5. Execute Trade & Update Position Ledger
      let realizedPnL = 0;
      const tradeId = `trd_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      if (side === 'BUY') {
        state.availableCash -= totalCost;
        const newQuantity = existingPos.quantity + quantity;
        const newTotalCost = existingPos.totalCost + grossValue;
        const newAvgPrice = newQuantity > 0 ? newTotalCost / newQuantity : 0;

        existingPos.quantity = newQuantity;
        existingPos.averagePrice = Math.round(newAvgPrice * 100) / 100;
        existingPos.totalCost = Math.round(newTotalCost * 100) / 100;
        existingPos.currentPrice = executionPrice;
        existingPos.currentValue = Math.round(newQuantity * executionPrice * 100) / 100;
        existingPos.unrealizedPnL = Math.round((existingPos.currentValue - existingPos.totalCost) * 100) / 100;
        existingPos.updatedAt = now;
      } else {
        // SELL
        state.availableCash += (grossValue - brokerageFee - sttTax);
        // Realized PnL = (Selling Price - Average Entry Price) * Quantity - Fees
        const costBasisOfSoldShares = existingPos.averagePrice * quantity;
        realizedPnL = Math.round((grossValue - costBasisOfSoldShares - brokerageFee - sttTax) * 100) / 100;

        existingPos.quantity -= quantity;
        existingPos.totalCost = Math.round((existingPos.averagePrice * existingPos.quantity) * 100) / 100;
        existingPos.currentPrice = executionPrice;
        existingPos.currentValue = Math.round(existingPos.quantity * executionPrice * 100) / 100;
        existingPos.unrealizedPnL = Math.round((existingPos.currentValue - existingPos.totalCost) * 100) / 100;
        existingPos.realizedPnL = Math.round((existingPos.realizedPnL + realizedPnL) * 100) / 100;
        existingPos.updatedAt = now;
      }

      state.positions[symbol] = existingPos;

      const trade: Trade = {
        id: tradeId,
        orderId,
        symbol,
        exchange,
        side,
        quantity,
        executionPrice,
        grossValue,
        brokerage: brokerageFee,
        taxes: sttTax,
        netValue: side === 'BUY' ? totalCost : grossValue - brokerageFee - sttTax,
        realizedPnL: side === 'SELL' ? realizedPnL : undefined,
        timestamp: now,
        isPaper: true,
      };

      state.trades.unshift(trade);

      // Audit Log
      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: now,
        action: `PAPER_${side}`,
        details: `Order #${orderId} executed: ${side} ${quantity} ${symbol} @ ₹${executionPrice}. Net: ₹${totalCost.toLocaleString('en-IN')}`,
        actor: 'USER',
        ip: '127.0.0.1',
      });

      return { order, trade };
    });
  }

  /**
   * Cancel a pending limit order and refund reserved cash
   */
  public static async cancelOrder(orderId: string): Promise<Order> {
    return await storage.withLock((state) => {
      const order = state.orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error(`Order #${orderId} not found.`);
      }
      if (order.status !== 'PENDING') {
        throw new Error(`Cannot cancel order #${orderId} with status '${order.status}'. Only PENDING orders can be cancelled.`);
      }

      order.status = 'CANCELLED';
      order.statusReason = 'Cancelled by user';

      // Refund reserved cash if it was a BUY limit order
      if (order.side === 'BUY') {
        state.availableCash += order.totalCost;
      }

      state.auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'ORDER_CANCELLED',
        details: `Order #${orderId} cancelled by user. Cash refunded: ₹${order.totalCost.toLocaleString('en-IN')}`,
        actor: 'USER',
        ip: '127.0.0.1',
      });

      return order;
    });
  }
}
