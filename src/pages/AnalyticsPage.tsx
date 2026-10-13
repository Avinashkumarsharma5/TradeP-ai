import React, { useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  PieChart, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Activity
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { portfolio, positions, trades } = useTrading();

  const activePositions = positions.filter(p => p.quantity > 0);

  const analytics = useMemo(() => {
    const buyTrades = trades.filter(t => t.side === 'BUY');
    const sellTrades = trades.filter(t => t.side === 'SELL');
    const winningTrades = trades.filter(t => (t.realizedPnL || 0) > 0);
    const losingTrades = trades.filter(t => (t.realizedPnL || 0) < 0);

    const totalRealizedPnL = trades.reduce((acc, t) => acc + (t.realizedPnL || 0), 0);
    const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;

    // P&L by instrument
    const pnlByInstrument: Record<string, { realized: number; unrealized: number }> = {};
    positions.forEach(p => {
      pnlByInstrument[p.symbol] = {
        realized: p.realizedPnL,
        unrealized: p.unrealizedPnL,
      };
    });

    return {
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      winCount: winningTrades.length,
      lossCount: losingTrades.length,
      winRate,
      totalRealizedPnL,
      pnlByInstrument,
    };
  }, [trades, positions]);

  const exportJSON = () => {
    const data = {
      portfolio,
      positions,
      trades,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradeai_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Trading Performance & Quantitative Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            P&L distribution by stock, win/loss ratios, order execution breakdown, and exportable reports
          </p>
        </div>

        <button
          onClick={exportJSON}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors shadow-md"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export Full Report (JSON)
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-num">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Win Rate (Closed Trades)</span>
          <div className="text-2xl font-extrabold text-white">{analytics.winRate.toFixed(1)}%</div>
          <span className="text-xs text-slate-500 mt-1 block font-sans">{analytics.winCount} Wins / {analytics.lossCount} Losses</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Total Realized P&L</span>
          <div className={`text-2xl font-extrabold ${analytics.totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {analytics.totalRealizedPnL >= 0 ? '+' : ''}₹{analytics.totalRealizedPnL.toFixed(2)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-sans">Net of brokerage & STT</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Order Activity</span>
          <div className="text-2xl font-extrabold text-sky-400">{trades.length}</div>
          <span className="text-xs text-slate-500 mt-1 block font-sans">{analytics.buyCount} Buys • {analytics.sellCount} Sells</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Capital Deployment</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            ₹{portfolio ? portfolio.investedValue.toLocaleString('en-IN') : '0'}
          </div>
          <span className="text-xs text-slate-500 mt-1 block font-sans">
            {portfolio ? ((portfolio.investedValue / portfolio.totalPortfolioValue) * 100).toFixed(1) : '0'}% of capital in market
          </span>
        </div>
      </div>

      {/* P&L Distribution by Instrument Bar Chart */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
          P&L Contribution by Stock (Unrealized & Realized)
        </h3>

        {Object.keys(analytics.pnlByInstrument).length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No stock holdings recorded yet. Trade instruments to view P&L analytics.
          </div>
        ) : (
          <div className="space-y-3 font-mono-num">
            {Object.entries(analytics.pnlByInstrument).map(([sym, pnl]) => {
              const netTotal = pnl.realized + pnl.unrealized;
              const isProfit = netTotal >= 0;

              return (
                <div key={sym} className="bg-[#080d19] p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                    <span className="font-bold text-white">{sym}</span>
                    <div className="flex items-center gap-4 font-mono-num">
                      <span className="text-slate-400 text-[11px]">
                        Realized: <strong className={pnl.realized >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {pnl.realized >= 0 ? '+' : ''}₹{pnl.realized.toFixed(2)}
                        </strong>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Unrealized: <strong className={pnl.unrealized >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {pnl.unrealized >= 0 ? '+' : ''}₹{pnl.unrealized.toFixed(2)}
                        </strong>
                      </span>
                      <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Total: {isProfit ? '+' : ''}₹{netTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, (Math.abs(netTotal) / 1000) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
