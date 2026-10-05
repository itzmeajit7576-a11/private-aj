import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LandingHero } from "./components/LandingHero";
import { EmailAnalyzer } from "./components/EmailAnalyzer";
import { AnalysisResult } from "./components/AnalysisResult";
import { DashboardView } from "./components/DashboardView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { EmailHistoryView } from "./components/EmailHistoryView";
import { ThreatIntelView } from "./components/ThreatIntelView";
import { AboutView } from "./components/AboutView";
import { AuthModal } from "./components/AuthModal";
import { ReportViewerModal } from "./components/ReportViewerModal";
import { ThreatToastContainer } from "./components/ThreatToast";
import { ThreatNotification } from "./services/notificationService";
import { EmailAnalysis, HistoryItem, User } from "./types/threat";
import { 
  getStoredHistory, 
  deleteHistoryItem, 
  clearHistory, 
  checkServerHealth 
} from "./services/api";
import { 
  auth, 
  mapFirebaseUserToUser, 
  logoutUser,
  ADMIN_USER_ID,
  isUserAdmin
} from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SAMPLE_EMAILS } from "./services/sampleData";
import { Shield, Sparkles } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [currentAnalysis, setCurrentAnalysis] = useState<EmailAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [printableAnalysis, setPrintableAnalysis] = useState<EmailAnalysis | null>(null);

  const [isAiConnected, setIsAiConnected] = useState(false);

  // Initialize data and Firebase Auth listener on mount
  useEffect(() => {
    const loadedHistory = getStoredHistory();
    setHistory(loadedHistory);

    // Check server backend and Gemini health
    checkServerHealth().then((health) => {
      setIsAiConnected(health.geminiConfigured);
    });

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUserToUser(fbUser);
        setCurrentUser(mapped);
      } else {
        // Fallback to local storage if user was mock/cached
        try {
          const stored = localStorage.getItem("ai_threat_user");
          if (stored) {
            setCurrentUser(JSON.parse(stored));
          } else {
            setCurrentUser(null);
          }
        } catch {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAnalysisComplete = (result: EmailAnalysis) => {
    setCurrentAnalysis(result);
    // Refresh history
    setHistory(getStoredHistory());
    setCurrentView("analyzer");
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setCurrentAnalysis(item.analysis);
    setCurrentView("analyzer");
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    // Redirect to dashboard on login as requested in section 4
    setCurrentView("dashboard");
  };

  const handleUserLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setCurrentUser(null);
  };

  const handleViewDemo = () => {
    // Load first high-impact sample (Microsoft 365 credential phishing) from history
    if (history.length > 0) {
      setCurrentAnalysis(history[0].analysis);
      setCurrentView("analyzer");
    } else {
      setCurrentView("analyzer");
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cyber Grid Accent */}
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none z-0 opacity-40" />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleUserLogout}
        isAiConnected={isAiConnected}
        history={history}
        onSelectThreat={(notif) => {
          setCurrentAnalysis(notif.analysis);
          setCurrentView("analyzer");
        }}
      />

      {/* Main Content View Switcher */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === "home" && (
          <LandingHero
            onAnalyzeClick={() => setCurrentView("analyzer")}
            onViewDemoClick={handleViewDemo}
            onNavigateToDashboard={() => setCurrentView("dashboard")}
            onNavigateToIntel={() => setCurrentView("threat-intel")}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === "analyzer" && (
          <div className="space-y-6">
            {currentAnalysis ? (
              <AnalysisResult
                analysis={currentAnalysis}
                onReset={() => setCurrentAnalysis(null)}
                onViewPrintReport={() => setPrintableAnalysis(currentAnalysis)}
              />
            ) : (
              <EmailAnalyzer onAnalysisComplete={handleAnalysisComplete} />
            )}
          </div>
        )}

        {currentView === "dashboard" && (
          currentUser?.id === ADMIN_USER_ID ? (
            <AdminDashboardView
              currentUser={currentUser}
              onNavigateToAnalyzer={() => {
                setCurrentAnalysis(null);
                setCurrentView("analyzer");
              }}
              onSelectEmail={handleSelectHistoryItem}
            />
          ) : (
            <DashboardView
              history={history}
              onSelectEmail={handleSelectHistoryItem}
              onNavigateToAnalyzer={() => {
                setCurrentAnalysis(null);
                setCurrentView("analyzer");
              }}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )
        )}

        {currentView === "reports" && (
          <EmailHistoryView
            history={history}
            onSelectEmail={handleSelectHistoryItem}
            onDeleteEmail={handleDeleteHistory}
            onClearAll={handleClearHistory}
          />
        )}

        {currentView === "threat-intel" && <ThreatIntelView />}

        {currentView === "about" && <AboutView />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-8 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">AI Email Threat Detection</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-semibold tracking-wider">
              “Analyze. Detect. Protect.”
            </span>
          </div>

          <div className="text-center sm:text-right text-slate-400">
            Enterprise Security Telemetry • Powered by Google Gemini AI & Cryptographic Auditing
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleUserLogin}
        defaultEmail="itzmeajit7576@gmail.com"
      />

      <ReportViewerModal
        analysis={printableAnalysis}
        onClose={() => setPrintableAnalysis(null)}
      />

      {/* Real-time Threat Alert Toast Notifications */}
      <ThreatToastContainer
        onSelectThreat={(notif: ThreatNotification) => {
          setCurrentAnalysis(notif.analysis);
          setCurrentView("analyzer");
        }}
      />
    </div>
  );
}
