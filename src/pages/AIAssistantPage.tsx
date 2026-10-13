import React, { useState, useRef, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { api } from '../api/client';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  RefreshCw, 
  ShieldCheck, 
  Trash2,
  Copy,
  Check,
  Cpu,
  ShieldAlert,
  Zap,
  GraduationCap,
  MessageSquare
} from 'lucide-react';

export type AssistantRole = 'quant' | 'risk' | 'trader' | 'mentor';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isAiPowered?: boolean;
  modelUsed?: string;
  role?: AssistantRole;
  timestamp: string;
}

const ROLE_CONFIGS: Record<AssistantRole, {
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  samplePrompts: string[];
}> = {
  quant: {
    title: 'Senior Quant Analyst',
    shortDesc: 'Statistical modeling, backtesting metrics & indicator math',
    icon: Cpu,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    samplePrompts: [
      'Evaluate the 20/50 SMA Golden Cross strategy expectancy on RELIANCE',
      'How does profit factor and Sharpe ratio affect our trading edge?',
      'Calculate optimal position size for a ₹10,000 capital allocation',
      'Explain how Bollinger Band width signals volatility compression',
    ],
  },
  risk: {
    title: 'Risk & Compliance Officer',
    shortDesc: 'Capital preservation, position limits & circuit breakers',
    icon: ShieldAlert,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    samplePrompts: [
      'What are our current single-order and stock exposure ceilings?',
      'How should I manage drawdowns if daily losses approach ₹5,000?',
      'Analyze the risk of holding high single-stock concentration in TCS',
      'How does the Emergency Kill Switch protect virtual capital?',
    ],
  },
  trader: {
    title: 'Technical Swing Trader',
    shortDesc: 'Price action, breakout pivots & candlestick patterns',
    icon: Zap,
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    samplePrompts: [
      'Identify key support and resistance zones for NIFTY 50 today',
      'How do I confirm a breakout using volume expansion?',
      'Where should I place a trailing stop loss on TATAMOTORS?',
      'Explain the difference between a pin bar and an engulfing candle',
    ],
  },
  mentor: {
    title: 'Fintech Educational Mentor',
    shortDesc: 'Clear beginner concepts, order mechanics & accounting',
    icon: GraduationCap,
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    samplePrompts: [
      'What is the difference between Market orders and Limit orders?',
      'How does TRADEAI calculate Total Portfolio Value and P&L?',
      'What are the trading hours and settlement rules for NSE and BSE?',
      'Explain why paper trading is essential before risking real money',
    ],
  },
};

export const AIAssistantPage: React.FC = () => {
  const { portfolio } = useTrading();
  const [selectedRole, setSelectedRole] = useState<AssistantRole>('quant');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Welcome to TRADEAI! I am your Senior Quantitative Analyst.\n\nI have live context on your paper account: ₹${portfolio ? portfolio.availableCash.toLocaleString('en-IN') : '1,00,000'} available virtual cash across Indian stock markets (NSE & BSE).\n\nSelect a specialist persona above or ask any question to start our conversation!`,
      isAiPowered: true,
      modelUsed: 'gemini-3.8-flash',
      role: 'quant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setLoading(true);

    try {
      // Build multi-turn history from previous messages (excluding the newest user message)
      const historyTurns = messages
        .filter(m => m.id !== 'welcome_1') // skip default greeting if desired
        .slice(-8) // keep recent turns for rich context
        .map(m => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          parts: [{ text: m.text }]
        }));

      const res = await api.askAssistant({
        message: prompt,
        history: historyTurns,
        role: selectedRole,
        model: selectedModel,
      });

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        isAiPowered: res.isAiPowered,
        modelUsed: res.modelUsed,
        role: selectedRole,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Error processing request: ${err.message || 'Unable to connect to backend service.'}`,
        role: selectedRole,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearThread = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `New conversation thread initialized with ${ROLE_CONFIGS[selectedRole].title}.\n\nReady to analyze Indian markets, portfolio metrics, and trading strategies. What's on your mind?`,
        isAiPowered: true,
        modelUsed: selectedModel,
        role: selectedRole,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeRoleConfig = ROLE_CONFIGS[selectedRole];

  return (
    <div className="flex flex-col gap-4 p-6 max-w-6xl mx-auto h-[calc(100vh-5rem)]">
      {/* Top Header & Persona Selector Bar */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-lg flex-shrink-0 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-[#080d19] border border-slate-800 flex items-center justify-center ${activeRoleConfig.color} shadow-md`}>
              <activeRoleConfig.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  Gemini Trading Copilot
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeRoleConfig.badgeBg}`}>
                  {activeRoleConfig.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {activeRoleConfig.shortDesc}
              </p>
            </div>
          </div>

          {/* Model Selector & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#080d19] p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase px-1.5">Model:</span>
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2 py-1 rounded font-mono text-[11px] font-semibold transition-colors ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                gemini-3.8-flash
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2 py-1 rounded font-mono text-[11px] font-semibold transition-colors ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                gemini-3.1-flash-lite
              </button>
            </div>

            <button
              onClick={handleClearThread}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Clear Thread & Start Fresh"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
          {(['quant', 'risk', 'trader', 'mentor'] as const).map(roleKey => {
            const cfg = ROLE_CONFIGS[roleKey];
            const Icon = cfg.icon;
            const isSelected = selectedRole === roleKey;

            return (
              <button
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? `${cfg.badgeBg} shadow-sm font-bold`
                    : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                <span className="text-xs truncate">{cfg.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-xl overflow-y-auto flex flex-col gap-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const roleCfg = msg.role ? ROLE_CONFIGS[msg.role] : activeRoleConfig;
          const RoleIcon = roleCfg.icon;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isUser
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'bg-[#080d19] border border-slate-800 text-emerald-400 shadow-md'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <RoleIcon className={`w-4 h-4 ${roleCfg.color}`} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                isUser
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-[#080d19] border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {/* Header for assistant messages */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                      <RoleIcon className={`w-3.5 h-3.5 ${roleCfg.color}`} />
                      {roleCfg.title}
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Footer metadata */}
                <div className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[10px] ${
                  isUser ? 'border-emerald-500/40 text-emerald-200' : 'border-slate-800/80 text-slate-500'
                }`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.modelUsed && (
                    <span className="font-mono text-slate-400 font-medium">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#080d19] border border-slate-800 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#080d19] border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Analyzing market context with {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Multi-turn Questions for Active Persona */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider whitespace-nowrap pl-1">
          Suggestions:
        </span>
        {activeRoleConfig.samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-lg bg-[#0d1527] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            {p}
          </button>
        ))}
      </div>

      {/* Input Composer Box */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-2.5 flex items-center gap-2 flex-shrink-0 shadow-lg">
        <input
          type="text"
          placeholder={`Ask ${activeRoleConfig.title} about Indian stocks, strategies, or risk...`}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || loading}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
