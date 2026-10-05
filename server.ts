import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = Boolean(apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim().length > 5);

let ai: GoogleGenAI | null = null;
if (isApiKeyConfigured) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey!,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("Failed to initialize Google GenAI:", err);
  }
}

// Regex helpers for email parsing
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const matches = text.match(urlRegex) || [];
  // Clean trailing punctuation
  return Array.from(new Set(matches.map(u => u.replace(/[.,;:)\]>]+$/, ""))));
}

function parseEmailHeadersAndBody(rawEmail: string) {
  const lines = rawEmail.split(/\r?\n/);
  const headers: Record<string, string> = {};
  let isHeader = true;
  let bodyLines: string[] = [];
  let currentHeaderKey = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isHeader) {
      if (line.trim() === "") {
        isHeader = false;
        continue;
      }
      // Check for continuation line (leading space or tab)
      if (/^\s+/.test(line) && currentHeaderKey) {
        headers[currentHeaderKey] += " " + line.trim();
        continue;
      }
      const match = line.match(/^([\w-]+):\s*(.*)$/);
      if (match) {
        currentHeaderKey = match[1].toLowerCase();
        headers[currentHeaderKey] = match[2].trim();
      }
    } else {
      bodyLines.push(line);
    }
  }

  const body = bodyLines.join("\n").trim() || rawEmail;
  const from = headers["from"] || "";
  const to = headers["to"] || "";
  const replyTo = headers["reply-to"] || "";
  const subject = headers["subject"] || "";
  const date = headers["date"] || new Date().toUTCString();
  const messageId = headers["message-id"] || "";
  const received = headers["received"] || "";

  // Analyze SPF / DKIM / DMARC from authentication-results or received-spf headers
  const authResultsHeader = headers["authentication-results"] || "";
  const receivedSpfHeader = headers["received-spf"] || "";

  let spf: "Verified" | "Failed" | "Missing" | "Unknown" = "Unknown";
  let dkim: "Verified" | "Failed" | "Missing" | "Unknown" = "Unknown";
  let dmarc: "Verified" | "Failed" | "Missing" | "Unknown" = "Unknown";

  const fullAuthText = `${authResultsHeader} ${receivedSpfHeader}`.toLowerCase();

  if (fullAuthText.includes("spf=pass")) spf = "Verified";
  else if (fullAuthText.includes("spf=fail") || fullAuthText.includes("spf=softfail")) spf = "Failed";
  else if (headers["received-spf"] || headers["authentication-results"]) {
    if (fullAuthText.includes("spf=none") || fullAuthText.includes("spf=neutral")) spf = "Missing";
  } else {
    spf = "Missing";
  }

  if (fullAuthText.includes("dkim=pass")) dkim = "Verified";
  else if (fullAuthText.includes("dkim=fail")) dkim = "Failed";
  else if (fullAuthText.includes("dkim=none")) dkim = "Missing";
  else dkim = "Missing";

  if (fullAuthText.includes("dmarc=pass")) dmarc = "Verified";
  else if (fullAuthText.includes("dmarc=fail")) dmarc = "Failed";
  else if (fullAuthText.includes("dmarc=none")) dmarc = "Missing";
  else dmarc = "Missing";

  return {
    headers: {
      from,
      to,
      replyTo,
      subject,
      date,
      messageId,
      received,
      spf,
      dkim,
      dmarc,
      rawHeaders: headers,
    },
    body,
    extractedUrls: extractUrls(rawEmail),
  };
}

