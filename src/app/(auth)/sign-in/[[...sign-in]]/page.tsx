"use client";

import { useState } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Loader2, Mail, IdCard, ArrowRight, ShieldCheck, Eye, EyeOff,
} from "lucide-react";

type AuthMode = "select" | "google" | "email-otp" | "employee-otp";
type OtpStep = "email" | "otp";

// ── Logo ──────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] flex items-center justify-center shadow-sm">
        <span className="text-white font-bold text-sm tracking-tight">M</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground tracking-tight leading-none">MergeX</p>
        <p className="text-xs text-muted-foreground mt-0.5">Sales OS</p>
      </div>
    </div>
  );
}

// ── Google Icon SVG ───────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── Method card ───────────────────────────────────────────
function MethodCard({
  icon: Icon, title, description, onClick, badge, googleIcon,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  googleIcon?: boolean;
  title: string; description: string; onClick: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#16161A] hover:border-[#8B5CF6]/40 hover:bg-[#F3E8FF]/30 dark:hover:bg-[#8B5CF6]/5 transition-all duration-200 text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-[#F8F8FA] dark:bg-[#26262C] group-hover:bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0 transition-colors duration-200">
        {googleIcon ? (
          <GoogleIcon />
        ) : Icon ? (
          <Icon className="w-5 h-5 text-[#6B7280] group-hover:text-[#8B5CF6] transition-colors duration-200" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {badge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6] uppercase tracking-wide">{badge}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
    </button>
  );
}

// ── Field ─────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, disabled, autoFocus, suffix }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; autoFocus?: boolean; suffix?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled} autoFocus={autoFocus}
          className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
    </div>
  );
}

// ── OTP Input ─────────────────────────────────────────────
function OtpInput({ value, onChange, prefix = "otp" }: { value: string; onChange: (v: string) => void; prefix?: string }) {
  const digits = [...value.split("").slice(0, 6)];
  while (digits.length < 6) digits.push("");
  const focus = (i: number) => (document.getElementById(`${prefix}-${i}`) as HTMLInputElement)?.focus();
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Verification Code</label>
      <div className="flex gap-2">
        {digits.map((d, i) => (
          <input key={i} id={`${prefix}-${i}`} type="text" inputMode="numeric" maxLength={1}
            value={d}
            onChange={(e) => {
              const v = e.target.value.slice(-1);
              const next = [...digits]; next[i] = v; onChange(next.join(""));
              if (v) focus(i + 1);
            }}
            onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i] && i > 0) focus(i - 1); }}
            autoFocus={i === 0}
            className="w-full h-12 text-center text-lg font-semibold rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all duration-150"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return <p className="text-xs text-[#EF4444] bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-xl px-3 py-2.5">{message}</p>;
}

function PrimaryButton({ children, onClick, loading, disabled }: {
  children: React.ReactNode; onClick?: () => void; loading?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="w-full h-12 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150">
      ← Back to sign in options
    </button>
  );
}

// ── Email OTP Flow ────────────────────────────────────────
function EmailOtpFlow({ onBack }: { onBack: () => void }) {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const [step, setStep] = useState<OtpStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    if (!signIn || !email) return;
    setLoading(true); setError("");
    try {
      const { error: createErr } = await signIn.create({ identifier: email });
      if (createErr) { setError(createErr.message); return; }
      const { error: sendErr } = await signIn.emailCode.sendCode();
      if (sendErr) { setError(sendErr.message); return; }
      setStep("otp");
    } catch { setError("Failed to send code. Please try again."); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!signIn || otp.length < 6) return;
    setLoading(true); setError("");
    try {
      const { error: verifyErr } = await signIn.emailCode.verifyCode({ code: otp });
      if (verifyErr) { setError(verifyErr.message); setOtp(""); return; }
      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId });
        router.push("/dashboard");
      }
    } catch { setError("Verification failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      {step === "email" ? (
        <>
          <div>
            <p className="text-sm font-medium text-foreground">Email + One-Time Code</p>
            <p className="text-xs text-muted-foreground">Enter your work email. We'll send a 6-digit code.</p>
          </div>
          <Field label="Work Email" type="email" value={email} onChange={setEmail} placeholder="you@mergex.in" autoFocus />
          {error && <ErrorMsg message={error} />}
          <PrimaryButton loading={loading} onClick={sendOtp} disabled={!email}>
            Send Verification Code <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium text-foreground">Check your inbox</p>
            <p className="text-xs text-muted-foreground">6-digit code sent to <span className="text-foreground font-medium">{email}</span></p>
          </div>
          <OtpInput value={otp} onChange={setOtp} prefix="eotp" />
          {error && <ErrorMsg message={error} />}
          <PrimaryButton loading={loading} onClick={verifyOtp} disabled={otp.length < 6}>Verify & Sign In</PrimaryButton>
          <button onClick={() => { setStep("email"); setOtp(""); setError(""); }}
            className="text-xs text-muted-foreground hover:text-[#8B5CF6] transition-colors text-center">
            Didn't receive it? Resend code
          </button>
        </>
      )}
      <BackBtn onClick={onBack} />
    </div>
  );
}

