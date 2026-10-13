import { Instrument, Candle } from '../types.js';

export const MASTER_INSTRUMENTS: Instrument[] = [
  // Major Indices
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Benchmark Index',
    exchange: 'NSE',
    sector: 'Indices',
    lastPrice: 24852.30,
    change: 142.60,
    pChange: 0.58,
    open: 24730.10,
    high: 24895.00,
    low: 24715.40,
    close: 24709.70,
    volume: 245000000,
    high52: 26277.35,
    low52: 18837.85,
    marketCapCr: 18500000,
    peRatio: 22.8,
    dividendYield: 1.25,
    isIndex: true,
  },
  {
    symbol: 'SENSEX',
    name: 'BSE SENSEX Benchmark Index',
    exchange: 'BSE',
    sector: 'Indices',
    lastPrice: 81381.36,
    change: 494.20,
    pChange: 0.61,
    open: 80920.15,
    high: 81490.80,
    low: 80890.00,
    close: 80887.16,
    volume: 18000000,
    high52: 85978.25,
    low52: 63583.07,
    marketCapCr: 16200000,
    peRatio: 23.4,
    dividendYield: 1.18,
    isIndex: true,
  },
  {
    symbol: 'BANKNIFTY',
    name: 'NIFTY Bank Sectoral Index',
    exchange: 'NSE',
    sector: 'Indices',
    lastPrice: 51240.75,
    change: -115.30,
    pChange: -0.22,
    open: 51400.00,
    high: 51520.10,
    low: 51105.50,
    close: 51356.05,
    volume: 120000000,
    high52: 54467.35,
    low52: 42105.40,
    marketCapCr: 8900000,
    peRatio: 16.2,
    dividendYield: 0.95,
    isIndex: true,
  },
  {
    symbol: 'NIFTY IT',
    name: 'NIFTY IT Sectoral Index',
    exchange: 'NSE',
    sector: 'Indices',
    lastPrice: 42180.50,
    change: 530.80,
    pChange: 1.27,
    open: 41700.20,
    high: 42350.00,
    low: 41650.00,
    close: 41649.70,
    volume: 45000000,
    high52: 44250.00,
    low52: 30500.00,
    marketCapCr: 4100000,
    peRatio: 30.5,
    dividendYield: 2.1,
    isIndex: true,
  },
  // Top NSE / BSE Equities
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    exchange: 'NSE',
    sector: 'Energy & Petrochemicals',
    lastPrice: 2742.50,
    change: 18.20,
    pChange: 0.67,
    open: 2728.00,
    high: 2755.00,
    low: 2721.10,
    close: 2724.30,
    volume: 5820400,
    high52: 3217.90,
    low52: 2221.05,
    marketCapCr: 1855000,
    peRatio: 26.8,
    dividendYield: 0.36,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    lastPrice: 4125.80,
    change: 62.40,
    pChange: 1.54,
    open: 4075.00,
    high: 4140.00,
    low: 4065.20,
    close: 4063.40,
    volume: 2150300,
    high52: 4592.25,
    low52: 3311.00,
    marketCapCr: 1492000,
    peRatio: 31.2,
    dividendYield: 1.82,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    lastPrice: 1682.40,
    change: -8.10,
    pChange: -0.48,
    open: 1695.00,
    high: 1698.80,
    low: 1675.20,
    close: 1690.50,
    volume: 12450800,
    high52: 1794.00,
    low52: 1363.45,
    marketCapCr: 1280000,
    peRatio: 18.6,
    dividendYield: 1.16,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    exchange: 'NSE',
    sector: 'Information Technology',
    lastPrice: 1895.10,
    change: 28.50,
    pChange: 1.53,
    open: 1870.00,
    high: 1905.00,
    low: 1866.30,
    close: 1866.60,
    volume: 6410200,
    high52: 1991.45,
    low52: 1358.35,
    marketCapCr: 786000,
    peRatio: 29.4,
    dividendYield: 2.43,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    lastPrice: 1245.90,
    change: 5.60,
    pChange: 0.45,
    open: 1242.00,
    high: 1253.40,
    low: 1238.10,
    close: 1240.30,
    volume: 8940100,
    high52: 1332.95,
    low52: 913.00,
    marketCapCr: 875000,
    peRatio: 17.5,
    dividendYield: 0.81,
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd',
    exchange: 'NSE',
    sector: 'Automobile',
    lastPrice: 918.25,
    change: -12.40,
    pChange: -1.33,
    open: 932.00,
    high: 936.50,
    low: 914.00,
    close: 930.65,
    volume: 9812400,
    high52: 1179.05,
    low52: 621.75,
    marketCapCr: 338000,
    peRatio: 10.4,
    dividendYield: 0.65,
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    sector: 'Public Banking',
    lastPrice: 798.50,
    change: 3.20,
    pChange: 0.40,
    open: 796.00,
    high: 804.80,
    low: 792.10,
    close: 795.30,
    volume: 14102000,
    high52: 912.10,
    low52: 555.25,
    marketCapCr: 712000,
    peRatio: 11.2,
    dividendYield: 1.72,
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd',
    exchange: 'NSE',
    sector: 'Telecommunications',
    lastPrice: 1690.30,
    change: 14.80,
    pChange: 0.88,
    open: 1680.00,
    high: 1699.50,
    low: 1672.00,
    close: 1675.50,
    volume: 4210900,
    high52: 1779.00,
    low52: 902.00,
    marketCapCr: 960000,
    peRatio: 82.5,
    dividendYield: 0.47,
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd',
    exchange: 'NSE',
    sector: 'FMCG & Conglomerate',
    lastPrice: 478.10,
    change: 1.90,
    pChange: 0.40,
    open: 476.50,
    high: 480.90,
    low: 475.20,
    close: 476.20,
    volume: 8500200,
    high52: 528.55,
    low52: 399.30,
    marketCapCr: 598000,
    peRatio: 28.1,
    dividendYield: 2.87,
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    sector: 'Infrastructure & Capital Goods',
    lastPrice: 3512.00,
    change: -22.50,
    pChange: -0.64,
    open: 3540.00,
    high: 3555.00,
    low: 3498.00,
    close: 3534.50,
    volume: 1980400,
    high52: 3919.90,
    low52: 2862.00,
    marketCapCr: 483000,
    peRatio: 33.7,
    dividendYield: 0.97,
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd',
    exchange: 'NSE',
    sector: 'Non-Banking Financial',
    lastPrice: 6850.00,
    change: 45.00,
    pChange: 0.66,
    open: 6810.00,
    high: 6890.00,
    low: 6790.00,
    close: 6805.00,
    volume: 1120000,
    high52: 7850.00,
    low52: 6365.00,
    marketCapCr: 424000,
    peRatio: 28.9,
    dividendYield: 0.53,
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd',
    exchange: 'NSE',
    sector: 'Automobile',
    lastPrice: 11980.00,
    change: -75.00,
    pChange: -0.62,
    open: 12050.00,
    high: 12100.00,
    low: 11920.00,
    close: 12055.00,
    volume: 450100,
    high52: 13680.00,
    low52: 9550.00,
    marketCapCr: 376000,
    peRatio: 26.2,
    dividendYield: 1.04,
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd',
    exchange: 'NSE',
    sector: 'Pharmaceuticals',
    lastPrice: 1820.50,
    change: 12.30,
    pChange: 0.68,
    open: 1810.00,
    high: 1832.00,
    low: 1805.00,
    close: 1808.20,
    volume: 2100400,
    high52: 1960.00,
    low52: 1080.00,
    marketCapCr: 436000,
    peRatio: 37.1,
    dividendYield: 0.74,
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd',
    exchange: 'NSE',
    sector: 'Consumer Discretionary',
    lastPrice: 3410.00,
    change: -18.00,
    pChange: -0.52,
    open: 3435.00,
    high: 3450.00,
    low: 3390.00,
    close: 3428.00,
    volume: 980000,
    high52: 3886.95,
    low52: 3055.00,
    marketCapCr: 302000,
    peRatio: 84.5,
    dividendYield: 0.32,
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd',
    exchange: 'BSE',
    sector: 'Metals & Mining',
    lastPrice: 148.80,
    change: 1.45,
    pChange: 0.98,
    open: 147.50,
    high: 149.60,
    low: 146.80,
    close: 147.35,
    volume: 28500000,
    high52: 184.60,
    low52: 118.00,
    marketCapCr: 185000,
    peRatio: 42.1,
    dividendYield: 2.42,
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Ltd',
    exchange: 'BSE',
    sector: 'Information Technology',
    lastPrice: 532.40,
    change: 4.80,
    pChange: 0.91,
    open: 528.00,
    high: 536.00,
    low: 526.50,
    close: 527.60,
    volume: 6200000,
    high52: 580.00,
    low52: 375.00,
    marketCapCr: 278000,
    peRatio: 24.8,
    dividendYield: 0.19,
  }
];

