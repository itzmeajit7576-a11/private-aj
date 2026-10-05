import React from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { RiskSeverity } from "../types/threat";

interface ThreatBadgeProps {
  severity: RiskSeverity | string;
  threatType?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({
  severity,
  threatType,
  size = "md",
  showIcon = true,
}) => {
  const normalized = severity?.toLowerCase() || "safe";

  let colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let icon = <ShieldCheck className="w-3.5 h-3.5" />;
  let label = threatType || "SAFE";

  if (normalized === "critical" || normalized === "critical risk") {
    colorClasses = "bg-red-500/10 text-red-400 border-red-500/30 glow-red animate-pulse";
    icon = <AlertOctagon className="w-3.5 h-3.5" />;
    label = threatType || "CRITICAL RISK";
  } else if (normalized === "high" || normalized === "high risk") {
    colorClasses = "bg-orange-500/10 text-orange-400 border-orange-500/30 glow-amber";
    icon = <ShieldAlert className="w-3.5 h-3.5" />;
    label = threatType || "HIGH RISK";
  } else if (normalized === "suspicious" || normalized === "medium") {
    colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    icon = <AlertTriangle className="w-3.5 h-3.5" />;
    label = threatType || "SUSPICIOUS";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium tracking-wide",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wider",
    lg: "px-3.5 py-1.5 text-sm font-bold tracking-wider",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase backdrop-blur-sm ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
