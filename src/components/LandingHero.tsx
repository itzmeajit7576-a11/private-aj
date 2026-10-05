import React from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Send, 
  Play, 
  Sparkles, 
  Cpu, 
  Globe, 
  Lock, 
  Radio, 
  Layers, 
  Fingerprint, 
  ArrowRight,
  AlertTriangle,
  Zap,
  CheckCircle2
} from "lucide-react";

import { User } from "../types/threat";

interface LandingHeroProps {
  onAnalyzeClick: () => void;
  onViewDemoClick: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToIntel: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onAnalyzeClick,
  onViewDemoClick,
  onNavigateToDashboard,
  onNavigateToIntel,
  onOpenAuth,
  currentUser,
}) => {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-md glow-cyan/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                Next-Gen Mailbox Defense Engine
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Detect Email Threats{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                Before They Become Breaches.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              AI-powered email security that analyzes messages, links, senders and suspicious patterns to identify phishing, scams and other cyber threats.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onAnalyzeClick}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Analyze an Email</span>
              </button>

              <button
                onClick={onViewDemoClick}
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-cyan-400" />
                <span>View Demo Analysis</span>
              </button>
            </div>

            {/* Auth Session Status Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono pt-1">
              {currentUser ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authenticated as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})</span>
                </div>
              ) : onOpenAuth ? (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors group cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>Sign in as <strong className="text-cyan-300">itzmeajit7576@gmail.com</strong> or corporate SSO →</span>
                </button>
              ) : null}
            </div>

            {/* Security Indicator Badges */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>AI Detection</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Radio className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Threat Intelligence</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>URL Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Risk Scoring</span>
              </div>
            </div>
          </div>

          {/* Right Column: Futuristic Cyber Radar Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Outer radar frame */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-3xl border border-cyan-500/30 bg-slate-950/70 backdrop-blur-2xl p-6 glow-cyan flex flex-col justify-between overflow-hidden">
              {/* Radar circular sweeps */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-72 h-72 rounded-full border border-cyan-500/20" />
                <div className="w-52 h-52 rounded-full border border-cyan-500/30 absolute" />
                <div className="w-32 h-32 rounded-full border border-cyan-500/40 absolute" />
                {/* Rotating scanner beam */}
                <div className="w-72 h-72 rounded-full bg-radar-sweep animate-radar absolute" />
              </div>

              {/* Top status */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
                    INTERCEPTED THREAT
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                  CRITICAL: 89/100
                </span>
              </div>

              {/* Middle interactive graphic card */}
              <div className="relative z-10 my-auto p-4 rounded-xl bg-black/60 border border-slate-800 backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono truncate max-w-[200px]">
                    Microsoft 365 Password Phish
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                    BLOCKED
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  micros0ft-portal-auth.xyz (Typosquatted)
                </div>
                <div className="pt-2 flex items-center justify-between text-[10px] font-mono border-t border-slate-800">
                  <span className="text-red-400">SPF / DMARC: FAILED</span>
                  <span className="text-slate-400">Neural Conf: 96%</span>
                </div>
              </div>

              {/* Bottom telemetry indicators */}
              <div className="relative z-10 grid grid-cols-3 gap-2 text-center font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Heuristics</span>
                  <span className="text-cyan-300 font-bold">ACTIVE</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sandbox</span>
                  <span className="text-emerald-400 font-bold">ARMED</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Model</span>
                  <span className="text-cyan-300 font-bold">GEMINI 3.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Capabilities Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold block mb-1">
            Enterprise Threat Matrix
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Defense Across All Attack Vectors
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Detect sophisticated adversarial evasion tactics that traditional spam filters fail to catch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Phishing & Credential Theft</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes urgent verification lures, fake login gateways, and credential harvesting templates targeting corporate single sign-on (SSO).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/20 group-hover:scale-105 transition-transform">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">Executive Impersonation (BEC)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies display-name spoofing, out-of-band communication blocks, fraudulent direct deposit alterations, and wire fraud schemes.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">URL & Typosquatting Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts and defangs hyperlinks, inspects brand character permutations (e.g., '0' for 'o'), high-risk TLDs, and redirection chains.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md hover:border-cyan-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-1.5">SPF / DKIM / DMARC Audits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspects envelope cryptography, relay hops, and misalignment between RFC 822 From and Return-Path headers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
