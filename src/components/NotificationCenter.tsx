import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  CheckCheck, 
  Trash2, 
  X, 
  ExternalLink, 
  Zap, 
  Radio, 
  AlertOctagon,
  Flame,
  ArrowRight
} from "lucide-react";
import { 
  notificationService, 
  ThreatNotification 
} from "../services/notificationService";
import { HistoryItem } from "../types/threat";

interface NotificationCenterProps {
  history: HistoryItem[];
  onSelectThreat: (notification: ThreatNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  history,
  onSelectThreat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ThreatNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "critical" | "unread">("all");
  const [soundActive, setSoundActive] = useState(notificationService.isSoundEnabled());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize and synchronize with history
  useEffect(() => {
    const notifs = notificationService.getNotifications(history);
    setNotifications(notifs);

    const unsubscribe = notificationService.subscribe((updated) => {
      setNotifications(updated);
    });

    return () => unsubscribe();
  }, [history]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "critical") return n.riskScore >= 81;
    if (filter === "unread") return !n.read;
    return true;
  });

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    notificationService.setSoundEnabled(next);
  };

  const handleSimulateAttack = () => {
    notificationService.simulateInboundThreat();
  };

  const handleItemClick = (n: ThreatNotification) => {
    notificationService.markAsRead(n.id);
    setIsOpen(false);
    onSelectThreat(n);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all cursor-pointer ${
          isOpen
            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
            : unreadCount > 0
            ? "bg-red-950/30 border-red-500/40 text-red-400 hover:border-red-400 glow-red"
            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
        }`}
        title="Real-Time Threat Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:inline font-bold">Threat Alerts</span>

        {unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-slate-950 font-black text-[10px] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-950 border border-cyan-500/30 p-4 shadow-2xl z-50 text-xs font-mono space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                Real-Time Threat Telemetry
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title={soundActive ? "Mute alert chime" : "Enable alert chime"}
              >
                {soundActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex rounded-lg bg-black/60 p-0.5 border border-slate-800">
              <button
                onClick={() => setFilter("all")}
                className={`px-2 py-0.5 rounded-md ${
                  filter === "all" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("critical")}
                className={`px-2 py-0.5 rounded-md ${
                  filter === "critical" ? "bg-red-500/20 text-red-300 font-bold" : "text-slate-400"
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-2 py-0.5 rounded-md ${
                  filter === "unread" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => notificationService.markAllAsRead()}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => notificationService.clearAll()}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
                title="Clear all alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {filteredNotifs.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <ShieldAlert className="w-7 h-7 mx-auto mb-2 opacity-40 text-slate-600" />
                <p>No active threats in this filter.</p>
              </div>
            ) : (
              filteredNotifs.map((item) => {
                const isCrit = item.riskScore >= 81;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                      !item.read
                        ? isCrit
                          ? "bg-red-950/20 border-red-500/40 hover:border-red-400"
                          : "bg-orange-950/20 border-orange-500/40 hover:border-orange-400"
                        : "bg-black/30 border-slate-800/80 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            !item.read ? "bg-red-400 animate-ping" : "bg-slate-600"
                          }`}
                        />
                        <span
                          className={`font-bold truncate max-w-[170px] ${
                            isCrit ? "text-red-300" : "text-orange-300"
                          }`}
                        >
                          {item.threatType}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isCrit
                            ? "bg-red-500/20 text-red-300"
                            : "bg-orange-500/20 text-orange-300"
                        }`}
                      >
                        {item.riskScore}/100
                      </span>
                    </div>

                    <div className="text-slate-200 font-sans text-xs truncate font-medium">
                      {item.subject}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      From: {item.sender}
                    </div>

                    {item.indicators && item.indicators.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.indicators.slice(0, 2).map((ind, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 text-slate-300 border border-slate-800 truncate max-w-[160px]"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action: Simulate Live Threat Alert */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Live SOC Trigger</span>

            <button
              onClick={handleSimulateAttack}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test real-time alert toast & sound"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Simulate Threat Alert</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
