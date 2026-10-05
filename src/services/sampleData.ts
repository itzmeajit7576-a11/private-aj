import { EmailAnalysis, HistoryItem } from "../types/threat";

export const SAMPLE_EMAILS = [
  {
    id: "sample-phishing-m365",
    label: "Microsoft 365 Credential Harvest",
    tag: "Phishing",
    riskLevel: "Critical",
    sender: "security-update@micros0ft-portal-auth.xyz",
    subject: "URGENT: Your Microsoft 365 Account Will Be Terminated in 24 Hours",
    rawEml: `From: "Microsoft Security Operations" <security-update@micros0ft-portal-auth.xyz>
To: target-employee@company.com
Reply-To: support@micros0ft-portal-auth.xyz
Subject: URGENT: Your Microsoft 365 Account Will Be Terminated in 24 Hours
Date: Mon, 05 Oct 2026 08:14:22 +0000
Message-ID: <20261005081422.phish.092@micros0ft-portal-auth.xyz>
Authentication-Results: mx.company.com; spf=fail (sender IP 194.26.29.112 not authorized); dkim=none; dmarc=fail action=none
Received: from mail.micros0ft-portal-auth.xyz (194.26.29.112)

Dear Valued Employee,

Your Microsoft 365 business license requires mandatory two-factor credential re-verification following abnormal login attempts from unknown IP 185.220.101.5.

Failure to re-authenticate within 24 hours will result in permanent mailbox suspension and revocation of all corporate cloud access.

Please verify your credentials immediately through the Microsoft Secure Gateway:
https://micros0ft-portal-auth.xyz/auth/login?tenant=company&session=982419

Do NOT forward this automated security notification.

Sincerely,
Microsoft Cloud Security Team
Redmond, WA`,
  },
  {
    id: "sample-bec-wire",
    label: "CEO Urgent Wire Transfer",
    tag: "BEC Scam",
    riskLevel: "Critical",
    sender: "ceo.richard.hendricks@executive-office-mail.com",
    subject: "CONFIDENTIAL: Immediate Vendor Acquisition Wire Authorization Required",
    rawEml: `From: "Richard Hendricks (CEO)" <ceo.richard.hendricks@executive-office-mail.com>
To: finance-director@company.com
Reply-To: richard.hendricks.private@gmail.com
Subject: CONFIDENTIAL: Immediate Vendor Acquisition Wire Authorization Required
Date: Mon, 05 Oct 2026 07:45:00 +0000
Message-ID: <exec-83921-priv@executive-office-mail.com>
Authentication-Results: mx.company.com; spf=none; dkim=none; dmarc=none

Hi,

I am currently in closed-door executive meetings with legal counsel regarding the strategic acquisition of our European supplier.

Due to stringent contractual deadlines, we must execute an initial escrow wire transfer of $84,500 today before 3:00 PM EST. Please do not call my mobile as I cannot step out of negotiations.

Reply immediately to this email so I can forward the beneficiary routing and invoice details. Treat this with absolute confidentiality until formal press disclosure tomorrow.

Sent from my iPad Pro
Richard Hendricks
Chief Executive Officer`,
  },
  {
    id: "sample-paypal-fraud",
    label: "PayPal Account Suspension Scam",
    tag: "Fraud",
    riskLevel: "High Risk",
    sender: "service@pay-pal-dispute-resolution.online",
    subject: "Action Required: Suspicious Transaction Flagged on Your PayPal Balance",
    rawEml: `From: "PayPal Resolution Center" <service@pay-pal-dispute-resolution.online>
To: billing-user@company.com
Subject: Action Required: Suspicious Transaction Flagged on Your PayPal Balance
Date: Sun, 04 Oct 2026 19:12:10 +0000
Message-ID: <pp-case-94182@pay-pal-dispute-resolution.online>
Authentication-Results: mx.company.com; spf=fail; dkim=fail; dmarc=fail

Hello PayPal Member,

We detected an unauthorized payment of $499.00 USD to 'Global Digital Goods Inc.' billed from your linked bank account.

If you did not authorize this purchase, cancel the transaction immediately by logging into our Resolution Center within the next 4 hours:
https://pay-pal-dispute-resolution.online/verify-dispute?case=PP-D-882194

If unresolved, this payment will be permanently posted to your account.

Thank you,
PayPal Customer Support`,
  },
  {
    id: "sample-dhl-malware",
    label: "DHL Delivery Notice with Malicious Link",
    tag: "Malicious URL",
    riskLevel: "Critical",
    sender: "tracking-notification@dhl-express-tracking24.top",
    subject: "Delivery Exception: Package #DHL-98421894 held at regional distribution hub",
    rawEml: `From: "DHL Express Support" <tracking-notification@dhl-express-tracking24.top>
To: shipping@company.com
Subject: Delivery Exception: Package #DHL-98421894 held at regional distribution hub
Date: Mon, 05 Oct 2026 04:30:19 +0000
Message-ID: <dhl-track-9938@dhl-express-tracking24.top>
Authentication-Results: mx.company.com; spf=fail; dkim=missing; dmarc=missing

Dear Customer,

Your parcel tracking code DHL-98421894 could not be delivered due to incomplete street address customs records.

A redelivery fee of $2.49 is pending. Review the shipping manifest and schedule redelivery now:
http://185.193.64.12/dhl-portal/manifest.php?id=98421894

Packages not claimed within 48 hours will be returned to the international distribution depot.

Regards,
DHL Express Logistics Center`,
  },
  {
    id: "sample-safe-internal",
    label: "Legitimate Corporate Newsletter",
    tag: "Clean / Safe",
    riskLevel: "Safe",
    sender: "security-awareness@company.com",
    subject: "Cybersecurity Awareness Month: October 2026 Training & Tips",
    rawEml: `From: "Cybersecurity Training" <security-awareness@company.com>
To: all-employees@company.com
Subject: Cybersecurity Awareness Month: October 2026 Training & Tips
Date: Mon, 05 Oct 2026 09:00:00 +0000
Message-ID: <cybersec-oct2026@company.com>
Authentication-Results: mx.company.com; spf=pass (ip=20.190.151.68); dkim=pass header.d=company.com; dmarc=pass action=none
Received: from internal-relay.company.com (20.190.151.68)

Team,

October is National Cybersecurity Awareness Month! As part of our commitment to safeguarding corporate infrastructure and customer data, our security team is launching the Q4 Interactive Security Refresher.

This month's 10-minute micro-module covers:
1. Recognizing sender address spoofing & lookalike domains
2. Multi-Factor Authentication (MFA) fatigue attacks
3. Safely reporting suspicious incoming emails via our Outlook Report button

Learn more on our internal knowledge base:
https://company.internal.portal/security/awareness-2026

Thank you for being our strongest first line of cyber defense.

Best regards,
Information Security & Compliance Team
Enterprise IT Operations`,
  },
];

