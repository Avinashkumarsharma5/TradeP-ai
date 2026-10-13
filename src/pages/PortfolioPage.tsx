import React from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  PieChart, 
  Wallet, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { portfolio, positions } = useTrading();

  const activePositions = positions.filter(p => p.quantity > 0);
  const totalValue = portfolio ? portfolio.totalPortfolioValue : 100000;
  const cash = portfolio ? portfolio.availableCash : 100000;
  const invested = portfolio ? portfolio.investedValue : 0;

  const cashPct = totalValue > 0 ? (cash / totalValue) * 100 : 100;
  const equityPct = totalValue > 0 ? (invested / totalValue) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            Portfolio Valuation & Asset Allocation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete capital accounting, holding weights, and performance returns in Indian Rupees (₹)
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-bold">
          Paper Account Verified
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Total Portfolio Value</span>
          <div className="text-2xl font-extrabold text-white font-mono-num">
            ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Starting Capital: ₹1,00,000.00</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Available Liquid Cash</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono-num">
            ₹{cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-mono-num">{cashPct.toFixed(1)}% of total portfolio</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Invested Value (Cost Basis)</span>
          <div className="text-2xl font-extrabold text-slate-200 font-mono-num">
            ₹{invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block font-mono-num">{equityPct.toFixed(1)}% deployed in equities</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
          <span className="text-xs text-slate-400 block mb-1">Overall Net P&L</span>
          <div className={`text-2xl font-extrabold font-mono-num ${
            portfolio && portfolio.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {portfolio && portfolio.totalPnL >= 0 ? '+' : ''}₹{portfolio ? portfolio.totalPnL.toFixed(2) : '0.00'}
          </div>
          <span className="text-xs font-semibold text-slate-300 mt-1 block font-mono-num">
            {portfolio ? portfolio.totalReturnPercent.toFixed(2) : '0.00'}% Net Return
          </span>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Holding Allocation Bars */}
        <div className="lg:col-span-2 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Portfolio Concentration Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Visual weight of liquid virtual cash versus open equity positions.
            </p>

            {/* Overall Allocation Bar */}
            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex mb-4 border border-slate-700/50">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${cashPct}%` }}
                title={`Cash: ${cashPct.toFixed(1)}%`}
              />
              <div 
                className="h-full bg-sky-500" 
                style={{ width: `${equityPct}%` }}
                title={`Equities: ${equityPct.toFixed(1)}%`}
              />
            </div>
            <div className="flex items-center gap-6 text-xs font-mono-num mb-6">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <strong className="text-slate-200">Virtual Cash:</strong> {cashPct.toFixed(1)}% (₹{cash.toLocaleString('en-IN')})
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
                <strong className="text-slate-200">Equities:</strong> {equityPct.toFixed(1)}% (₹{invested.toLocaleString('en-IN')})
              </span>
            </div>

            {/* Individual Stocks Allocation List */}
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Holdings Weight
            </h4>
            {activePositions.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No individual equity holdings. 100% of your portfolio is in virtual liquid cash.
              </div>
            ) : (
              <div className="flex flex-col gap-3 font-mono-num">
                {activePositions.map(pos => {
                  const weight = totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0;
                  const isConcentrated = weight > 25;

                  return (
                    <div key={pos.symbol} className="bg-[#080d19] p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{pos.symbol}</span>
                          <span className="text-[10px] text-slate-400">({pos.quantity} shares @ avg ₹{pos.averagePrice.toFixed(2)})</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono-num">
                          <span className="text-slate-200 font-bold">₹{pos.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          <span className="text-sky-400 font-bold">({weight.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isConcentrated ? 'bg-amber-400' : 'bg-sky-400'}`}
                          style={{ width: `${Math.min(100, weight)}%` }}
                        />
                      </div>
                      {isConcentrated && (
                        <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-sans">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Concentration warning: Position exceeds 25% of total portfolio value.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Accounting Standards & Formulas */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Documented Accounting Formula
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              TRADEAI enforces strict double-entry quantitative portfolio accounting standards to ensure zero discrepancy.
            </p>

            <div className="space-y-3 text-xs font-mono-num">
              <div className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Portfolio Value</span>
                <span className="text-emerald-300 font-semibold text-[11px]">
                  Available Cash + Sum(Quantity × Current Market Price)
                </span>
              </div>

              <div className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Invested Capital (Cost Basis)</span>
                <span className="text-sky-300 font-semibold text-[11px]">
                  Sum(Quantity × Average Execution Price)
                </span>
              </div>

              <div className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Unrealized P&L</span>
                <span className="text-slate-200 font-semibold text-[11px]">
                  Current Market Value − Invested Value
                </span>
              </div>

              <div className="bg-[#080d19] p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Realized P&L</span>
                <span className="text-slate-200 font-semibold text-[11px]">
                  (Sell Price − Avg Entry Price) × Sold Qty − Brokerage − STT
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
            <strong>Capital Isolation:</strong> Paper trading virtual ledger is 100% segregated from any real external broker or banking rails.
          </div>
        </div>
      </div>
    </div>
  );
};
