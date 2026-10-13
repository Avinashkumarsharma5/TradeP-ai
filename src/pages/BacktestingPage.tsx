import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { api } from '../api/client';
import { Strategy, BacktestResult } from '../types';
import { 
  FlaskConical, 
  Play, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  RefreshCw,
  Info
} from 'lucide-react';

export const BacktestingPage: React.FC = () => {
  const { instruments, addToast } = useTrading();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [days, setDays] = useState<number>(120);
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [loading, setLoading] = useState<boolean>(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getStrategies();
        setStrategies(res.strategies);
        if (res.strategies.length > 0) {
          setSelectedStrategyId(res.strategies[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStrategyId) return;

    setLoading(true);
    try {
      const res = await api.runBacktest({
        strategyId: selectedStrategyId,
        symbol: selectedSymbol,
        initialCapital,
        days,
      });
      setBacktestResult(res.backtest);
      addToast('success', 'Backtest Complete', `Analyzed ${res.backtest.trades.length} trades over ${days} days.`);
    } catch (err: any) {
      addToast('error', 'Backtest Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const equityCurve = backtestResult?.equityCurve || [];
  const minEquity = equityCurve.length > 0 ? Math.min(...equityCurve.map(e => Math.min(e.equity, e.benchmarkEquity))) * 0.95 : 0;
  const maxEquity = equityCurve.length > 0 ? Math.max(...equityCurve.map(e => Math.max(e.equity, e.benchmarkEquity))) * 1.05 : 100000;
  const equityRange = maxEquity - minEquity || 1;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-400" />
            Quantitative Backtesting Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate historical strategy performance with realistic transaction costs (₹20 flat brokerage, 0.1% STT, 0.05% slippage)
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Past simulation performance does not guarantee future results.</span>
        </div>
      </div>

      {/* Configuration Controls Bar */}
      <form onSubmit={handleRun} className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-semibold">
        <div>
          <label className="text-slate-400 block mb-1">Select Strategy</label>
          <select
            value={selectedStrategyId}
            onChange={(e) => setSelectedStrategyId(e.target.value)}
            className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          >
            {strategies.map(s => (
              <option key={s.id} value={s.id} className="bg-[#0d1527]">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Test Instrument</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
          >
            {instruments.filter(i => !i.isIndex).map(i => (
              <option key={i.symbol} value={i.symbol} className="bg-[#0d1527]">
                {i.symbol} ({i.exchange})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Initial Capital (₹)</label>
          <input
            type="number"
            step="10000"
            value={initialCapital}
            onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 100000)}
            className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono-num"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Lookback Period</label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white"
          >
            <option value={60}>60 Days (~3 Months)</option>
            <option value={120}>120 Days (~6 Months)</option>
            <option value={250}>250 Days (~1 Year)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading || !selectedStrategyId}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Backtest
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results View */}
      {backtestResult && (
        <div className="flex flex-col gap-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono-num">
            <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-3 shadow-md">
              <span className="text-[11px] text-slate-400 block mb-0.5">Strategy Return</span>
              <span className={`text-xl font-extrabold ${backtestResult.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {backtestResult.totalReturn >= 0 ? '+' : ''}{backtestResult.totalReturnPercent.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-500 block">₹{backtestResult.totalReturn.toFixed(2)}</span>
            </div>

            <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-3 shadow-md">
              <span className="text-[11px] text-slate-400 block mb-0.5">Win Rate</span>
              <span className="text-xl font-extrabold text-white">
                {backtestResult.winRate.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block">{backtestResult.winningTrades}W / {backtestResult.losingTrades}L</span>
            </div>

            <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-3 shadow-md">
              <span className="text-[11px] text-slate-400 block mb-0.5">Max Drawdown</span>
              <span className="text-xl font-extrabold text-rose-400">
                -{backtestResult.maxDrawdownPercent.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-500 block">Peak to trough</span>
            </div>

            <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-3 shadow-md">
              <span className="text-[11px] text-slate-400 block mb-0.5">Profit Factor</span>
              <span className="text-xl font-extrabold text-sky-400">
                {backtestResult.profitFactor.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">Gross Gains / Losses</span>
            </div>

            <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-3 shadow-md">
              <span className="text-[11px] text-slate-400 block mb-0.5">Sharpe Ratio</span>
              <span className="text-xl font-extrabold text-amber-400">
                {backtestResult.sharpeRatio.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">Risk adjusted</span>
            </div>

            <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-3 shadow-md">
              <span className="text-[11px] text-slate-400 block mb-0.5">Benchmark Return</span>
              <span className="text-xl font-extrabold text-slate-300">
                {backtestResult.benchmarkReturnPercent >= 0 ? '+' : ''}{backtestResult.benchmarkReturnPercent.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-500 block">Buy & Hold {backtestResult.symbol}</span>
            </div>
          </div>

          {/* Equity Curve SVG Chart */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Equity Curve vs Buy & Hold Benchmark
              </h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Strategy Equity (₹)
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-500 inline-block" /> Benchmark (₹)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <svg viewBox="0 0 800 240" className="w-full h-full">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const val = minEquity + (1 - pct) * equityRange;
                  const y = 20 + pct * 180;
                  return (
                    <g key={idx}>
                      <line x1="20" y1={y} x2="720" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <text x="730" y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                        ₹{(val / 1000).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}

                {/* Benchmark Line */}
                <path
                  d={equityCurve.reduce((acc, pt, i) => {
                    const x = 20 + (i / (equityCurve.length - 1 || 1)) * 700;
                    const y = 20 + (1 - (pt.benchmarkEquity - minEquity) / equityRange) * 180;
                    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Strategy Equity Line */}
                <path
                  d={equityCurve.reduce((acc, pt, i) => {
                    const x = 20 + (i / (equityCurve.length - 1 || 1)) * 700;
                    const y = 20 + (1 - (pt.equity - minEquity) / equityRange) * 180;
                    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>

          {/* Trade Execution Log */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Simulated Strategy Trade Log ({backtestResult.trades.length} Trades)
              </h3>
            </div>
            {backtestResult.trades.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Strategy generated 0 entry signals within this period. Try relaxing entry conditions or testing a higher volatility instrument.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs font-mono-num">
                  <thead className="sticky top-0 bg-[#080d19] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Entry Date</th>
                      <th className="py-2.5 px-3">Exit Date</th>
                      <th className="py-2.5 px-3 text-right">Entry (₹)</th>
                      <th className="py-2.5 px-3 text-right">Exit (₹)</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Net P&L (₹)</th>
                      <th className="py-2.5 px-3 text-right">Return %</th>
                      <th className="py-2.5 px-4">Exit Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {backtestResult.trades.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-4 text-slate-300">{t.entryDate}</td>
                        <td className="py-2 px-3 text-slate-300">{t.exitDate}</td>
                        <td className="py-2 px-3 text-right text-slate-200">₹{t.entryPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-slate-200">₹{t.exitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-slate-300">{t.quantity}</td>
                        <td className={`py-2 px-3 text-right font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toFixed(2)}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold ${t.pnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.exitReason === 'TAKE_PROFIT'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : t.exitReason === 'STOP_LOSS'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {t.exitReason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
