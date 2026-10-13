import React, { useState, useMemo } from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Ban, 
  Filter, 
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders, cancelOrder, addToast } = useTrading();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FILLED' | 'PENDING' | 'CANCELLED' | 'REJECTED'>('ALL');

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
    } catch (err: any) {
      // Toast handled in context
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Order Book & Status History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete order life-cycle tracking with fill execution prices and cancellation controls
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-num">
          <span className="px-3 py-1.5 rounded-lg bg-[#080d19] border border-slate-800 text-slate-300">
            Total Orders: <strong className="text-white">{orders.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            Pending: <strong>{orders.filter(o => o.status === 'PENDING').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#0d1527] p-2 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
        {(['ALL', 'FILLED', 'PENDING', 'CANCELLED', 'REJECTED'] as const).map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === st
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st} ({st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No orders match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-num">
              <thead>
                <tr className="bg-[#080d19] text-slate-400 border-b border-slate-800">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-3 font-semibold">Instrument</th>
                  <th className="py-3 px-3 font-semibold">Side</th>
                  <th className="py-3 px-3 font-semibold">Type</th>
                  <th className="py-3 px-3 text-right font-semibold">Qty</th>
                  <th className="py-3 px-3 text-right font-semibold">Price (₹)</th>
                  <th className="py-3 px-3 text-right font-semibold">Total Cost (₹)</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-4 text-slate-400 font-semibold">Time</th>
                  <th className="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{ord.id}</td>
                    <td className="py-3 px-3 font-sans font-bold text-white">
                      {ord.symbol} <span className="text-[10px] text-slate-500">({ord.exchange})</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{ord.type}</td>
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">{ord.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-100 font-bold">₹{ord.price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-200 font-bold">
                      ₹{ord.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        ord.status === 'FILLED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : ord.status === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : ord.status === 'CANCELLED'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {ord.status === 'FILLED' && <CheckCircle2 className="w-3 h-3" />}
                        {ord.status === 'PENDING' && <Clock className="w-3 h-3 animate-spin" />}
                        {ord.status === 'CANCELLED' && <Ban className="w-3 h-3" />}
                        {ord.status === 'REJECTED' && <AlertCircle className="w-3 h-3" />}
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(ord.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ord.status === 'PENDING' ? (
                        <button
                          onClick={() => handleCancel(ord.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-600/80 text-rose-300 hover:text-white font-bold text-[11px] transition-colors"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
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
