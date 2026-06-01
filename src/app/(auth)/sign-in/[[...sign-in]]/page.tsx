"use client";

import { useState, useEffect } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

// ── Logo ───────────────────────────────────────────────────────
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
        <p className="text-xs text-muted-foreground mt-0.5">Sales OS</p>
      </div>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────
function Field({
  label, type = "text", value, onChange, placeholder, disabled, autoFocus, suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <p className="text-xs text-[#EF4444] bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-xl px-3 py-2.5">
      {message}
    </p>
  );
}

function PrimaryButton({
  children, onClick, loading, disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full h-12 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

// ── Main Sign-In Page ──────────────────────────────────────────
export default function SignInPage() {
  const { isLoaded, userId } = useAuth();
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && userId) {
      router.replace("/workspaces");
    }
  }, [isLoaded, userId, router]);

  const handleSignIn = async () => {
    if (!signIn || !email || !password) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Sign-in failed. Check your email and password.");
        return;
      }

      if (signIn.status === "complete") {
        // Clerk sets the active session automatically - redirect
        router.push("/dashboard");
      } else {
        // Unexpected incomplete state (e.g. MFA - not enabled, but handle gracefully)
        setError("Sign-in could not be completed. Please contact your admin.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      const msg = clerkErr?.errors?.[0]?.message ?? "Sign-in failed. Check your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA] dark:bg-[#0B0B0F] flex items-center justify-center p-4">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#26262C] rounded-2xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-[#E5E7EB] dark:border-[#26262C]">
            <Logo />
            <div className="mt-6">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                Sign in to your workspace
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                cx.mergex.in - internal operations platform
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-7 flex flex-col gap-4" onKeyDown={handleKeyDown}>
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@mergex.in"
              autoFocus
              disabled={!isLoaded || loading}
            />
            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              disabled={!isLoaded || loading}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {error && <ErrorMsg message={error} />}

            <PrimaryButton
              loading={loading}
              disabled={!isLoaded || !email || !password}
              onClick={handleSignIn}
            >
              Sign in <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
          </div>

          {/* Footer */}
          <div className="px-8 pb-7">
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Secured by Clerk · enterprise-grade auth</span>
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
