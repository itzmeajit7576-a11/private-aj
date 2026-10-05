import React, { useEffect, useState } from "react";
import { Shield, ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";

interface RiskScoreProps {
  score: number;
  confidence?: number;
  threatType?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showDetails?: boolean;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  confidence = 92,
  threatType = "Unknown",
  size = "lg",
  showDetails = true,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const steps = 40;
    const stepTime = duration / steps;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Determine status & color scheme based on 0-100 range
  let status = "SAFE";
  let statusColor = "text-emerald-400";
  let circleStroke = "#10b981";
  let bgGlow = "shadow-[0_0_50px_rgba(16,185,129,0.2)]";
  let borderGlow = "border-emerald-500/30";
  let StatusIcon = ShieldCheck;
  let statusPillBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  if (score >= 81) {
    status = "CRITICAL RISK";
    statusColor = "text-red-400";
    circleStroke = "#ef4444";
    bgGlow = "shadow-[0_0_50px_rgba(239,68,68,0.35)]";
    borderGlow = "border-red-500/40";
    StatusIcon = ShieldAlert;
    statusPillBg = "bg-red-500/15 text-red-400 border-red-500/40 glow-red animate-pulse";
  } else if (score >= 61) {
    status = "HIGH RISK";
    statusColor = "text-orange-400";
    circleStroke = "#f97316";
    bgGlow = "shadow-[0_0_40px_rgba(249,115,22,0.25)]";
    borderGlow = "border-orange-500/30";
    StatusIcon = AlertTriangle;
    statusPillBg = "bg-orange-500/15 text-orange-400 border-orange-500/40";
  } else if (score >= 31) {
    status = "SUSPICIOUS";
    statusColor = "text-amber-400";
    circleStroke = "#f59e0b";
    bgGlow = "shadow-[0_0_35px_rgba(245,158,11,0.2)]";
    borderGlow = "border-amber-500/30";
    StatusIcon = AlertTriangle;
    statusPillBg = "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }

  // Circular SVG metrics
  const radius = size === "xl" ? 82 : size === "lg" ? 64 : size === "md" ? 44 : 32;
  const strokeWidth = size === "xl" ? 10 : size === "lg" ? 8 : size === "md" ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2 + 10;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className={`relative flex items-center justify-center rounded-full p-2 ${bgGlow} transition-all duration-700`}>
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90 transition-all duration-500"
        >
          {/* Background track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active score ring */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={circleStroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold mb-0.5">
            Risk Score
          </span>
          <div className="flex items-baseline">
            <span
              className={`font-mono font-extrabold tracking-tight ${
                size === "xl" ? "text-5xl" : size === "lg" ? "text-4xl" : "text-2xl"
              } ${statusColor}`}
            >
              {animatedScore}
            </span>
            <span className="font-mono text-sm text-slate-500 font-medium ml-1">/100</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Confidence {confidence}%
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusPillBg}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{status}</span>
          </div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <span>Threat Classification:</span>
            <span className="text-slate-200 font-semibold">{threatType}</span>
          </div>
        </div>
      )}
    </div>
  );
};
