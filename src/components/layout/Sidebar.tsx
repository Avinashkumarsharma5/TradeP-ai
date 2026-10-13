import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { 
  LayoutDashboard, 
  Globe2, 
  LineChart, 
  Bookmark, 
  Terminal, 
  PieChart, 
  Layers, 
  Clock, 
  History, 
  Cpu, 
  FlaskConical, 
  ShieldCheck, 
  Bot, 
  Bell, 
  BarChart3, 
  Settings, 
  Lock, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
  isAi?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, positions, orders } = useTrading();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const activePositionsCount = positions.filter(p => p.quantity > 0).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  const sections: SidebarSection[] = [
    {
      title: 'Trading Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'markets', label: 'Markets (NSE/BSE)', icon: Globe2 },
        { id: 'stock_detail', label: 'Stock Details', icon: LineChart },
        { id: 'watchlists', label: 'Watchlists', icon: Bookmark },
        { id: 'paper_trading', label: 'Paper Trading', icon: Terminal },
      ]
    },
    {
      title: 'Portfolio & History',
      items: [
        { id: 'portfolio', label: 'Portfolio', icon: PieChart },
        { 
          id: 'positions', 
          label: 'Positions', 
          icon: Layers, 
          badge: activePositionsCount > 0 ? activePositionsCount : undefined,
          badgeColor: 'bg-emerald-500/20 text-emerald-400'
        },
        { 
          id: 'orders', 
          label: 'Orders', 
          icon: Clock,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400'
        },
        { id: 'trades', label: 'Trade History', icon: History },
      ]
    },
    {
      title: 'Quantitative & AI',
      items: [
        { id: 'strategies', label: 'Strategy Builder', icon: Cpu },
        { id: 'backtesting', label: 'Backtesting', icon: FlaskConical },
        { id: 'risk', label: 'Risk Management', icon: ShieldCheck },
        { 
          id: 'ai_assistant', 
          label: 'AI Trading Assistant', 
          icon: Bot, 
          isAi: true 
        },
      ]
    },
    {
      title: 'Insights & System',
      items: [
        { id: 'alerts', label: 'Price Alerts', icon: Bell },
        { id: 'analytics', label: 'Analytics & P&L', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'auth', label: 'Security & Access', icon: Lock },
        { id: 'help_docs', label: 'Help & Docs', icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-[#070b16] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 select-none z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-4">
        {sections.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
                {section.title}
              </span>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    
                    {!collapsed && (
                      <span className="flex-1 text-left truncate flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          {item.label}
                          {item.isAi && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 uppercase">
                              AI
                            </span>
                          )}
                        </span>
                        {item.badge !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono-num font-bold ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle & Footer Mode Banner */}
      <div className="p-2 border-t border-slate-800/80 flex flex-col gap-2 bg-[#060912]">
        {!collapsed && (
          <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-400">Simulation Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-slate-400 text-[10px] leading-tight">
              Virtual Capital: ₹1,00,000. Real broker orders disabled.
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
