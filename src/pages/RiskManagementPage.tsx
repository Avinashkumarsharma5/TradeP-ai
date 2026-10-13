import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { api } from '../api/client';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Sliders, 
  Lock, 
  Power, 
  CheckCircle2,
  Info
} from 'lucide-react';

export const RiskManagementPage: React.FC = () => {
  const { riskSettings, refreshAllData, addToast } = useTrading();

  const [maxOrderValue, setMaxOrderValue] = useState<number>(riskSettings?.maxOrderValue || 10000);
  const [maxExposure, setMaxExposure] = useState<number>(riskSettings?.maxExposurePerInstrument || 20000);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(riskSettings?.dailyLossLimit || 5000);
  const [perTradeRisk, setPerTradeRisk] = useState<number>(riskSettings?.perTradeRiskPercent || 2);
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(riskSettings?.killSwitchActive || false);
  const [brokerageFlat, setBrokerageFlat] = useState<number>(riskSettings?.simulatedBrokerageFlat || 20);
  const [slippagePct, setSlippagePct] = useState<number>(riskSettings?.simulatedSlippagePercent || 0.05);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateRiskSettings({
        maxOrderValue,
        maxExposurePerInstrument: maxExposure,
        dailyLossLimit,
        perTradeRiskPercent: perTradeRisk,
        killSwitchActive,
        simulatedBrokerageFlat: brokerageFlat,
        simulatedSlippagePercent: slippagePct,
      });
      addToast('success', 'Risk Parameters Updated', 'Server-side risk rules successfully synced.');
      await refreshAllData();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleKillSwitch = async () => {
    const nextState = !killSwitchActive;
    setKillSwitchActive(nextState);
    try {
      await api.updateRiskSettings({ killSwitchActive: nextState });
      addToast(
        nextState ? 'warning' : 'success',
        nextState ? 'Kill Switch Activated' : 'Trading Resumed',
        nextState ? 'All paper order placements are now blocked on server.' : 'Paper trading unlocked.'
      );
      await refreshAllData();
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Risk Governance & Order Safeguards
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-side capital protection rules, exposure ceilings, and emergency circuit breaker
          </p>
        </div>

        {/* Kill Switch Big Toggle */}
        <button
          onClick={handleToggleKillSwitch}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg ${
            killSwitchActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Power className="w-4 h-4" />
          {killSwitchActive ? 'KILL SWITCH ACTIVE (LOCKED)' : 'Emergency Kill Switch'}
        </button>
      </div>

      {/* Kill Switch Warning Banner if active */}
      {killSwitchActive && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-center gap-3 text-rose-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <strong className="block font-bold">EMERGENCY KILL SWITCH ENGAGED:</strong>
            The server will reject 100% of incoming BUY and SELL orders until the kill switch is deactivated.
          </div>
        </div>
      )}

      {/* Risk Rules Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Exposure Limits */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Capital Exposure Limits
            </h3>

            <div className="space-y-4 text-xs font-mono-num">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Maximum Single Order Value (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={maxOrderValue}
                  onChange={(e) => setMaxOrderValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
                <span className="text-[11px] text-slate-500 font-sans block mt-1">
                  Prevents fat-finger mistakes. Default: ₹10,000.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Maximum Exposure Per Instrument (₹)
                </label>
                <input
                  type="number"
                  step="2000"
                  value={maxExposure}
                  onChange={(e) => setMaxExposure(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
                <span className="text-[11px] text-slate-500 font-sans block mt-1">
                  Limits single stock portfolio concentration. Default: ₹20,000.
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Daily Loss Limit Ceiling (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
                <span className="text-[11px] text-slate-500 font-sans block mt-1">
                  Stops trading if intraday losses exceed threshold. Default: ₹5,000.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Fees & Slippage Simulation */}
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Simulated Execution Parameters
            </h3>

            <div className="space-y-4 text-xs font-mono-num">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Simulated Brokerage Fee (Flat ₹ per Order)
                </label>
                <input
                  type="number"
                  step="5"
                  value={brokerageFlat}
                  onChange={(e) => setBrokerageFlat(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
                <span className="text-[11px] text-slate-500 font-sans block mt-1">
                  Replicates standard discount broker rate (e.g. ₹20 per trade).
                </span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Simulated Market Slippage Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={slippagePct}
                  onChange={(e) => setSlippagePct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
                />
                <span className="text-[11px] text-slate-500 font-sans block mt-1">
                  Models realistic bid-ask bounce and market impact. Default: 0.05%.
                </span>
              </div>

              <div className="p-3 bg-[#080d19] rounded-lg border border-slate-800 text-slate-400 font-sans text-xs">
                <span className="text-emerald-400 font-bold block mb-1">Server Enforcement:</span>
                All limits are evaluated in atomic server transactions before orders execute or virtual cash is debited.
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-md disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Apply Risk Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
