import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Terminal, 
  Send, 
  AlertCircle, 
  Sparkles, 
  Check, 
  RotateCcw,
  Zap,
  ShieldCheck,
  FileCode,
  ShieldAlert,
  Cloud,
  CheckCircle2,
  Lock,
  Loader2
} from "lucide-react";
import { SAMPLE_EMAILS } from "../services/sampleData";
import { analyzeEmailPayload, saveAnalysisToHistory } from "../services/api";
import { uploadEmailFileToStorage, StorageUploadResult } from "../services/firebase";
import { EmailAnalysis, User } from "../types/threat";
import { AnalysisProgress } from "./AnalysisProgress";

interface EmailAnalyzerProps {
  onAnalysisComplete: (result: EmailAnalysis) => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
}

export const EmailAnalyzer: React.FC<EmailAnalyzerProps> = ({ 
  onAnalysisComplete,
  currentUser,
  onOpenAuth
}) => {
  const [activeMode, setActiveMode] = useState<"paste" | "upload">("paste");
  const [rawEmail, setRawEmail] = useState("");
  const [senderInput, setSenderInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [inputTab, setInputTab] = useState<"raw" | "fields">("raw");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  const [archiveToFirebase, setArchiveToFirebase] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [storageStatusText, setStorageStatusText] = useState<string | null>(null);
  const [storageErrorNotice, setStorageErrorNotice] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size limit: 10 MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    setStorageErrorNotice(null);

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg("File size exceeds 10MB limit. Please upload a smaller email file.");
      return;
    }

    const isEmlOrTxt = file.name.endsWith(".eml") || file.name.endsWith(".txt") || file.name.endsWith(".msg") || file.type.includes("text") || file.type.includes("message");
    if (!isEmlOrTxt) {
      setErrorMsg("Invalid file format. Please upload an .eml or .txt email file.");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || content.trim().length === 0) {
        setErrorMsg("Uploaded email file appears empty.");
        return;
      }

      setRawEmail(content);
      setUploadedFileName(file.name);
      setUploadedFileSize((file.size / 1024).toFixed(1) + " KB");
      setActiveMode("upload");
    };

    reader.onerror = () => {
      setErrorMsg("Failed to read email file.");
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (sample: typeof SAMPLE_EMAILS[0]) => {
    setErrorMsg(null);
    setStorageErrorNotice(null);
    setRawEmail(sample.rawEml);
    setSenderInput(sample.sender);
    setSubjectInput(sample.subject);
    setBodyInput(sample.rawEml.split("\n\n")[1] || sample.rawEml);
    setUploadedFileName(`${sample.id}.eml`);
    setUploadedFileSize("1.4 KB");

    // Also generate a simulated File for the sample so it can be uploaded to Firebase Storage
    try {
      const sampleBlob = new Blob([sample.rawEml], { type: "message/rfc822" });
      const sampleFile = new File([sampleBlob], `${sample.id}.eml`, { type: "message/rfc822" });
      setSelectedFile(sampleFile);
    } catch {}
  };

  const handleStartAnalysis = async () => {
    setErrorMsg(null);
    setStorageErrorNotice(null);
    setStorageStatusText(null);

    let payload: {
      rawEmail?: string;
      senderInput?: string;
      subjectInput?: string;
      bodyInput?: string;
    } = {};

    if (activeMode === "upload") {
      if (!rawEmail.trim()) {
        setErrorMsg("Please upload a valid .eml file first or switch to paste mode.");
        return;
      }
      payload = { rawEmail };
    } else {
      if (inputTab === "raw") {
        if (!rawEmail.trim() || rawEmail.trim().length < 10) {
          setErrorMsg("Please paste the email content (headers, subject, or message body) to analyze.");
          return;
        }
        payload = { rawEmail };
      } else {
        if (!bodyInput.trim() && !subjectInput.trim()) {
          setErrorMsg("Please provide at least a subject or body for the email.");
          return;
        }
        payload = {
          senderInput: senderInput.trim(),
          subjectInput: subjectInput.trim(),
          bodyInput: bodyInput.trim(),
        };
      }
    }

    setIsScanning(true);

    try {
      // 1. Firebase Storage Upload Task (if enabled)
      let storageResult: StorageUploadResult | null = null;
      let fileToUpload = selectedFile;

      if (!fileToUpload && rawEmail.trim() && archiveToFirebase) {
        // Create an .eml File object from raw text if user pasted
        try {
          const generatedName = (subjectInput ? subjectInput.slice(0, 25).replace(/[^a-zA-Z0-9]/g, "_") : "email_submission") + ".eml";
          const blob = new Blob([rawEmail], { type: "message/rfc822" });
          fileToUpload = new File([blob], generatedName, { type: "message/rfc822" });
        } catch {}
      }

      if (fileToUpload && archiveToFirebase) {
        try {
          setStorageStatusText("Archiving to Firebase Storage bucket...");
          storageResult = await uploadEmailFileToStorage(
            fileToUpload,
            currentUser,
            (pct) => setUploadProgress(pct)
          );
          setStorageStatusText(`Stored in Firebase: ${storageResult.storagePath}`);
        } catch (storageErr: any) {
          console.warn("Firebase Storage upload note:", storageErr);
          setStorageErrorNotice(storageErr.message || "Could not upload to Firebase Storage.");
        }
      }

      // 2. Deep Threat Analysis
      const [analysisResult] = await Promise.all([
        analyzeEmailPayload(payload),
        new Promise((resolve) => setTimeout(resolve, 2200)), // scan step experience
      ]);

      // Attach Firebase Storage info if uploaded
      if (storageResult) {
        analysisResult.storageInfo = storageResult;
        saveAnalysisToHistory(analysisResult);
      }

      setIsScanning(false);
      onAnalysisComplete(analysisResult);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg(err.message || "Threat analysis failed. Please try again.");
    }
  };

  if (isScanning) {
    return <AnalysisProgress />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Quick Sample Selector */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-900/50 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Load Quick Threat Test Cases</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">1-Click Preset Demos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SAMPLE_EMAILS.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSample(s)}
              className="text-left p-2.5 rounded-lg bg-black/40 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                  {s.label}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    s.riskLevel === "Critical"
                      ? "bg-red-500/20 text-red-300"
                      : s.riskLevel === "High Risk"
                      ? "bg-orange-500/20 text-orange-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {s.tag}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate font-mono">{s.subject}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analyzer Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative">
        {/* Top Firebase Cloud Storage Indicator Bar */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cloud className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Firebase Storage Integration:</span>
            <span className="text-[11px] text-slate-400 truncate max-w-[260px] sm:max-w-none">
              helpful-envoy-14mm2.firebasestorage.app
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-slate-300 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={archiveToFirebase}
                onChange={(e) => setArchiveToFirebase(e.target.checked)}
                className="rounded bg-black/60 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Auto-Archive to Storage</span>
            </label>

            {!currentUser && onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
              >
                Sign in to verify
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveMode("paste")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeMode === "paste"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 glow-cyan/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Option 1: Paste Email Content</span>
          </button>

          <button
            onClick={() => setActiveMode("upload")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeMode === "upload"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 glow-cyan/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Option 2: Upload .EML File (Firebase Storage)</span>
          </button>
        </div>

        {/* Option 1: Paste Email */}
        {activeMode === "paste" && (
          <div className="space-y-4">
            {/* Sub-tabs: Raw paste vs Structured Fields */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputTab("raw")}
                  className={`text-xs font-mono px-3 py-1 rounded-md border ${
                    inputTab === "raw"
                      ? "bg-slate-800 text-cyan-300 border-cyan-500/30"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  Raw Email (Headers + Body)
                </button>
                <button
                  onClick={() => setInputTab("fields")}
                  className={`text-xs font-mono px-3 py-1 rounded-md border ${
                    inputTab === "fields"
                      ? "bg-slate-800 text-cyan-300 border-cyan-500/30"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  Custom Form Fields
                </button>
              </div>

              <button
                onClick={() => {
                  setRawEmail("");
                  setSenderInput("");
                  setSubjectInput("");
                  setBodyInput("");
                  setSelectedFile(null);
                  setUploadedFileName(null);
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>

            {inputTab === "raw" ? (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">
                  Paste complete email headers, body text, or full RFC 822 raw message:
                </label>
                <textarea
                  value={rawEmail}
                  onChange={(e) => setRawEmail(e.target.value)}
                  placeholder={`From: "HR Payroll" <notifications@secure-pay-portal.xyz>\nSubject: Immediate Direct Deposit Re-Verification Required\nDate: Mon, 05 Oct 2026\n\nPlease confirm your bank details at https://secure-pay-portal.xyz/verify ...`}
                  className="w-full h-64 p-4 rounded-xl bg-black/60 border border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 font-mono text-xs text-slate-200 placeholder:text-slate-600 resize-y leading-relaxed outline-none transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">From / Sender Address</label>
                  <input
                    type="text"
                    value={senderInput}
                    onChange={(e) => setSenderInput(e.target.value)}
                    placeholder="e.g. support@service-notification.xyz"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500/60 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    placeholder="e.g. URGENT: Account Suspension Notice"
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500/60 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Message Body & Links</label>
                  <textarea
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    rows={6}
                    placeholder="Paste the message content, body paragraphs, and links..."
                    className="w-full p-3 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500/60 text-slate-200 outline-none resize-y"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Option 2: Upload Email */}
        {activeMode === "upload" && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".eml,.txt,.msg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-cyan-400 bg-cyan-500/10 glow-cyan"
                  : "border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800/30"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7" />
              </div>

              <h4 className="text-base sm:text-lg font-semibold text-white mb-1">
                Drag & Drop Email File Here
              </h4>
              <p className="text-xs text-slate-400 mb-2">
                Supports standard RFC 822 format: <span className="font-mono text-cyan-300">.eml</span>,{" "}
                <span className="font-mono text-cyan-300">.txt</span> files (Max 10MB)
              </p>
              <p className="text-[11px] text-cyan-400 font-mono mb-4 flex items-center justify-center gap-1">
                <Cloud className="w-3.5 h-3.5" />
                <span>Files are archived to Firebase Storage bucket</span>
              </p>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono border border-slate-600 transition-colors"
              >
                Browse Files
              </button>
            </div>

            {uploadedFileName && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-cyan-500/30 font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-slate-100 font-semibold block">{uploadedFileName}</span>
                    <span className="text-slate-400 text-[10px]">{uploadedFileSize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-[11px] font-semibold flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Firebase Storage Ready</span>
                  </span>
                  <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Parsed
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Storage Notice / Warning if applicable */}
        {storageErrorNotice && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>Storage note: {storageErrorNotice}</span>
            </div>
            {!currentUser && onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        )}

        {/* Error message display */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Analyze Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Defanged Sandboxing • Firebase Storage Archive</span>
          </div>

          <button
            onClick={handleStartAnalysis}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Analyze & Archive to Storage</span>
          </button>
        </div>
      </div>
    </div>
  );
};
