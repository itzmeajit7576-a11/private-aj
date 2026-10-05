export type RiskSeverity = "Safe" | "Suspicious" | "High" | "Critical";

export interface ThreatFinding {
  category: "Sender Analysis" | "URL Analysis" | "Content Analysis" | "Attachment Analysis" | "Impersonation Analysis" | string;
  severity: "Safe" | "Low" | "Medium" | "High" | "Critical";
  title: string;
  explanation: string;
  evidence: string[];
  confidenceScore: number;
}

export interface URLFinding {
  url: string;
  domain: string;
  status: "Safe" | "Suspicious" | "Malicious";
  riskScore: number;
  protocol: string;
  suspiciousPatterns: string[];
  detectionReason: string;
}

export interface HeaderData {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  date: string;
  messageId: string;
  received?: string;
}

export interface SenderAnalysis {
  from: string;
  domain: string;
  isSuspicious: boolean;
  reputation: string;
  impersonationTarget: string;
  replyToMismatch?: boolean;
}

export interface AuthenticationStatus {
  spf: "Verified" | "Failed" | "Missing" | "Unknown";
  dkim: "Verified" | "Failed" | "Missing" | "Unknown";
  dmarc: "Verified" | "Failed" | "Missing" | "Unknown";
  authenticationPassed: boolean;
}

export interface EmailAnalysis {
  id: string;
  timestamp: string;
  isDemoMode: boolean;
  isAiGenerated: boolean;
  modelUsed: string;
  subject: string;
  sender: string;
  riskScore: number; // 0 - 100
  threatType: string; // e.g. "Phishing", "Business Email Compromise (BEC)", "Scam/Fraud", "Clean / Safe"
  confidence: number; // 0 - 100
  severity: RiskSeverity;
  summary: string;
  aiExplanation: string;
  findings: ThreatFinding[];
  urls: URLFinding[];
  senderAnalysis: SenderAnalysis;
  headers: HeaderData;
  authentication: AuthenticationStatus;
  recommendations: string[];
  rawBodyPreview?: string;
  storageInfo?: {
    downloadUrl: string;
    storagePath: string;
    storageBucket: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
}

export interface HistoryItem {
  id: string;
  date: string;
  subject: string;
  sender: string;
  threatType: string;
  riskScore: number;
  severity: RiskSeverity;
  analysis: EmailAnalysis;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  organization: string;
}