// Fallback Heuristic Cybersecurity Engine
function analyzeWithHeuristics(params: {
  subject: string;
  sender: string;
  body: string;
  urls: string[];
  headers: any;
}) {
  const { subject, sender, body, urls, headers } = params;
  const text = `${subject} ${body} ${sender}`.toLowerCase();

  let riskScore = 15;
  let threatType = "Clean / Legitimate";
  let confidence = 88;
  const findings: any[] = [];
  const urlFindings: any[] = [];

  // 1. Urgency / Fear indicators
  const urgencyKeywords = [
    "immediately", "urgent action required", "account suspended", "24 hours",
    "unauthorized access", "wire transfer", "gift card", "payroll change",
    "password expired", "verify your identity", "security alert", "confirm your account"
  ];
  const matchedUrgency = urgencyKeywords.filter(k => text.includes(k));
  if (matchedUrgency.length > 0) {
    riskScore += 25;
    findings.push({
      category: "Content Analysis",
      severity: matchedUrgency.length > 1 ? "Critical" : "High",
      title: "Psychological Urgency & Pressure Tactics Detected",
      explanation: `The email employs high-pressure tactics urging immediate reaction (${matchedUrgency.slice(0, 3).join(", ")}), a classic indicator of social engineering and phishing campaigns.`,
      evidence: matchedUrgency.slice(0, 3).map(k => `Trigger phrase: "${k}"`),
      confidenceScore: 92,
    });
  }

  // 2. Financial / Credential Harvesting
  const credKeywords = ["login to restore", "reset password", "bank account", "invoice attached", "w-2 form", "direct deposit", "cryptocurrency", "bitcoin"];
  const matchedCred = credKeywords.filter(k => text.includes(k));
  if (matchedCred.length > 0) {
    riskScore += 20;
    findings.push({
      category: "Credential / Financial Theft",
      severity: "High",
      title: "Credential or Financial Exfiltration Indicators",
      explanation: "Request for sensitive credentials, payroll updates, or payment redirection without authenticated channels.",
      evidence: matchedCred.map(k => `Exfiltration topic: "${k}"`),
      confidenceScore: 89,
    });
  }

  // 3. Sender & Brand Impersonation
  const brands = [
    { name: "Microsoft 365", pattern: /microsoft|office365|outlook/i, legitDomain: "microsoft.com" },
    { name: "Google Workspace", pattern: /google|workspace|gmail/i, legitDomain: "google.com" },
    { name: "PayPal", pattern: /paypal/i, legitDomain: "paypal.com" },
    { name: "Apple ID", pattern: /apple support|icloud|appleid/i, legitDomain: "apple.com" },
    { name: "DHL Express", pattern: /dhl delivery|dhl express|tracking number/i, legitDomain: "dhl.com" },
    { name: "Amazon", pattern: /amazon order|amazon security/i, legitDomain: "amazon.com" },
    { name: "Bank of America", pattern: /bank of america|bofa/i, legitDomain: "bankofamerica.com" },
  ];

  let impersonatedBrand: string | null = null;
  for (const b of brands) {
    if (b.pattern.test(subject) || b.pattern.test(body)) {
      if (!sender.toLowerCase().includes(b.legitDomain)) {
        impersonatedBrand = b.name;
        riskScore += 30;
        findings.push({
          category: "Impersonation Analysis",
          severity: "Critical",
          title: `Brand Impersonation Detected (${b.name})`,
          explanation: `The email displays visual or textual cues belonging to ${b.name}, but originates from an unauthorized sender domain "${sender || "Unknown"}" with no cryptographic delegation.`,
          evidence: [`Claimed brand: ${b.name}`, `Actual sender address: ${sender || "Missing"}`],
          confidenceScore: 95,
        });
        break;
      }
    }
  }

  // 4. URL analysis
  urls.forEach(rawUrl => {
    let domain = "";
    try {
      const parsed = new URL(rawUrl);
      domain = parsed.hostname;
    } catch {
      domain = rawUrl.replace(/https?:\/\//i, "").split("/")[0];
    }

    const isSuspiciousTld = /\.(xyz|top|ru|tk|ml|ga|cf|gq|buzz|click|country|kim|download)$/i.test(domain);
    const hasIpAddress = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:\d+)?/i.test(rawUrl);
    const hasBrandInSubdomain = brands.some(b => domain.includes(b.name.toLowerCase().replace(/\s+/g, "")) && !domain.endsWith(b.legitDomain));
    const isShortener = /(bit\.ly|tinyurl\.com|t\.co|ow\.ly|is\.gd|buff\.ly|cutt\.ly)/i.test(domain);

    let urlRisk = 10;
    let status: "Safe" | "Suspicious" | "Malicious" = "Safe";
    let reasons: string[] = [];

    if (hasIpAddress) {
      urlRisk = 95;
      status = "Malicious";
      reasons.push("Raw IP address used instead of legitimate hostname");
    } else if (hasBrandInSubdomain) {
      urlRisk = 90;
      status = "Malicious";
      reasons.push("Brand typosquatting or fraudulent subdomain targeting victim credentials");
    } else if (isSuspiciousTld) {
      urlRisk = 80;
      status = "Suspicious";
      reasons.push("High-risk top-level domain frequently associated with spam and malware campaigns");
    } else if (isShortener) {
      urlRisk = 65;
      status = "Suspicious";
      reasons.push("URL shortener obscuring actual landing destination");
    }

    if (urlRisk > 60) riskScore += 18;

    urlFindings.push({
      url: rawUrl,
      domain,
      status,
      riskScore: urlRisk,
      protocol: rawUrl.startsWith("https") ? "HTTPS" : "HTTP (Insecure)",
      suspiciousPatterns: reasons.length ? reasons : ["Standard domain protocol"],
      detectionReason: reasons.join(". ") || "No overt anomalies detected in domain structure.",
    });
  });

  if (urlFindings.some(u => u.status === "Malicious")) {
    findings.push({
      category: "URL Analysis",
      severity: "Critical",
      title: "High-Risk / Phishing Destinations Identified",
      explanation: "Extracted hyperlinks route to deceptive destinations with typosquatting, raw IP targets, or obscure domains.",
      evidence: urlFindings.filter(u => u.status !== "Safe").map(u => `${u.domain} (${u.status})`),
      confidenceScore: 94,
    });
  }

  // 5. Authentication check
  if (headers.spf === "Failed" || headers.dmarc === "Failed") {
    riskScore += 25;
    findings.push({
      category: "Sender Authentication",
      severity: "Critical",
      title: "SPF / DMARC Cryptographic Validation Failure",
      explanation: "The originating mail transfer agent failed cryptographic domain verification, indicating forged envelope headers.",
      evidence: [`SPF: ${headers.spf}`, `DMARC: ${headers.dmarc}`],
      confidenceScore: 98,
    });
  }

  // Normalize score
  riskScore = Math.min(Math.max(riskScore, 5), 98);

  let severity = "Safe";
  if (riskScore >= 81) {
    severity = "Critical";
    threatType = impersonatedBrand ? `Phishing (${impersonatedBrand} Impersonation)` : "Phishing / Credential Theft";
  } else if (riskScore >= 61) {
    severity = "High";
    threatType = "Business Email Compromise (BEC) / Scam";
  } else if (riskScore >= 31) {
    severity = "Suspicious";
    threatType = "Suspicious Unsolicited Mail";
  } else {
    severity = "Safe";
    threatType = "Clean / Legitimate";
    confidence = 96;
  }

  const recommendations = riskScore >= 61
    ? [
        "Do not click on any hyperlinks or buttons inside this message.",
        "Do not enter passwords, MFA codes, or corporate credentials on linked pages.",
        "Quarantine or permanently delete this email from the mail server.",
        "Report the sender domain and associated URLs to your security operations center (SOC).",
        "If you already interacted with links, revoke session tokens and perform immediate credential rotation.",
      ]
    : riskScore >= 31
    ? [
        "Exercise caution before following links or downloading attachments.",
        "Verify the sender's identity through an out-of-band communication channel (e.g., direct phone call or known chat).",
        "Inspect destination URLs before entering any corporate or personal data.",
      ]
    : [
        "No significant cyber threats detected in envelope, URLs, or body context.",
        "Continue observing standard security hygiene practices.",
      ];

  const summary = riskScore >= 61
    ? `Critical email threat detected: ${threatType} exhibiting high-confidence social engineering and fraudulent routing indicators.`
    : riskScore >= 31
    ? `Suspicious email patterns flagged: Review sender origin and avoid clicking unverified links.`
    : `Email verified as legitimate with clean reputation and valid structural indicators.`;

  const aiExplanation = riskScore >= 61
    ? `This email was flagged with a Risk Score of ${riskScore}/100 because it exhibits definitive deceptive markers: ${findings.map(f => f.title).join(", ")}. Attackers often leverage urgency and brand trust to bypass human vigilance and harvest credentials.`
    : riskScore >= 31
    ? `This email scored ${riskScore}/100 due to ambiguous sender attribution and marketing/urgency phrasing. While not confirmed malicious, caution is advised before sharing data.`
    : `This email scored ${riskScore}/100 and appears benign. The message lacks credential harvesting triggers, exhibits normal formatting, and contains no blacklisted domains.`;

  return {
    riskScore,
    threatType,
    confidence,
    severity,
    summary,
    aiExplanation,
    findings,
    urls: urlFindings,
    senderAnalysis: {
      from: sender || "Not Specified",
      domain: sender.includes("@") ? sender.split("@")[1].replace(/[<>]/g, "") : "Unknown",
      isSuspicious: riskScore >= 61,
      reputation: riskScore >= 61 ? "Poor / Hostile" : riskScore >= 31 ? "Neutral / Unverified" : "Reputable",
      impersonationTarget: impersonatedBrand || "None",
      replyToMismatch: Boolean(headers.replyTo && headers.replyTo !== headers.from),
    },
    authentication: {
      spf: headers.spf || "Unknown",
      dkim: headers.dkim || "Unknown",
      dmarc: headers.dmarc || "Unknown",
      authenticationPassed: headers.spf === "Verified" && headers.dkim === "Verified",
    },
    recommendations,
    indicatorsOfCompromise: [
      ...(urls.length ? urls.slice(0, 3).map(u => ({ type: "URL", value: u })) : []),
      ...(sender ? [{ type: "Sender Address", value: sender }] : []),
    ],
  };
}

