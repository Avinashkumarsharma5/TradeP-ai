import React from 'react';
import { useTrading } from '../context/TradingContext';
import { InteractiveChart } from '../components/trading/InteractiveChart';
import { OrderTicket } from '../components/trading/OrderTicket';
import { MarketDepth } from '../components/trading/MarketDepth';
import { 
  Terminal, 
  Wallet, 
  Layers, 
  Clock, 
  RotateCcw, 
  AlertTriangle,
  Info
} from 'lucide-react';

export const PaperTradingPage: React.FC = () => {
  const { 
    activeSymbol, 
    setActiveSymbol, 
    instruments, 
    portfolio, 
    positions, 
    orders, 
    placeOrder, 
    addToast 
  } = useTrading();

  const currentInstrument = instruments.find(i => i.symbol === activeSymbol) || instruments[0] || {
    symbol: 'RELIANCE',
    lastPrice: 2742.50,
    exchange: 'NSE' as const,
  };

  const activePositions = positions.filter(p => p.quantity > 0);

  const handleSquareOff = async (symbol: string, quantity: number) => {
    try {
      await placeOrder({
        symbol,
        side: 'SELL',
        type: 'MARKET',
        quantity,
      });
      addToast('success', 'Position Squared Off', `Exited ${quantity} shares of ${symbol}.`);
    } catch (err: any) {
      addToast('error', 'Square Off Failed', err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Dedicated Paper Trading Terminal
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
                ₹1,00,000 Starting Virtual Capital
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Zero capital risk • Realistic execution simulation with simulated brokerage (₹20) and STT
            </p>
          </div>
        </div>

        {/* Quick Capital Readout */}
        <div className="flex items-center gap-4 text-xs font-mono-num">
          <div className="bg-[#080d19] border border-slate-800 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Available Cash</span>
            <span className="text-sm font-bold text-emerald-400">
              ₹{portfolio ? portfolio.availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '1,00,000.00'}
            </span>
          </div>
          <div className="bg-[#080d19] border border-slate-800 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Portfolio</span>
            <span className="text-sm font-bold text-white">
              ₹{portfolio ? portfolio.totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '1,00,000.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart + Active Positions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <InteractiveChart symbol={currentInstrument.symbol} />

          {/* Quick Active Positions Terminal Ledger */}
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Active Terminal Positions ({activePositions.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Click Square Off to immediately liquidate
              </span>
            </div>

            {activePositions.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No active positions. Execute a BUY order using the ticket on the right.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-num">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-2">
                      <th className="py-2">Symbol</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Avg Entry</th>
                      <th className="py-2 text-right">Current</th>
                      <th className="py-2 text-right">Unrealized P&L</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activePositions.map(pos => (
                      <tr key={pos.symbol} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-white font-sans">{pos.symbol}</td>
                        <td className="py-2.5 text-right text-slate-200">{pos.quantity}</td>
                        <td className="py-2.5 text-right text-slate-300">₹{pos.averagePrice.toFixed(2)}</td>
                        <td className="py-2.5 text-right text-slate-100">₹{pos.currentPrice.toFixed(2)}</td>
                        <td className={`py-2.5 text-right font-bold ${pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pos.unrealizedPnL >= 0 ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)} ({pos.unrealizedPnLPercent.toFixed(2)}%)
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleSquareOff(pos.symbol, pos.quantity)}
                            className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors"
                          >
                            Square Off
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Ticket & Market Depth */}
        <div className="flex flex-col gap-6">
          <OrderTicket initialSymbol={currentInstrument.symbol} />
          <MarketDepth lastPrice={currentInstrument.lastPrice} />
        </div>
      </div>
    </div>
  );
};
