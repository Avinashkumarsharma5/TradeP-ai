import React, { useMemo } from 'react';

interface MarketDepthProps {
  lastPrice: number;
}

export const MarketDepth: React.FC<MarketDepthProps> = ({ lastPrice }) => {
  const depthData = useMemo(() => {
    const bids = [
      { orders: 4, qty: 150, price: Math.round((lastPrice - 0.20) * 100) / 100 },
      { orders: 8, qty: 420, price: Math.round((lastPrice - 0.45) * 100) / 100 },
      { orders: 12, qty: 680, price: Math.round((lastPrice - 0.80) * 100) / 100 },
      { orders: 5, qty: 210, price: Math.round((lastPrice - 1.15) * 100) / 100 },
      { orders: 19, qty: 1450, price: Math.round((lastPrice - 1.50) * 100) / 100 },
    ];

    const asks = [
      { orders: 3, qty: 120, price: Math.round((lastPrice + 0.15) * 100) / 100 },
      { orders: 7, qty: 380, price: Math.round((lastPrice + 0.50) * 100) / 100 },
      { orders: 15, qty: 890, price: Math.round((lastPrice + 0.75) * 100) / 100 },
      { orders: 9, qty: 540, price: Math.round((lastPrice + 1.20) * 100) / 100 },
      { orders: 11, qty: 1120, price: Math.round((lastPrice + 1.65) * 100) / 100 },
    ];

    const totalBidQty = bids.reduce((acc, b) => acc + b.qty, 0);
    const totalAskQty = asks.reduce((acc, a) => acc + a.qty, 0);

    return { bids, asks, totalBidQty, totalAskQty };
  }, [lastPrice]);

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-lg text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <h4 className="font-bold text-white tracking-wide">Market Depth (L2 Order Book)</h4>
        <span className="text-[10px] text-slate-400">5-Depth Top of Book</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Bid Side (Buyers) */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 pb-1 mb-1">
            <span>Orders</span>
            <span>Qty</span>
            <span className="text-emerald-400">Bid (₹)</span>
          </div>
          <div className="flex flex-col gap-1 font-mono-num">
            {depthData.bids.map((b, i) => (
              <div key={i} className="flex justify-between items-center py-0.5 text-slate-300 relative">
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none rounded"
                  style={{ width: `${(b.qty / 1500) * 100}%` }}
                />
                <span className="text-slate-500 z-10">{b.orders}</span>
                <span className="text-slate-200 z-10">{b.qty}</span>
                <span className="font-bold text-emerald-400 z-10">₹{b.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t border-slate-800/80 pt-1.5 mt-1 font-semibold text-slate-300">
            <span>Total Bids:</span>
            <span className="text-emerald-400 font-mono-num">{depthData.totalBidQty}</span>
          </div>
        </div>

        {/* Ask Side (Sellers) */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 pb-1 mb-1">
            <span className="text-rose-400">Ask (₹)</span>
            <span>Qty</span>
            <span>Orders</span>
          </div>
          <div className="flex flex-col gap-1 font-mono-num">
            {depthData.asks.map((a, i) => (
              <div key={i} className="flex justify-between items-center py-0.5 text-slate-300 relative">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none rounded"
                  style={{ width: `${(a.qty / 1500) * 100}%` }}
                />
                <span className="font-bold text-rose-400 z-10">₹{a.price.toFixed(2)}</span>
                <span className="text-slate-200 z-10">{a.qty}</span>
                <span className="text-slate-500 z-10">{a.orders}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t border-slate-800/80 pt-1.5 mt-1 font-semibold text-slate-300">
            <span>Total Asks:</span>
            <span className="text-rose-400 font-mono-num">{depthData.totalAskQty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
