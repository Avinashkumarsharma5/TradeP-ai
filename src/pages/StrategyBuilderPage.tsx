import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { api } from '../api/client';
import { Strategy } from '../types';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Sliders, 
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';

export const StrategyBuilderPage: React.FC = () => {
  const { instruments, setActivePage, addToast } = useTrading();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Strategy Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [timeframe, setTimeframe] = useState<'1D' | '1H' | '15M'>('1D');
  const [indicator, setIndicator] = useState<'SMA' | 'EMA' | 'RSI' | 'BOLLINGER'>('SMA');
  const [period, setPeriod] = useState<number>(20);
  const [operator, setOperator] = useState<'>' | '<'>('>');
  const [thresholdValue, setThresholdValue] = useState<number>(50);
  const [stopLossPercent, setStopLossPercent] = useState<number>(2.5);
  const [takeProfitPercent, setTakeProfitPercent] = useState<number>(6.0);
  const [positionSizeCash, setPositionSizeCash] = useState<number>(10000);

  const fetchStrategies = async () => {
    try {
      const res = await api.getStrategies();
      setStrategies(res.strategies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await api.createStrategy({
        name: name.trim(),
        description: description.trim(),
        symbols: [selectedSymbol],
        timeframe,
        entryRules: [
          { indicator, period, operator, value: thresholdValue }
        ],
        exitRules: [
          { indicator, period, operator: operator === '>' ? '<' : '>', value: thresholdValue }
        ],
        stopLossPercent,
        takeProfitPercent,
        positionSizeCash,
      });

      addToast('success', 'Strategy Created', `Created strategy "${res.strategy.name}".`);
      await fetchStrategies();
      setShowCreateModal(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteStrategy(id);
      addToast('info', 'Deleted', 'Strategy removed.');
      await fetchStrategies();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleRunBacktest = (stratId: string) => {
    // Navigate to backtesting page
    setActivePage('backtesting');
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            Quantitative Strategy Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build rule-based technical algorithms using Moving Averages, RSI, and Bollinger Bands
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create New Strategy
        </button>
      </div>

      {/* Strategies List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.map(strat => (
          <div key={strat.id} className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-base font-bold text-white">{strat.name}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">{strat.description}</span>
                </div>
                <button
                  onClick={() => handleDelete(strat.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete Strategy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 my-3 text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold font-mono-num">
                  Symbol: {strat.symbols.join(', ')}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-mono-num">
                  Timeframe: {strat.timeframe}
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold font-mono-num">
                  Capital: ₹{strat.positionSizeCash.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Rules List */}
              <div className="bg-[#080d19] p-3 rounded-lg border border-slate-800 text-xs font-mono-num space-y-1.5 my-3">
                <div className="text-slate-400">
                  <span className="text-emerald-400 font-bold font-sans">ENTRY SIGNAL: </span>
                  {strat.entryRules.map((r, i) => `${r.indicator}(${r.period}) ${r.operator} ${r.value}`).join(' AND ')}
                </div>
                <div className="text-slate-400">
                  <span className="text-rose-400 font-bold font-sans">EXIT SIGNAL: </span>
                  SL: <strong className="text-rose-300">-{strat.stopLossPercent}%</strong> | TP: <strong className="text-emerald-300">+{strat.takeProfitPercent}%</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-800 pt-3 mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Created: {new Date(strat.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleRunBacktest(strat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Backtest Strategy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1">Create Quantitative Strategy</h3>
            <p className="text-xs text-slate-400 mb-4">Define technical indicator conditions, position limits, and risk targets.</p>

            <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Strategy Name</label>
                <input
                  type="text"
                  placeholder="e.g. RSI Mean Reversion / SMA Cross"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description / Thesis</label>
                <textarea
                  rows={2}
                  placeholder="Describe your market hypothesis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Instrument</label>
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
                  <label className="text-slate-300 font-semibold block mb-1">Candle Timeframe</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as any)}
                    className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1D">1 Day (EOD)</option>
                    <option value="1H">1 Hour</option>
                    <option value="15M">15 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Indicator Rules */}
              <div className="p-3 bg-[#080d19] rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-2">Entry Indicator Condition</span>
                <div className="grid grid-cols-3 gap-2 font-mono-num">
                  <select
                    value={indicator}
                    onChange={(e) => setIndicator(e.target.value as any)}
                    className="bg-[#0d1527] border border-slate-700 rounded px-2 py-1.5 text-white"
                  >
                    <option value="SMA">SMA</option>
                    <option value="EMA">EMA</option>
                    <option value="RSI">RSI</option>
                    <option value="BOLLINGER">Bollinger</option>
                  </select>

                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="bg-[#0d1527] border border-slate-700 rounded px-2 py-1.5 text-white"
                  >
                    <option value=">">Greater than (&gt;)</option>
                    <option value="<">Less than (&lt;)</option>
                  </select>

                  <input
                    type="number"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(parseFloat(e.target.value) || 0)}
                    placeholder="Value (e.g. 30)"
                    className="bg-[#0d1527] border border-slate-700 rounded px-2 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Risk & Exit Parameters */}
              <div className="grid grid-cols-3 gap-3 font-mono-num">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Stop Loss (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={stopLossPercent}
                    onChange={(e) => setStopLossPercent(parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-rose-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Take Profit (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={takeProfitPercent}
                    onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Size (₹ Cash)</label>
                  <input
                    type="number"
                    step="1000"
                    value={positionSizeCash}
                    onChange={(e) => setPositionSizeCash(parseFloat(e.target.value) || 5000)}
                    className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
