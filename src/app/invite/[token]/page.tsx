"use client";

import { useEffect, useState, useCallback } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, ShieldCheck, Eye, EyeOff, Building2 } from "lucide-react";

type InviteData = {
  valid: boolean;
  email: string;
  employeeId: string | null;
  roleLabel: string;
  brands: { id: string; name: string; slug: string; logoUrl: string | null }[];
  inviteId: string;
  error?: string;
};

type Step = "loading" | "invalid" | "form" | "verify" | "success";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo/mergex-logo.png" alt="MergeX Logo" className="w-9 h-9 object-contain shrink-0" />
      <div>
        <p className="text-sm font-semibold text-foreground tracking-tight leading-none">MergeX</p>
        <p className="text-xs text-muted-foreground mt-0.5">OS</p>
      </div>
    </div>
  );
}

function PasswordInput({
  label, value, onChange, placeholder, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-12 px-4 pr-11 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all duration-150 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.split("").slice(0, 6);
  while (digits.length < 6) digits.push("");
  const handleChange = (i: number, v: string) => {
    const d = [...digits]; d[i] = v.slice(-1); onChange(d.join(""));
    if (v && i < 5) (document.getElementById(`inv-${i + 1}`) as HTMLInputElement)?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      (document.getElementById(`inv-${i - 1}`) as HTMLInputElement)?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i} id={`inv-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          autoFocus={i === 0}
          className="w-11 h-13 text-center text-lg font-semibold rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all"
        />
      ))}
    </div>
  );
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();

  const [step, setStep] = useState<Step>("loading");
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupInvite = useCallback(async () => {
    const res = await fetch(`/api/auth/invite-lookup?token=${params.token}`);
    const data: InviteData = await res.json();
    setInvite(data);
    setStep(data.valid ? "form" : "invalid");
  }, [params.token]);

  useEffect(() => { lookupInvite(); }, [lookupInvite]);

  const handleActivate = async () => {
    if (!signUp || !invite) return;
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true); setError("");
    try {
      await signUp.create({ emailAddress: invite.email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr?.errors?.[0]?.message ?? "Activation failed. Please try again.");
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!signUp || otp.length < 6) return;
    setLoading(true); setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp });
      if (result.status === "complete") {
        await setActive?.({ session: result.createdSessionId });
        setStep("success");
        setTimeout(() => router.push("/onboarding/profile"), 1500);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr?.errors?.[0]?.message ?? "Invalid code. Try again.");
      setOtp("");
    } finally { setLoading(false); }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#0B0B0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#0B0B0F] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#26262C] rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
          <Logo />
          <div className="mt-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Invalid Invitation</h1>
            <p className="text-sm text-muted-foreground mt-2">{invite?.error ?? "This invitation link is invalid or has expired."}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/sign-in";
            }}
            className="mt-6 w-full h-11 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                {step === "success" ? "Account Activated!" : "Activate Your Account"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {step === "verify"
                  ? `Enter the 6-digit code sent to ${invite?.email}`
                  : "Set your password to complete account setup"}
              </p>
            </div>
          </div>

          <div className="px-8 py-6 space-y-4">
            {step === "success" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm text-muted-foreground">Redirecting to onboarding…</p>
              </div>
            )}

            {step === "form" && invite && (
              <>
                {/* Invite details */}
                <div className="bg-[#F8F8FA] dark:bg-[#0B0B0F] rounded-xl p-4 space-y-3 border border-[#E5E7EB] dark:border-[#26262C]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Email</span>
                    <span className="text-sm font-medium text-foreground">{invite.email}</span>
                  </div>
                  {invite.employeeId && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Employee ID</span>
                      <span className="text-sm font-mono font-semibold text-[#8B5CF6]">{invite.employeeId}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Role</span>
                    <span className="text-sm font-medium text-foreground">{invite.roleLabel}</span>
                  </div>
                  {invite.brands.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Access</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {invite.brands.map(b => b.name).join(", ")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <PasswordInput
                  label="Create Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 8 characters"
                />
                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat password"
                />

                {error && (
                  <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleActivate}
                  disabled={loading || !isLoaded || !password || !confirmPassword}
                  className="w-full h-12 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Activate Account
                </button>
              </>
            )}

            {step === "verify" && (
              <>
                <OtpInput value={otp} onChange={setOtp} />
                {error && (
                  <p className="text-xs text-red-500 text-center">{error}</p>
                )}
                <button
                  onClick={handleVerify}
                  disabled={loading || otp.length < 6}
                  className="w-full h-12 rounded-xl bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Verify Email
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Check your inbox at <strong>{invite?.email}</strong>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
