import React from 'react';
import { useTrading } from '../context/TradingContext';
import { InteractiveChart } from '../components/trading/InteractiveChart';
import { OrderTicket } from '../components/trading/OrderTicket';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    portfolio, 
    positions, 
    orders, 
    trades, 
    marketStatus, 
    instruments, 
    activeSymbol, 
    setActiveSymbol, 
    setActivePage,
    refreshAllData,
    loading,
    error 
  } = useTrading();

  const activePositions = positions.filter(p => p.quantity > 0);
  const recentTrades = trades.slice(0, 5);

  const topGainers = [...instruments.filter(i => !i.isIndex)]
    .sort((a, b) => b.pChange - a.pChange)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Welcome & Data Source Notice */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              TRADEAI Terminal Dashboard
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
                Paper Trading (INR)
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Indian Stock Markets (NSE & BSE) • Real-time simulated execution engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Data source badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#080d19] border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300">Data Source:</span>
            <span className="text-emerald-400 font-semibold">Sample Market Feed (Realistic NSE/BSE)</span>
          </div>

          <button
            onClick={() => refreshAllData()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Backend Connection Error Banner with Retry */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">Backend Connection Notice</h4>
              <p className="text-xs text-rose-300/80">{error}</p>
            </div>
          </div>
          <button
            onClick={() => refreshAllData()}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Portfolio Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Portfolio Value</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono-num">
            <div className="text-2xl font-extrabold text-white">
              ₹{portfolio ? portfolio.totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '1,00,000.00'}
            </div>
            <div className="flex items-center gap-1.5 text-xs mt-1">
              <span className={portfolio && portfolio.totalPnL >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {portfolio && portfolio.totalPnL >= 0 ? '+' : ''}₹{portfolio ? portfolio.totalPnL.toFixed(2) : '0.00'}
              </span>
              <span className="text-slate-500">
                ({portfolio ? portfolio.totalReturnPercent.toFixed(2) : '0.00'}% total return)
              </span>
            </div>
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Available Cash</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Liquid</span>
          </div>
          <div className="font-mono-num">
            <div className="text-2xl font-extrabold text-emerald-400">
              ₹{portfolio ? portfolio.availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '1,00,000.00'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Initial Capital: ₹1,00,000.00
            </div>
          </div>
        </div>

        {/* Invested Capital */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Invested Capital</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono-num">
            <div className="text-2xl font-extrabold text-slate-100">
              ₹{portfolio ? portfolio.investedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {activePositions.length} active position(s)
            </div>
          </div>
        </div>

        {/* Realized & Unrealized P&L */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Unrealized P&L</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              portfolio && portfolio.totalUnrealizedPnL >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {portfolio && portfolio.totalUnrealizedPnL >= 0 ? 'PROFIT' : 'LOSS'}
            </span>
          </div>
          <div className="font-mono-num">
            <div className={`text-2xl font-extrabold ${
              portfolio && portfolio.totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {portfolio && portfolio.totalUnrealizedPnL >= 0 ? '+' : ''}₹{portfolio ? portfolio.totalUnrealizedPnL.toFixed(2) : '0.00'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Realized P&L: ₹{portfolio ? portfolio.totalRealizedPnL.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Chart + Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <InteractiveChart symbol={activeSymbol} />

          {/* Top Gainers Quick Ticker Strip */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Indian Market Movers</h3>
              <button 
                onClick={() => setActivePage('markets')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                View All Markets <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topGainers.map(inst => (
                <div
                  key={inst.symbol}
                  onClick={() => setActiveSymbol(inst.symbol)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeSymbol === inst.symbol
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-[#080d19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{inst.symbol}</span>
                    <span className="text-[10px] text-slate-400">{inst.exchange}</span>
                  </div>
                  <div className="font-mono-num">
                    <span className="text-sm font-bold text-slate-100 block">₹{inst.lastPrice.toFixed(2)}</span>
                    <span className={`text-xs font-semibold ${inst.pChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {inst.pChange >= 0 ? '+' : ''}{inst.pChange}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Ticket */}
        <div>
          <OrderTicket />
        </div>
      </div>

      {/* Bottom Row: Active Positions & Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions Summary */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Open Positions</h3>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-bold text-slate-300">
                  {activePositions.length}
                </span>
              </div>
              <button
                onClick={() => setActivePage('positions')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                Manage Positions <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activePositions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No active positions. Place a BUY order in the ticket above to start paper trading.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-num">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-2">
                      <th className="py-2">Symbol</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Avg Price</th>
                      <th className="py-2 text-right">LTP</th>
                      <th className="py-2 text-right">Unrealized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activePositions.map(pos => (
                      <tr key={pos.symbol} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-white">
                          <button
                            onClick={() => { setActiveSymbol(pos.symbol); setActivePage('stock_detail'); }}
                            className="hover:text-emerald-400 transition-colors"
                          >
                            {pos.symbol}
                          </button>
                        </td>
                        <td className="py-2.5 text-right text-slate-200">{pos.quantity}</td>
                        <td className="py-2.5 text-right text-slate-300">₹{pos.averagePrice.toFixed(2)}</td>
                        <td className="py-2.5 text-right text-slate-100 font-semibold">₹{pos.currentPrice.toFixed(2)}</td>
                        <td className={`py-2.5 text-right font-bold ${pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pos.unrealizedPnL >= 0 ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades Ledger */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-white text-sm">Recent Paper Executions</h3>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-bold text-slate-300">
                  {trades.length}
                </span>
              </div>
              <button
                onClick={() => setActivePage('trades')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                Full Trade History <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTrades.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No trades executed yet. Place an order to see simulated trade executions.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-num">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-2">
                      <th className="py-2">Time</th>
                      <th className="py-2">Side</th>
                      <th className="py-2">Symbol</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Fill Price</th>
                      <th className="py-2 text-right">Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentTrades.map(trd => (
                      <tr key={trd.id} className="hover:bg-slate-800/30">
                        <td className="py-2 text-slate-400 text-[11px]">
                          {new Date(trd.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            trd.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {trd.side}
                          </span>
                        </td>
                        <td className="py-2 font-bold text-white">{trd.symbol}</td>
                        <td className="py-2 text-right text-slate-200">{trd.quantity}</td>
                        <td className="py-2 text-right text-slate-100">₹{trd.executionPrice.toFixed(2)}</td>
                        <td className="py-2 text-right text-slate-200">₹{trd.netValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
