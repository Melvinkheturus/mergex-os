"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Lock,
  KeyRound,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import styles from "./success-animation.module.css";

type InviteData = {
  valid: boolean;
  email: string;
  employeeId: string | null;
  roleLabel: string;
  brands: { id: string; name: string; slug: string; logoUrl: string | null }[];
  inviteId: string;
  moduleAccess?: string[];
  permissionAccess?: string[];
  error?: string;
};

type Step = "loading" | "invalid" | "form" | "verify" | "success";

// ── Error Message Component ───────────────────────────────────────────────────

function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5">
      <p className="text-[10px] font-medium text-rose-400 leading-relaxed">
        {message}
      </p>
    </div>
  );
}

// ── Password Input Component ───────────────────────────────────────────────────

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-white/10 bg-transparent pl-9 pr-9 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ── OTP Input Component ────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const digits = value.split("").slice(0, 6);
  while (digits.length < 6) digits.push("");

  const handleChange = (i: number, v: string) => {
    const cleanValue = v.replace(/\D/g, "");
    if (cleanValue.length > 1) {
      const newDigits = [...digits];
      for (let j = 0; j < cleanValue.length && i + j < 6; j++) {
        newDigits[i + j] = cleanValue[j];
      }
      const newOtp = newDigits.join("").slice(0, 6);
      onChange(newOtp);
      const focusIndex = Math.min(i + cleanValue.length, 5);
      (document.getElementById(`otp-inv-${focusIndex}`) as HTMLInputElement)?.focus();
      return;
    }

    const d = [...digits];
    d[i] = cleanValue.slice(-1);
    onChange(d.join(""));
    if (cleanValue && i < 5) {
      (document.getElementById(`otp-inv-${i + 1}`) as HTMLInputElement)?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[i] && i > 0) {
        const d = [...digits];
        d[i - 1] = "";
        onChange(d.join(""));
        (document.getElementById(`otp-inv-${i - 1}`) as HTMLInputElement)?.focus();
        e.preventDefault();
      } else if (digits[i]) {
        const d = [...digits];
        d[i] = "";
        onChange(d.join(""));
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const cleanValue = pastedText.replace(/\D/g, "").slice(0, 6);
    if (cleanValue.length > 0) {
      onChange(cleanValue);
      const focusIndex = Math.min(cleanValue.length, 5);
      (document.getElementById(`otp-inv-${focusIndex}`) as HTMLInputElement)?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-inv-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={i === 0}
          className="w-10 h-12 text-center text-sm font-semibold rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/60 focus:bg-purple-500/5 transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();

  const [step, setStep] = useState<Step>("loading");
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupInvite = useCallback(async () => {
    try {
      const res = await fetch(`/api/auth/invite-lookup?token=${token}`);
      const data: InviteData = await res.json();
      setInvite(data);
      setStep(data.valid ? "form" : "invalid");
    } catch {
      setStep("invalid");
    }
  }, [token]);

  useEffect(() => {
    lookupInvite();
  }, [lookupInvite]);

  useEffect(() => {
    if (isLoaded && signUp && signUp.status === "complete") {
      const sessionId = signUp.createdSessionId;
      if (sessionId) {
        setActive?.({ session: sessionId }).then(() => {
          setStep("success");
          setTimeout(() => router.push("/workspaces"), 1500);
        });
      }
    }
  }, [isLoaded, signUp, setActive, router]);

  const handleActivate = async () => {
    if (!signUp || !invite) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Note: firstName/lastName are profile-only fields in this Clerk instance,
      // not sign-up attributes — so we do NOT pass them to signUp.create().
      // We store them in unsafeMetadata so onboarding can pick them up.
      await signUp.create({
        emailAddress: invite.email,
        password,
        unsafeMetadata: {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        },
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      setError(clerkErr?.errors?.[0]?.message ?? "Activation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activateAndRedirect = async (sessionId: string) => {
    await setActive?.({ session: sessionId });
    setStep("success");
    setTimeout(() => router.push("/workspaces"), 1500);
  };

  const handleVerify = async () => {
    if (!signUp || otp.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp });

      if (result.status === "complete" && result.createdSessionId) {
        await activateAndRedirect(result.createdSessionId);
        return;
      }

      // "missing_requirements" — email is verified, but Clerk needs more fields.
      // Read signUp.missingFields to find out what's actually required and fill them in.
      if (result.status === "missing_requirements") {
        const missing: string[] = (signUp as unknown as { missingFields?: string[] }).missingFields ?? [];
        console.log("[InvitePage] missing_requirements — missingFields:", missing);

        const updatePayload: Record<string, string> = {};

        for (const field of missing) {
          if (field === "username") {
            // Auto-generate a username from the email local part
            const base = invite!.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
            updatePayload.username = `${base}_${Math.floor(Math.random() * 9000 + 1000)}`;
          } else if (field === "first_name") {
            updatePayload.firstName = firstName.trim() || "Member";
          } else if (field === "last_name") {
            updatePayload.lastName = lastName.trim() || "User";
          }
        }

        console.log("[InvitePage] Attempting signUp.update with:", updatePayload);
        let updated = result;
        try {
          updated = await signUp.update(updatePayload);
        } catch (updateErr) {
          console.error("[InvitePage] signUp.update() failed:", updateErr);
        }

        console.log("[InvitePage] After update — status:", updated.status, "sessionId:", updated.createdSessionId);

        if (updated.status === "complete" && updated.createdSessionId) {
          await activateAndRedirect(updated.createdSessionId);
          return;
        }

        // If still missing_requirements but we have a sessionId, activate anyway
        const sessionId = updated.createdSessionId ?? signUp.createdSessionId;
        if (sessionId) {
          await activateAndRedirect(sessionId);
          return;
        }

        setError(`Sign-up incomplete (missing: ${missing.join(", ") || "unknown"}). Contact your admin.`);
        return;
      }

      setError("Unexpected verification status. Please try again.");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; code?: string }[] };
      const isAlreadyVerified = clerkErr?.errors?.some(
        (e) => e.message?.includes("already verified") || e.code === "already_verified"
      );

      if (isAlreadyVerified && signUp.createdSessionId) {
        await activateAndRedirect(signUp.createdSessionId);
      } else {
        setError(clerkErr?.errors?.[0]?.message ?? "Invalid code. Try again.");
        setOtp("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "form" && password && confirmPassword) handleActivate();
      else if (step === "verify" && otp.length === 6) handleVerify();
    }
  };

  // ── Banner (shared left side) ─────────────────────────────────────────────
  const Banner = (
    <div className="relative w-full md:w-[44%] lg:w-[42%] xl:w-[40%] rounded-[20px] overflow-hidden bg-[#060608] p-6 md:p-8 flex flex-col justify-between min-h-[350px] md:min-h-0 md:h-full border border-white/5 border-b-transparent shadow-[0_0_50px_-12px_rgba(139,92,246,0.12)] shrink-0 select-none">
      {/* Arch Shaped Violet/Purple Dome Gradient (Curved n-shape dome dropping on sides) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(100% 60% at 50% 0%, #8b5cf6 0%, #6d28d9 35%, #3b0764 65%, #060608 100%)",
        }}
      />

      {/* Textured SVG Grains Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay z-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dissolve bottom card edge with page background color (#060608) */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-[#060608] via-[#060608]/95 to-transparent pointer-events-none z-2" />

      {/* Decorative ambient elements inside the card */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none z-1" />

      {/* Logo & Header using local brand assets */}
      <div className="relative z-10 flex items-center gap-3">
        <img
          src="/logo/flat_logo.png"
          alt="MergeX Logo"
          className="h-6 w-auto object-contain brightness-200"
        />
        <div className="pl-1">
          <span className="text-sm font-extrabold tracking-tight text-white leading-none block">
            MergeX OS
          </span>
        </div>
      </div>

      {/* Core Content */}
      <div className="relative z-10 my-auto py-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-[1.15]">
          Welcome to MergeX
        </h1>
        <p className="text-xs text-white/60 mt-2 max-w-[260px] leading-relaxed">
          Set up your credentials to join your workspace platform.
        </p>

        {/* Stepper / Features Indicators */}
        <div className="mt-6 space-y-3.5 max-w-[260px]">
          {[
            {
              icon: ShieldCheck,
              label: "Secure Sign Up",
              desc: "Enterprise-grade protection by Clerk",
            },
            {
              icon: KeyRound,
              label: "Workspace Auditing",
              desc: "Access & actions strictly logged",
            },
            {
              icon: Lock,
              label: "Encrypted Session",
              desc: "End-to-end zero-trust architecture",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white shrink-0">
                <Icon className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[9px] text-white/30">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="relative z-10 text-center text-[10px] text-white/30 select-none">
        Access is invite-only. Contact your admin to request access.
      </div>
    </div>
  );

  // ── LOADING STATE ────────────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden animate-pulse">
        {/* Ambient glows */}
        <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

        {Banner}

        {/* Right Side Skeleton */}
        <div className="w-full md:flex-1 flex flex-col items-center py-4 px-4 relative z-10 overflow-y-auto h-full max-h-full">
          <div className="w-full max-w-[420px] space-y-6 my-auto py-6">
            <div className="space-y-2">
              <Skeleton className="w-48 h-6 bg-white/5 rounded" />
              <Skeleton className="w-32 h-3.5 bg-white/5 rounded" />
            </div>

            <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="w-10 h-3 bg-white/5 rounded" />
                  <Skeleton className="w-28 h-3.5 bg-white/5 rounded" />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="w-24 h-3 bg-white/5 rounded" />
                  <Skeleton className="w-full h-10 bg-white/5 rounded-lg" />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Skeleton className="w-[140px] h-[42px] bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── INVALID STEP ──────────────────────────────────────────────────────────
  if (step === "invalid") {
    return (
      <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

        {Banner}

        {/* Right Side */}
        <div className="w-full md:flex-1 flex flex-col items-center py-4 px-4 relative z-10 overflow-y-auto h-full max-h-full">
          <div className="w-full max-w-[420px] space-y-5 my-auto py-6 text-center">
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <ShieldCheck className="w-6 h-6 text-rose-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Invalid Invitation</h1>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              {invite?.error ?? "This invitation link is invalid or has expired."}
            </p>
            <div className="pt-4 flex justify-center">
              <LiquidMetalButton
                label="Go to Sign In"
                width={200}
                height={42}
                onClick={() => {
                  window.location.href = "/sign-in";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE FLOW (FORM / VERIFY / SUCCESS) ───────────────────────────────
  return (
    <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

      {Banner}

      {/* Right Side */}
      <div className="w-full md:flex-1 flex flex-col items-center py-4 px-4 relative z-10 overflow-y-auto h-full max-h-full">
        <div
          className="w-full max-w-[420px] space-y-5 my-auto py-6"
          onKeyDown={handleKeyDown}
        >
          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className={styles.animationCtn}>
                <div className={`${styles.successIcon} w-16 h-16`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 154 154"
                    className="w-full h-full"
                  >
                    <g fill="none" stroke="#22AE73" strokeWidth="2">
                      <circle
                        cx="77"
                        cy="77"
                        r="72"
                        style={{ strokeDasharray: "480px, 480px", strokeDashoffset: "960px" }}
                      />
                      <circle
                        className={styles.coloredCircle}
                        fill="#22AE73"
                        cx="77"
                        cy="77"
                        r="72"
                        style={{ strokeDasharray: "480px, 480px", strokeDashoffset: "960px" }}
                      />
                      <polyline
                        stroke="#fff"
                        strokeWidth="10"
                        points="43.5,77.8 63.7,97.9 112.2,49.4"
                        style={{ strokeDasharray: "100px, 100px", strokeDashoffset: "200px" }}
                      />
                    </g>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Account Activated!
              </h2>
              <p className="text-xs text-zinc-500 leading-normal">
                Setting up your environment. Redirecting to onboarding…
              </p>
            </div>
          )}

          {step === "form" && invite && (
            <>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Activate Your Account
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Set your password to complete account setup
                </p>
              </div>

              {/* Invite details */}
              <div className="rounded-xl border border-white/10 bg-[#09090c]/80 backdrop-blur-xl p-4 space-y-3 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Email
                  </span>
                  <span className="text-xs font-semibold text-zinc-300">
                    {invite.email}
                  </span>
                </div>
                {invite.employeeId && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Employee ID
                    </span>
                    <span className="text-xs font-mono font-bold text-[#A78BFA]">
                      {invite.employeeId}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Role
                  </span>
                  <span className="text-xs font-semibold text-zinc-300">
                    {invite.roleLabel}
                  </span>
                </div>
                {invite.brands.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Access
                    </span>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-xs font-semibold text-zinc-300">
                        {invite.brands.map((b) => b.name).join(", ")}
                      </span>
                    </div>
                  </div>
                )}
                {invite.moduleAccess && invite.moduleAccess.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Module Access
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {invite.moduleAccess.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-300"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      disabled={loading}
                      autoFocus
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Johnson"
                      disabled={loading}
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
                    />
                  </div>
                </div>

                <PasswordInput
                  label="Create Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 8 characters"
                  disabled={loading}
                />
                <PasswordInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Repeat password"
                  disabled={loading}
                />

                {error && <ErrorMsg message={error} />}

                <div id="clerk-captcha" />

                <div className="pt-2 flex justify-end">
                  <LiquidMetalButton
                    label={loading ? "Activating..." : "Activate Account"}
                    width={180}
                    height={42}
                    onClick={handleActivate}
                  />
                </div>
              </div>
            </>
          )}

          {step === "verify" && (
            <div className="w-full rounded-2xl border border-white/10 bg-[#09090c]/85 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)] space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Verify your email
                </h2>
                <p className="text-xs text-zinc-500 leading-normal">
                  A 6-digit code was sent to{" "}
                  <span className="text-zinc-300 font-medium">
                    {invite?.email}
                  </span>
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex justify-center py-2">
                  <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                </div>

                {error && <ErrorMsg message={error} />}

                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setError("");
                      setOtp("");
                    }}
                    className="h-[42px] px-5 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <LiquidMetalButton
                    label={loading ? "Verifying..." : "Verify"}
                    width={140}
                    height={42}
                    onClick={handleVerify}
                  />
                </div>

                <p className="text-center text-[10px] text-zinc-600">
                  Didn&apos;t receive the code? Check your spam folder or wait a
                  moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
