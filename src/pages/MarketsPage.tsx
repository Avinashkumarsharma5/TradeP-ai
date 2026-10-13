import React, { useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  Globe2, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  BookmarkPlus, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

export const MarketsPage: React.FC = () => {
  const { 
    instruments, 
    setActiveSymbol, 
    setActivePage, 
    watchlists, 
    addToast 
  } = useTrading();

  const [search, setSearch] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<'ALL' | 'NSE' | 'BSE'>('ALL');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const sectors = useMemo(() => {
    const set = new Set<string>();
    instruments.forEach(i => {
      if (i.sector && i.sector !== 'Indices') set.add(i.sector);
    });
    return ['ALL', ...Array.from(set)];
  }, [instruments]);

  const filtered = useMemo(() => {
    return instruments.filter(i => {
      if (i.isIndex) return false; // Filter out indices for individual stock list
      const matchesSearch = 
        i.symbol.toLowerCase().includes(search.toLowerCase()) || 
        i.name.toLowerCase().includes(search.toLowerCase());
      const matchesExchange = selectedExchange === 'ALL' || i.exchange === selectedExchange;
      const matchesSector = selectedSector === 'ALL' || i.sector === selectedSector;
      return matchesSearch && matchesExchange && matchesSector;
    });
  }, [instruments, search, selectedExchange, selectedSector]);

  const handleTrade = (sym: string) => {
    setActiveSymbol(sym);
    setActivePage('stock_detail');
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            Indian Equity Markets (NSE & BSE)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time simulated quotes, sector classifications, fundamentals, and 52-week ranges
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-[#080d19] border border-slate-800 text-slate-300">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span>Feed: Sample NSE/BSE Real-time Feed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symbol or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080d19] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Exchange Filter */}
        <div className="flex items-center gap-1 bg-[#080d19] p-1 rounded-lg border border-slate-800 text-xs">
          {(['ALL', 'NSE', 'BSE'] as const).map(ex => (
            <button
              key={ex}
              onClick={() => setSelectedExchange(ex)}
              className={`px-3 py-1.5 rounded font-semibold transition-colors ${
                selectedExchange === ex
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Sector Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {sectors.map(sec => (
              <option key={sec} value={sec} className="bg-[#0d1527]">
                {sec === 'ALL' ? 'All Sectors' : sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Instruments Table */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-num">
            <thead>
              <tr className="bg-[#080d19] text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Instrument</th>
                <th className="py-3 px-3 font-semibold">Sector</th>
                <th className="py-3 px-3 text-right font-semibold">LTP (₹)</th>
                <th className="py-3 px-3 text-right font-semibold">Day Change</th>
                <th className="py-3 px-4 font-semibold text-center">52W Range</th>
                <th className="py-3 px-3 text-right font-semibold">Market Cap (Cr)</th>
                <th className="py-3 px-3 text-right font-semibold">P/E</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(i => {
                const rangeSpan = i.high52 - i.low52;
                const currentPosPct = rangeSpan > 0 ? ((i.lastPrice - i.low52) / rangeSpan) * 100 : 50;

                return (
                  <tr key={i.symbol} className="hover:bg-slate-800/40 transition-colors">
                    {/* Symbol & Name */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{i.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-300">
                          {i.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">{i.name}</span>
                    </td>

                    {/* Sector */}
                    <td className="py-3.5 px-3 font-sans text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700/50">
                        {i.sector}
                      </span>
                    </td>

                    {/* LTP */}
                    <td className="py-3.5 px-3 text-right font-bold text-white text-sm">
                      ₹{i.lastPrice.toFixed(2)}
                    </td>

                    {/* Change */}
                    <td className="py-3.5 px-3 text-right">
                      <span className={`font-semibold flex items-center justify-end gap-1 ${
                        i.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {i.pChange >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {i.change >= 0 ? '+' : ''}₹{i.change.toFixed(2)} ({i.pChange >= 0 ? '+' : ''}{i.pChange}%)
                      </span>
                    </td>

                    {/* 52W Range Bar */}
                    <td className="py-3.5 px-4 min-w-[150px]">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>₹{i.low52.toFixed(0)}</span>
                        <span>₹{i.high52.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, currentPosPct))}%` }}
                        />
                      </div>
                    </td>

                    {/* Market Cap */}
                    <td className="py-3.5 px-3 text-right text-slate-300">
                      ₹{i.marketCapCr.toLocaleString('en-IN')} Cr
                    </td>

                    {/* P/E Ratio */}
                    <td className="py-3.5 px-3 text-right text-slate-300">
                      {i.peRatio > 0 ? i.peRatio.toFixed(1) : 'N/A'}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTrade(i.symbol)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-sm"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
