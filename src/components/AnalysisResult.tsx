import React, { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Printer, 
  FileJson, 
  Share2, 
  ArrowLeft, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  ListChecks, 
  ExternalLink,
  Layers,
  FileText,
  Globe,
  Fingerprint,
  Cloud,
  HardDrive
} from "lucide-react";
import { EmailAnalysis } from "../types/threat";
import { RiskScore } from "./RiskScore";
import { ThreatFindingCard } from "./ThreatFindingCard";
import { URLTable } from "./URLTable";
import { HeaderAnalysisView } from "./HeaderAnalysisView";

interface AnalysisResultProps {
  analysis: EmailAnalysis;
  onReset?: () => void;
  onViewPrintReport?: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  analysis,
  onReset,
  onViewPrintReport,
}) => {
  const [activeTab, setActiveTab] = useState<"findings" | "urls" | "headers" | "recommendations" | "storage">("findings");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `threat-report-${analysis.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice("JSON report exported successfully.");
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrint = () => {
    if (onViewPrintReport) {
      onViewPrintReport();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Analyzer</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Threat Analysis Report
              </h2>
              {analysis.isDemoMode ? (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Demo Analysis
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3.8 Flash AI
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Scan ID: <span className="text-slate-300">{analysis.id}</span> • Analyzed on{" "}
              {new Date(analysis.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {analysis.storageInfo && (
            <a
              href={analysis.storageInfo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Download raw file from Firebase Storage bucket"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Storage .EML</span>
            </a>
          )}

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print / PDF Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono animate-in fade-in">
          {exportNotice}
        </div>
      )}

      {/* Hero Assessment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle glowing radial background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Column 1: Animated Circular Risk Gauge */}
        <div className="flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-800">
          <RiskScore
            score={analysis.riskScore}
            confidence={analysis.confidence}
            threatType={analysis.threatType}
            size="xl"
            showDetails={true}
          />
        </div>

        {/* Column 2 & 3: Threat Summary & Quick Telemetry */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-5">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold mb-1 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Executive Security Verdict
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
              {analysis.summary}
            </h3>

            {/* Email Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Subject</span>
                <span className="text-slate-200 font-sans font-medium truncate block">
                  {analysis.subject}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Originating Sender</span>
                <span className="text-slate-200 truncate block">{analysis.sender}</span>
              </div>
            </div>
          </div>

          {/* Section 9: "Why Was This Email Flagged?" */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold mb-1.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Why Was This Email Flagged?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {analysis.aiExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("findings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-semibold transition-all border-b-2 ${
            activeTab === "findings"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Threat Findings ({analysis.findings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("urls")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-semibold transition-all border-b-2 ${
            activeTab === "urls"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>URL Analysis ({analysis.urls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("headers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-semibold transition-all border-b-2 ${
            activeTab === "headers"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Headers & Auth (SPF/DKIM/DMARC)</span>
        </button>

        <button
          onClick={() => setActiveTab("recommendations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-semibold transition-all border-b-2 ${
            activeTab === "recommendations"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>Recommended Remediation</span>
        </button>

        <button
          onClick={() => setActiveTab("storage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-mono text-xs font-semibold transition-all border-b-2 ${
            activeTab === "storage"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Firebase Storage {analysis.storageInfo ? "✓" : ""}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "findings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
              Diagnostic Breakdown & Security Indicators
            </h3>
            <span className="text-xs text-slate-400">
              {analysis.findings.length} Anomalies Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.findings.map((finding, idx) => (
              <ThreatFindingCard key={idx} finding={finding} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "urls" && (
        <div className="space-y-4">
          <URLTable urls={analysis.urls} />
        </div>
      )}

      {activeTab === "headers" && (
        <HeaderAnalysisView
          headers={analysis.headers}
          authentication={analysis.authentication}
        />
      )}

      {activeTab === "recommendations" && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Incident Response & Recommended Actions
            </h3>
          </div>

          <div className="space-y-3">
            {analysis.recommendations.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-slate-800/80"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {action}
                </div>
              </div>
            ))}
          </div>

          {analysis.riskScore > 60 && (
            <div className="mt-6 p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                  Automated SOC Quarantine Recommendation
                </h4>
                <p className="text-xs text-slate-300">
                  Because this email surpasses the 60/100 threshold, it has been flagged for tenant-wide administrative block. Consider blocking domain <span className="font-mono text-white font-bold">{analysis.senderAnalysis?.domain || analysis.sender}</span> in Exchange Online / Google Workspace Admin console.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "storage" && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Firebase Storage Repository</h3>
                <p className="text-xs text-slate-400 font-mono">Bucket: helpful-envoy-14mm2.firebasestorage.app (Production Mode)</p>
              </div>
            </div>
            {analysis.storageInfo && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Archived in Bucket
              </span>
            )}
          </div>

          {analysis.storageInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Storage Bucket</span>
                  <span className="text-cyan-300 font-bold block truncate">{analysis.storageInfo.storageBucket}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Original File Name</span>
                  <span className="text-slate-200 block truncate">{analysis.storageInfo.fileName}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Firebase Object Path</span>
                  <span className="text-slate-300 block truncate">{analysis.storageInfo.storagePath}</span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Archive Timestamp</span>
                  <span className="text-slate-300 block">{new Date(analysis.storageInfo.uploadedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Raw .EML Forensics Artifact</span>
                  <span className="text-[11px] text-slate-400 font-mono">Download exact byte-for-byte message artifact from Firebase Storage</span>
                </div>

                <a
                  href={analysis.storageInfo.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download From Firebase Storage</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 font-mono text-xs space-y-2">
              <Cloud className="w-8 h-8 text-slate-600 mx-auto opacity-75" />
              <p>No remote Firebase Storage artifact was attached during this scan session.</p>
              <p className="text-slate-500 text-[11px]">When submitting a new file in the Email Analyzer, ensure "Auto-Archive to Storage" is enabled.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
