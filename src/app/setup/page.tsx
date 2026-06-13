"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, KeyRound } from "lucide-react";

import { SetupForm } from "./setup-form";
import { RecoveryCodesScreen } from "./recovery-codes-screen";

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [screen, setScreen] = useState<"form" | "codes">("form");
  const [setupResult, setSetupResult] = useState<{
    employeeId: string;
    codes: string[];
  } | null>(null);

  // Self-guard: if platform already initialized, redirect to sign-in
  useEffect(() => {
    fetch("/api/setup/status")
      .then((r) => r.json())
      .then((data: { initialized: boolean }) => {
        if (data.initialized) {
          router.replace("/sign-in");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSetupSuccess = (employeeId: string, codes: string[]) => {
    setSetupResult({ employeeId, codes });
    setScreen("codes");
  };

  if (checking) {
    return (
      <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden animate-pulse">
        {/* Left Banner Skeleton */}
        <div className="relative w-full md:w-[44%] lg:w-[42%] xl:w-[40%] rounded-[20px] overflow-hidden bg-[#0e0e12] p-6 md:p-8 flex flex-col justify-between min-h-[350px] md:min-h-0 md:h-full border border-white/5 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10" />
            <div className="w-20 h-4 rounded bg-white/10" />
          </div>
          <div className="space-y-4 my-auto py-6">
            <div className="w-48 h-8 rounded bg-white/10" />
            <div className="w-32 h-4 rounded bg-white/10" />
            <div className="space-y-3 mt-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-white/10" />
                  <div className="space-y-1">
                    <div className="w-28 h-3 rounded bg-white/10" />
                    <div className="w-16 h-2 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-3 rounded bg-white/5" />
        </div>

        {/* Right Form Space Skeleton */}
        <div className="w-full md:flex-1 flex flex-col items-center py-4 px-4 h-full max-h-full">
          <div className="w-full max-w-[420px] space-y-6 my-auto py-6">
            <div className="space-y-2">
              <div className="w-48 h-6 rounded bg-white/10" />
              <div className="w-72 h-4 rounded bg-white/10" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-20 h-3 rounded bg-white/10" />
                    <div className="w-full h-11 rounded-lg bg-white/5" />
                  </div>
                ))}
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-24 h-3 rounded bg-white/10" />
                  <div className="w-full h-11 rounded-lg bg-white/5" />
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <div className="w-44 h-10 rounded-lg bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen h-screen bg-[#060608] text-white flex flex-col md:flex-row p-3 md:p-5 gap-5 relative overflow-hidden">
      {/* Background radial ambient glow */}
      <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[180px] pointer-events-none" />

      {/* Left Side: Gradient Banner */}
      <div className="relative w-full md:w-[44%] lg:w-[42%] xl:w-[40%] rounded-[20px] overflow-hidden bg-[#060608] p-6 md:p-8 flex flex-col justify-between min-h-[350px] md:min-h-0 md:h-full border border-white/5 border-b-transparent shadow-[0_0_50px_-12px_rgba(139,92,246,0.12)] shrink-0 select-none">
        
        {/* Arch Shaped Violet/Purple Dome Gradient */}
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
            Get Started with Us
          </h1>
          <p className="text-xs text-white/60 mt-2 max-w-[260px] leading-relaxed">
            Complete these simple steps to initialize and secure your system.
          </p>

          {/* Stepper Indicators */}
          <div className="mt-6 space-y-3.5 max-w-[260px]">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all duration-300 ${
                screen === "form"
                  ? "bg-white text-purple-700 border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-white/20 text-white border-white/10"
              }`}>
                {screen === "codes" ? <Check className="h-3.5 w-3.5" /> : "1"}
              </div>
              <div>
                <p className={`text-xs font-bold transition-all duration-300 ${screen === "form" ? "text-white" : "text-white/50"}`}>
                  Sign up your account
                </p>
                <p className="text-[9px] text-white/30">First-time super admin</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all duration-300 ${
                screen === "codes"
                  ? "bg-white text-purple-700 border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                  : "bg-white/5 text-white/30 border-white/5"
              }`}>
                2
              </div>
              <div>
                <p className={`text-xs font-bold transition-all duration-300 ${screen === "codes" ? "text-white" : "text-white/40"}`}>
                  Set up security
                </p>
                <p className="text-[9px] text-white/30">Save recovery codes</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] border bg-white/5 text-white/20 border-white/5">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-white/20">
                  Setup complete
                </p>
                <p className="text-[9px] text-white/20">Start managing workspaces</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="relative z-10 text-center text-[10px] text-white/30 select-none">
          This page is only accessible before platform initialization.
        </div>

      </div>

      {/* Right Side: Form / Codes Workspace */}
      <div className="w-full md:flex-1 flex flex-col items-center py-4 px-4 relative z-10 overflow-y-auto h-full max-h-full">
        
        <div className="w-full max-w-[420px] space-y-5 my-auto py-6">
          
          {/* Header info */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {screen === "form" ? "Create Super Admin Account" : "Secure Recovery Credentials"}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 leading-normal">
              {screen === "form" 
                ? "Enter your credentials to initialize your primary Super Admin privilege."
                : "These 5 distinct backup codes are essential to safeguard system access."
              }
            </p>
          </div>

          {/* Screen components with animation */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {screen === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <SetupForm onSuccess={handleSetupSuccess} />
                </motion.div>
              )}
              {screen === "codes" && setupResult && (
                <motion.div
                  key="codes"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <RecoveryCodesScreen
                    employeeId={setupResult.employeeId}
                    codes={setupResult.codes}
                    onDone={() => {
                      window.location.href = "/sign-in";
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
