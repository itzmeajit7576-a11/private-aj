import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Shield, Radio, Terminal, Cpu } from "lucide-react";

interface AnalysisProgressProps {
  onComplete?: () => void;
}

const SCAN_STEPS = [
  { id: 1, label: "Parsing Email Envelope & Headers...", detail: "Extracting MIME parts, message IDs, and relay routes" },
  { id: 2, label: "Extracting Features & NLP Patterns...", detail: "Scanning textual sentiment, urgency cues, and exfiltration vectors" },
  { id: 3, label: "Checking URLs & Sandboxing Domains...", detail: "Evaluating domain age, typosquatting, and blacklist reputation" },
  { id: 4, label: "Analyzing Sender & Cryptographic Signatures...", detail: "Verifying SPF, DKIM, and DMARC alignment protocols" },
  { id: 5, label: "Running AI Threat Detection Engine...", detail: "Executing neural analysis via Google Gemini security model" },
  { id: 6, label: "Generating Risk Assessment & Report...", detail: "Synthesizing severity score, finding breakdown, and remediation rules" },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 650);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 glow-cyan relative overflow-hidden">
      {/* Top glowing scanning laser bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line" />

      {/* Cyber header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wide flex items-center gap-2">
              Deep Security Telemetry Scan
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">Neural heuristics inspection in progress</p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-lg font-bold text-cyan-400">{progressPercent}%</span>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {SCAN_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                isCurrent
                  ? "bg-cyan-500/10 border border-cyan-500/30 glow-cyan/40"
                  : isDone
                  ? "bg-slate-800/30 border border-slate-800"
                  : "opacity-40"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono text-slate-500">
                    {step.id}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs font-medium font-mono ${
                      isCurrent
                        ? "text-cyan-300 font-bold"
                        : isDone
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Console simulated stream */}
      <div className="mt-6 p-3 rounded-lg bg-black/60 border border-slate-800/80 font-mono text-[11px] text-slate-400 flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span className="text-slate-500">$</span>
        <span className="text-cyan-400/90 truncate">
          inspect_mime --stream=rfc822 --ai-model=gemini-3.8-flash --verify-crypto=true
        </span>
      </div>
    </div>
  );
};
