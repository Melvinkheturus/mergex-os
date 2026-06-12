"use client";

import { useEffect, useState } from "react";
import { useSignUp, useClerk, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/logo/mergex-logo.png" 
        alt="MergeX Logo" 
        className="w-9 h-9 object-contain shrink-0" 
      />
      <div>
        <p className="text-sm font-semibold text-foreground tracking-tight leading-none">MergeX</p>
        <p className="text-xs text-muted-foreground mt-0.5">OS</p>
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

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = value.split("").slice(0, 6);
  while (digits.length < 6) digits.push("");
  const handleChange = (i: number, v: string) => {
    const d = [...digits]; d[i] = v.slice(-1); onChange(d.join(""));
    if (v && i < 5) (document.getElementById(`sup-${i + 1}`) as HTMLInputElement)?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      (document.getElementById(`sup-${i - 1}`) as HTMLInputElement)?.focus();
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Verification Code</label>
      <div className="flex gap-2">
        {digits.map((d, i) => (
          <input key={i} id={`sup-${i}`} type="text" inputMode="numeric" maxLength={1}
            value={d} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
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

function InvalidInvite() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center">
        <ShieldCheck className="w-6 h-6 text-[#EF4444]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Invalid or Expired Invite</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto">
          This invite link is invalid or has expired. Contact your administrator for a new invite.
        </p>
      </div>
    </div>
  );
}

function Success({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center">
        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Welcome to MergeX, {name}!</p>
        <p className="text-xs text-muted-foreground mt-1">Redirecting you to the dashboard...</p>
      </div>
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
    </div>
  );
}

type Step = "details" | "verify" | "success";

export default function SignUpPage() {
  const { isLoaded, userId } = useAuth();
  const { signUp } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const inviteEmail = searchParams.get("email");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && userId) {
      router.replace("/workspaces");
    }
  }, [isLoaded, userId, router]);

  const [step, setStep] = useState<Step>("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);

  // Validate the invite token
  useEffect(() => {
    if (!token || !inviteEmail) { setInviteValid(false); return; }
    fetch(`/api/auth/invite-validate?token=${token}&email=${encodeURIComponent(inviteEmail)}`)
      .then(r => r.json())
      .then((d: { valid: boolean }) => setInviteValid(d.valid))
      .catch(() => setInviteValid(false));
  }, [token, inviteEmail]);

  const handleSignUp = async () => {
    if (!signUp || !inviteEmail) return;
    setLoading(true); setError("");
    try {
      const { error: createErr } = await signUp.create({
        emailAddress: inviteEmail, password, firstName, lastName,
      });
      if (createErr) { setError(createErr.message); return; }
      // Send email verification code (method is directly on verifications, not emailAddress)
      const { error: sendErr } = await signUp.verifications.sendEmailCode();
      if (sendErr) { setError(sendErr.message); return; }
      setStep("verify");
    } catch { setError("Sign-up failed. Please try again."); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!signUp || otp.length < 6) return;
    setLoading(true); setError("");
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code: otp });
      if (verifyErr) { setError(verifyErr.message); setOtp(""); return; }
      if (signUp.status === "complete") {
        setStep("success");
        // Session is active — proxy will route based on onboardingState
        setTimeout(() => router.push("/workspaces"), 1200);
      }
    } catch { setError("Invalid code. Please try again."); setOtp(""); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#0B0B0F] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      <div className="relative w-full max-w-[400px]">
        <div className="bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#26262C] rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#E5E7EB] dark:border-[#26262C]">
            <Logo />
            <div className="mt-6">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                {step === "success" ? "Account Created" : "Accept your invitation"}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {inviteEmail ? `Joining as ${inviteEmail}` : "Enterprise invite-only access"}
              </p>
            </div>
          </div>
          {/* Body */}
          <div className="px-8 py-7 flex flex-col gap-5">
            {inviteValid === null && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {inviteValid === false && <InvalidInvite />}
            {inviteValid === true && step === "details" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="Alex" autoFocus />
                  <Field label="Last Name" value={lastName} onChange={setLastName} placeholder="Johnson" />
                </div>
                <Field label="Email" type="email" value={inviteEmail ?? ""} onChange={() => {}} disabled />
                <Field label="Set Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" />
                {error && <ErrorMsg message={error} />}
                <div id="clerk-captcha" />
                <PrimaryButton loading={loading} onClick={handleSignUp} disabled={!firstName || !lastName || password.length < 8}>
                  Create Account <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
              </>
            )}
            {inviteValid === true && step === "verify" && (
              <>
                <div>
                  <p className="text-sm font-medium text-foreground">Verify your email</p>
                  <p className="text-xs text-muted-foreground">6-digit code sent to <span className="text-foreground font-medium">{inviteEmail}</span></p>
                </div>
                <OtpInput value={otp} onChange={setOtp} />
                {error && <ErrorMsg message={error} />}
                <PrimaryButton loading={loading} onClick={handleVerify} disabled={otp.length < 6}>
                  Verify & Enter Dashboard
                </PrimaryButton>
              </>
            )}
            {step === "success" && <Success name={firstName} />}
          </div>
          {/* Footer */}
          {step !== "success" && (
            <div className="px-8 pb-7">
              <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Invite-only · Enterprise security</span>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-5">
          Already have access?{" "}
          <a href="/sign-in" className="text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">Sign in here</a>
        </p>
      </div>
    </div>
  );
}
