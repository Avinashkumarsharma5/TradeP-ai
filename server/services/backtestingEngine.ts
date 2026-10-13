import { Strategy, BacktestResult, BacktestTrade } from '../types.js';
import { generateCandlesForSymbol, calculateSMA, calculateEMA, calculateRSI } from '../data/instruments.js';

export interface RunBacktestInput {
  strategy: Strategy;
  symbol: string;
  initialCapital?: number;
  days?: number;
}

export class BacktestingEngine {
  public static runBacktest(input: RunBacktestInput): BacktestResult {
    const initialCapital = input.initialCapital || 100000;
    const days = input.days || 120;
    const symbol = input.symbol.toUpperCase();
    const candles = generateCandlesForSymbol(symbol, days);

    if (candles.length < 30) {
      throw new Error(`Insufficient historical candles for ${symbol} to execute backtest.`);
    }

    const closePrices = candles.map(c => c.close);
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const rsi14 = calculateRSI(closePrices, 14);

    let currentCash = initialCapital;
    let inPosition = false;
    let entryPrice = 0;
    let entryDate = '';
    let positionQty = 0;
    const trades: BacktestTrade[] = [];
    const equityCurve: { date: string; equity: number; benchmarkEquity: number }[] = [];

    const benchmarkStartPrice = closePrices[0];
    const brokerage = 20; // ₹20 flat
    const slippage = 0.0005; // 0.05%

    for (let i = 25; i < candles.length; i++) {
      const candle = candles[i];
      const prevCandle = candles[i - 1];
      const curPrice = candle.close;
      const benchmarkMultiplier = curPrice / benchmarkStartPrice;
      const benchmarkEquity = Math.round(initialCapital * benchmarkMultiplier);

      // Evaluate exit if in position
      if (inPosition) {
        let shouldExit = false;
        let exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'SIGNAL_EXIT' = 'SIGNAL_EXIT';

        const pnlPct = ((curPrice - entryPrice) / entryPrice) * 100;
        if (pnlPct <= -input.strategy.stopLossPercent) {
          shouldExit = true;
          exitReason = 'STOP_LOSS';
        } else if (pnlPct >= input.strategy.takeProfitPercent) {
          shouldExit = true;
          exitReason = 'TAKE_PROFIT';
        } else {
          // Check strategy custom exit rules
          const rsiVal = rsi14[i];
          if (input.strategy.name.includes('RSI') && rsiVal !== null && rsiVal > 65) {
            shouldExit = true;
            exitReason = 'SIGNAL_EXIT';
          } else if (input.strategy.name.includes('SMA') && sma20[i] !== null && sma50[i] !== null) {
            if ((sma20[i] as number) < (sma50[i] as number)) {
              shouldExit = true;
              exitReason = 'SIGNAL_EXIT';
            }
          }
        }

        if (shouldExit || i === candles.length - 1) {
          const effectiveExitPrice = curPrice * (1 - slippage);
          const grossValue = positionQty * effectiveExitPrice;
          const netProceeds = grossValue - brokerage - (grossValue * 0.001); // STT
          const tradePnL = Math.round((netProceeds - (positionQty * entryPrice)) * 100) / 100;
          const tradePnLPct = Math.round(((effectiveExitPrice - entryPrice) / entryPrice) * 10000) / 100;

          currentCash += netProceeds;
          trades.push({
            entryDate,
            exitDate: candle.time,
            symbol,
            type: 'LONG',
            entryPrice: Math.round(entryPrice * 100) / 100,
            exitPrice: Math.round(effectiveExitPrice * 100) / 100,
            quantity: positionQty,
            pnl: tradePnL,
            pnlPercent: tradePnLPct,
            exitReason,
          });

          inPosition = false;
          positionQty = 0;
        }
      }

      // Evaluate entry if not in position
      if (!inPosition && i < candles.length - 1) {
        let entrySignal = false;

        if (input.strategy.name.includes('RSI')) {
          const curRsi = rsi14[i];
          if (curRsi !== null && curRsi < 32) {
            entrySignal = true;
          }
        } else {
          // Default SMA Cross or custom rules
          const curSma20 = sma20[i];
          const curSma50 = sma50[i];
          const prevSma20 = sma20[i - 1];
          const prevSma50 = sma50[i - 1];

          if (curSma20 !== null && curSma50 !== null && prevSma20 !== null && prevSma50 !== null) {
            if (prevSma20 <= prevSma50 && curSma20 > curSma50) {
              entrySignal = true;
            }
          }
        }

        if (entrySignal) {
          const effectiveEntryPrice = curPrice * (1 + slippage);
          const alloc = Math.min(input.strategy.positionSizeCash || 15000, currentCash * 0.95);
          const qty = Math.floor(alloc / effectiveEntryPrice);

          if (qty > 0) {
            const cost = qty * effectiveEntryPrice + brokerage + (qty * effectiveEntryPrice * 0.001);
            if (currentCash >= cost) {
              currentCash -= cost;
              inPosition = true;
              entryPrice = effectiveEntryPrice;
              entryDate = candle.time;
              positionQty = qty;
            }
          }
        }
      }

      // Record daily equity
      const positionValue = inPosition ? positionQty * curPrice : 0;
      const totalEquity = Math.round((currentCash + positionValue) * 100) / 100;
      equityCurve.push({
        date: candle.time,
        equity: totalEquity,
        benchmarkEquity,
      });
    }

    const finalCapital = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : initialCapital;
    const totalReturn = Math.round((finalCapital - initialCapital) * 100) / 100;
    const totalReturnPercent = Math.round((totalReturn / initialCapital) * 10000) / 100;

    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    const winRate = trades.length > 0 ? Math.round((winningTrades.length / trades.length) * 10000) / 100 : 0;

    const grossGains = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
    const grossLosses = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLosses > 0 ? Math.round((grossGains / grossLosses) * 100) / 100 : grossGains > 0 ? 99 : 0;

    // Maximum drawdown calculation
    let peak = initialCapital;
    let maxDrawdown = 0;
    for (const point of equityCurve) {
      if (point.equity > peak) peak = point.equity;
      const dd = ((peak - point.equity) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    const benchmarkFinal = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].benchmarkEquity : initialCapital;
    const benchmarkReturnPercent = Math.round(((benchmarkFinal - initialCapital) / initialCapital) * 10000) / 100;

    return {
      id: `bt_${Date.now()}`,
      strategyId: input.strategy.id,
      strategyName: input.strategy.name,
      symbol,
      startDate: candles[0].time,
      endDate: candles[candles.length - 1].time,
      initialCapital,
      finalCapital,
      totalReturn,
      totalReturnPercent,
      cagr: Math.round(totalReturnPercent * (252 / candles.length) * 100) / 100,
      winRate,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      maxDrawdownPercent: Math.round(maxDrawdown * 100) / 100,
      profitFactor,
      sharpeRatio: Math.round((totalReturnPercent / (maxDrawdown || 1)) * 50) / 100,
      trades,
      equityCurve,
      benchmarkReturnPercent,
      createdAt: new Date().toISOString(),
    };
  }
}
