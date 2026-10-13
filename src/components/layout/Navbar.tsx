import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { 
  TrendingUp, 
  Search, 
  Bell, 
  User, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    portfolio, 
    marketStatus, 
    instruments, 
    setActiveSymbol, 
    setActivePage, 
    alerts,
    resetAccount 
  } = useTrading();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredInstruments = searchQuery.trim()
    ? instruments.filter(i => 
        i.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const nifty = instruments.find(i => i.symbol === 'NIFTY 50');
  const sensex = instruments.find(i => i.symbol === 'SENSEX');
  const pendingAlertsCount = alerts.filter(a => a.triggered).length;

  return (
    <header className="h-16 bg-[#090f1d] border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Market Ticker */}
      <div className="flex items-center gap-6">
        <div 
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-white">TRADEAI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 tracking-wider block -mt-0.5">
              INTELLIGENT TRADING
            </span>
          </div>
        </div>

        {/* Live Indices Ticker */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono-num border-l border-slate-800 pl-4">
          {nifty && (
            <div 
              onClick={() => { setActiveSymbol('NIFTY 50'); setActivePage('stock_detail'); }}
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/40 p-1.5 rounded transition-colors"
            >
              <span className="text-slate-400 font-semibold">NIFTY 50</span>
              <span className="text-slate-200 font-bold">₹{nifty.lastPrice.toLocaleString('en-IN')}</span>
              <span className={`text-[11px] font-semibold ${nifty.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {nifty.pChange >= 0 ? '+' : ''}{nifty.pChange}%
              </span>
            </div>
          )}

          {sensex && (
            <div 
              onClick={() => { setActiveSymbol('SENSEX'); setActivePage('stock_detail'); }}
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/40 p-1.5 rounded transition-colors"
            >
              <span className="text-slate-400 font-semibold">SENSEX</span>
              <span className="text-slate-200 font-bold">₹{sensex.lastPrice.toLocaleString('en-IN')}</span>
              <span className={`text-[11px] font-semibold ${sensex.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {sensex.pChange >= 0 ? '+' : ''}{sensex.pChange}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="relative flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search instruments (e.g. RELIANCE, TCS, HDFCBANK)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-[#0d1527] border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && filteredInstruments.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0d1527] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="p-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Matching Instruments ({filteredInstruments.length})
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredInstruments.map(i => (
                <div
                  key={i.symbol}
                  onClick={() => {
                    setActiveSymbol(i.symbol);
                    setActivePage('stock_detail');
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2 flex items-center justify-between hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{i.symbol}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                        {i.exchange}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{i.name}</span>
                  </div>
                  <div className="text-right font-mono-num">
                    <span className="text-xs font-bold text-white block">₹{i.lastPrice.toFixed(2)}</span>
                    <span className={`text-[10px] font-semibold ${i.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {i.pChange >= 0 ? '+' : ''}{i.pChange}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Indian Market Hours Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0d1527] border border-slate-800 text-xs">
          <span className={`w-2 h-2 rounded-full ${marketStatus?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-slate-300 font-medium">
            {marketStatus?.isOpen ? 'NSE/BSE Open' : 'NSE/BSE Closed'}
          </span>
          <span className="text-slate-500 font-mono-num text-[11px]">
            {marketStatus?.currentTimeIST || 'IST'}
          </span>
        </div>

        {/* Virtual Capital Summary Chip */}
        <div 
          onClick={() => setActivePage('portfolio')}
          className="cursor-pointer bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
        >
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
              Virtual Cash
            </span>
            <span className="text-xs font-bold font-mono-num text-emerald-400">
              ₹{portfolio ? portfolio.availableCash.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '1,00,000'}
            </span>
          </div>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={() => setActivePage('alerts')}
          className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          title="Price & Risk Alerts"
        >
          <Bell className="w-4 h-4" />
          {pendingAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        {/* Profile / Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0d1527] border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              TR
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0d1527] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <span className="font-bold text-white block">Trader Account</span>
                <span className="text-[11px] text-emerald-400 font-medium">Paper Trading Mode</span>
              </div>
              <button
                onClick={() => { setActivePage('portfolio'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800/60"
              >
                Portfolio & Performance
              </button>
              <button
                onClick={() => { setActivePage('risk'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800/60"
              >
                Risk Management
              </button>
              <button
                onClick={() => { setActivePage('settings'); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 rounded text-slate-300 hover:bg-slate-800/60"
              >
                Settings & API Config
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => { setShowResetConfirm(true); setShowProfileMenu(false); }}
                className="w-full text-left px-3 py-2 rounded text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Paper Account (₹1L)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Account Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Reset Paper Trading Account?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              This action will reset your virtual cash back to ₹1,00,000 and clear all simulated open positions, orders, and trade history. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await resetAccount();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