// ── Employee ID Flow ──────────────────────────────────────
function EmployeeIdFlow({ onBack }: { onBack: () => void }) {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyCredentials = async () => {
    if (!signIn || !employeeId || !password) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/employee-verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password }),
      });
      const data = await res.json() as { success: boolean; email?: string; error?: string };
      if (!res.ok || !data.success) { setError(data.error ?? "Invalid credentials."); return; }
      setEmail(data.email!);
      const { error: createErr } = await signIn.create({ identifier: data.email! });
      if (createErr) { setError(createErr.message); return; }
      const { error: sendErr } = await signIn.emailCode.sendCode();
      if (sendErr) { setError(sendErr.message); return; }
      setStep("otp");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!signIn || otp.length < 6) return;
    setLoading(true); setError("");
    try {
      const { error: verifyErr } = await signIn.emailCode.verifyCode({ code: otp });
      if (verifyErr) { setError(verifyErr.message); setOtp(""); return; }
      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId });
        router.push("/dashboard");
      }
    } catch { setError("Verification failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      {step === "credentials" ? (
        <>
          <div>
            <p className="text-sm font-medium text-foreground">Employee Login</p>
            <p className="text-xs text-muted-foreground">Use your company-issued employee ID and password.</p>
          </div>
          <Field label="Employee ID" value={employeeId} onChange={setEmployeeId} placeholder="EMP-00123" autoFocus />
          <Field label="Password" type={showPw ? "text" : "password"} value={password} onChange={setPassword} placeholder="••••••••••"
            suffix={
              <button type="button" onClick={() => setShowPw(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          {error && <ErrorMsg message={error} />}
          <PrimaryButton loading={loading} onClick={verifyCredentials} disabled={!employeeId || !password}>
            Continue <ArrowRight className="w-4 h-4" />
          </PrimaryButton>
        </>
      ) : (
        <>
          <div>
            <p className="text-sm font-medium text-foreground">One more step</p>
            <p className="text-xs text-muted-foreground">6-digit code sent to <span className="text-foreground font-medium">{email}</span></p>
          </div>
          <OtpInput value={otp} onChange={setOtp} prefix="emp-otp" />
          {error && <ErrorMsg message={error} />}
          <PrimaryButton loading={loading} onClick={verifyOtp} disabled={otp.length < 6}>Verify & Sign In</PrimaryButton>
        </>
      )}
      <BackBtn onClick={onBack} />
    </div>
  );
}

// ── Google OAuth Flow ─────────────────────────────────────
function GoogleFlow({ onBack }: { onBack: () => void }) {
  const { signIn } = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    if (!signIn) return;
    setLoading(true); setError("");
    try {
      const { error: ssoErr } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectCallbackUrl: `${window.location.origin}/sso-callback`,
      });
      if (ssoErr) { setError(ssoErr.message); setLoading(false); }
    } catch { setError("Google sign-in failed. Please try again."); setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-foreground">Continue with Google</p>
        <p className="text-xs text-muted-foreground">Sign in using your Google Workspace account.</p>
      </div>
      {error && <ErrorMsg message={error} />}
      <button onClick={handleGoogle} disabled={loading}
        className="w-full h-12 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#16161A] hover:bg-[#F8F8FA] dark:hover:bg-[#111114] text-sm font-medium text-foreground flex items-center justify-center gap-3 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><GoogleIcon /> Sign in with Google</>}
      </button>
      <BackBtn onClick={onBack} />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function SignInPage() {
  const [mode, setMode] = useState<AuthMode>("select");

  return (
    <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#0B0B0F] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      <div className="relative w-full max-w-[400px]">
        <div className="bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#26262C] rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#E5E7EB] dark:border-[#26262C]">
            <Logo />
            <div className="mt-6">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                {mode === "select" ? "Sign in to your workspace" :
                 mode === "google" ? "Google Authentication" :
                 mode === "email-otp" ? "Email Verification" : "Employee Access"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === "select" ? "cx.mergex.in — internal operations platform" : "MergeX Sales OS"}
              </p>
            </div>
          </div>
          {/* Body */}
          <div className="px-8 py-7">
            {mode === "select" && (
              <div className="flex flex-col gap-3">
                <MethodCard googleIcon title="Continue with Google" description="Recommended for admins and managers" badge="Recommended" onClick={() => setMode("google")} />
                <MethodCard icon={Mail} title="Email + One-Time Code" description="Secure OTP sent to your work email" onClick={() => setMode("email-otp")} />
                <MethodCard icon={IdCard} title="Employee ID + Password" description="For internal employees with company credentials" onClick={() => setMode("employee-otp")} />
              </div>
            )}
            {mode === "google"       && <GoogleFlow    onBack={() => setMode("select")} />}
            {mode === "email-otp"    && <EmailOtpFlow  onBack={() => setMode("select")} />}
            {mode === "employee-otp" && <EmployeeIdFlow onBack={() => setMode("select")} />}
          </div>
          {/* Footer */}
          <div className="px-8 pb-7">
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Secured by Clerk — enterprise-grade auth</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-5">
          Access is invite-only. Contact your admin to request access.
        </p>
      </div>
    </div>
  );
}
