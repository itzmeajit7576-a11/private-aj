import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  AlertTriangle, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  ArrowUpRight, 
  ArrowRight, 
  Activity,
  Layers,
  Sparkles,
  Radio,
  Zap,
  Bell
} from "lucide-react";
import { HistoryItem, User } from "../types/threat";
import { ThreatBadge } from "./ThreatBadge";
import { NotificationCenter } from "./NotificationCenter";
import { notificationService, ThreatNotification } from "../services/notificationService";

interface DashboardViewProps {
  history: HistoryItem[];
  onSelectEmail: (item: HistoryItem) => void;
  onNavigateToAnalyzer: () => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  history,
  onSelectEmail,
  onNavigateToAnalyzer,
  currentUser,
  onOpenAuth,
}) => {
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  // Trigger initial toast alert for recent high-risk threats across history
  useEffect(() => {
    const highRiskItems = history.filter((h) => h.riskScore >= 61);
    if (highRiskItems.length > 0) {
      // Trigger toast for the latest high-risk threat detected
      const timer = setTimeout(() => {
        notificationService.addNotificationFromHistory(highRiskItems[0], true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [history]);

  // Aggregated Metrics
  const baseAnalyzed = 1284;
  const baseThreats = 247;
  const baseSafe = 937;
  const baseHighRisk = 100;

  // Add dynamically saved scans to base
  const totalAnalyzed = baseAnalyzed + history.length - 4; // adjusted for initial 4
  const detectedThreats = baseThreats + history.filter(h => h.riskScore > 30).length - 3;
  const safeEmails = baseSafe + history.filter(h => h.riskScore <= 30).length - 1;
  const highRiskEmails = baseHighRisk + history.filter(h => h.riskScore >= 61).length - 3;

  // Trend data for last 7 days
  const trendData = [
    { day: "Sep 29", count: 142, threats: 28 },
    { day: "Sep 30", count: 189, threats: 34 },
    { day: "Oct 01", count: 215, threats: 41 },
    { day: "Oct 02", count: 198, threats: 32 },
    { day: "Oct 03", count: 165, threats: 25 },
    { day: "Oct 04", count: 220, threats: 48 },
    { day: "Oct 05 (Today)", count: 245, threats: 53 },
  ];

  // Threat Type Distribution
  const typeDistribution = [
    { type: "Phishing (Cred Theft)", count: 112, percent: 45, color: "#ef4444" },
    { type: "BEC / CEO Impersonation", count: 58, percent: 23, color: "#f97316" },
    { type: "Malicious URLs", count: 42, percent: 17, color: "#eab308" },
    { type: "Fraud / Scam", count: 24, percent: 10, color: "#06b6d4" },
    { type: "Spam / Unsolicited", count: 11, percent: 5, color: "#8b5cf6" },
  ];

  // Risk Score Distribution (Histogram)
  const riskBuckets = [
    { label: "0-20 Safe", count: 712, height: "85%", color: "bg-emerald-500" },
    { label: "21-40 Low", count: 225, height: "45%", color: "bg-emerald-400" },
    { label: "41-60 Medium", count: 147, height: "35%", color: "bg-amber-500" },
    { label: "61-80 High", count: 100, height: "25%", color: "bg-orange-500" },
    { label: "81-100 Critical", count: 100, height: "25%", color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 backdrop-blur-xl glow-cyan/20">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 font-semibold tracking-widest uppercase mb-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Cyber Threat Intelligence Dashboard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>Welcome back, {currentUser?.name || "Security Analyst"}</span>
            {currentUser && (
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {currentUser.email}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {currentUser 
              ? `Signed in as ${currentUser.role}. All inbound relays operating under active AI heuristics inspection.`
              : "Real-time mailbox telemetry monitoring. All inbound relays operating under active AI heuristics inspection."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <NotificationCenter
            history={history}
            onSelectThreat={(n) =>
              onSelectEmail({
                id: n.threatId,
                date: n.timestamp,
                subject: n.subject,
                sender: n.sender,
                threatType: n.threatType,
                riskScore: n.riskScore,
                severity: n.severity,
                analysis: n.analysis,
              })
            }
          />

          <button
            onClick={() => notificationService.simulateInboundThreat()}
            className="px-3.5 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Simulate inbound high-risk attack and test real-time toast alert"
          >
            <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>Simulate Threat Alert</span>
          </button>

          <button
            onClick={onNavigateToAnalyzer}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Launch Analyzer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyzed */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Emails Analyzed
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-white">{totalAnalyzed.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% from last week</span>
          </div>
        </div>

        {/* Threats Detected */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Threats Detected
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-amber-400">{detectedThreats.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {((detectedThreats / totalAnalyzed) * 100).toFixed(1)}% detection rate
          </div>
        </div>

        {/* Safe Emails */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Safe Emails
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-emerald-400">{safeEmails.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            Verified benign communications
          </div>
        </div>

        {/* High-Risk Emails */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group hover:border-red-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              High-Risk Emails
            </span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-extrabold text-red-400">{highRiskEmails.toLocaleString()}</div>
          <div className="text-[11px] text-red-400 font-mono mt-1">
            Critical BEC & Phishing strikes
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Threat Detection Trend (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Threat Detection 7-Day Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily volume of scanned messages vs intercepted attacks</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                <span className="text-slate-300">Total Scanned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                <span className="text-slate-300">Threats</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Trend Chart */}
          <div className="h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="700" y2="160" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="210" x2="700" y2="210" stroke="#334155" />

              {/* Total Analyzed Area & Line */}
              {/* Coordinates mapped across 7 points */}
              <path
                d="M 50 140 Q 150 110, 250 85 T 450 120 T 550 80 T 650 60 L 650 210 L 50 210 Z"
                fill="url(#cyanGradient)"
              />
              <path
                d="M 50 140 Q 150 110, 250 85 T 450 120 T 550 80 T 650 60"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                className="transition-all"
              />

              {/* Threats Area & Line */}
              <path
                d="M 50 185 Q 150 180, 250 170 T 450 180 T 550 160 T 650 150 L 650 210 L 50 210 Z"
                fill="url(#redGradient)"
              />
              <path
                d="M 50 185 Q 150 180, 250 170 T 450 180 T 550 160 T 650 150"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
              />

              {/* Interactive Data points */}
              {trendData.map((d, i) => {
                const x = 50 + i * 100;
                // rough mapping for visual dots
                const yTotal = 140 - (d.count - 140) * 0.7;
                const yThreat = 190 - (d.threats - 25) * 1.3;

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredTrendIndex(i)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={x}
                      cy={yTotal}
                      r={hoveredTrendIndex === i ? 6 : 4}
                      fill="#06b6d4"
                      className="transition-all"
                    />
                    <circle
                      cx={x}
                      cy={yThreat}
                      r={hoveredTrendIndex === i ? 6 : 3.5}
                      fill="#ef4444"
                      className="transition-all"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredTrendIndex !== null && (
              <div
                className="absolute -top-4 p-2 rounded-lg bg-black/90 border border-cyan-500/40 text-xs font-mono shadow-xl pointer-events-none transition-all"
                style={{ left: `${(hoveredTrendIndex / 6) * 80 + 5}%` }}
              >
                <div className="font-bold text-white">{trendData[hoveredTrendIndex].day}</div>
                <div className="text-cyan-400">Total Scanned: {trendData[hoveredTrendIndex].count}</div>
                <div className="text-red-400">Threats: {trendData[hoveredTrendIndex].threats}</div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-6">
            {trendData.map((d, i) => (
              <span key={i}>{d.day.split(" ")[0]}</span>
            ))}
          </div>
        </div>

        {/* Chart 2: Threat Type Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Threat Type Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">Breakdown of intercepted attack classes</p>
          </div>

          {/* SVG Donut */}
          <div className="flex justify-center my-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* 5 Slices calculated with stroke-dasharray */}
                <circle cx="50" cy="50" r="40" stroke="#ef4444" strokeWidth="14" fill="none" strokeDasharray="113 251" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" stroke="#f97316" strokeWidth="14" fill="none" strokeDasharray="57 251" strokeDashoffset="-113" />
                <circle cx="50" cy="50" r="40" stroke="#eab308" strokeWidth="14" fill="none" strokeDasharray="42 251" strokeDashoffset="-170" />
                <circle cx="50" cy="50" r="40" stroke="#06b6d4" strokeWidth="14" fill="none" strokeDasharray="25 251" strokeDashoffset="-212" />
                <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="14" fill="none" strokeDasharray="14 251" strokeDashoffset="-237" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xl font-extrabold text-white">247</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Threats</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {typeDistribution.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPieIndex(idx)}
                onMouseLeave={() => setHoveredPieIndex(null)}
                className={`flex items-center justify-between text-xs p-1.5 rounded transition-colors ${
                  hoveredPieIndex === idx ? "bg-slate-800" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-mono text-[11px] truncate max-w-[150px]">
                    {item.type}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-200">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Risk Score Distribution Histogram */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Risk Score Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Statistical breakdown of evaluated email risk scores</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: {totalAnalyzed}</span>
        </div>

        <div className="grid grid-cols-5 gap-3 pt-6 pb-2 items-end h-44">
          {riskBuckets.map((bucket, idx) => (
            <div key={idx} className="flex flex-col items-center h-full justify-end group">
              <span className="font-mono text-xs font-bold text-slate-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {bucket.count}
              </span>
              <div className="w-full max-w-[60px] bg-slate-800/80 rounded-t-lg h-full flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${bucket.color}`}
                  style={{ height: bucket.height }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-2 text-center truncate w-full">
                {bucket.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Evaluated Emails */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Recent Evaluated Threat Stream
          </h3>
          <span className="text-xs text-slate-400 font-mono">Showing {Math.min(history.length, 5)} Latest</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {history.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectEmail(item)}
              className="py-3 px-3 -mx-3 rounded-xl hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ThreatBadge severity={item.severity} size="sm" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-cyan-300 truncate">
                    {item.subject}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 truncate">
                  From: {item.sender} • {item.date}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-white">Score: {item.riskScore}/100</div>
                  <div className="text-[10px] text-slate-400">{item.threatType}</div>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-cyan-400 transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