// API Routes

// Health & Engine Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "AI Email Threat Detection",
    version: "2.4.0",
    geminiConfigured: isApiKeyConfigured,
    model: "gemini-3.8-flash",
    timestamp: new Date().toISOString(),
  });
});

// Threat Intel Lookup Sandbox API
app.get("/api/threat-intel/lookup", (req, res) => {
  const query = String(req.query.query || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  // Simulated threat intelligence database
  const isKnownBad = /(paypal-verify|login-office365|secure-banking|dhl-parcel-track|account-update-portal|bit\.ly|tinyurl)/i.test(query);
  const isTldSuspicious = /\.(xyz|top|ru|tk|ga|buzz|country)$/i.test(query);

  const reputationScore = isKnownBad ? 92 : isTldSuspicious ? 74 : 12;
  const status = reputationScore > 80 ? "Malicious" : reputationScore > 50 ? "Suspicious" : "Clean";

  res.json({
    query,
    status,
    reputationScore,
    threatTypes: isKnownBad ? ["Phishing", "Credential Harvester", "Fast-flux DNS"] : isTldSuspicious ? ["Spam Relay", "Abuse Risk"] : [],
    firstSeen: isKnownBad ? "2026-08-14" : "2023-01-10",
    lastReported: isKnownBad ? "Recent (Active campaign)" : "None",
    nameservers: ["ns1.hostcloud-defense.net", "ns2.hostcloud-defense.net"],
    registrar: isKnownBad ? "NameCheap / Privacy Protected" : "MarkMonitor Inc.",
    asn: isKnownBad ? "AS204957 (High-risk bulletproof hosting)" : "AS15169 (Google LLC)",
    recommendation: isKnownBad ? "Block domain at boundary firewall & DNS sinkhole." : "Traffic permitted under standard filtering.",
  });
});

// Main Email Analysis Endpoint
app.post("/api/analyze-email", async (req, res) => {
  try {
    const { rawEmail, subjectInput, senderInput, bodyInput } = req.body;

    let emailContent = "";
    let extractedData: ReturnType<typeof parseEmailHeadersAndBody>;

    if (rawEmail && typeof rawEmail === "string") {
      emailContent = rawEmail;
      extractedData = parseEmailHeadersAndBody(rawEmail);
    } else {
      const combined = [
        senderInput ? `From: ${senderInput}` : "",
        subjectInput ? `Subject: ${subjectInput}` : "",
        "\n",
        bodyInput || "",
      ].filter(Boolean).join("\n");

      emailContent = combined;
      extractedData = parseEmailHeadersAndBody(combined);
      if (senderInput) extractedData.headers.from = senderInput;
      if (subjectInput) extractedData.headers.subject = subjectInput;
    }

    if (!emailContent || emailContent.trim().length < 5) {
      return res.status(400).json({ error: "Email content is empty or too short for security analysis." });
    }

    const { headers, body, extractedUrls } = extractedData;
    const effectiveSender = headers.from || senderInput || "Unknown Sender";
    const effectiveSubject = headers.subject || subjectInput || "No Subject";

    let aiResult: any = null;
    let isAiGenerated = false;

    // Call Gemini API if configured
    if (ai) {
      try {
        const prompt = `You are an enterprise cybersecurity threat detection AI. Analyze the following email message, headers, senders, and links for cyber threats including Phishing, Business Email Compromise (BEC), Scam/Fraud, Malicious URLs, Sender Impersonation, Credential Theft, Social Engineering, and Spam.

EMAIL DATA TO ANALYZE:
From: ${effectiveSender}
Subject: ${effectiveSubject}
SPF: ${headers.spf}
DKIM: ${headers.dkim}
DMARC: ${headers.dmarc}
Detected URLs: ${JSON.stringify(extractedUrls)}

EMAIL BODY / CONTENT:
"""
${body.slice(0, 10000)}
"""

Evaluate this email rigorously. Provide an accurate cyber analysis in pure JSON matching this exact structure:
{
  "riskScore": (integer between 0 and 100, where 0-30 is Safe, 31-60 is Suspicious, 61-80 is High Risk, 81-100 is Critical),
  "threatType": "(Phishing, Business Email Compromise (BEC), Scam/Fraud, Malicious URLs, Sender Impersonation, Credential Theft, Social Engineering, Spam, or Clean / Safe)",
  "confidence": (integer between 70 and 99),
  "severity": "(Safe, Suspicious, High, or Critical)",
  "summary": "(One concise sentence summarizing the security verdict)",
  "aiExplanation": "(Clear, plain-English 2-3 sentence explanation answering 'Why Was This Email Flagged?')",
  "findings": [
    {
      "category": "(Sender Analysis, URL Analysis, Content Analysis, Attachment Analysis, or Impersonation Analysis)",
      "severity": "(Safe, Low, Medium, High, or Critical)",
      "title": "(Concise finding title)",
      "explanation": "(Detailed explanation of the indicator)",
      "evidence": ["(Evidence snippet 1)", "(Evidence snippet 2)"],
      "confidenceScore": (integer 1-100)
    }
  ],
  "urls": [
    {
      "url": "(The URL string)",
      "domain": "(The domain name)",
      "status": "(Safe, Suspicious, or Malicious)",
      "riskScore": (integer 0-100),
      "protocol": "(HTTPS or HTTP)",
      "suspiciousPatterns": ["(Pattern 1)"],
      "detectionReason": "(Why this URL is safe or dangerous)"
    }
  ],
  "senderAnalysis": {
    "from": "${effectiveSender}",
    "domain": "(extracted domain)",
    "isSuspicious": (boolean),
    "reputation": "(Reputable, Neutral, Suspicious, or Malicious)",
    "impersonationTarget": "(Brand or individual targeted, or 'None')",
    "replyToMismatch": (boolean)
  },
  "authentication": {
    "spf": "${headers.spf}",
    "dkim": "${headers.dkim}",
    "dmarc": "${headers.dmarc}",
    "authenticationPassed": (boolean)
  },
  "recommendations": [
    "(Specific recommended action for user or SOC)"
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are an enterprise AI email threat detection engine. Output only strictly valid JSON matching the user schema.",
          },
        });

        const textResponse = response.text;
        if (textResponse) {
          aiResult = JSON.parse(textResponse);
          isAiGenerated = true;
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed or timed out, falling back to cybersecurity heuristic engine:", geminiError);
      }
    }

    // Fallback to our cybersecurity heuristics engine if Gemini not used or failed
    if (!aiResult) {
      aiResult = analyzeWithHeuristics({
        subject: effectiveSubject,
        sender: effectiveSender,
        body,
        urls: extractedUrls,
        headers,
      });
      isAiGenerated = false;
    }

    // Ensure all critical fields exist and are normalized
    const normalizedResult = {
      id: "scan-" + Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toISOString(),
      isDemoMode: !isAiGenerated,
      isAiGenerated,
      modelUsed: isAiGenerated ? "Gemini 3.8 Flash (Enterprise AI)" : "Cyber Heuristic Analysis Engine (Demo Mode)",
      subject: effectiveSubject,
      sender: effectiveSender,
      riskScore: Math.min(Math.max(Number(aiResult.riskScore) || 20, 0), 100),
      threatType: aiResult.threatType || "Phishing",
      confidence: Number(aiResult.confidence) || 90,
      severity: aiResult.severity || (aiResult.riskScore > 80 ? "Critical" : aiResult.riskScore > 60 ? "High" : aiResult.riskScore > 30 ? "Suspicious" : "Safe"),
      summary: aiResult.summary || "Automated email security evaluation complete.",
      aiExplanation: aiResult.aiExplanation || "Automated cybersecurity assessment based on email structure, headers, and content.",
      findings: Array.isArray(aiResult.findings) ? aiResult.findings : [],
      urls: Array.isArray(aiResult.urls) ? aiResult.urls : [],
      senderAnalysis: aiResult.senderAnalysis || {
        from: effectiveSender,
        domain: effectiveSender.split("@")[1] || "unknown",
        isSuspicious: false,
        reputation: "Neutral",
        impersonationTarget: "None",
      },
      headers: {
        from: effectiveSender,
        to: headers.to || "User",
        replyTo: headers.replyTo || effectiveSender,
        subject: effectiveSubject,
        date: headers.date,
        messageId: headers.messageId || `<${Math.random().toString(36).substring(2)}@mail.internal>`,
        received: headers.received,
      },
      authentication: aiResult.authentication || {
        spf: headers.spf,
        dkim: headers.dkim,
        dmarc: headers.dmarc,
        authenticationPassed: headers.spf === "Verified",
      },
      recommendations: Array.isArray(aiResult.recommendations) ? aiResult.recommendations : [
        "Do not click links without verifying sender through secondary channels.",
      ],
      rawBodyPreview: body.slice(0, 1500),
    };

    res.json(normalizedResult);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({
      error: "Internal server error during email threat analysis.",
      message: "An unexpected error occurred while parsing the email payload.",
    });
  }
});

// Setup Vite or static serving
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Email Threat Detection server running on http://0.0.0.0:${PORT}`);
  console.log(`Gemini API configured: ${isApiKeyConfigured ? "YES" : "NO (Demo Mode Active)"}`);
});
