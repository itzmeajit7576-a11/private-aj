import React, { useState } from "react";
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Key, 
  ArrowRight,
  Loader2,
  Sparkles,
  Crown
} from "lucide-react";
import { User } from "../types/threat";
import { 
  loginWithEmailPassword, 
  registerWithEmailPassword, 
  loginWithGoogle, 
  resetUserPassword,
  ADMIN_USER_ID
} from "../services/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultEmail?: string;
}

function getFriendlyFirebaseError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "This email address is already registered in Firebase. Please switch to Sign In.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/user-not-found":
      return "No user found with this email. Please check spelling or create an account.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please verify and try again.";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Account temporarily locked for security. Please try again later or reset password.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completion.";
    case "auth/popup-blocked":
      return "Popup was blocked by the browser. Please allow popups or use Email/Password.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in provider is disabled in Firebase Console. Please verify.";
    default:
      return err?.message || "Authentication error occurred. Please try again.";
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultEmail = "itzmeajit7576@gmail.com"
}) => {
  const [tab, setTab] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("Ajit");
  const [role, setRole] = useState("Senior SOC Analyst (Level 3)");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid corporate or personal email address.");
      return;
    }

    if (tab === "forgot") {
      try {
        setIsSubmitting(true);
        await resetUserPassword(email.trim());
        setSuccessMsg(`Firebase password reset email dispatched to ${email.trim()}. Please check your inbox or spam.`);
        setTimeout(() => {
          setTab("login");
          setSuccessMsg(null);
        }, 3500);
      } catch (err: any) {
        setErrorMsg(getFriendlyFirebaseError(err));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (tab === "signup") {
      if (!fullName.trim()) {
        setErrorMsg("Full Name is required for audit and compliance logging.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      try {
        setIsSubmitting(true);
        const appUser = await registerWithEmailPassword(
          email.trim(),
          password,
          fullName.trim(),
          role
        );
        setSuccessMsg(`Firebase user registered for ${appUser.email}! Redirecting...`);
        setTimeout(() => {
          onSuccess(appUser);
          onClose();
        }, 700);
      } catch (err: any) {
        setErrorMsg(getFriendlyFirebaseError(err));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (tab === "login") {
      try {
        setIsSubmitting(true);
        const appUser = await loginWithEmailPassword(email.trim(), password);
        setSuccessMsg(`Authenticated with Firebase as ${appUser.email}! Welcome back.`);
        setTimeout(() => {
          onSuccess(appUser);
          onClose();
        }, 600);
      } catch (err: any) {
        setErrorMsg(getFriendlyFirebaseError(err));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg("Connecting to Google SSO via Firebase...");
    setIsSubmitting(true);

    try {
      const appUser = await loginWithGoogle();
      setSuccessMsg(`Google SSO verified for ${appUser.email}! Redirecting...`);
      setTimeout(() => {
        onSuccess(appUser);
        onClose();
      }, 600);
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg(getFriendlyFirebaseError(err));
      } else {
        setSuccessMsg(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glowing cyber accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {tab === "login" && "Sign In with Email & Password"}
            {tab === "signup" && "Create Firebase Security Account"}
            {tab === "forgot" && "Recover Security Credentials"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise authentication connected to Firebase Auth & Storage
          </p>
        </div>

        {/* Google SSO Quick Auth */}
        {tab !== "forgot" && (
          <div className="space-y-2 mb-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const adminUser: User = {
                  id: ADMIN_USER_ID,
                  name: "Global Security Administrator",
                  email: "admin@threatdefense.corp",
                  role: "Global System Administrator (Full Access)",
                  organization: "Cloud Threat Defense Admin Operations",
                  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AdminGlobal",
                };
                setSuccessMsg(`Authenticated as Admin (${ADMIN_USER_ID})! Launching Admin Console...`);
                setTimeout(() => {
                  onSuccess(adminUser);
                  onClose();
                }, 600);
              }}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-200 border border-red-500/40 hover:border-red-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign in as Admin (UID: {ADMIN_USER_ID.slice(0, 10)}...)</span>
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] font-mono text-slate-500 uppercase">Or use Firebase Email/Password</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>
          </div>
        )}

        {/* Tab switch */}
        {tab !== "forgot" && (
          <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                tab === "login"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                tab === "signup"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Feedback messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          {tab === "signup" && (
            <>
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ajit"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Security Role / Clearance</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500 text-slate-200 outline-none cursor-pointer"
                >
                  <option value="Senior SOC Analyst (Level 3)">Senior SOC Analyst (Level 3)</option>
                  <option value="Principal Threat Hunter">Principal Threat Hunter</option>
                  <option value="Incident Response Lead">Incident Response Lead</option>
                  <option value="Chief Information Security Officer">CISO / Security Director</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="itzmeajit7576@gmail.com"
                required
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500 text-slate-200 outline-none"
              />
            </div>
          </div>

          {tab !== "forgot" && (
            <div>
              <label className="block text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500 text-slate-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {tab === "signup" && (
            <div>
              <label className="block text-slate-400 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-slate-800 focus:border-cyan-500 text-slate-200 outline-none"
                />
              </div>
            </div>
          )}

          {tab === "login" && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-black/60 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setTab("forgot")}
                className="text-cyan-400 hover:text-cyan-300"
              >
                Forgot password?
              </button>
            </div>
          )}

          {tab === "forgot" && (
            <div className="text-right text-[11px] pt-1">
              <button
                type="button"
                onClick={() => setTab("login")}
                className="text-cyan-400 hover:text-cyan-300"
              >
                Back to Sign In
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Firebase Auth...</span>
              </>
            ) : (
              <>
                <span>
                  {tab === "login" && "Sign In with Firebase"}
                  {tab === "signup" && "Create Account"}
                  {tab === "forgot" && "Send Firebase Recovery Email"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
