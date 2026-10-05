import React, { useState, useRef, useEffect } from "react";
import { 
  Shield, 
  Menu, 
  X, 
  Cpu, 
  Send, 
  User as UserIcon, 
  LogOut, 
  Database, 
  FileText, 
  BarChart3, 
  Sparkles,
  Radio,
  ChevronDown,
  CheckCircle2,
  Lock,
  Crown
} from "lucide-react";
import { User, HistoryItem } from "../types/threat";
import { NotificationCenter } from "./NotificationCenter";
import { ThreatNotification } from "../services/notificationService";
import { ADMIN_USER_ID } from "../services/firebase";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isAiConnected: boolean;
  history?: HistoryItem[];
  onSelectThreat?: (notification: ThreatNotification) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  isAiConnected,
  history = [],
  onSelectThreat,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "analyzer", label: "Analyzer" },
    { id: "dashboard", label: "Dashboard" },
    { id: "threat-intel", label: "Threat Intel" },
    { id: "reports", label: "Reports" },
    { id: "about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 glow-cyan/40 group-hover:border-cyan-400 transition-colors">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                AI Email Threat Detection
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/80 tracking-widest block uppercase">
              Analyze • Detect • Protect
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          {navLinks.map((link) => {
            const isAdmin = currentUser?.id === ADMIN_USER_ID;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentView === link.id
                    ? isAdmin && link.id === "dashboard"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40 font-bold"
                      : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {link.id === "dashboard" && isAdmin ? (
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin View</span>
                  </span>
                ) : (
                  link.label
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Auth Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {/* AI Engine Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-slate-800 text-[10px] font-mono text-slate-400">
            <div
              className={`w-2 h-2 rounded-full ${
                isAiConnected ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"
              }`}
            />
            <span>{isAiConnected ? "GEMINI 3.8 FLASH" : "DEMO ENGINE READY"}</span>
          </div>

          {/* Notification Center */}
          <NotificationCenter
            history={history}
            onSelectThreat={(n) => {
              if (onSelectThreat) {
                onSelectThreat(n);
              }
            }}
          />

          <button
            onClick={() => onNavigate("analyzer")}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono tracking-wide flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Analyze Email</span>
          </button>

          {/* User Account / Sign In */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2.5 pl-2.5 py-1 pr-2 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                  currentUser.id === ADMIN_USER_ID
                    ? "bg-red-950/40 border-red-500/50 hover:border-red-400 text-red-200"
                    : "bg-slate-900 border-slate-700/80 hover:border-cyan-500/50 text-slate-200"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  currentUser.id === ADMIN_USER_ID
                    ? "bg-red-500/30 border border-red-500/50 text-amber-300"
                    : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                }`}>
                  {currentUser.id === ADMIN_USER_ID ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    currentUser.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="text-left">
                  <span className="text-slate-200 font-bold block truncate max-w-[120px] text-xs flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    {currentUser.id === ADMIN_USER_ID && (
                      <span className="px-1 py-0.2 rounded bg-red-500/20 text-red-400 text-[8px] uppercase font-bold">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className={`text-[9px] block truncate max-w-[120px] ${
                    currentUser.id === ADMIN_USER_ID ? "text-amber-400/90" : "text-cyan-400"
                  }`}>
                    {currentUser.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-cyan-500/30 p-4 shadow-2xl z-50 text-xs font-mono space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authenticated Session</span>
                    </div>
                    <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-slate-400 text-[11px] truncate mt-0.5">{currentUser.email}</div>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Security Clearance:</span>
                      <span className="text-cyan-300 font-semibold">{currentUser.role}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Organization:</span>
                      <span className="text-slate-300">{currentUser.organization}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-emerald-400">SOC Live Connected</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate("dashboard");
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px]"
                    >
                      View Dashboard →
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="px-2.5 py-1 rounded bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-500/30 text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? (
            <button
              onClick={() => onOpenAuth()}
              className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold"
            >
              {currentUser.name.slice(0, 4)}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs font-mono"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2 font-mono text-xs animate-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                currentView === link.id
                  ? "bg-cyan-500/20 text-cyan-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-800">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="text-slate-200 font-bold block">{currentUser.name}</span>
                  <span className="text-[10px] text-cyan-400">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1 rounded bg-red-950/40 text-red-300 border border-red-500/30"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-center"
              >
                Sign In to Security Portal
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
