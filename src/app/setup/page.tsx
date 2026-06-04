"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building2,
  KeyRound,
  User,
  Mail,
  Lock,
  Sparkles,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

// ── Form schema ──────────────────────────────────────────────────────────────

const setupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    employeeId: z
      .string()
      .min(2, "Employee ID is required")
      .regex(
        /^[A-Z0-9-]+$/,
        "Use uppercase letters, numbers, and hyphens only (e.g. MX001)"
      ),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    companyName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetupFormValues = z.infer<typeof setupSchema>;

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1 w-full">
      <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase select-none">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[9px] text-zinc-500 leading-normal">{hint}</p>
      )}
      {error && <p className="text-[10px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-white/10 bg-transparent px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15 ${className ?? ""}`}
      {...props}
    />
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Screen 1: Setup Form ─────────────────────────────────────────────────────

function SetupForm({
  onSuccess,
}: {
  onSuccess: (employeeId: string, codes: string[]) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SetupFormValues>({ resolver: zodResolver(setupSchema) });

  const passwordValue = watch("password") || "";
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const strengthScore = getPasswordStrength(passwordValue);

  const onSubmit = async (values: SetupFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          employeeId: values.employeeId,
          email: values.email,
          password: values.password,
          companyName: values.companyName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Platform is already initialized. Please sign in.");
          return;
        }
        toast.error(data.error ?? "Setup failed. Please try again.");
        return;
      }

      onSuccess(data.employeeId as string, data.recoveryCodes as string[]);
    } catch {
      toast.error("Network error. Please check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" error={errors.firstName?.message}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input placeholder="eg. Manikandan" className="pl-9" {...register("firstName")} />
          </div>
        </Field>
        <Field label="Last Name" error={errors.lastName?.message}>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input placeholder="eg. Kumar" className="pl-9" {...register("lastName")} />
          </div>
        </Field>
      </div>

      {/* Employee ID */}
      <Field
        label="Employee ID"
        error={errors.employeeId?.message}
      >
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder="eg. MX001"
            {...register("employeeId", {
              onChange: (e) =>
                setValue("employeeId", e.target.value.toUpperCase(), {
                  shouldValidate: true,
                }),
            })}
            className="pl-9 font-mono tracking-wider"
          />
        </div>
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email?.message}>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            type="email"
            placeholder="eg. manikandan@mergex.in"
            className="pl-9"
            {...register("email")}
          />
        </div>
      </Field>

      {/* Company Name */}
      <Field label="Company Name (optional)" error={errors.companyName?.message}>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input placeholder="eg. MergeX Solutions" className="pl-9" {...register("companyName")} />
        </div>
      </Field>

      {/* Password row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Password */}
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 chars"
              {...register("password")}
              className="pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {/* Password strength indicator */}
          {passwordValue && (
            <div className="flex gap-1 mt-2 h-1 w-full rounded-full overflow-hidden bg-white/5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`flex-1 transition-all duration-300 ${
                    strengthScore >= level
                      ? strengthScore <= 2
                        ? "bg-rose-500"
                        : strengthScore <= 4
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </Field>

        {/* Confirm Password */}
        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat password"
              {...register("confirmPassword")}
              className="pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </Field>
      </div>

      <div className="w-full pt-2 flex justify-end">
        <LiquidMetalButton
          label={submitting ? "Initializing..." : "Initialize Platform"}
          width={180}
          height={42}
        />
      </div>
    </form>
  );
}

// ── Screen 2: Recovery Codes ─────────────────────────────────────────────────

function RecoveryCodesScreen({
  employeeId,
  codes,
  onDone,
}: {
  employeeId: string;
  codes: string[];
  onDone: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyAll = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    toast.success("All codes copied to clipboard");
  };

  const downloadTxt = () => {
    const text = `MERGEX OS RECOVERY CODES
Employee ID: ${employeeId}
Generated: ${new Date().toLocaleString()}

Keep these codes secure. They can be used to recover access if you lose your credentials.

${codes.map((code, index) => `${index + 1}. ${code}`).join("\n")}
`;
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `mergex-recovery-codes-${employeeId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Recovery codes downloaded as TXT file");
  };

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="flex flex-col items-center text-center gap-2 py-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Platform Initialized</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Save your recovery codes before continuing
          </p>
        </div>
        {/* Employee ID badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1">
          <KeyRound className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 font-mono tracking-wider">
            Your ID: {employeeId}
          </span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[10px] font-medium text-amber-300/80 leading-relaxed">
          These codes will <strong>never be shown again</strong>. Store them in a password
          manager or secure offline location.
        </p>
      </div>

      {/* Recovery codes list */}
      <div className="rounded-lg border border-white/5 bg-[#121214] overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-white/2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            Recovery Codes ({codes.length})
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadTxt}
              className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <Download className="h-2.5 w-2.5" /> Download TXT
            </button>
            <div className="h-2.5 w-px bg-white/10" />
            <button
              onClick={copyAll}
              className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              {copiedAll ? (
                <><Check className="h-2.5 w-2.5 text-emerald-400" /> Copied!</>
              ) : (
                <><Copy className="h-2.5 w-2.5" /> Copy all</>
              )}
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {codes.map((code, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3.5 py-2 hover:bg-white/1 transition-colors"
            >
              <span className="font-mono text-xs font-semibold tracking-wider text-white">
                {code}
              </span>
              <CopyButton text={code} />
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`h-4 w-4 rounded border flex items-center justify-center transition-all duration-200 ${
              saved
                ? "border-purple-500 bg-purple-500"
                : "border-white/10 group-hover:border-white/20 bg-transparent"
            }`}
          >
            {saved && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className="text-[11px] text-zinc-400 leading-normal select-none">
          I have securely saved all recovery codes and know they are lost forever if I don't.
        </span>
      </label>

      {/* CTA */}
      <button
        type="button"
        onClick={onDone}
        disabled={!saved}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-black disabled:text-zinc-500 py-2.5 text-xs font-bold shadow-lg shadow-black/25 active:scale-[0.99] transition-all disabled:opacity-40 duration-200"
      >
        Go to Sign In
      </button>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

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

        {/* Footer note moved from right side */}
        <div className="relative z-10 text-center text-[10px] text-white/30 select-none">
          This page is only accessible before platform initialization.
        </div>

      </div>

      {/* Right Side: Form / Codes Workspace (Directly on Page BG) */}
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
