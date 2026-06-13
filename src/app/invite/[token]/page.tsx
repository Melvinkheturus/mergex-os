"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import styles from "./success-animation.module.css";

import { ErrorMsg } from "./error-msg";
import { PasswordInput } from "./password-input";
import { OtpInput } from "./otp-input";
import { InviteBanner } from "./invite-banner";

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

      if (result.status === "missing_requirements") {
        const missing: string[] = (signUp as unknown as { missingFields?: string[] }).missingFields ?? [];
        console.log("[InvitePage] missing_requirements — missingFields:", missing);

        const updatePayload: Record<string, string> = {};

        for (const field of missing) {
          if (field === "username") {
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

  if (step === "loading") {
    return (
      <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden animate-pulse">
        <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

        <InviteBanner />

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

  if (step === "invalid") {
    return (
      <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

        <InviteBanner />

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

  return (
    <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden">
      <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

      <InviteBanner />

      <div className="w-full md:flex-1 flex flex-col items-center py-4 px-4 relative z-10 overflow-y-auto h-full max-h-full">
        <div className="w-full max-w-[420px] space-y-5 my-auto py-6" onKeyDown={handleKeyDown}>
          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className={styles.animationCtn}>
                <div className={`${styles.successIcon} w-16 h-16`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 154 154" className="w-full h-full">
                    <g fill="none" stroke="#22AE73" strokeWidth="2">
                      <circle cx="77" cy="77" r="72" style={{ strokeDasharray: "480px, 480px", strokeDashoffset: "960px" }} />
                      <circle className={styles.coloredCircle} fill="#22AE73" cx="77" cy="77" r="72" style={{ strokeDasharray: "480px, 480px", strokeDashoffset: "960px" }} />
                      <polyline stroke="#fff" strokeWidth="10" points="43.5,77.8 63.7,97.9 112.2,49.4" style={{ strokeDasharray: "100px, 100px", strokeDashoffset: "200px" }} />
                    </g>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Account Activated!</h2>
              <p className="text-xs text-zinc-500 leading-normal">Setting up your environment. Redirecting to onboarding…</p>
            </div>
          )}

          {step === "form" && invite && (
            <>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Activate Your Account</h2>
                <p className="text-xs text-zinc-500 mt-1">Set your password to complete account setup</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#09090c]/80 backdrop-blur-xl p-4 space-y-3 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email</span>
                  <span className="text-xs font-semibold text-zinc-300">{invite.email}</span>
                </div>
                {invite.employeeId && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Employee ID</span>
                    <span className="text-xs font-mono font-bold text-[#A78BFA]">{invite.employeeId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Role</span>
                  <span className="text-xs font-semibold text-zinc-300">{invite.roleLabel}</span>
                </div>
                {invite.brands.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Access</span>
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
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Module Access</span>
                    <div className="flex flex-wrap gap-1">
                      {invite.moduleAccess.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase">First Name</label>
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
                    <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Last Name</label>
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

                <PasswordInput label="Create Password" value={password} onChange={setPassword} placeholder="Min. 8 characters" disabled={loading} />
                <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password" disabled={loading} />

                {error && <ErrorMsg message={error} />}

                <div id="clerk-captcha" />

                <div className="pt-2 flex justify-end">
                  <LiquidMetalButton label={loading ? "Activating..." : "Activate Account"} width={180} height={42} onClick={handleActivate} />
                </div>
              </div>
            </>
          )}

          {step === "verify" && (
            <div className="w-full rounded-2xl border border-white/10 bg-[#09090c]/85 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)] space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-white">Verify your email</h2>
                <p className="text-xs text-zinc-500 leading-normal">
                  A 6-digit code was sent to <span className="text-zinc-300 font-medium">{invite?.email}</span>
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
                  <LiquidMetalButton label={loading ? "Verifying..." : "Verify"} width={140} height={42} onClick={handleVerify} />
                </div>

                <p className="text-center text-[10px] text-zinc-600">Didn&apos;t receive the code? Check your spam folder or wait a moment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
