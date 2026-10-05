import { HistoryItem, EmailAnalysis, RiskSeverity } from "../types/threat";
import { SAMPLE_EMAILS } from "./sampleData";

export interface ThreatNotification {
  id: string;
  threatId: string;
  title: string;
  subject: string;
  sender: string;
  threatType: string;
  riskScore: number;
  severity: RiskSeverity;
  timestamp: string;
  timeAgo?: string;
  read: boolean;
  analysis: EmailAnalysis;
  indicators?: string[];
}

const STORAGE_NOTIF_KEY = "ai_email_threat_notifications_v1";

type NotificationListener = (notifications: ThreatNotification[]) => void;
type ToastListener = (toast: ThreatNotification) => void;

class NotificationManager {
  private listeners: NotificationListener[] = [];
  private toastListeners: ToastListener[] = [];
  private soundEnabled: boolean = true;

  constructor() {
    // Sound setting preference
    try {
      const soundPref = localStorage.getItem("threat_sound_enabled");
      if (soundPref !== null) {
        this.soundEnabled = soundPref === "true";
      }
    } catch {}
  }

  // Synthesize a subtle, futuristic cybersecurity alert chime
  public playAlertSound() {
    if (!this.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {
      // Audio playback prevented by browser autoplay policy
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem("threat_sound_enabled", String(enabled));
    } catch {}
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getNotifications(historyItems?: HistoryItem[]): ThreatNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIF_KEY);
      if (stored) {
        const parsed: ThreatNotification[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // Fallback: derive notifications from high-risk history items
    if (historyItems && historyItems.length > 0) {
      const derived = historyItems
        .filter((h) => h.riskScore >= 61)
        .map((h, idx) => ({
          id: `notif-${h.id}`,
          threatId: h.id,
          title: h.threatType,
          subject: h.subject,
          sender: h.sender,
          threatType: h.threatType,
          riskScore: h.riskScore,
          severity: h.severity,
          timestamp: h.date,
          read: idx > 1, // keep first 2 unread for immediate visibility
          analysis: h.analysis,
          indicators: h.analysis.findings?.slice(0, 2).map((f) => f.title) || ["Urgency pattern detected"],
        }));

      this.saveNotifications(derived);
      return derived;
    }

    return [];
  }

  public saveNotifications(notifications: ThreatNotification[]) {
    try {
      localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(notifications.slice(0, 30)));
    } catch {}
    this.notifyListeners(notifications);
  }

  public addNotificationFromHistory(item: HistoryItem, triggerToast: boolean = true): ThreatNotification | null {
    // Only alert for high risk and critical threats
    if (item.riskScore < 61) return null;

    const current = this.getNotifications();
    const existingIndex = current.findIndex((n) => n.threatId === item.id);

    const newNotif: ThreatNotification = {
      id: `notif-${item.id}-${Date.now()}`,
      threatId: item.id,
      title: item.threatType,
      subject: item.subject,
      sender: item.sender,
      threatType: item.threatType,
      riskScore: item.riskScore,
      severity: item.severity,
      timestamp: new Date().toISOString(),
      read: false,
      analysis: item.analysis,
      indicators: item.analysis.findings?.slice(0, 2).map((f) => f.title) || ["Anomalous routing pattern"],
    };

    let updated: ThreatNotification[];
    if (existingIndex >= 0) {
      updated = [newNotif, ...current.filter((_, idx) => idx !== existingIndex)];
    } else {
      updated = [newNotif, ...current];
    }

    this.saveNotifications(updated);

    if (triggerToast) {
      this.playAlertSound();
      this.toastListeners.forEach((fn) => fn(newNotif));
    }

    return newNotif;
  }

  public markAsRead(id: string) {
    const current = this.getNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(updated);
  }

  public markAllAsRead() {
    const current = this.getNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    this.saveNotifications(updated);
  }

  public dismissNotification(id: string) {
    const current = this.getNotifications();
    const updated = current.filter((n) => n.id !== id);
    this.saveNotifications(updated);
  }

  public clearAll() {
    this.saveNotifications([]);
  }

  // Simulate a live inbound high-risk threat alert (for testing and SOC verification)
  public simulateInboundThreat(): ThreatNotification {
    const highRiskSamples = SAMPLE_EMAILS.filter((s) => s.riskLevel === "Critical" || s.riskLevel === "High Risk");
    const chosen = highRiskSamples[Math.floor(Math.random() * highRiskSamples.length)] || SAMPLE_EMAILS[0];
    const riskScore = chosen.riskLevel === "Critical" ? Math.floor(Math.random() * 12) + 87 : Math.floor(Math.random() * 14) + 68;

    const simulatedAnalysis: EmailAnalysis = {
      id: "live-" + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString(),
      isDemoMode: true,
      isAiGenerated: true,
      modelUsed: "Gemini 3.8 Flash (Enterprise AI)",
      subject: chosen.subject,
      sender: chosen.sender,
      riskScore,
      threatType: chosen.tag,
      confidence: 95,
      severity: riskScore >= 81 ? "Critical" : "High",
      summary: `Live intercept: ${chosen.tag} targeting corporate perimeter.`,
      aiExplanation: `Real-time incoming email was intercepted and scored ${riskScore}/100 due to detected deceptive brand cues and failed cryptographic authentication.`,
      findings: [
        {
          category: "Impersonation Analysis",
          severity: "Critical",
          title: "Real-Time Intercepted Brand Spoofing",
          explanation: "Inbound packet mimics corporate sender but fails envelope verification.",
          evidence: [chosen.sender],
          confidenceScore: 96,
        },
      ],
      urls: [],
      senderAnalysis: {
        from: chosen.sender,
        domain: chosen.sender.split("@")[1] || "hostile.xyz",
        isSuspicious: true,
        reputation: "Hostile",
        impersonationTarget: chosen.label,
      },
      headers: {
        from: chosen.sender,
        to: "soc-telemetry@company.internal",
        replyTo: chosen.sender,
        subject: chosen.subject,
        date: new Date().toUTCString(),
        messageId: `<sim-${Date.now()}@relay>`,
      },
      authentication: {
        spf: "Failed",
        dkim: "Missing",
        dmarc: "Failed",
        authenticationPassed: false,
      },
      recommendations: [
        "Do not interact with sender.",
        "Add sender to active boundary firewall blocklist.",
      ],
    };

    const notif: ThreatNotification = {
      id: `sim-${Date.now()}`,
      threatId: simulatedAnalysis.id,
      title: `${chosen.tag} Detected`,
      subject: chosen.subject,
      sender: chosen.sender,
      threatType: chosen.tag,
      riskScore,
      severity: riskScore >= 81 ? "Critical" : "High",
      timestamp: new Date().toISOString(),
      read: false,
      analysis: simulatedAnalysis,
      indicators: ["Zero-Hour Envelope Anomaly", "Critical Impersonation Vector"],
    };

    const current = this.getNotifications();
    this.saveNotifications([notif, ...current]);

    // Fire sound & toast
    this.playAlertSound();
    this.toastListeners.forEach((fn) => fn(notif));

    return notif;
  }

  // Subscribe to notification updates
  public subscribe(fn: NotificationListener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  // Subscribe to live toast alerts
  public subscribeToast(fn: ToastListener): () => void {
    this.toastListeners.push(fn);
    return () => {
      this.toastListeners = this.toastListeners.filter((l) => l !== fn);
    };
  }

  private notifyListeners(notifications: ThreatNotification[]) {
    this.listeners.forEach((fn) => fn(notifications));
  }
}

export const notificationService = new NotificationManager();
