import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  ChevronRight,
  ExternalLink 
} from 'lucide-react';
import { ToastMessage } from '../../context/TradingContext';

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const duration = toast.duration !== undefined ? toast.duration : 5000;
  const isPersistent = duration === 0 || duration === Infinity;

  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isPersistent) return;

    const intervalTime = 50;
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        remainingTimeRef.current -= intervalTime;
        const pct = Math.max(0, (remainingTimeRef.current / duration) * 100);
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          clearInterval(timerRef.current);
          onRemove(toast.id);
        }
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duration, isPaused, isPersistent, onRemove, toast.id]);

  const handleMouseEnter = () => {
    if (!isPersistent) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (!isPersistent) setIsPaused(false);
  };

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';

  const typeConfig = {
    success: {
      border: 'border-emerald-500/40 hover:border-emerald-500/60',
      bg: 'bg-[#091816]/95',
      badgeBg: 'bg-emerald-500/20 text-emerald-400',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />,
      progressBar: 'bg-emerald-500',
      accent: 'text-emerald-300',
    },
    error: {
      border: 'border-rose-500/40 hover:border-rose-500/60',
      bg: 'bg-[#1e0a12]/95',
      badgeBg: 'bg-rose-500/20 text-rose-400',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />,
      progressBar: 'bg-rose-500',
      accent: 'text-rose-300',
    },
    warning: {
      border: 'border-amber-500/40 hover:border-amber-500/60',
      bg: 'bg-[#221504]/95',
      badgeBg: 'bg-amber-500/20 text-amber-400',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />,
      progressBar: 'bg-amber-500',
      accent: 'text-amber-300',
    },
    info: {
      border: 'border-sky-500/40 hover:border-sky-500/60',
      bg: 'bg-[#0a1424]/95',
      badgeBg: 'bg-sky-500/20 text-sky-400',
      icon: <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />,
      progressBar: 'bg-sky-500',
      accent: 'text-sky-300',
    },
  }[toast.type] || {
    border: 'border-slate-700',
    bg: 'bg-[#0d1527]/95',
    badgeBg: 'bg-slate-800 text-slate-300',
    icon: <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />,
    progressBar: 'bg-slate-500',
    accent: 'text-slate-300',
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto rounded-xl border ${typeConfig.border} ${typeConfig.bg} shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-200 transform translate-y-0 select-none animate-in fade-in slide-in-from-right-4`}
    >
      <div className="p-3.5 flex items-start justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {typeConfig.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <strong className="font-bold text-white text-[13px] tracking-wide truncate">
                {toast.title}
              </strong>
              {isPersistent && (
                <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-400 uppercase">
                  Persistent
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed text-xs break-words">
              {toast.message}
            </p>

            {/* Optional Action Button */}
            {toast.action && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    onRemove(toast.id);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>{toast.action.label}</span>
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                </button>
                <span className="text-[10px] text-slate-500 font-mono">
                  {toast.timestamp || ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {toast.dismissible !== false && (
          <button
            onClick={() => onRemove(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/50 transition-colors flex-shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Lifespan Progress Bar */}
      {!isPersistent && (
        <div className="w-full h-1 bg-slate-800/60 overflow-hidden">
          <div
            className={`h-full ${typeConfig.progressBar} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
}> = ({ toasts, onRemove, onClearAll }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none select-none">
      {toasts.length > 3 && onClearAll && (
        <div className="flex justify-end pr-1 pointer-events-auto">
          <button
            onClick={onClearAll}
            className="text-[10px] text-slate-400 hover:text-white bg-[#0d1527]/90 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-full transition-colors shadow-md"
          >
            Clear All Notifications ({toasts.length})
          </button>
        </div>
      )}

      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
