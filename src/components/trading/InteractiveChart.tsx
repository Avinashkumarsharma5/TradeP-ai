import React, { useState, useEffect, useMemo } from 'react';
import { Candle } from '../../types';
import { api } from '../../api/client';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Activity, 
  Layers, 
  Eye, 
  EyeOff, 
  RefreshCw 
} from 'lucide-react';

interface InteractiveChartProps {
  symbol: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ symbol }) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'CANDLE' | 'LINE'>('CANDLE');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('3M');
  const [showSMA20, setShowSMA20] = useState<boolean>(true);
  const [showSMA50, setShowSMA50] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const days = timeframe === '1D' ? 5 : timeframe === '1W' ? 14 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 250;
      const res = await api.getHistory(symbol, days);
      setCandles(res.candles);
    } catch (err) {
      console.error('Error fetching candles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [symbol, timeframe]);

  // Dimensions
  const width = 800;
  const mainHeight = 360;
  const rsiHeight = showRSI ? 100 : 0;
  const padding = { top: 20, right: 60, bottom: 30, left: 10 };

  const { minPrice, maxPrice, priceRange, sma20, sma50, rsi14, bollingerBands } = useMemo(() => {
    if (candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, sma20: [], sma50: [], rsi14: [], bollingerBands: [] };
    }

    let min = Infinity;
    let max = -Infinity;
    candles.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    const buffer = (max - min) * 0.05 || 5;
    const finalMin = Math.max(0, min - buffer);
    const finalMax = max + buffer;

    // Moving Averages
    const closes = candles.map(c => c.close);
    const calcSMA = (period: number) => {
      return closes.map((_, idx) => {
        if (idx < period - 1) return null;
        const slice = closes.slice(idx - period + 1, idx + 1);
        return slice.reduce((a, b) => a + b, 0) / period;
      });
    };

    const s20 = calcSMA(20);
    const s50 = calcSMA(50);

    // RSI
    const rsi: (number | null)[] = [];
    let gains = 0;
    let losses = 0;
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        rsi.push(null);
        continue;
      }
      const diff = closes[i] - closes[i - 1];
      if (i <= 14) {
        if (diff >= 0) gains += diff;
        else losses -= diff;
        if (i === 14) {
          const rs = losses === 0 ? 100 : (gains / 14) / (losses / 14);
          rsi.push(100 - (100 / (1 + rs)));
        } else {
          rsi.push(null);
        }
      } else {
        const prev = rsi[i - 1];
        if (prev === null) {
          rsi.push(null);
          continue;
        }
        const curG = diff > 0 ? diff : 0;
        const curL = diff < 0 ? -diff : 0;
        gains = (gains * 13 + curG) / 14;
        losses = (losses * 13 + curL) / 14;
        const rs = losses === 0 ? 100 : gains / losses;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    // Bollinger Bands
    const bb = closes.map((_, idx) => {
      const mean = s20[idx];
      if (mean === null) return { upper: null, lower: null };
      const slice = closes.slice(idx - 19, idx + 1);
      const variance = slice.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      return {
        upper: mean + 2 * stdDev,
        lower: mean - 2 * stdDev,
      };
    });

    return {
      minPrice: finalMin,
      maxPrice: finalMax,
      priceRange: finalMax - finalMin || 1,
      sma20: s20,
      sma50: s50,
      rsi14: rsi,
      bollingerBands: bb,
    };
  }, [candles]);

  const getY = (price: number) => {
    return padding.top + (1 - (price - minPrice) / priceRange) * (mainHeight - padding.top - padding.bottom);
  };

  const getX = (index: number) => {
    if (candles.length <= 1) return padding.left;
    const chartW = width - padding.left - padding.right;
    return padding.left + (index / (candles.length - 1)) * chartW;
  };

  const candleWidth = useMemo(() => {
    if (candles.length === 0) return 6;
    const availableW = width - padding.left - padding.right;
    const rawW = (availableW / candles.length) * 0.7;
    return Math.max(2, Math.min(14, rawW));
  }, [candles.length]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg select-none">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Symbol Info & Live Quote */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-wide">{symbol}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                NSE
              </span>
              <span className="text-xs text-slate-400">Equity Intraday/Historical</span>
            </div>
            {activeCandle && (
              <div className="flex items-center gap-3 text-xs font-mono-num mt-1">
                <span className="text-slate-400">O: <strong className="text-slate-200">₹{activeCandle.open.toFixed(2)}</strong></span>
                <span className="text-slate-400">H: <strong className="text-emerald-400">₹{activeCandle.high.toFixed(2)}</strong></span>
                <span className="text-slate-400">L: <strong className="text-rose-400">₹{activeCandle.low.toFixed(2)}</strong></span>
                <span className="text-slate-400">C: <strong className="text-slate-100">₹{activeCandle.close.toFixed(2)}</strong></span>
                <span className="text-slate-400">Vol: <strong className="text-sky-400">{(activeCandle.volume / 100000).toFixed(1)}L</strong></span>
                <span className="text-slate-500">({activeCandle.time})</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Controls & Timeframes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill buttons */}
          <div className="flex items-center bg-[#080d19] border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center bg-[#080d19] border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setChartType('CANDLE')}
              className={`p-1.5 rounded flex items-center gap-1 ${
                chartType === 'CANDLE' ? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Candlestick Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('LINE')}
              className={`p-1.5 rounded flex items-center gap-1 ${
                chartType === 'LINE' ? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Line Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Technical Indicator Toggles */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                showSMA20
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                showSMA50
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              SMA 50
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                showBollinger
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              Bollinger
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 rounded border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                showRSI
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              RSI (14)
            </button>
          </div>

          <button
            onClick={fetchHistory}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Refresh Chart"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden bg-[#090f1d] rounded-lg border border-slate-800/60 p-2">
        {loading && candles.length === 0 ? (
          <div className="h-[360px] flex items-center justify-center text-slate-400 text-sm gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            Loading historical market data...
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${mainHeight + rsiHeight}`}
            className="w-full h-auto max-h-[500px] overflow-visible"
            onMouseLeave={() => setHoveredCandle(null)}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Price Ticks */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const price = minPrice + (1 - pct) * priceRange;
              const y = padding.top + pct * (mainHeight - padding.top - padding.bottom);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={width - padding.right + 6}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ₹{price.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Bollinger Bands Fill & Lines */}
            {showBollinger && (
              <>
                {/* Upper and Lower Band Paths */}
                <path
                  d={candles.reduce((acc, _, i) => {
                    const bb = bollingerBands[i];
                    if (!bb?.upper) return acc;
                    const x = getX(i);
                    const y = getY(bb.upper);
                    return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <path
                  d={candles.reduce((acc, _, i) => {
                    const bb = bollingerBands[i];
                    if (!bb?.lower) return acc;
                    const x = getX(i);
                    const y = getY(bb.lower);
                    return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              </>
            )}

            {/* Volume bars in lower background */}
            {candles.map((c, i) => {
              const x = getX(i);
              const maxVol = Math.max(...candles.map(item => item.volume));
              const volHeight = (c.volume / (maxVol || 1)) * 60;
              const y = mainHeight - padding.bottom - volHeight;
              const isUp = c.close >= c.open;
              return (
                <rect
                  key={`vol_${i}`}
                  x={x - candleWidth / 2}
                  y={y}
                  width={candleWidth}
                  height={volHeight}
                  fill={isUp ? '#10b981' : '#f43f5e'}
                  opacity={0.18}
                />
              );
            })}

            {/* Chart Type: Line */}
            {chartType === 'LINE' && (
              <>
                <path
                  d={`${candles.reduce((acc, c, i) => {
                    const x = getX(i);
                    const y = getY(c.close);
                    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')} L ${getX(candles.length - 1)} ${mainHeight - padding.bottom} L ${getX(0)} ${mainHeight - padding.bottom} Z`}
                  fill="url(#areaGrad)"
                />
                <path
                  d={candles.reduce((acc, c, i) => {
                    const x = getX(i);
                    const y = getY(c.close);
                    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              </>
            )}

            {/* Chart Type: Candlestick */}
            {chartType === 'CANDLE' &&
              candles.map((c, i) => {
                const x = getX(i);
                const isUp = c.close >= c.open;
                const candleColor = isUp ? '#10b981' : '#f43f5e';
                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);

                const topBody = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                return (
                  <g key={`candle_${i}`}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={topBody}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })}

            {/* SMA 20 Overlay */}
            {showSMA20 && (
              <path
                d={candles.reduce((acc, _, i) => {
                  const val = sma20[i];
                  if (val === null) return acc;
                  const x = getX(i);
                  const y = getY(val);
                  return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
              />
            )}

            {/* SMA 50 Overlay */}
            {showSMA50 && (
              <path
                d={candles.reduce((acc, _, i) => {
                  const val = sma50[i];
                  if (val === null) return acc;
                  const x = getX(i);
                  const y = getY(val);
                  return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.8"
              />
            )}

            {/* RSI Sub-chart */}
            {showRSI && (
              <g transform={`translate(0, ${mainHeight})`}>
                {/* Background & Levels */}
                <line x1={padding.left} y1={20} x2={width - padding.right} y2={20} stroke="#334155" strokeDasharray="3 3" />
                <line x1={padding.left} y1={50} x2={width - padding.right} y2={50} stroke="#1e293b" />
                <line x1={padding.left} y1={80} x2={width - padding.right} y2={80} stroke="#334155" strokeDasharray="3 3" />
                <text x={width - padding.right + 6} y={23} fill="#f43f5e" fontSize="9" fontFamily="monospace">70 Overbought</text>
                <text x={width - padding.right + 6} y={53} fill="#64748b" fontSize="9" fontFamily="monospace">50 Neutral</text>
                <text x={width - padding.right + 6} y={83} fill="#10b981" fontSize="9" fontFamily="monospace">30 Oversold</text>
                
                {/* RSI curve */}
                <path
                  d={candles.reduce((acc, _, i) => {
                    const r = rsi14[i];
                    if (r === null) return acc;
                    const x = getX(i);
                    const y = 100 - r; // Map 0..100 to 100..0
                    return acc === '' ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.8"
                />
              </g>
            )}

            {/* Interactive Hover Overlay Bars */}
            {candles.map((c, i) => {
              const x = getX(i);
              return (
                <rect
                  key={`hover_${i}`}
                  x={x - candleWidth}
                  y={padding.top}
                  width={candleWidth * 2}
                  height={mainHeight + rsiHeight - padding.top}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredCandle(c)}
                />
              );
            })}

            {/* Active Crosshair Line */}
            {hoveredCandle && (
              <line
                x1={getX(candles.indexOf(hoveredCandle))}
                y1={padding.top}
                x2={getX(candles.indexOf(hoveredCandle))}
                y2={mainHeight + rsiHeight - padding.bottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
                pointerEvents="none"
              />
            )}
          </svg>
        )}
      </div>

      {/* Legend & Indicators Status */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Bullish Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Bearish Candle
          </span>
          {showSMA20 && (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" /> SMA(20)
            </span>
          )}
          {showSMA50 && (
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-3 h-0.5 bg-blue-400 inline-block" /> SMA(50)
            </span>
          )}
          {showBollinger && (
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-3 h-0.5 bg-purple-400 inline-block" /> BB(20,2)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>*Sample Market Feed</span>
          <span>•</span>
          <span>Data Provider: TRADEAI Core Engine</span>
        </div>
      </div>
    </div>
  );
};
