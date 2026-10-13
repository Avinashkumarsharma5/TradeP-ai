import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { api } from '../api/client';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts, instruments, refreshAllData, addToast } = useTrading();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [symbol, setSymbol] = useState<string>('RELIANCE');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(2800);
  const [notes, setNotes] = useState<string>('');

  const currentInst = instruments.find(i => i.symbol === symbol);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;
    try {
      await api.createAlert({
        symbol,
        condition,
        targetPrice,
        notes: notes.trim(),
      });
      addToast('success', 'Alert Created', `Alert created for ${symbol} ${condition} ₹${targetPrice}.`);
      await refreshAllData();
      setShowAddModal(false);
      setNotes('');
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAlert(id);
      addToast('info', 'Deleted', 'Alert deleted.');
      await refreshAllData();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Price & Risk Alerts Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time triggers based on price thresholds and market resistance/support levels
          </p>
        </div>

        <button
          onClick={() => {
            if (currentInst) setTargetPrice(Math.round(currentInst.lastPrice * 1.02));
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create New Alert
        </button>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map(a => {
          const inst = instruments.find(i => i.symbol === a.symbol);
          const currentPrice = inst ? inst.lastPrice : a.currentPrice;
          const diffPct = currentPrice > 0 ? ((a.targetPrice - currentPrice) / currentPrice) * 100 : 0;

          return (
            <div
              key={a.id}
              className={`bg-[#0d1527] border rounded-xl p-4 shadow-lg flex flex-col justify-between ${
                a.triggered
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{a.symbol}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.condition === 'ABOVE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {a.condition} ₹{a.targetPrice.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {a.notes && (
                  <p className="text-xs text-slate-400 italic mb-3">"{a.notes}"</p>
                )}

                <div className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800 text-xs font-mono-num flex justify-between items-center my-2">
                  <span className="text-slate-400">Current Price:</span>
                  <span className="text-white font-bold">₹{currentPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="border-t border-slate-800/80 pt-2.5 mt-2 flex items-center justify-between text-[11px]">
                {a.triggered ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Triggered at {a.triggeredAt ? new Date(a.triggeredAt).toLocaleTimeString() : 'Recent'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    Pending ({Math.abs(diffPct).toFixed(1)}% away)
                  </span>
                )}
                <span className="text-slate-500">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Set New Price Alert</h3>
            <form onSubmit={handleCreateAlert} className="flex flex-col gap-4 text-xs font-semibold">
              <div>
                <label className="text-slate-300 block mb-1">Select Instrument</label>
                <select
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value);
                    const inst = instruments.find(i => i.symbol === e.target.value);
                    if (inst) setTargetPrice(Math.round(inst.lastPrice * 1.02));
                  }}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  {instruments.filter(i => !i.isIndex).map(i => (
                    <option key={i.symbol} value={i.symbol} className="bg-[#0d1527]">
                      {i.symbol} — ₹{i.lastPrice.toFixed(2)} ({i.exchange})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="ABOVE">Price &ge; Target</option>
                    <option value="BELOW">Price &le; Target</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Target Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono-num font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Notes / Alert Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Resistance breakout watch"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
