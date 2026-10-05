import React, { useState } from "react";
import { Globe, ShieldAlert, ShieldCheck, AlertTriangle, Copy, Check, ExternalLink, Shield } from "lucide-react";
import { URLFinding } from "../types/threat";

interface URLTableProps {
  urls: URLFinding[];
}

// Defang URL for safe cybersecurity display (prevent accidental clicks)
function defangUrl(url: string): string {
  return url
    .replace(/^https?:\/\//i, (match) => (match.toLowerCase().startsWith("https") ? "hxxps://" : "hxxp://"))
    .replace(/\./g, "[.]");
}

export const URLTable: React.FC<URLTableProps> = ({ urls }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!urls || urls.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center">
        <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
        <h4 className="text-sm font-semibold text-slate-200">No Hyperlinks Detected</h4>
        <p className="text-xs text-slate-400 mt-1">
          This message does not contain embedded URLs, reducing link-based attack vectors.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
      {/* Header notice */}
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Extracted Hyperlinks Sandbox ({urls.length})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>URLs defanged for safe analysis (non-clickable)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Domain / Destination</th>
              <th className="py-3 px-4">Protocol</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Suspicious Patterns & Reason</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {urls.map((item, idx) => {
              const defanged = defangUrl(item.url);
              const isMalicious = item.status === "Malicious" || item.riskScore > 75;
              const isSuspicious = item.status === "Suspicious" || (item.riskScore > 30 && item.riskScore <= 75);

              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    isMalicious
                      ? "bg-red-950/15 hover:bg-red-950/25"
                      : isSuspicious
                      ? "bg-amber-950/10 hover:bg-amber-950/20"
                      : "hover:bg-slate-800/40"
                  }`}
                >
                  {/* Domain & Defanged URL */}
                  <td className="py-3 px-4 max-w-[240px]">
                    <div className="font-bold text-slate-100 truncate">{item.domain}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5" title={defanged}>
                      {defanged}
                    </div>
                  </td>

                  {/* Protocol */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.protocol.includes("HTTP (Insecure)")
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.protocol}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {isMalicious ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        MALICIOUS
                      </span>
                    ) : isSuspicious ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        SUSPICIOUS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        SAFE
                      </span>
                    )}
                  </td>

                  {/* Risk Score */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isMalicious
                              ? "bg-red-500"
                              : isSuspicious
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${item.riskScore}%` }}
                        />
                      </div>
                      <span
                        className={`font-bold ${
                          isMalicious
                            ? "text-red-400"
                            : isSuspicious
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {item.riskScore}/100
                      </span>
                    </div>
                  </td>

                  {/* Detection Reason */}
                  <td className="py-3 px-4 max-w-[280px]">
                    <div className="text-[11px] text-slate-300 line-clamp-2">
                      {item.detectionReason}
                    </div>
                    {item.suspiciousPatterns && item.suspiciousPatterns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.suspiciousPatterns.map((pat, pidx) => (
                          <span
                            key={pidx}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {pat}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleCopy(defanged, idx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
                      title="Copy defanged URL safely"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
