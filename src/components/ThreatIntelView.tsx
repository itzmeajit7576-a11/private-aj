import React, { useState } from "react";
import { 
  ShieldAlert, 
  Search, 
  Globe, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Lock,
  Cpu,
  Layers,
  FileCode
} from "lucide-react";
import { lookupThreatIntel } from "../services/api";

export const ThreatIntelView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLookup = async (lookupQuery?: string) => {
    const q = lookupQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await lookupThreatIntel(q.trim());
      setLookupResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to query threat intelligence database");
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "micros0ft-portal-auth.xyz",
    "pay-pal-dispute-resolution.online",
    "dhl-express-tracking24.top",
    "google.com",
    "185.193.64.12",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" />
          <span>Global Threat Intelligence & IOC Vault</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Domain & Indicator Reputation Sandbox
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Query suspicious domains, sender addresses, hostnames, and IP indicators against real-time phishing feed intelligence and DNS telemetry.
        </p>

        {/* Search input */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="Enter suspicious domain, URL, or sender address (e.g. micros0ft-portal-auth.xyz)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-500 text-xs sm:text-sm text-slate-200 outline-none font-mono"
            />
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm font-mono flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            {loading ? "Inspecting..." : "Scan Indicator"}
          </button>
        </div>

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[11px] font-mono text-slate-400">Try sample IOCs:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleLookup(sq);
              }}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* Lookup Result Card */}
      {lookupResult && (
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">Indicator Target</span>
              <h3 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                {lookupResult.query}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Hostility Score</span>
                <span
                  className={`text-xl font-extrabold ${
                    lookupResult.reputationScore > 75
                      ? "text-red-400"
                      : lookupResult.reputationScore > 40
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {lookupResult.reputationScore}/100
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                  lookupResult.status === "Malicious"
                    ? "bg-red-500/20 text-red-400 border-red-500/40 glow-red"
                    : lookupResult.status === "Suspicious"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                }`}
              >
                {lookupResult.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs font-mono">
            <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Registrar</span>
              <span className="text-slate-200 mt-0.5 block truncate">{lookupResult.registrar}</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Autonomous System (ASN)</span>
              <span className="text-slate-200 mt-0.5 block truncate">{lookupResult.asn}</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">First Observed</span>
              <span className="text-slate-200 mt-0.5 block">{lookupResult.firstSeen}</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Activity Status</span>
              <span className="text-slate-200 mt-0.5 block">{lookupResult.lastReported}</span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold mb-1">
              Firewall & Perimeter Enforcement Recommendation:
            </span>
            <p className="text-slate-300 font-sans leading-relaxed">{lookupResult.recommendation}</p>
          </div>
        </div>
      )}

      {/* Threat Feeds & Known Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Attack Campaigns */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Active Phishing Wave Signatures
          </h3>

          <div className="space-y-3">
            {[
              {
                brand: "Microsoft 365 / Entra ID",
                vector: "Password expiration & MFA reset lure",
                tlds: ".xyz, .top, .live",
                severity: "Critical",
              },
              {
                brand: "Executive Wire Transfer (BEC)",
                vector: "Direct deposit change & secret escrow lure",
                tlds: ".co, disposable Gmail/Outlook relays",
                severity: "Critical",
              },
              {
                brand: "DHL & FedEx Logistics",
                vector: "Pending parcel tariff fee / fake invoice",
                tlds: "Raw IP addresses, .download, .click",
                severity: "High",
              },
              {
                brand: "DocuSign Electronic Signature",
                vector: "Suspicious contract view & credential prompt",
                tlds: ".biz, redirected Cloudflare workers",
                severity: "High",
              },
            ].map((camp, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-slate-800 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-100">{camp.brand}</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      camp.severity === "Critical"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    }`}
                  >
                    {camp.severity}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mb-1">{camp.vector}</p>
                <div className="text-[10px] font-mono text-slate-500">Associated TLDs: {camp.tlds}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Authentication Standards Reference */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Cryptographic Defenses Architecture
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-cyan-300 font-mono mb-0.5">SPF (Sender Policy Framework)</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Lists authorized IP addresses permitted to send mail for a domain. Prevents envelope spoofing.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-cyan-300 font-mono mb-0.5">DKIM (DomainKeys Identified Mail)</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Cryptographically signs the message headers and body. Assures tampering has not occurred in transit.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-cyan-300 font-mono mb-0.5">DMARC (Domain-based Auth & Conformance)</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Directs receiving mail exchangers on how to treat messages that fail SPF or DKIM (reject, quarantine, or none).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
            Notice: AI Email Threat Detection flags missing or failed DMARC/SPF as a high multiplier for sender impersonation risk.
          </div>
        </div>
      </div>
    </div>
  );
};
