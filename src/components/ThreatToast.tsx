import React, { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  ExternalLink,
  Flame,
  Radio
} from "lucide-react";
import { ThreatNotification, notificationService } from "../services/notificationService";

interface ThreatToastProps {
  toast: ThreatNotification;
  onDismiss: (id: string) => void;
  onInvestigate: (notification: ThreatNotification) => void;
}

export const ThreatToastItem: React.FC<ThreatToastProps> = ({
  toast,
  onDismiss,
  onInvestigate,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const DURATION = 6500; // 6.5s auto dismiss

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const step = (interval / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, toast.id, onDismiss]);

  const isCritical = toast.riskScore >= 81 || toast.severity === "Critical";

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-96 max-w-[calc(100vw-2rem)] rounded-2xl border backdrop-blur-xl p-4 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 ${
        isCritical
          ? "bg-slate-950/90 border-red-500/50 glow-red"
          : "bg-slate-950/90 border-orange-500/50 glow-amber"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl flex items-center justify-center ${
              isCritical
                ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                : "bg-orange-500/20 text-orange-400 border border-orange-500/40"
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isCritical
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-orange-500/20 text-orange-300 border-orange-500/40"
                }`}
              >
                {isCritical ? "CRITICAL RISK DETECTED" : "HIGH-RISK THREAT"}
              </span>

              <span className="font-mono text-xs font-bold text-white">
                {toast.riskScore}/100
              </span>
            </div>

            <h4 className="text-xs font-bold text-slate-100 truncate max-w-[190px] mt-0.5">
              {toast.threatType}
            </h4>
          </div>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subject and Sender */}
      <div className="text-xs space-y-0.5 font-mono mb-3 bg-black/40 p-2.5 rounded-xl border border-slate-800/80">
        <div className="text-slate-200 font-sans font-medium text-xs line-clamp-1">
          {toast.subject}
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          From: <span className="text-slate-300">{toast.sender}</span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>Live SOC Stream</span>
        </span>

        <button
          onClick={() => onInvestigate(toast)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isCritical
              ? "bg-red-500 hover:bg-red-400 text-slate-950 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              : "bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          }`}
        >
          <span>Investigate Threat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/60 rounded-b-2xl overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${
            isCritical ? "bg-red-500" : "bg-orange-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ThreatToastContainer: React.FC<{
  onSelectThreat: (notification: ThreatNotification) => void;
}> = ({ onSelectThreat }) => {
  const [activeToasts, setActiveToasts] = useState<ThreatNotification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToast((newToast) => {
      setActiveToasts((prev) => {
        // Prevent duplicate toasts
        if (prev.some((t) => t.id === newToast.id)) return prev;
        return [newToast, ...prev].slice(0, 3); // Max 3 toasts at a time
      });
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleInvestigate = (notification: ThreatNotification) => {
    notificationService.markAsRead(notification.id);
    handleDismiss(notification.id);
    onSelectThreat(notification);
  };

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 pointer-events-auto">
      {activeToasts.map((toast) => (
        <ThreatToastItem
          key={toast.id}
          toast={toast}
          onDismiss={handleDismiss}
          onInvestigate={handleInvestigate}
        />
      ))}
    </div>
  );
};
