import { GoogleGenAI } from '@google/genai';
import { TradingEngine } from './tradingEngine.js';
import { MASTER_INSTRUMENTS } from '../data/instruments.js';
import { storage } from './storage.js';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export type AssistantRole = 'quant' | 'risk' | 'trader' | 'mentor';

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface AssistantChatRequest {
  message: string;
  history?: ChatHistoryTurn[];
  role?: AssistantRole;
  model?: string;
}

export interface AssistantChatResponse {
  reply: string;
  isAiPowered: boolean;
  modelUsed: string;
  role: AssistantRole;
  contextData?: {
    portfolioSummary?: any;
    referencedInstruments?: string[];
  };
  disclaimer: string;
}

const ROLE_SYSTEM_INSTRUCTIONS: Record<AssistantRole, string> = {
  quant: `You are TRADEAI's Senior Quantitative Analyst specializing in Indian equities (NSE & BSE).
Your role:
- Analyze algorithmic indicators (SMA, EMA, RSI, MACD, Bollinger Bands) and statistical expectancy.
- Evaluate backtest results, Sharpe ratios, maximum drawdowns, and profit factors with mathematical rigor.
- Formulate testable systematic trading hypotheses.
- Ground all comments strictly on verified data without fabricating stock prices.
- Always quote prices in Indian Rupees (₹).
- Remind users that all orders in TRADEAI are simulated paper executions. Never guarantee returns.`,

  risk: `You are TRADEAI's Chief Risk Officer.
Your role:
- Emphasize capital preservation, position sizing, and risk-to-reward ratios.
- Actively review and enforce server risk rules: Max single order value (₹10,000), Max instrument exposure (₹20,000), and Daily loss limit (₹5,000).
- Warn users about over-leveraging, revenge trading, and single-stock portfolio concentration.
- Remind users that all executions in TRADEAI are paper trading simulations.`,

  trader: `You are a seasoned Indian Equity Swing Trader.
Your role:
- Focus on price action, candlestick chart patterns, volume surges, breakout levels, and support/resistance pivots.
- Help traders plan high-probability entry triggers, trailing stop-losses, and profit-taking targets on NSE/BSE stocks.
- Discuss market sentiment, intraday volatility, and sector rotations.
- Remind users that all trades are paper simulations. Never promise profits.`,

  mentor: `You are a patient, encouraging Fintech Educational Mentor.
Your role:
- Teach stock market fundamentals, order mechanics (Market vs. Limit orders), and paper portfolio accounting in clear, accessible language.
- Explain technical indicators from first principles.
- Demystify trading terminology and foster disciplined trading psychology.
- Remind users that all trades are paper simulations.`
};

