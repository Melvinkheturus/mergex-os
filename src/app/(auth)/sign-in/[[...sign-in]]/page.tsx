"use client";

import { useState, useEffect } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
} from "lucide-react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

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
        router.push("/workspaces");
      } else {
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
          className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Dissolve bottom card edge with page background color (#060608) */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#060608] via-[#060608]/95 to-transparent pointer-events-none z-[2]" />

        {/* Decorative ambient elements inside the card */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none z-[1]" />
        
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
            Welcome to MergeX
          </h1>
          <p className="text-xs text-white/60 mt-2 max-w-[260px] leading-relaxed">
            Securely authenticate to manage your operations platform.
          </p>

          {/* Stepper / Features Indicators */}
          <div className="mt-6 space-y-3.5 max-w-[260px]">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Secure Sign In
                </p>
                <p className="text-[9px] text-white/30">Enterprise-grade protection by Clerk</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <KeyRound className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Workspace Auditing
                </p>
                <p className="text-[9px] text-white/30">Access & actions strictly logged</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white">
                <Lock className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Encrypted Session
                </p>
                <p className="text-[9px] text-white/30">End-to-end zero-trust architecture</p>
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
              Sign in to your workspace
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-normal">
              cx.mergex.in - internal operations platform
            </p>
          </div>

          {/* Form */}
          <div className="relative" onKeyDown={handleKeyDown}>
            <div className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1 w-full">
                <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase select-none">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@mergex.in"
                    disabled={!isLoaded || loading}
                    autoFocus
                    className="w-full rounded-lg border border-white/10 bg-transparent pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1 w-full">
                <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase select-none">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    disabled={!isLoaded || loading}
                    className="w-full rounded-lg border border-white/10 bg-transparent pl-9 pr-9 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {error && <ErrorMsg message={error} />}

              {/* Button & Forgot Password row */}
              <div className="pt-2 flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-500 hover:text-[#8B5CF6] transition-colors"
                >
                  Forgot password?
                </Link>

                <LiquidMetalButton
                  label={loading ? "Signing in..." : "Sign in"}
                  width={140}
                  height={42}
                  onClick={handleSignIn}
                />
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
