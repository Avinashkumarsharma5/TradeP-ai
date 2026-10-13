import React from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  FileSpreadsheet,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const TradeHistoryPage: React.FC = () => {
  const { trades } = useTrading();

  const totalBrokerage = trades.reduce((acc, t) => acc + t.brokerage, 0);
  const totalTaxes = trades.reduce((acc, t) => acc + t.taxes, 0);
  const totalVolume = trades.reduce((acc, t) => acc + t.grossValue, 0);

  const exportCSV = () => {
    if (trades.length === 0) return;
    const headers = ['Trade ID', 'Order ID', 'Symbol', 'Exchange', 'Side', 'Qty', 'Price', 'Gross Value', 'Brokerage', 'Taxes', 'Net Value', 'Realized PnL', 'Timestamp'];
    const rows = trades.map(t => [
      t.id,
      t.orderId,
      t.symbol,
      t.exchange,
      t.side,
      t.quantity,
      t.executionPrice,
      t.grossValue,
      t.brokerage,
      t.taxes,
      t.netValue,
      t.realizedPnL ?? '',
      t.timestamp
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradeai_trade_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Trade Execution History & Fee Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official immutable log of executed paper orders with STT taxes and brokerage deductions
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={trades.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export CSV Ledger
        </button>
      </div>

      {/* Aggregate Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md font-mono-num">
          <span className="text-xs text-slate-400 block mb-1">Total Executed Trades</span>
          <div className="text-2xl font-extrabold text-white">{trades.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Gross Volume: ₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md font-mono-num">
          <span className="text-xs text-slate-400 block mb-1">Total Simulated Brokerage</span>
          <div className="text-2xl font-extrabold text-amber-400">₹{totalBrokerage.toFixed(2)}</div>
          <span className="text-xs text-slate-500 mt-1 block">Fixed ₹20 per trade rate</span>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md font-mono-num">
          <span className="text-xs text-slate-400 block mb-1">STT & Regulatory Taxes</span>
          <div className="text-2xl font-extrabold text-slate-200">₹{totalTaxes.toFixed(2)}</div>
          <span className="text-xs text-slate-500 mt-1 block">0.1% Securities Transaction Tax</span>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {trades.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No trades executed yet. Completed orders will appear in this ledger.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-num">
              <thead>
                <tr className="bg-[#080d19] text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-semibold">Trade ID</th>
                  <th className="py-3 px-3 font-semibold">Instrument</th>
                  <th className="py-3 px-3 font-semibold">Side</th>
                  <th className="py-3 px-3 text-right font-semibold">Qty</th>
                  <th className="py-3 px-3 text-right font-semibold">Execution Price</th>
                  <th className="py-3 px-3 text-right font-semibold">Gross Value</th>
                  <th className="py-3 px-3 text-right font-semibold">Brokerage</th>
                  <th className="py-3 px-3 text-right font-semibold">STT (0.1%)</th>
                  <th className="py-3 px-3 text-right font-semibold">Net Value</th>
                  <th className="py-3 px-3 text-right font-semibold">Realized P&L</th>
                  <th className="py-3 px-4 text-slate-400 font-semibold">Execution Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trades.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{t.id}</td>
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      {t.symbol} <span className="text-[10px] text-slate-500">({t.exchange})</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {t.side}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">{t.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-100 font-bold">₹{t.executionPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-300">₹{t.grossValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-3 text-right text-slate-400">₹{t.brokerage.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-400">₹{t.taxes.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">
                      ₹{t.netValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      {t.realizedPnL !== undefined ? (
                        <span className={t.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.realizedPnL >= 0 ? '+' : ''}₹{t.realizedPnL.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
