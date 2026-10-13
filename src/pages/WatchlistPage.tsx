import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { api } from '../api/client';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const { 
    watchlists, 
    instruments, 
    setActiveSymbol, 
    setActivePage, 
    refreshAllData, 
    addToast 
  } = useTrading();

  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string>(
    watchlists[0]?.id || 'wl_default'
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newWatchlistName, setNewWatchlistName] = useState<string>('');
  const [symbolToAdd, setSymbolToAdd] = useState<string>('RELIANCE');

  const currentWatchlist = watchlists.find(w => w.id === selectedWatchlistId) || watchlists[0];

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;
    try {
      const res = await api.createWatchlist(newWatchlistName.trim(), ['RELIANCE', 'TCS']);
      addToast('success', 'Watchlist Created', `Created "${res.watchlist.name}".`);
      await refreshAllData();
      setSelectedWatchlistId(res.watchlist.id);
      setNewWatchlistName('');
      setShowAddModal(false);
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    if (watchlists.length <= 1) {
      addToast('warning', 'Action Prohibited', 'You must maintain at least one active watchlist.');
      return;
    }
    try {
      await api.deleteWatchlist(id);
      addToast('info', 'Deleted', 'Watchlist deleted.');
      await refreshAllData();
      setSelectedWatchlistId(watchlists.find(w => w.id !== id)?.id || '');
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleAddSymbol = async () => {
    if (!currentWatchlist) return;
    if (currentWatchlist.symbols.includes(symbolToAdd)) {
      addToast('info', 'Already Added', `${symbolToAdd} is already in ${currentWatchlist.name}.`);
      return;
    }
    const updatedSymbols = [...currentWatchlist.symbols, symbolToAdd];
    try {
      await api.updateWatchlist(currentWatchlist.id, currentWatchlist.name, updatedSymbols);
      addToast('success', 'Symbol Added', `Added ${symbolToAdd} to ${currentWatchlist.name}.`);
      await refreshAllData();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleRemoveSymbol = async (sym: string) => {
    if (!currentWatchlist) return;
    const updatedSymbols = currentWatchlist.symbols.filter(s => s !== sym);
    try {
      await api.updateWatchlist(currentWatchlist.id, currentWatchlist.name, updatedSymbols);
      addToast('info', 'Removed', `Removed ${sym} from ${currentWatchlist.name}.`);
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
            <Bookmark className="w-5 h-5 text-emerald-400" />
            Stock Watchlists
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor curated Indian stock lists and track price swings with one-click trading shortcuts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create Watchlist
        </button>
      </div>

      {/* Watchlist Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {watchlists.map(wl => (
          <button
            key={wl.id}
            onClick={() => setSelectedWatchlistId(wl.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedWatchlistId === wl.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-[#0d1527] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{wl.name}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {wl.symbols.length}
            </span>
          </button>
        ))}
      </div>

      {/* Main Watchlist Content */}
      {currentWatchlist && (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-5">
          {/* Watchlist Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">{currentWatchlist.name}</h2>
              <span className="text-xs text-slate-400">
                Created: {new Date(currentWatchlist.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Add Symbol Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={symbolToAdd}
                  onChange={(e) => setSymbolToAdd(e.target.value)}
                  className="bg-[#080d19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {instruments.filter(i => !i.isIndex).map(i => (
                    <option key={i.symbol} value={i.symbol} className="bg-[#0d1527]">
                      {i.symbol} ({i.exchange})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddSymbol}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {watchlists.length > 1 && (
                <button
                  onClick={() => handleDeleteWatchlist(currentWatchlist.id)}
                  className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Delete Watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Instruments in Watchlist Table */}
          {currentWatchlist.symbols.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              This watchlist is empty. Add symbols using the dropdown above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono-num">
                <thead>
                  <tr className="bg-[#080d19] text-slate-400 border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold">Instrument</th>
                    <th className="py-3 px-3 font-semibold">Sector</th>
                    <th className="py-3 px-3 text-right font-semibold">LTP (₹)</th>
                    <th className="py-3 px-3 text-right font-semibold">Day Change</th>
                    <th className="py-3 px-3 text-right font-semibold">52W High</th>
                    <th className="py-3 px-3 text-right font-semibold">52W Low</th>
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentWatchlist.symbols.map(sym => {
                    const inst = instruments.find(i => i.symbol === sym) || {
                      symbol: sym,
                      name: sym,
                      exchange: 'NSE' as const,
                      sector: 'Equity',
                      lastPrice: 0,
                      change: 0,
                      pChange: 0,
                      high52: 0,
                      low52: 0,
                    };

                    return (
                      <tr key={sym} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{inst.symbol}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {inst.exchange}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">{inst.name}</span>
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-300">{inst.sector}</td>
                        <td className="py-3 px-3 text-right font-bold text-white text-sm">
                          ₹{inst.lastPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-semibold flex items-center justify-end gap-1 ${
                            inst.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {inst.pChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {inst.change >= 0 ? '+' : ''}₹{inst.change.toFixed(2)} ({inst.pChange >= 0 ? '+' : ''}{inst.pChange}%)
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400">₹{inst.high52.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-rose-400">₹{inst.low52.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setActiveSymbol(inst.symbol);
                                setActivePage('stock_detail');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
                            >
                              Trade
                            </button>
                            <button
                              onClick={() => handleRemoveSymbol(inst.symbol)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Remove from Watchlist"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Watchlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Create New Watchlist</h3>
            <form onSubmit={handleCreateWatchlist} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">Watchlist Name</label>
                <input
                  type="text"
                  placeholder="e.g. IT Growth Stocks, Dividend Heavy"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWatchlistName.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
