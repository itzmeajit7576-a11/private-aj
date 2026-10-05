import React from "react";
import { 
  ShieldAlert, 
  Globe, 
  FileText, 
  Paperclip, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  Fingerprint, 
  HelpCircle 
} from "lucide-react";
import { ThreatFinding } from "../types/threat";
import { ThreatBadge } from "./ThreatBadge";

interface ThreatFindingCardProps {
  finding: ThreatFinding;
}

export const ThreatFindingCard: React.FC<ThreatFindingCardProps> = ({ finding }) => {
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("sender") || cat.includes("authentication")) return <Fingerprint className="w-5 h-5 text-cyan-400" />;
    if (cat.includes("url") || cat.includes("link")) return <Globe className="w-5 h-5 text-cyan-400" />;
    if (cat.includes("content") || cat.includes("urgency")) return <FileText className="w-5 h-5 text-cyan-400" />;
    if (cat.includes("attachment")) return <Paperclip className="w-5 h-5 text-cyan-400" />;
    if (cat.includes("impersonation") || cat.includes("brand")) return <UserX className="w-5 h-5 text-cyan-400" />;
    return <AlertTriangle className="w-5 h-5 text-cyan-400" />;
  };

  const isCritical = finding.severity?.toLowerCase() === "critical";
  const isHigh = finding.severity?.toLowerCase() === "high";
  const isSafe = finding.severity?.toLowerCase() === "safe";

  const cardBorder = isCritical
    ? "border-red-500/30 hover:border-red-500/50 bg-red-950/10"
    : isHigh
    ? "border-orange-500/30 hover:border-orange-500/50 bg-orange-950/10"
    : isSafe
    ? "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-950/10"
    : "border-amber-500/30 hover:border-amber-500/50 bg-amber-950/10";

  return (
    <div
      className={`rounded-xl border backdrop-blur-md p-5 transition-all duration-300 hover:shadow-lg ${cardBorder}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
            {getCategoryIcon(finding.category)}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
              {finding.category}
            </span>
            <h4 className="font-semibold text-sm sm:text-base text-slate-100">
              {finding.title}
            </h4>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <ThreatBadge severity={finding.severity} size="sm" />
          <span className="text-[10px] font-mono text-slate-400">
            Conf: <span className="text-slate-200 font-semibold">{finding.confidenceScore}%</span>
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
        {finding.explanation}
      </p>

      {finding.evidence && finding.evidence.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Detected Evidence / Technical Indicators:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {finding.evidence.map((item, idx) => (
              <span
                key={idx}
                className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40 border border-slate-800 text-cyan-200/90 max-w-full break-all"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
