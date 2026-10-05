import React from "react";
import { Shield, Cpu, Lock, CheckCircle2, Server, Eye, FileText } from "lucide-react";

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>System Architecture & Threat Methodology</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          About AI Email Threat Detection
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          Designed as an enterprise-grade cybersecurity platform that bridges modern large language model (LLM) reasoning with strict cryptographic protocol verification.
        </p>
      </div>

      {/* Philosophy Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-2">Neural Threat Reasoning</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Legacy Secure Email Gateways (SEGs) rely primarily on static regex rules and outdated reputation lists. Attackers evade these by using freshly registered lookalike domains, zero-hour phishing kits, and targeted executive impersonation.
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Our platform deploys Google Gemini neural reasoning to evaluate psychological urgency, linguistic coercion, executive hierarchy abuse, and social engineering context.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base mb-2">Strict Cryptographic Validation</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI analysis is grounded in RFC 822 / RFC 7208 / RFC 6376 / RFC 7489 cryptographic standards:
          </p>
          <ul className="text-xs text-slate-400 mt-2 space-y-1.5 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>SPF (Sender Policy Framework)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>DKIM (DomainKeys Identified Mail)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>DMARC (Domain-based Message Authentication)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety & Sandbox Rules */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          Sandboxing & Safe Handling Standards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Defanged URLs</span>
            <p className="text-slate-400">
              All parsed links are rendered non-clickable (e.g. hxxps://domain[.]com) to prevent accidental execution by security staff.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Server-Side Secrets</span>
            <p className="text-slate-400">
              API tokens and threat intelligence database credentials reside exclusively in server environments and are never shipped to clients.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">No Geolocation Telemetry</span>
            <p className="text-slate-400">
              In accordance with privacy and application constraints, zero browser geolocation APIs or tracking sensors are deployed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
