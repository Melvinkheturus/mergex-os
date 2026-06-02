"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, KeyRound, ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";

type Tab = "standard" | "recovery";
type StandardStep = "email" | "sent";
type RecoveryStep = "form" | "success";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo/mergex-logo.png" alt="MergeX Logo" className="w-9 h-9 object-contain shrink-0" />
      <div>
        <p className="text-sm font-semibold text-foreground tracking-tight leading-none">MergeX</p>
        <p className="text-xs text-muted-foreground mt-0.5">Sales OS</p>
      </div>
    </div>
  );
}

function Field({
  label, type = "text", value, onChange, placeholder, disabled, autoFocus,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled} autoFocus={autoFocus}
        className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("standard");

  // Standard reset state
  const [stdEmail, setStdEmail] = useState("");
  const [stdStep, setStdStep] = useState<StandardStep>("email");
  const [stdLoading, setStdLoading] = useState(false);
  const [stdError, setStdError] = useState("");

  // Recovery code state
  const [recEmail, setRecEmail] = useState("");
  const [recCode, setRecCode] = useState("");
  const [recStep, setRecStep] = useState<RecoveryStep>("form");
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleStandardReset = async () => {
    if (!stdEmail) { setStdError("Email is required"); return; }
    setStdLoading(true); setStdError("");
    try {
      // Clerk handles password reset emails via their built-in flow
      // We redirect to Clerk's forgot password URL with the email pre-filled
      // For custom implementations, use the Clerk SDK
      const res = await fetch("/api/auth/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: stdEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setStdError(data.error ?? "Something went wrong");
        return;
      }
      setStdStep("sent");
    } catch {
      setStdError("Network error. Please try again.");
    } finally {
      setStdLoading(false);
    }
  };

  const handleRecoveryVerify = async () => {
    if (!recEmail || !recCode) { setRecError("All fields are required"); return; }
    setRecLoading(true); setRecError("");
    try {
      const res = await fetch("/api/auth/recovery-code/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recEmail, code: recCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRecError(data.error ?? "Verification failed");
        return;
      }
      setResetUrl(data.resetUrl);
      setRecStep("success");
    } catch {
      setRecError("Network error. Please try again.");
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#0B0B0F] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      <div className="relative w-full max-w-[420px]">
        <div className="bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#26262C] rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#E5E7EB] dark:border-[#26262C]">
            <Logo />
            <div className="mt-6">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">Reset Password</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Choose how you want to reset your password
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#E5E7EB] dark:border-[#26262C]">
            <button
              onClick={() => setTab("standard")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-medium transition-colors ${
                tab === "standard"
                  ? "text-[#8B5CF6] border-b-2 border-[#8B5CF6] -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Reset
            </button>
            <button
              onClick={() => setTab("recovery")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-medium transition-colors ${
                tab === "recovery"
                  ? "text-[#8B5CF6] border-b-2 border-[#8B5CF6] -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Recovery Code
            </button>
          </div>

          <div className="px-8 py-6 space-y-4">
            {/* ── Standard Reset ─────────────────────────────── */}
            {tab === "standard" && (
              <>
                {stdStep === "sent" ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Check your inbox</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      We&apos;ve sent a password reset link to <strong>{stdEmail}</strong>.
                    </p>
                    <button
                      onClick={() => { setStdStep("email"); setStdEmail(""); }}
                      className="mt-4 text-xs text-[#8B5CF6] hover:underline"
                    >
                      Try a different email
                    </button>
                  </div>
                ) : (
                  <>
                    <Field
                      label="Work Email"
                      type="email"
                      value={stdEmail}
                      onChange={setStdEmail}
                      placeholder="you@company.com"
                      autoFocus
                    />
                    {stdError && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{stdError}</p>
                    )}
                    <button
                      onClick={handleStandardReset}
                      disabled={stdLoading || !stdEmail}
                      className="w-full h-12 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {stdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Send Reset Link
                    </button>
                  </>
                )}
              </>
            )}

            {/* ── Recovery Code (Super Admin) ────────────────── */}
            {tab === "recovery" && (
              <>
                {recStep === "success" ? (
                  <div className="text-center py-4 space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Recovery verified</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click the button below to set your new password.
                      </p>
                    </div>
                    <a
                      href={resetUrl}
                      className="w-full h-12 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] transition-colors flex items-center justify-center gap-2"
                    >
                      Set New Password
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Super Admin only.</strong> Enter your email and the recovery code
                        stored in your secure vault.
                      </p>
                    </div>
                    <Field
                      label="Admin Email"
                      type="email"
                      value={recEmail}
                      onChange={setRecEmail}
                      placeholder="admin@company.com"
                      autoFocus
                    />
                    <Field
                      label="Recovery Code"
                      value={recCode}
                      onChange={setRecCode}
                      placeholder="MX-XXXX-XXXX-XXXX"
                    />
                    {recError && (
                      <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{recError}</p>
                    )}
                    <button
                      onClick={handleRecoveryVerify}
                      disabled={recLoading || !recEmail || !recCode}
                      className="w-full h-12 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {recLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Verify & Get Reset Link
                    </button>
                  </>
                )}
              </>
            )}

            {/* Back to sign in */}
            <div className="pt-2">
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