export class GeminiAssistantService {
  public static async chat(req: AssistantChatRequest): Promise<AssistantChatResponse> {
    const ai = getGenAI();
    const query = req.message.trim();
    const role: AssistantRole = req.role || 'quant';
    const chosenModel = req.model || 'gemini-3.8-flash';

    // Prepare live context from our trading engine
    const portfolio = TradingEngine.calculatePortfolio();
    const state = storage.getState();
    const openPositions = Object.values(state.positions).filter(p => p.quantity > 0);

    // Extract any mentioned symbols
    const mentionedSymbols = MASTER_INSTRUMENTS
      .filter(i => query.toUpperCase().includes(i.symbol))
      .map(i => `${i.symbol} (${i.exchange}): ₹${i.lastPrice} (${i.pChange > 0 ? '+' : ''}${i.pChange}%)`)
      .slice(0, 5);

    const contextSummary = `
[LIVE TERMINAL CONTEXT - NSE/BSE]:
• Available Virtual Cash: ₹${portfolio.availableCash.toLocaleString('en-IN')} | Total Value: ₹${portfolio.totalPortfolioValue.toLocaleString('en-IN')}
• Net P&L: ₹${portfolio.totalPnL.toLocaleString('en-IN')} (${portfolio.totalReturnPercent}%)
• Open Holdings: ${openPositions.length === 0 ? 'None' : openPositions.map(p => `${p.quantity} shares of ${p.symbol} @ avg ₹${p.averagePrice}`).join(', ')}
• Risk Limits: Max order ₹${state.riskSettings.maxOrderValue}, Max exposure ₹${state.riskSettings.maxExposurePerInstrument}, Kill Switch: ${state.riskSettings.killSwitchActive ? 'ACTIVE' : 'INACTIVE'}
• Active Indian Instruments: ${mentionedSymbols.join(' | ') || 'NIFTY 50: ₹24,852.30 (+0.58%), SENSEX: 81,381.36 (+0.61%)'}
    `.trim();

    const disclaimer = 'TRADEAI Assistant provides educational insights and paper portfolio analysis only. Never guarantees profit or constitutes SEBI-registered financial advice.';

    // If Gemini API is available, invoke multi-turn generation
    if (ai) {
      try {
        const systemInstruction = `${ROLE_SYSTEM_INSTRUCTIONS[role]}\n\n${contextSummary}`;

        // Format multi-turn conversation history
        const contentsPayload: any[] = [];
        if (req.history && req.history.length > 0) {
          req.history.forEach(turn => {
            contentsPayload.push({
              role: turn.role,
              parts: turn.parts.map(p => ({ text: p.text }))
            });
          });
        }
        contentsPayload.push({
          role: 'user',
          parts: [{ text: query }]
        });

        const response = await ai.models.generateContent({
          model: chosenModel,
          contents: contentsPayload,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const replyText = response.text || 'Unable to generate response from Gemini API.';

        return {
          reply: replyText,
          isAiPowered: true,
          modelUsed: chosenModel,
          role,
          contextData: {
            portfolioSummary: portfolio,
            referencedInstruments: mentionedSymbols,
          },
          disclaimer,
        };
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local quantitative response:', err?.message);
      }
    }

    // High quality role-based fallback when Gemini API key is not yet set
    const fallbackReply = this.generateRoleFallback(query, role, portfolio, openPositions, state.riskSettings, chosenModel);

    return {
      reply: fallbackReply,
      isAiPowered: false,
      modelUsed: `${chosenModel} (quantitative fallback)`,
      role,
      contextData: {
        portfolioSummary: portfolio,
        referencedInstruments: mentionedSymbols,
      },
      disclaimer,
    };
  }

  private static generateRoleFallback(
    query: string,
    role: AssistantRole,
    portfolio: any,
    openPositions: any[],
    risk: any,
    chosenModel: string
  ): string {
    const q = query.toLowerCase();

    if (role === 'risk') {
      return `🛡️ **Chief Risk Officer Analysis:**\n\n` +
        `• **Capital Exposure:** You have ₹${portfolio.availableCash.toLocaleString('en-IN')} available cash with ₹${portfolio.investedValue.toLocaleString('en-IN')} deployed across ${openPositions.length} active position(s).\n` +
        `• **Server Risk Thresholds:** Single order ceiling is ₹${risk.maxOrderValue.toLocaleString('en-IN')}; per-instrument exposure is capped at ₹${risk.maxExposurePerInstrument.toLocaleString('en-IN')}.\n` +
        `• **Drawdown Rule:** Daily loss limit is currently set to ₹${risk.dailyLossLimit.toLocaleString('en-IN')}.\n` +
        `• **Circuit Breaker:** Kill Switch status is ${risk.killSwitchActive ? '🔴 ENGAGED (Orders Blocked)' : '🟢 Disengaged (Normal)'}.\n\n` +
        `*Advisory:* Always ensure position size does not exceed 10-20% of total capital to survive market drawdowns.`;
    }

    if (role === 'trader') {
      return `⚡ **Technical Swing Trader Perspective:**\n\n` +
        `• **Market Pulse:** NIFTY 50 holds above 24,800 psychological support, and SENSEX trades near 81,380.\n` +
        `• **Active Setups:** Look for price confirmation on heavyweights like RELIANCE (₹2,742) and TCS (₹4,125) on the 1D chart.\n` +
        `• **Execution Rule:** Use Limit orders near support or breakout levels, and place stop-losses beyond recent swing lows to manage risk.\n\n` +
        `*Paper Simulation:* Test order execution directly in the Paper Trading terminal to practice timing and entries.`;
    }

    if (role === 'mentor') {
      return `🎓 **Fintech Educational Mentor:**\n\n` +
        `• **Portfolio Mechanics:** Your account started with ₹1,00,000. Current total value is ₹${portfolio.totalPortfolioValue.toLocaleString('en-IN')}.\n` +
        `• **Order Types:** Market orders fill immediately at best available price; Limit orders only execute if price reaches your specified target.\n` +
        `• **Fees & STT:** In this simulation, each trade incurs flat ₹20 brokerage and 0.1% STT to replicate real Indian broker conditions.\n\n` +
        `*Tip:* Ask me anything about candlestick terms, indicators, or order execution!`;
    }

    // Default 'quant'
    return `📊 **Senior Quantitative Analyst Report:**\n\n` +
      `• **Portfolio Metrics:** Total Value ₹${portfolio.totalPortfolioValue.toLocaleString('en-IN')} (Net Return: ${portfolio.totalReturnPercent}%).\n` +
      `• **Indicator Guidance:** For trend-following setups, backtest the 20/50 SMA Golden Cross. For mean-reversion, test RSI(14) < 30 on high-liquidity NIFTY stocks.\n` +
      `• **Transaction Costs:** Slippage (0.05%) and flat ₹20 brokerage are factored into backtests to avoid unrealistic paper returns.\n\n` +
      `*System Note:* To activate live ${chosenModel} reasoning, configure GEMINI_API_KEY in Settings > Secrets.`;
  }
}
