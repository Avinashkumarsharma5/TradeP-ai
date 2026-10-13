import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const PositionsPage: React.FC = () => {
  const { positions, placeOrder, setActiveSymbol, setActivePage, addToast } = useTrading();
  const [selectedPositionToExit, setSelectedPositionToExit] = useState<any | null>(null);
  const [exitQuantity, setExitQuantity] = useState<number>(1);
  const [isSubmittingExit, setIsSubmittingExit] = useState<boolean>(false);

  const activePositions = positions.filter(p => p.quantity > 0);
  const closedPositions = positions.filter(p => p.quantity === 0 && p.realizedPnL !== 0);

  const totalUnrealizedPnL = activePositions.reduce((acc, p) => acc + p.unrealizedPnL, 0);
  const totalMarketValue = activePositions.reduce((acc, p) => acc + p.currentValue, 0);

  const handleOpenExitModal = (pos: any) => {
    setSelectedPositionToExit(pos);
    setExitQuantity(pos.quantity);
  };

  const handleConfirmExit = async () => {
    if (!selectedPositionToExit) return;
    setIsSubmittingExit(true);
    try {
      await placeOrder({
        symbol: selectedPositionToExit.symbol,
        exchange: selectedPositionToExit.exchange,
        side: 'SELL',
        type: 'MARKET',
        quantity: exitQuantity,
      });
      addToast(
        'success',
        'Position Liquidated',
        `Sold ${exitQuantity} shares of ${selectedPositionToExit.symbol} at market price.`
      );
      setSelectedPositionToExit(null);
    } catch (err: any) {
      addToast('error', 'Exit Failed', err.message);
    } finally {
      setIsSubmittingExit(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Trading Positions & Square-Off
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time unrealized P&L, holding cost bases, and one-click exit execution
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-num">
          <div className="bg-[#080d19] border border-slate-800 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Market Value</span>
            <span className="text-sm font-bold text-white">
              ₹{totalMarketValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-[#080d19] border border-slate-800 px-3 py-1.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Unrealized P&L</span>
            <span className={`text-sm font-bold ${totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnL >= 0 ? '+' : ''}₹{totalUnrealizedPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Active Positions Table */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Open Holdings ({activePositions.length})
          </h2>
          <span className="text-xs text-slate-400">All prices updated via live simulated feed</span>
        </div>

        {activePositions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No active open positions. Browse the Markets or use the Order Ticket to buy shares.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-num">
              <thead>
                <tr className="bg-[#080d19] text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-semibold">Symbol</th>
                  <th className="py-3 px-3 text-right font-semibold">Qty</th>
                  <th className="py-3 px-3 text-right font-semibold">Avg Entry (₹)</th>
                  <th className="py-3 px-3 text-right font-semibold">LTP (₹)</th>
                  <th className="py-3 px-3 text-right font-semibold">Cost Basis (₹)</th>
                  <th className="py-3 px-3 text-right font-semibold">Current Value (₹)</th>
                  <th className="py-3 px-3 text-right font-semibold">Unrealized P&L</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activePositions.map(pos => (
                  <tr key={pos.symbol} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-white">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setActiveSymbol(pos.symbol); setActivePage('stock_detail'); }}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {pos.symbol}
                        </button>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                          {pos.exchange}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-200 font-bold">{pos.quantity}</td>
                    <td className="py-3.5 px-3 text-right text-slate-300">₹{pos.averagePrice.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-right text-slate-100 font-bold">₹{pos.currentPrice.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-right text-slate-300">₹{pos.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-3 text-right text-slate-100 font-bold">₹{pos.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className={`font-bold flex items-center justify-end gap-1 ${
                        pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {pos.unrealizedPnL >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {pos.unrealizedPnL >= 0 ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)} ({pos.unrealizedPnLPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenExitModal(pos)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
                      >
                        Exit Position
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closed Positions Ledger */}
      {closedPositions.length > 0 && (
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Previously Closed Positions (Realized P&L)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-num">
              <thead>
                <tr className="bg-[#080d19] text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-4 font-semibold">Symbol</th>
                  <th className="py-2.5 px-3 font-semibold">Exchange</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Realized Net P&L (₹)</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {closedPositions.map(pos => (
                  <tr key={pos.symbol} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-4 font-sans font-bold text-white">{pos.symbol}</td>
                    <td className="py-2.5 px-3 text-slate-400">{pos.exchange}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${
                      pos.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {pos.realizedPnL >= 0 ? '+' : ''}₹{pos.realizedPnL.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-400">Squared Off</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exit / Square-Off Confirmation Modal */}
      {selectedPositionToExit && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1527] border border-slate-800 rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Exit / Square Off Position
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Sell shares of <strong className="text-white">{selectedPositionToExit.symbol}</strong> at current market price (₹{selectedPositionToExit.currentPrice.toFixed(2)}).
            </p>

            <div className="mb-4">
              <label className="text-xs text-slate-400 font-medium block mb-1">Quantity to Liquidate</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={selectedPositionToExit.quantity}
                  value={exitQuantity}
                  onChange={(e) => setExitQuantity(Math.min(selectedPositionToExit.quantity, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="flex-1 bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-sm font-bold font-mono-num text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setExitQuantity(selectedPositionToExit.quantity)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-emerald-400"
                >
                  All ({selectedPositionToExit.quantity})
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPositionToExit(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingExit}
                onClick={handleConfirmExit}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
              >
                {isSubmittingExit ? 'Liquidating...' : 'Confirm Square Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
