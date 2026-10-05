import React from "react";
import { 
  X, 
  Printer, 
  Download, 
  FileJson, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  Fingerprint,
  Globe,
  ListChecks,
  Check
} from "lucide-react";
import { EmailAnalysis } from "../types/threat";

interface ReportViewerModalProps {
  analysis: EmailAnalysis | null;
  onClose: () => void;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ analysis, onClose }) => {
  if (!analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `forensic-report-${analysis.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar (hidden during browser print) */}
        <div className="no-print flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              AUDIT REPORT
            </span>
            <h3 className="font-bold text-sm sm:text-base text-white">
              Official Cybersecurity Forensic Evaluation
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <FileJson className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-sans text-slate-200 print:text-black print:bg-white print:p-0">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="text-xl font-extrabold text-cyan-400 uppercase tracking-tight flex items-center gap-2">
                <span>AI Email Threat Detection</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Automated Heuristic & Neural Threat Defense Platform • Model: {analysis.modelUsed}
              </p>
            </div>

            <div className="text-right font-mono text-xs">
              <div>Report ID: <span className="font-bold text-slate-100">{analysis.id}</span></div>
              <div className="text-slate-400">Timestamp: {new Date(analysis.timestamp).toUTCString()}</div>
            </div>
          </div>

          {/* Verdict Box */}
          <div className="p-5 rounded-xl border border-slate-800 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                OVERALL RISK LEVEL
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-2xl font-black font-mono tracking-tight ${
                    analysis.riskScore > 80
                      ? "text-red-400"
                      : analysis.riskScore > 60
                      ? "text-orange-400"
                      : analysis.riskScore > 30
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {analysis.riskScore} / 100
                </span>
                <span className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  {analysis.severity} • {analysis.threatType}
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-slate-400 block">AI Model Confidence</span>
              <span className="text-base font-bold text-cyan-400">{analysis.confidence}%</span>
            </div>
          </div>

          {/* Email Info */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              1. Email Specification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono p-3 rounded-lg bg-black/30 border border-slate-800">
              <div><span className="text-slate-500">Subject:</span> <span className="text-slate-200 font-sans">{analysis.subject}</span></div>
              <div><span className="text-slate-500">From:</span> <span className="text-slate-200">{analysis.sender}</span></div>
              <div><span className="text-slate-500">Reply-To:</span> <span className="text-slate-200">{analysis.headers.replyTo || "Identical"}</span></div>
              <div><span className="text-slate-500">Date:</span> <span className="text-slate-200">{analysis.headers.date}</span></div>
              {analysis.storageInfo && (
                <div className="sm:col-span-2 text-cyan-300">
                  <span className="text-slate-500">Firebase Storage:</span> {analysis.storageInfo.storageBucket}/{analysis.storageInfo.storagePath}
                </div>
              )}
            </div>
          </div>

          {/* AI Explanation */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              2. Forensic Explanation (Why Was This Flagged?)
            </h4>
            <div className="p-4 rounded-lg bg-black/30 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {analysis.aiExplanation}
            </div>
          </div>

          {/* Threat Indicators & Findings */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              3. Detected Threat Indicators ({analysis.findings.length})
            </h4>
            <div className="space-y-2">
              {analysis.findings.map((f, i) => (
                <div key={i} className="p-3 rounded-lg bg-black/30 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100">{f.title} ({f.category})</span>
                    <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase">{f.severity}</span>
                  </div>
                  <p className="text-slate-300 mb-1">{f.explanation}</p>
                  {f.evidence && f.evidence.length > 0 && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Evidence: {f.evidence.join(" • ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* URLs */}
          {analysis.urls.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
                4. Hyperlink Threat Analysis ({analysis.urls.length})
              </h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
                {analysis.urls.map((u, i) => (
                  <div key={i} className="p-2.5 bg-black/30 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200">{u.domain}</span>
                      <span className="text-[11px] text-slate-400 block">{u.detectionReason}</span>
                    </div>
                    <span className="text-xs font-bold text-red-400">{u.status} ({u.riskScore}/100)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authentication & Cryptography */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              5. Envelope Cryptography & Sender Domain
            </h4>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded bg-black/30 border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">SPF</span>
                <span className="font-bold text-slate-200">{analysis.authentication.spf}</span>
              </div>
              <div className="p-2.5 rounded bg-black/30 border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">DKIM</span>
                <span className="font-bold text-slate-200">{analysis.authentication.dkim}</span>
              </div>
              <div className="p-2.5 rounded bg-black/30 border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">DMARC</span>
                <span className="font-bold text-slate-200">{analysis.authentication.dmarc}</span>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
              6. Security Action Plan
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 p-3 rounded-lg bg-black/30 border border-slate-800">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
