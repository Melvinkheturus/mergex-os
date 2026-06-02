"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

type Tab = "standard" | "recovery";
type StandardStep = "email" | "sent";
type RecoveryStep = "form" | "success";

// ── Error Message Component ──────────────────────────────────────────────────

function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5">
      <p className="text-[10px] font-medium text-rose-400 leading-relaxed">
        {message}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

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
  const [recStep, setRecoveryStep] = useState<RecoveryStep>("form");
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleStandardReset = async () => {
    if (!stdEmail) {
      setStdError("Email is required");
      return;
    }
    setStdLoading(true);
    setStdError("");
    try {
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
    if (!recEmail || !recCode) {
      setRecError("All fields are required");
      return;
    }
    setRecLoading(true);
    setRecError("");
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
      setRecoveryStep("success");
    } catch {
      setRecError("Network error. Please try again.");
    } finally {
      setRecLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (tab === "standard" && stdStep === "email") {
        handleStandardReset();
      } else if (tab === "recovery" && recStep === "form") {
        handleRecoveryVerify();
      }
    }
  };

  return (
    <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden">
      {/* Background radial ambient glow */}
      <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

      {/* Left Side: Gradient Banner */}
      <div className="relative w-full md:w-[44%] lg:w-[42%] xl:w-[40%] rounded-[20px] overflow-hidden bg-[#060608] p-6 md:p-8 flex flex-col justify-between min-h-[350px] md:min-h-0 md:h-full border border-white/5 border-b-transparent shadow-[0_0_50px_-12px_rgba(139,92,246,0.12)] shrink-0 select-none">
        
        {/* Arch Shaped Violet/Purple Dome Gradient (Curved n-shape dome dropping on sides) */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(100% 60% at 50% 0%, #8b5cf6 0%, #6d28d9 35%, #3b0764 65%, #060608 100%)"
          }}
        />

        {/* Textured SVG Grains Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay z-1"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Dissolve bottom card edge with page background color (#060608) */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#060608] via-[#060608]/95 to-transparent pointer-events-none z-2" />

        {/* Decorative ambient elements inside the card */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none z-1" />
        
        {/* Logo & Header using local brand assets */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo/flat_logo.png" alt="MergeX Logo" className="h-6 w-auto object-contain brightness-200" />
          <div className="pl-1">
            <span className="text-sm font-extrabold tracking-tight text-white leading-none block">
              MergeX OS
            </span>
          </div>
        </div>

        {/* Core Content */}
        <div className="relative z-10 my-auto py-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-[1.15]">
            Password Recovery
          </h1>
          <p className="text-xs text-white/60 mt-2 max-w-[260px] leading-relaxed">
            Secure pathways to regain your primary workspace access.
          </p>

          {/* Stepper / Features Indicators */}
          <div className="mt-6 space-y-3.5 max-w-[260px]">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <Mail className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Identity Verification
                </p>
                <p className="text-[9px] text-white/30">Verify ownership with encrypted links</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <KeyRound className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Super Admin Recovery
                </p>
                <p className="text-[9px] text-white/30">Use secure backup codes for emergency access</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Immediate Restoration
                </p>
                <p className="text-[9px] text-white/30">Restore credentials and instantly log back in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note moved from right side */}
        <div className="relative z-10 text-center text-[10px] text-white/30 select-none">
          Access is invite-only. Contact your admin to request access.
        </div>

      </div>

      {/* Right Side: Form Workspace (Directly on Page BG) */}
      <div className="w-full md:flex-1 flex flex-col items-center py-4 px-4 relative z-10 overflow-y-auto h-full max-h-full animate-fade-in">
        
        <div className="w-full max-w-[420px] space-y-5 my-auto py-6">
          
          {/* Header info */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Reset Password
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-normal">
              Choose how you want to restore access to your workspace
            </p>
          </div>

          {/* Form container */}
          <div className="rounded-xl border border-white/5 bg-[#121214]/50 overflow-hidden shadow-2xl">
            {/* Tabs */}
            <div className="flex border-b border-white/5 bg-white/1">
              <button
                type="button"
                onClick={() => setTab("standard")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider select-none transition-colors border-b-2 ${
                  tab === "standard"
                    ? "text-white border-purple-500 bg-white/1"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email Reset
              </button>
              <button
                type="button"
                onClick={() => setTab("recovery")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-wider select-none transition-colors border-b-2 ${
                  tab === "recovery"
                    ? "text-white border-purple-500 bg-white/1"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Recovery Code
              </button>
            </div>

            <div className="p-6 space-y-4" onKeyDown={handleKeyDown}>
              {/* ── Standard Reset ─────────────────────────────── */}
              {tab === "standard" && (
                <>
                  {stdStep === "sent" ? (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Check your inbox</p>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                          We&apos;ve sent a password reset link to <strong className="text-white">{stdEmail}</strong>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStdStep("email");
                          setStdEmail("");
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Try a different email
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1 w-full">
                        <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase select-none">
                          Work Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="email"
                            value={stdEmail}
                            onChange={(e) => setStdEmail(e.target.value)}
                            placeholder="you@company.com"
                            autoFocus
                            disabled={stdLoading}
                            className="w-full rounded-lg border border-white/10 bg-transparent pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
                          />
                        </div>
                      </div>
                      {stdError && <ErrorMsg message={stdError} />}
                      
                      <div className="pt-2 flex items-center justify-between">
                        <Link
                          href="/sign-in"
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Back to Sign In
                        </Link>
                        
                        <LiquidMetalButton
                          label={stdLoading ? "Sending..." : "Send Reset Link"}
                          width={150}
                          height={42}
                          onClick={handleStandardReset}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── Recovery Code (Super Admin) ────────────────── */}
              {tab === "recovery" && (
                <>
                  {recStep === "success" ? (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Recovery verified</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Click the button below to set your new password.
                        </p>
                      </div>
                      <div className="pt-2 flex flex-col items-center gap-3">
                        <a
                          href={resetUrl}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-zinc-100 text-black py-2.5 px-5 text-xs font-bold shadow-lg shadow-black/25 active:scale-[0.99] transition-all duration-200"
                        >
                          Set New Password
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href="/sign-in"
                          className="text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3.5 py-2.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium text-purple-300/80 leading-relaxed">
                          <strong>Super Admin Only:</strong> Enter your admin email and the secure recovery code generated during initialization.
                        </p>
                      </div>
                      
                      <div className="space-y-1 w-full">
                        <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase select-none">
                          Admin Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="email"
                            value={recEmail}
                            onChange={(e) => setRecEmail(e.target.value)}
                            placeholder="admin@company.com"
                            autoFocus
                            disabled={recLoading}
                            className="w-full rounded-lg border border-white/10 bg-transparent pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 w-full">
                        <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase select-none">
                          Recovery Code
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="text"
                            value={recCode}
                            onChange={(e) => setRecCode(e.target.value)}
                            placeholder="MX-XXXX-XXXX-XXXX"
                            disabled={recLoading}
                            className="w-full rounded-lg border border-white/10 bg-transparent pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15 font-mono uppercase tracking-wider"
                          />
                        </div>
                      </div>

                      {recError && <ErrorMsg message={recError} />}
                      
                      <div className="pt-2 flex items-center justify-between">
                        <Link
                          href="/sign-in"
                          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Back to Sign In
                        </Link>
                        
                        <LiquidMetalButton
                          label={recLoading ? "Verifying..." : "Verify Code"}
                          width={140}
                          height={42}
                          onClick={handleRecoveryVerify}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
