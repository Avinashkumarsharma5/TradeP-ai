/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { StockDetailPage } from './pages/StockDetailPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { PaperTradingPage } from './pages/PaperTradingPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { PositionsPage } from './pages/PositionsPage';
import { OrdersPage } from './pages/OrdersPage';
import { TradeHistoryPage } from './pages/TradeHistoryPage';
import { StrategyBuilderPage } from './pages/StrategyBuilderPage';
import { BacktestingPage } from './pages/BacktestingPage';
import { RiskManagementPage } from './pages/RiskManagementPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { HelpDocsPage } from './pages/HelpDocsPage';

import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const PageRenderer: React.FC = () => {
  const { activePage } = useTrading();

  switch (activePage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'markets':
      return <MarketsPage />;
    case 'stock_detail':
      return <StockDetailPage />;
    case 'watchlists':
      return <WatchlistPage />;
    case 'paper_trading':
      return <PaperTradingPage />;
    case 'portfolio':
      return <PortfolioPage />;
    case 'positions':
      return <PositionsPage />;
    case 'orders':
      return <OrdersPage />;
    case 'trades':
      return <TradeHistoryPage />;
    case 'strategies':
      return <StrategyBuilderPage />;
    case 'backtesting':
      return <BacktestingPage />;
    case 'risk':
      return <RiskManagementPage />;
    case 'ai_assistant':
      return <AIAssistantPage />;
    case 'alerts':
      return <AlertsPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'auth':
      return <AuthPage />;
    case 'help_docs':
      return <HelpDocsPage />;
    default:
      return <DashboardPage />;
  }
};

import { ToastContainer } from './components/common/ToastNotification';

export default function App() {
  return (
    <TradingProvider>
      <AppContent />
    </TradingProvider>
  );
}

function AppContent() {
  const { toasts, removeToast, clearToasts } = useTrading();

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Body Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Left Navigation */}
        <Sidebar />

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#080d19] to-[#060913]">
          <PageRenderer />
        </main>
      </div>

      {/* Global Comprehensive Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        onClearAll={clearToasts}
      />
    </div>
  );
}
