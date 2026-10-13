import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2, 
  Info,
  DollarSign
} from 'lucide-react';

interface OrderTicketProps {
  initialSymbol?: string;
  onOrderSuccess?: () => void;
}

export const OrderTicket: React.FC<OrderTicketProps> = ({ initialSymbol, onOrderSuccess }) => {
  const { 
    portfolio, 
    positions, 
    instruments, 
    riskSettings, 
    placeOrder, 
    activeSymbol, 
    setActiveSymbol 
  } = useTrading();

  const currentSymbol = initialSymbol || activeSymbol;
  const instrument = instruments.find(i => i.symbol === currentSymbol) || instruments[0] || {
    symbol: 'RELIANCE',
    lastPrice: 2742.50,
    exchange: 'NSE' as const,
  };

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [type, setType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(2);
  const [limitPrice, setLimitPrice] = useState<number>(instrument.lastPrice);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

  // Position currently held
  const existingPosition = positions.find(p => p.symbol === instrument.symbol);
  const ownedQuantity = existingPosition ? existingPosition.quantity : 0;

  // Calculation of values
  const effectivePrice = type === 'LIMIT' && limitPrice > 0 ? limitPrice : instrument.lastPrice;
  const grossValue = Math.round(quantity * effectivePrice * 100) / 100;
  const brokerage = riskSettings?.simulatedBrokerageFlat || 20;
  const stt = Math.round(grossValue * 0.001 * 100) / 100;
  const totalCost = side === 'BUY' ? grossValue + brokerage + stt : grossValue - brokerage - stt;

  const availableCash = portfolio ? portfolio.availableCash : 0;

  // Server-side risk limit mirrors for real-time validation warnings
  const maxOrderVal = riskSettings?.maxOrderValue || 10000;
  const maxExposure = riskSettings?.maxExposurePerInstrument || 20000;
  const projectedExposure = (ownedQuantity + (side === 'BUY' ? quantity : -quantity)) * effectivePrice;

  const isExceedingOrderLimit = grossValue > maxOrderVal;
  const isExceedingExposureLimit = side === 'BUY' && projectedExposure > maxExposure;
  const isInsufficientCash = side === 'BUY' && totalCost > availableCash;
  const isInsufficientHoldings = side === 'SELL' && quantity > ownedQuantity;

  const canSubmit = quantity > 0 && !isExceedingOrderLimit && !isInsufficientCash && !isInsufficientHoldings && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (quantity <= 0) {
      setErrorMessage('Quantity must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await placeOrder({
        symbol: instrument.symbol,
        exchange: instrument.exchange,
        side,
        type,
        quantity,
        limitPrice: type === 'LIMIT' ? limitPrice : undefined,
      });

      setSuccessInfo(res.order);
      if (onOrderSuccess) onOrderSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Order execution failed on server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaxQuantity = () => {
    if (side === 'BUY') {
      const maxAffordable = Math.floor((availableCash - brokerage) / (effectivePrice * 1.001));
      const maxAllowedByLimit = Math.floor(maxOrderVal / effectivePrice);
      const target = Math.max(1, Math.min(maxAffordable, maxAllowedByLimit));
      setQuantity(target);
    } else {
      setQuantity(Math.max(1, ownedQuantity));
    }
  };

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-base font-bold text-white tracking-wide">Order Ticket</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Paper Mode
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Available Cash</span>
          <span className="text-sm font-bold font-mono-num text-emerald-400">
            ₹{availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Symbol Picker */}
      <div className="flex items-center justify-between bg-[#080d19] p-3 rounded-lg border border-slate-800">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
            Instrument
          </label>
          <select
            value={instrument.symbol}
            onChange={(e) => setActiveSymbol(e.target.value)}
            className="bg-transparent text-white font-bold text-base focus:outline-none cursor-pointer"
          >
            {instruments.filter(i => !i.isIndex).map(i => (
              <option key={i.symbol} value={i.symbol} className="bg-[#0d1527] text-white">
                {i.symbol} — ₹{i.lastPrice.toFixed(2)} ({i.exchange})
              </option>
            ))}
          </select>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Market Price</span>
          <span className="text-base font-bold font-mono-num text-white">
            ₹{instrument.lastPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Buy / Sell Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#080d19] rounded-lg border border-slate-800">
        <button
          type="button"
          onClick={() => { setSide('BUY'); setErrorMessage(null); }}
          className={`py-2 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            side === 'BUY'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          BUY
        </button>
        <button
          type="button"
          onClick={() => { setSide('SELL'); setErrorMessage(null); }}
          className={`py-2 px-4 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            side === 'SELL'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          SELL
        </button>
      </div>

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Order Type & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Order Type</label>
            <div className="flex bg-[#080d19] rounded-lg border border-slate-800 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setType('MARKET')}
                className={`flex-1 py-1.5 rounded text-center transition-colors ${
                  type === 'MARKET' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Market
              </button>
              <button
                type="button"
                onClick={() => setType('LIMIT')}
                className={`flex-1 py-1.5 rounded text-center transition-colors ${
                  type === 'LIMIT' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              {type === 'LIMIT' ? 'Limit Price (₹)' : 'Execution (Market)'}
            </label>
            <input
              type="number"
              step="0.05"
              disabled={type === 'MARKET'}
              value={type === 'MARKET' ? instrument.lastPrice : limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
              className={`w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono-num text-white focus:outline-none focus:border-emerald-500 ${
                type === 'MARKET' ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Quantity Input & Steppers */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-slate-400 font-medium">Quantity (Shares)</label>
            {side === 'SELL' && (
              <span className="text-xs text-slate-400">
                Owned: <strong className="text-slate-200">{ownedQuantity}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="flex-1 bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-sm font-bold font-mono-num text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => setQuantity(q => q + 5)}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200"
            >
              +5
            </button>
            <button
              type="button"
              onClick={handleMaxQuantity}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-emerald-400"
            >
              Max
            </button>
          </div>
        </div>

        {/* Order Accounting Summary Breakdown */}
        <div className="bg-[#080d19] rounded-lg p-3 border border-slate-800/80 text-xs flex flex-col gap-1.5 font-mono-num">
          <div className="flex justify-between text-slate-400">
            <span>Gross Order Value:</span>
            <span className="text-slate-200 font-semibold">₹{grossValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Simulated Brokerage (Flat):</span>
            <span className="text-slate-300">₹{brokerage.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>STT & Exchange Fees (0.1%):</span>
            <span className="text-slate-300">₹{stt.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-800 my-1" />
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-200">{side === 'BUY' ? 'Total Required Cash:' : 'Net Receivable:'}</span>
            <span className={side === 'BUY' ? 'text-emerald-400' : 'text-sky-400'}>
              ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Risk Warning Banners */}
        {isExceedingOrderLimit && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong>Risk Limit Alert:</strong> Order value (₹{grossValue.toLocaleString('en-IN')}) exceeds max order limit of ₹{maxOrderVal.toLocaleString('en-IN')}. Reduce quantity.
            </div>
          </div>
        )}

        {isInsufficientCash && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-xs text-rose-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong>Insufficient Virtual Cash:</strong> You need ₹{totalCost.toLocaleString('en-IN')} but have ₹{availableCash.toLocaleString('en-IN')}.
            </div>
          </div>
        )}

        {isInsufficientHoldings && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-xs text-rose-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong>Insufficient Holdings:</strong> You only own {ownedQuantity} shares of {instrument.symbol}.
            </div>
          </div>
        )}

        {/* Server Error Notice */}
        {errorMessage && (
          <div className="bg-rose-900/30 border border-rose-700/60 rounded-lg p-3 text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Server Success Notice */}
        {successInfo && (
          <div className="bg-emerald-900/30 border border-emerald-600/50 rounded-lg p-3 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <strong>Order Filled #{successInfo.id}:</strong> {successInfo.side} {successInfo.quantity} {successInfo.symbol} @ ₹{successInfo.price.toFixed(2)}.
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            !canSubmit
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
              : side === 'BUY'
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50 cursor-pointer'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/50 cursor-pointer'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting Order to Server...
            </>
          ) : (
            <>
              {side === 'BUY' ? 'Execute Paper BUY' : 'Execute Paper SELL'} ({instrument.symbol})
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-500 text-center leading-tight">
          Simulated order will execute immediately in paper trading engine. Real broker execution remains disabled.
        </p>
      </form>
    </div>
  );
};