// Generates consistent, realistic historical OHLCV data for charting and backtesting
export function generateCandlesForSymbol(symbol: string, days = 90): Candle[] {
  const instrument = MASTER_INSTRUMENTS.find(i => i.symbol === symbol) || MASTER_INSTRUMENTS[4]; // Default RELIANCE
  const basePrice = instrument.lastPrice;
  const candles: Candle[] = [];
  
  // Seed random deterministically from symbol chars
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed = (seed << 5) - seed + symbol.charCodeAt(i);
  }
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const now = new Date();
  let currentPrice = basePrice * (0.85 + pseudoRandom() * 0.1); // Start ~90 days ago

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Skip weekends for stock market
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const volatility = 0.015; // 1.5% daily volatility
    const trend = (basePrice - currentPrice) / (i + 10) * 0.2; // Slight drift towards current price
    const dailyChange = (pseudoRandom() - 0.48) * volatility * currentPrice + trend;
    
    const open = Math.round(currentPrice * 100) / 100;
    const close = Math.round((currentPrice + dailyChange) * 100) / 100;
    const high = Math.round(Math.max(open, close) * (1 + pseudoRandom() * 0.012) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - pseudoRandom() * 0.012) * 100) / 100;
    const volume = Math.floor(100000 + pseudoRandom() * 2000000);

    candles.push({
      time: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  // Ensure last candle matches instrument's current stats
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = instrument.lastPrice;
    last.high = Math.max(last.high, instrument.high);
    last.low = Math.min(last.low, instrument.low);
  }

  return candles;
}

