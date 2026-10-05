import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, Terminal, Key, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { HeaderData, AuthenticationStatus } from "../types/threat";

interface HeaderAnalysisViewProps {
  headers: HeaderData;
  authentication: AuthenticationStatus;
}

export const HeaderAnalysisView: React.FC<HeaderAnalysisViewProps> = ({
  headers,
  authentication,
}) => {
  const [showFullRaw, setShowFullRaw] = useState(false);

  const renderAuthBadge = (protocol: string, status: "Verified" | "Failed" | "Missing" | "Unknown") => {
    let colorClass = "bg-slate-800 text-slate-400 border-slate-700";
    let Icon = HelpCircle;

    if (status === "Verified") {
      colorClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 glow-emerald";
      Icon = CheckCircle2;
    } else if (status === "Failed") {
      colorClass = "bg-red-500/15 text-red-400 border-red-500/40 glow-red";
      Icon = XCircle;
    } else if (status === "Missing") {
      colorClass = "bg-amber-500/15 text-amber-400 border-amber-500/30";
      Icon = AlertCircle;
    }

    return (
      <div className={`flex items-center justify-between p-3 rounded-xl border ${colorClass}`}>
        <div className="flex items-center gap-2.5">
          <Key className="w-4 h-4 opacity-75" />
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider">{protocol}</div>
            <div className="text-[10px] opacity-80 font-mono">
              {protocol === "SPF" && "Sender Policy Framework"}
              {protocol === "DKIM" && "DomainKeys Identified Mail"}
              {protocol === "DMARC" && "Domain-based Msg Auth"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase">
          <Icon className="w-4 h-4" />
          <span>{status}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Authentication Indicators Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Cryptographic Authentication Indicators
          </h4>
          <span className="text-[11px] font-mono text-slate-400">RFC 7208 / RFC 6376 / RFC 7489</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {renderAuthBadge("SPF", authentication.spf)}
          {renderAuthBadge("DKIM", authentication.dkim)}
          {renderAuthBadge("DMARC", authentication.dmarc)}
        </div>
      </div>

      {/* Extracted RFC 822 Header Fields */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Extracted Message Envelope Headers
        </h4>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded bg-black/40 border border-slate-800/80">
            <span className="text-slate-400 font-semibold sm:col-span-1">From:</span>
            <span className="text-slate-100 sm:col-span-3 break-all">{headers.from || "Not specified"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded bg-black/40 border border-slate-800/80">
            <span className="text-slate-400 font-semibold sm:col-span-1">To:</span>
            <span className="text-slate-200 sm:col-span-3 break-all">{headers.to || "Not specified"}</span>
          </div>

          {headers.replyTo && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded bg-black/40 border border-slate-800/80">
              <span className="text-slate-400 font-semibold sm:col-span-1">Reply-To:</span>
              <span className={`sm:col-span-3 break-all ${headers.replyTo !== headers.from ? "text-amber-400 font-bold" : "text-slate-200"}`}>
                {headers.replyTo}
                {headers.replyTo !== headers.from && " (⚠️ Mismatch with From header)"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded bg-black/40 border border-slate-800/80">
            <span className="text-slate-400 font-semibold sm:col-span-1">Subject:</span>
            <span className="text-slate-100 sm:col-span-3 font-sans font-medium">{headers.subject || "No subject provided"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded bg-black/40 border border-slate-800/80">
            <span className="text-slate-400 font-semibold sm:col-span-1">Date:</span>
            <span className="text-slate-300 sm:col-span-3">{headers.date || "Unknown"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded bg-black/40 border border-slate-800/80">
            <span className="text-slate-400 font-semibold sm:col-span-1">Message-ID:</span>
            <span className="text-slate-400 sm:col-span-3 text-[11px] break-all">{headers.messageId || "Missing"}</span>
          </div>

          {headers.received && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded bg-black/40 border border-slate-800/80">
              <span className="text-slate-400 font-semibold sm:col-span-1">Received Hop:</span>
              <span className="text-slate-400 sm:col-span-3 text-[11px] break-all">{headers.received}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
