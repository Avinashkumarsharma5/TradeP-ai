import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  UserCheck, 
  FileText, 
  Clock, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          Security, Authentication & Audit Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-side access control, session boundaries, and immutable audit logs
        </p>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Session Status</span>
            <span className="text-sm font-bold text-white">Paper Trader (Local)</span>
            <span className="text-[10px] text-emerald-400 font-semibold block">Full Terminal Access</span>
          </div>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Gemini API Key</span>
            <span className="text-sm font-bold text-white">Server Environment</span>
            <span className="text-[10px] text-slate-400 block">Secured in backend secrets</span>
          </div>
        </div>

        <div className="bg-[#0d1527] border border-slate-800 rounded-xl p-4 shadow-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Broker Isolation</span>
            <span className="text-sm font-bold text-emerald-400">Protected</span>
            <span className="text-[10px] text-slate-400 block">0% real broker exposure</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#0d1527] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Security & Transaction Audit Trail ({logs.length})
          </h2>
          <button
            onClick={fetchLogs}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title="Refresh Audit Trail"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No audit records yet.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono-num">
              <thead className="bg-[#080d19] text-slate-400 border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-4">Details</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-4 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 font-bold text-emerald-400">{log.action}</td>
                    <td className="py-2 px-4 text-slate-200 font-sans">{log.details}</td>
                    <td className="py-2 px-3 text-slate-400">{log.actor}</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{log.ip}</td>
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
