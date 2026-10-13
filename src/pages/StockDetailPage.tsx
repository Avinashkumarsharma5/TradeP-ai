import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { InteractiveChart } from '../components/trading/InteractiveChart';
import { OrderTicket } from '../components/trading/OrderTicket';
import { MarketDepth } from '../components/trading/MarketDepth';
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Bell, 
  Bookmark, 
  Info,
  DollarSign
} from 'lucide-react';

export const StockDetailPage: React.FC = () => {
  const { 
    activeSymbol, 
    setActiveSymbol, 
    instruments, 
    positions, 
    addToast 
  } = useTrading();

  const instrument = instruments.find(i => i.symbol === activeSymbol) || instruments[0] || {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE' as const,
    sector: 'Energy & Petrochemicals',
    lastPrice: 2742.50,
    change: 18.20,
    pChange: 0.67,
    open: 2728.00,
    high: 2755.00,
    low: 2721.10,
    close: 2724.30,
    volume: 5820400,
    high52: 3217.90,
    low52: 2221.05,
    marketCapCr: 1855000,
    peRatio: 26.8,
    dividendYield: 0.36,
  };

  const heldPosition = positions.find(p => p.symbol === instrument.symbol);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Instrument Header Card */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Left: Symbol & Exchange */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-extrabold text-white text-base">
            {instrument.symbol.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-wide">{instrument.symbol}</h1>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {instrument.exchange}
              </span>
              <span className="text-xs text-slate-400 font-medium">{instrument.sector}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{instrument.name}</p>
          </div>
        </div>

        {/* Center: Live Quote & Day Change */}
        <div className="flex items-center gap-6 font-mono-num">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Last Traded Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">₹{instrument.lastPrice.toFixed(2)}</span>
              <span className={`text-sm font-bold flex items-center ${
                instrument.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {instrument.pChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {instrument.change >= 0 ? '+' : ''}₹{instrument.change.toFixed(2)} ({instrument.pChange >= 0 ? '+' : ''}{instrument.pChange}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Existing Holdings Tag */}
        <div className="flex items-center gap-3">
          {heldPosition && heldPosition.quantity > 0 ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">You Own</span>
              <span className="text-emerald-300 font-bold font-mono-num">
                {heldPosition.quantity} shares (Avg ₹{heldPosition.averagePrice.toFixed(2)})
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
              No active position
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Chart & Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Chart + Market Depth */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <InteractiveChart symbol={instrument.symbol} />

          {/* Key Fundamentals Card */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Fundamental Statistics & Daily Range
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-num">
              <div>
                <span className="text-slate-400 text-[11px] block">Open Price</span>
                <span className="text-slate-100 font-bold text-sm">₹{instrument.open.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Day High</span>
                <span className="text-emerald-400 font-bold text-sm">₹{instrument.high.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Day Low</span>
                <span className="text-rose-400 font-bold text-sm">₹{instrument.low.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Prev Close</span>
                <span className="text-slate-100 font-bold text-sm">₹{instrument.close.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">52-Week High</span>
                <span className="text-emerald-300 font-bold text-sm">₹{instrument.high52.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">52-Week Low</span>
                <span className="text-rose-300 font-bold text-sm">₹{instrument.low52.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Market Capitalization</span>
                <span className="text-slate-100 font-bold text-sm">₹{instrument.marketCapCr.toLocaleString('en-IN')} Cr</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">P/E Ratio</span>
                <span className="text-slate-100 font-bold text-sm">{instrument.peRatio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Ticket & Market Depth */}
        <div className="flex flex-col gap-6">
          <OrderTicket initialSymbol={instrument.symbol} />
          <MarketDepth lastPrice={instrument.lastPrice} />
        </div>
      </div>
    </div>
  );
};