// Indicator calculation utilities
export function calculateSMA(data: number[], period: number): (number | null)[] {
  return data.map((val, idx) => {
    if (idx < period - 1) return null;
    const slice = data.slice(idx - period + 1, idx + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return Math.round((sum / period) * 100) / 100;
  });
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let prevEMA: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const slice = data.slice(0, period);
      prevEMA = slice.reduce((a, b) => a + b, 0) / period;
      result.push(Math.round(prevEMA * 100) / 100);
    } else if (prevEMA !== null) {
      prevEMA = data[i] * k + prevEMA * (1 - k);
      result.push(Math.round(prevEMA * 100) / 100);
    }
  }
  return result;
}

export function calculateRSI(data: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }
    const diff = data[i] - data[i - 1];
    if (i <= period) {
      if (diff >= 0) gains += diff;
      else losses -= diff;

      if (i === period) {
        let avgGain = gains / period;
        let avgLoss = losses / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result.push(Math.round((100 - (100 / (1 + rs))) * 100) / 100);
      } else {
        result.push(null);
      }
    } else {
      const prevRsi = result[i - 1];
      if (prevRsi === null) {
        result.push(null);
        continue;
      }
      const curGain = diff > 0 ? diff : 0;
      const curLoss = diff < 0 ? -diff : 0;
      gains = (gains * (period - 1) + curGain) / period;
      losses = (losses * (period - 1) + curLoss) / period;
      const rs = losses === 0 ? 100 : gains / losses;
      result.push(Math.round((100 - (100 / (1 + rs))) * 100) / 100);
    }
  }
  return result;
}

export function calculateBollingerBands(data: number[], period = 20, multiplier = 2) {
  const sma = calculateSMA(data, period);
  return data.map((val, idx) => {
    const mean = sma[idx];
    if (mean === null) return { upper: null, middle: null, lower: null };
    const slice = data.slice(idx - period + 1, idx + 1);
    const variance = slice.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    return {
      upper: Math.round((mean + multiplier * stdDev) * 100) / 100,
      middle: mean,
      lower: Math.round((mean - multiplier * stdDev) * 100) / 100,
    };
  });
}
