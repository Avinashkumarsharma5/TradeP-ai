import React from 'react';
import { 
  HelpCircle, 
  Clock, 
  Terminal, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink,
  Code,
  DollarSign
} from 'lucide-react';

export const HelpDocsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          TRADEAI Knowledge Base & System Documentation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Indian stock market mechanics, paper trading accounting, risk safeguards, and backend deployment
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Indian Stock Market (NSE/BSE) */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Indian Market Trading Hours & Rules
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Regular Market Hours:</strong> 09:15 AM to 03:30 PM IST (Monday through Friday).
            </p>
            <p>
              • <strong>Pre-Open Session:</strong> 09:00 AM to 09:08 AM IST for order collection and price discovery.
            </p>
            <p>
              • <strong>Settlement Standard:</strong> T+1 rolling settlement system enforced by SEBI.
            </p>
            <p>
              • <strong>Benchmark Indices:</strong> NIFTY 50 (NSE index of top 50 bluechips) and BSE SENSEX (top 30 companies).
            </p>
            <p>
              • <strong>Primary Currency:</strong> All prices, quotes, and account balances are denominated in Indian Rupees (₹ - INR).
            </p>
          </div>
        </div>

        {/* Section 2: Paper Trading Accounting */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            Paper Trading Accounting Formula
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-mono-num">
            <p className="font-sans">
              TRADEAI initializes each trader with <strong>₹1,00,000</strong> in virtual cash:
            </p>
            <div className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              Total Value = Available Cash + Sum(Quantity × Current Price)
            </div>
            <div className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              Net P&L = Total Value − ₹1,00,000 (Starting Capital)
            </div>
            <p className="font-sans text-[11px] text-slate-400">
              Simulated deductions: Flat ₹20 brokerage fee per executed order + 0.1% Securities Transaction Tax (STT) on gross turnover + 0.05% slippage.
            </p>
          </div>
        </div>

        {/* Section 3: Risk Controls */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Server-Side Risk Controls
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Max Order Value:</strong> Orders exceeding ₹10,000 are rejected immediately by the server.
            </p>
            <p>
              • <strong>Max Instrument Exposure:</strong> Projected total exposure per stock cannot exceed ₹20,000.
            </p>
            <p>
              • <strong>Daily Loss Limit:</strong> Configured to prevent drawdown beyond ₹5,000 in a single session.
            </p>
            <p>
              • <strong>Emergency Kill Switch:</strong> One-click circuit breaker to immediately lock order entry on server.
            </p>
          </div>
        </div>

        {/* Section 4: External Python FastAPI Setup */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-2">
            <Code className="w-4 h-4 text-purple-400" />
            Python FastAPI External Backend Setup
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p className="font-sans">
              To deploy with standalone Python FastAPI instead of unified Node server:
            </p>
            <pre className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto">
{`cd backend_fastapi
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload`}
            </pre>
            <p className="font-sans text-[11px] text-slate-400">
              Then navigate to <strong>Settings</strong> and set API Base URL to <code className="text-white">http://127.0.0.1:8001</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
