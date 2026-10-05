import { EmailAnalysis, HistoryItem } from "../types/threat";
import { INITIAL_HISTORY } from "./sampleData";

const STORAGE_KEY = "ai_email_threat_history_v2";

export async function checkServerHealth(): Promise<{
  status: string;
  geminiConfigured: boolean;
  model: string;
}> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (err) {
    return {
      status: "degraded",
      geminiConfigured: false,
      model: "Heuristic Defense (Local)",
    };
  }
}

export async function analyzeEmailPayload(payload: {
  rawEmail?: string;
  senderInput?: string;
  subjectInput?: string;
  bodyInput?: string;
}): Promise<EmailAnalysis> {
  const res = await fetch("/api/analyze-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || "Failed to analyze email.");
  }

  const data: EmailAnalysis = await res.json();
  saveAnalysisToHistory(data);
  return data;
}

export async function lookupThreatIntel(query: string) {
  const res = await fetch(`/api/threat-intel/lookup?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Threat intelligence lookup failed");
  return await res.json();
}

// History Storage Helpers
export function getStoredHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_HISTORY;
  } catch {
    return INITIAL_HISTORY;
  }
}

export function saveAnalysisToHistory(analysis: EmailAnalysis): HistoryItem[] {
  try {
    const current = getStoredHistory();
    const newItem: HistoryItem = {
      id: analysis.id,
      date: new Date().toISOString().replace("T", " ").substring(0, 19),
      subject: analysis.subject || "Untitled Email",
      sender: analysis.sender || "Unknown Sender",
      threatType: analysis.threatType,
      riskScore: analysis.riskScore,
      severity: analysis.severity,
      analysis,
    };
    // Prepend and keep up to 50
    const updated = [newItem, ...current.filter(i => i.id !== newItem.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_HISTORY;
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const current = getStoredHistory();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return INITIAL_HISTORY;
  }
}

export function clearHistory(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
