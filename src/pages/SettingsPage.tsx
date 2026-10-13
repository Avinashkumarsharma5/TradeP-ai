import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { getApiBaseUrl, setCustomApiBaseUrl } from '../api/client';
import { 
  Settings, 
  Server, 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Layers,
  Terminal,
  Globe2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { resetAccount, refreshAllData, addToast } = useTrading();
  const [apiUrl, setApiUrl] = useState<string>(getApiBaseUrl() || '');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = apiUrl.trim();
    setCustomApiBaseUrl(clean ? clean : null);
    addToast('success', 'API Base URL Updated', clean ? `Now connecting to ${clean}` : 'Defaulting to relative unified backend (/api).');
    refreshAllData();
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetAccount();
      setShowResetConfirm(false);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Terminal & Backend Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure API endpoints, broker integrations, and paper trading simulation controls
        </p>
      </div>

      {/* Backend API Connection Configuration */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Server className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Backend API Endpoint Configuration
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          TRADEAI connects to the server-side REST API for market quotes, atomic paper orders, risk validation, and Gemini AI queries.
        </p>

        <form onSubmit={handleSaveApiUrl} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              API Base URL (VITE_API_BASE_URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Leave empty for unified backend, or http://127.0.0.1:8001 for Python FastAPI"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="flex-1 bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
              >
                Save URL
              </button>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1 font-sans">
              Currently using: <strong className="text-emerald-400 font-mono">{apiUrl || 'Relative Unified Server (Port 3000)'}</strong>
            </span>
          </div>
        </form>
      </div>

      {/* Real Brokerage Integration Safeguard Notice */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Indian Broker Integrations (Safety Status)
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          In strict compliance with fintech security standards, real-money broker order routing is intentionally disabled until explicit API credentials and 2FA authentication are configured.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#080d19] p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white text-xs block">Zerodha (Kite Connect)</span>
              <span className="text-[11px] text-slate-500">API Key, API Secret, Request Token</span>
            </div>
            <span className="mt-3 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 w-fit">
              DISABLED (Paper Mode Active)
            </span>
          </div>

          <div className="bg-[#080d19] p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white text-xs block">Upstox API</span>
              <span className="text-[11px] text-slate-500">OAuth 2.0 Client ID & Secret</span>
            </div>
            <span className="mt-3 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 w-fit">
              DISABLED (Paper Mode Active)
            </span>
          </div>

          <div className="bg-[#080d19] p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white text-xs block">Angel One (SmartAPI)</span>
              <span className="text-[11px] text-slate-500">SmartAPI Key & TOTP Token</span>
            </div>
            <span className="mt-3 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 w-fit">
              DISABLED (Paper Mode Active)
            </span>
          </div>
        </div>
      </div>

      {/* Account Reset Area */}
      <div className="bg-[#0d1527] border border-rose-950/60 rounded-xl p-5 shadow-xl flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-400" />
            Reset Paper Trading Account
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Restore virtual liquid balance to ₹1,00,000 and clear all paper open positions and trade logs.
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-colors whitespace-nowrap shadow-md cursor-pointer"
        >
          Reset to ₹1,00,000
        </button>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirm Virtual Account Reset
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Are you sure? This will wipe all current open positions and reset your virtual balance to ₹1,00,000.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={isResetting}
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