export const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: "hist-001",
    date: "2026-10-05 08:14:22",
    subject: "URGENT: Your Microsoft 365 Account Will Be Terminated in 24 Hours",
    sender: "security-update@micros0ft-portal-auth.xyz",
    threatType: "Phishing (Brand Impersonation)",
    riskScore: 89,
    severity: "Critical",
    analysis: {
      id: "scan-001",
      timestamp: "2026-10-05T08:14:22Z",
      isDemoMode: true,
      isAiGenerated: true,
      modelUsed: "Gemini 3.8 Flash (Enterprise AI)",
      subject: "URGENT: Your Microsoft 365 Account Will Be Terminated in 24 Hours",
      sender: "security-update@micros0ft-portal-auth.xyz",
      riskScore: 89,
      threatType: "Phishing (Brand Impersonation)",
      confidence: 96,
      severity: "Critical",
      summary: "Critical phishing threat: Brand impersonation of Microsoft 365 coupled with credential harvesting URLs and forged SPF records.",
      aiExplanation: "This email was classified as CRITICAL RISK because it exhibits artificial urgency ('terminated in 24 hours'), brand impersonation targeting Microsoft 365, a fraudulent typosquatted domain ('micros0ft-portal-auth.xyz'), and completely failed SPF/DMARC authentication.",
      findings: [
        {
          category: "Impersonation Analysis",
          severity: "Critical",
          title: "Microsoft 365 Brand Spoofing",
          explanation: "Attacker mimics official Microsoft corporate branding while sending from an unregistered, disposable .xyz domain.",
          evidence: ["Claimed: Microsoft Cloud Security", "Sender domain: micros0ft-portal-auth.xyz (Typosquatted numeral '0')"],
          confidenceScore: 98,
        },
        {
          category: "URL Analysis",
          severity: "Critical",
          title: "Credential Harvesting Landing Portal",
          explanation: "Hyperlink directs victim to a fake Microsoft login page configured to harvest Active Directory credentials.",
          evidence: ["hxxps://micros0ft-portal-auth[.]xyz/auth/login?tenant=company"],
          confidenceScore: 95,
        },
        {
          category: "Content Analysis",
          severity: "High",
          title: "Extreme Artificial Urgency",
          explanation: "Threatens immediate service termination within 24 hours to induce panic and force bypass of security protocols.",
          evidence: ["'Mandatory re-verification within 24 hours'", "'Permanent mailbox suspension'"],
          confidenceScore: 92,
        },
        {
          category: "Sender Authentication",
          severity: "Critical",
          title: "Cryptographic Envelope Verification Failed",
          explanation: "SPF and DMARC failed validation. Originating IP 194.26.29.112 is not an authorized sender for the claimed domain.",
          evidence: ["SPF: Failed (IP 194.26.29.112)", "DMARC: Failed"],
          confidenceScore: 99,
        },
      ],
      urls: [
        {
          url: "https://micros0ft-portal-auth.xyz/auth/login?tenant=company&session=982419",
          domain: "micros0ft-portal-auth.xyz",
          status: "Malicious",
          riskScore: 96,
          protocol: "HTTPS",
          suspiciousPatterns: ["Typosquatting ('0' instead of 'o')", "Newly registered .xyz TLD", "Credential exfiltration URL parameters"],
          detectionReason: "Confirmed active phishing kit impersonating Microsoft Entra ID login portal.",
        },
      ],
      senderAnalysis: {
        from: "security-update@micros0ft-portal-auth.xyz",
        domain: "micros0ft-portal-auth.xyz",
        isSuspicious: true,
        reputation: "Hostile / Blacklisted",
        impersonationTarget: "Microsoft 365",
        replyToMismatch: false,
      },
      headers: {
        from: "security-update@micros0ft-portal-auth.xyz",
        to: "target-employee@company.com",
        replyTo: "support@micros0ft-portal-auth.xyz",
        subject: "URGENT: Your Microsoft 365 Account Will Be Terminated in 24 Hours",
        date: "Mon, 05 Oct 2026 08:14:22 +0000",
        messageId: "<20261005081422.phish.092@micros0ft-portal-auth.xyz>",
      },
      authentication: {
        spf: "Failed",
        dkim: "Missing",
        dmarc: "Failed",
        authenticationPassed: false,
      },
      recommendations: [
        "Do not click on links or input credentials.",
        "Block domain micros0ft-portal-auth.xyz at DNS and firewall perimeter.",
        "Add sender IP 194.26.29.112 to threat intel blacklist.",
        "Purge email from all corporate mailboxes via message trace purge.",
      ],
    },
  },
  {
    id: "hist-002",
    date: "2026-10-05 07:45:00",
    subject: "CONFIDENTIAL: Immediate Vendor Acquisition Wire Authorization Required",
    sender: "ceo.richard.hendricks@executive-office-mail.com",
    threatType: "Business Email Compromise (BEC)",
    riskScore: 84,
    severity: "Critical",
    analysis: {
      id: "scan-002",
      timestamp: "2026-10-05T07:45:00Z",
      isDemoMode: true,
      isAiGenerated: true,
      modelUsed: "Gemini 3.8 Flash (Enterprise AI)",
      subject: "CONFIDENTIAL: Immediate Vendor Acquisition Wire Authorization Required",
      sender: "ceo.richard.hendricks@executive-office-mail.com",
      riskScore: 84,
      threatType: "Business Email Compromise (BEC)",
      confidence: 94,
      severity: "Critical",
      summary: "High-confidence CEO fraud / BEC attack attempting unauthorized wire authorization.",
      aiExplanation: "This email was flagged with an 84/100 risk score because it matches textbook Executive Impersonation (BEC). The sender uses a lookalike display name pretending to be the CEO, asks for an urgent $84,500 wire, insists on secrecy, explicitly forbids telephone verification, and redirects replies to a personal Gmail address.",
      findings: [
        {
          category: "Impersonation Analysis",
          severity: "Critical",
          title: "Executive Identity Impersonation (CEO Fraud)",
          explanation: "Display name spoofing targeting the Chief Executive Officer to intimidate financial staff into bypassing approval matrices.",
          evidence: ["Claimed identity: Richard Hendricks (CEO)", "Envelope domain: executive-office-mail.com"],
          confidenceScore: 96,
        },
        {
          category: "Sender Analysis",
          severity: "Critical",
          title: "Reply-To Redirection to Personal Webmail",
          explanation: "The Reply-To header diverts replies away from corporate servers directly to richard.hendricks.private@gmail.com controlled by the adversary.",
          evidence: ["Reply-To: richard.hendricks.private@gmail.com"],
          confidenceScore: 99,
        },
        {
          category: "Content Analysis",
          severity: "High",
          title: "Social Engineering & Out-of-Band Channel Block",
          explanation: "Adversary specifically tells recipient 'Please do not call my mobile' to prevent verbal verification.",
          evidence: ["Requested wire: $84,500", "Forbidden phone verification"],
          confidenceScore: 94,
        },
      ],
      urls: [],
      senderAnalysis: {
        from: "ceo.richard.hendricks@executive-office-mail.com",
        domain: "executive-office-mail.com",
        isSuspicious: true,
        reputation: "Suspicious / Unverified Domain",
        impersonationTarget: "Richard Hendricks (CEO)",
        replyToMismatch: true,
      },
      headers: {
        from: "ceo.richard.hendricks@executive-office-mail.com",
        to: "finance-director@company.com",
        replyTo: "richard.hendricks.private@gmail.com",
        subject: "CONFIDENTIAL: Immediate Vendor Acquisition Wire Authorization Required",
        date: "Mon, 05 Oct 2026 07:45:00 +0000",
        messageId: "<exec-83921-priv@executive-office-mail.com>",
      },
      authentication: {
        spf: "Missing",
        dkim: "Missing",
        dmarc: "Missing",
        authenticationPassed: false,
      },
      recommendations: [
        "DO NOT execute wire transfers or respond to this message.",
        "Perform verbal out-of-band verification directly with the executive using officially recorded phone extension.",
        "Notify the Chief Information Security Officer (CISO) and Treasury department.",
      ],
    },
  },
  {
    id: "hist-003",
    date: "2026-10-04 19:12:10",
    subject: "Action Required: Suspicious Transaction Flagged on Your PayPal Balance",
    sender: "service@pay-pal-dispute-resolution.online",
    threatType: "Scam / Fraud",
    riskScore: 78,
    severity: "High",
    analysis: {
      id: "scan-003",
      timestamp: "2026-10-04T19:12:10Z",
      isDemoMode: true,
      isAiGenerated: true,
      modelUsed: "Gemini 3.8 Flash (Enterprise AI)",
      subject: "Action Required: Suspicious Transaction Flagged on Your PayPal Balance",
      sender: "service@pay-pal-dispute-resolution.online",
      riskScore: 78,
      threatType: "Scam / Fraud",
      confidence: 91,
      severity: "High",
      summary: "Financial scam email spoofing PayPal security alerts to steal payment credentials.",
      aiExplanation: "Flagged due to PayPal brand impersonation from an unauthorized domain, fake invoice scare tactics ($499 claim), and links to an unverified dispute resolution portal.",
      findings: [
        {
          category: "Impersonation Analysis",
          severity: "High",
          title: "PayPal Brand Infringement",
          explanation: "Impersonates PayPal customer resolution team from a 3rd party domain registered within the last 30 days.",
          evidence: ["Domain: pay-pal-dispute-resolution.online"],
          confidenceScore: 93,
        },
        {
          category: "URL Analysis",
          severity: "High",
          title: "Fraudulent Payment Dispute Link",
          explanation: "Link routes to a phishing credential harvester hosted on cheap cloud infrastructure.",
          evidence: ["pay-pal-dispute-resolution.online"],
          confidenceScore: 90,
        },
      ],
      urls: [
        {
          url: "https://pay-pal-dispute-resolution.online/verify-dispute?case=PP-D-882194",
          domain: "pay-pal-dispute-resolution.online",
          status: "Malicious",
          riskScore: 88,
          protocol: "HTTPS",
          suspiciousPatterns: ["Brand name hyphenated in domain", "Newly registered domain", "Dispute case lure"],
          detectionReason: "Unregistered domain attempting fraudulent harvesting of PayPal account credentials.",
        },
      ],
      senderAnalysis: {
        from: "service@pay-pal-dispute-resolution.online",
        domain: "pay-pal-dispute-resolution.online",
        isSuspicious: true,
        reputation: "Suspicious",
        impersonationTarget: "PayPal Inc.",
      },
      headers: {
        from: "service@pay-pal-dispute-resolution.online",
        to: "billing-user@company.com",
        replyTo: "service@pay-pal-dispute-resolution.online",
        subject: "Action Required: Suspicious Transaction Flagged on Your PayPal Balance",
        date: "Sun, 04 Oct 2026 19:12:10 +0000",
        messageId: "<pp-case-94182@pay-pal-dispute-resolution.online>",
      },
      authentication: {
        spf: "Failed",
        dkim: "Failed",
        dmarc: "Failed",
        authenticationPassed: false,
      },
      recommendations: [
        "Do not visit the dispute link.",
        "Check genuine account status directly at paypal.com by opening a new browser tab.",
      ],
    },
  },
  {
    id: "hist-004",
    date: "2026-10-04 14:02:11",
    subject: "Cybersecurity Awareness Month: October 2026 Training & Tips",
    sender: "security-awareness@company.com",
    threatType: "Clean / Legitimate",
    riskScore: 8,
    severity: "Safe",
    analysis: {
      id: "scan-004",
      timestamp: "2026-10-04T14:02:11Z",
      isDemoMode: true,
      isAiGenerated: true,
      modelUsed: "Gemini 3.8 Flash (Enterprise AI)",
      subject: "Cybersecurity Awareness Month: October 2026 Training & Tips",
      sender: "security-awareness@company.com",
      riskScore: 8,
      threatType: "Clean / Legitimate",
      confidence: 98,
      severity: "Safe",
      summary: "Benign internal corporate communication with verified cryptographic headers and internal portal links.",
      aiExplanation: "This email was marked SAFE (8/100). The sender matches corporate domain records, SPF and DKIM pass with full validation, and the embedded links route solely to authenticated internal intranets.",
      findings: [
        {
          category: "Sender Authentication",
          severity: "Safe",
          title: "Full Cryptographic Alignment (SPF/DKIM/DMARC)",
          explanation: "All mail authentication checks passed successfully against corporate tenant policies.",
          evidence: ["SPF: Pass", "DKIM: Pass", "DMARC: Pass"],
          confidenceScore: 100,
        },
        {
          category: "URL Analysis",
          severity: "Safe",
          title: "Legitimate Corporate Intranet Destination",
          explanation: "Links resolve to internal protected resource servers with no external data exfiltration.",
          evidence: ["company.internal.portal"],
          confidenceScore: 98,
        },
      ],
      urls: [
        {
          url: "https://company.internal.portal/security/awareness-2026",
          domain: "company.internal.portal",
          status: "Safe",
          riskScore: 2,
          protocol: "HTTPS",
          suspiciousPatterns: [],
          detectionReason: "Internal corporate portal domain.",
        },
      ],
      senderAnalysis: {
        from: "security-awareness@company.com",
        domain: "company.com",
        isSuspicious: false,
        reputation: "Verified Internal",
        impersonationTarget: "None",
      },
      headers: {
        from: "security-awareness@company.com",
        to: "all-employees@company.com",
        replyTo: "security-awareness@company.com",
        subject: "Cybersecurity Awareness Month: October 2026 Training & Tips",
        date: "Mon, 05 Oct 2026 09:00:00 +0000",
        messageId: "<cybersec-oct2026@company.com>",
      },
      authentication: {
        spf: "Verified",
        dkim: "Verified",
        dmarc: "Verified",
        authenticationPassed: true,
      },
      recommendations: [
        "No threat detected. Proceed with normal business interaction.",
      ],
    },
  },
];
