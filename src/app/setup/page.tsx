"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

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
    password: z.string().min(8, "Password must be at least 8 characters"),
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
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-foreground/80 tracking-wide uppercase">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-[11px] text-destructive font-medium">{error}</p>}
    </div>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 disabled:opacity-50 ${className ?? ""}`}
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
      className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-400 transition-colors"
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
    formState: { errors },
  } = useForm<SetupFormValues>({ resolver: zodResolver(setupSchema) });

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
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" error={errors.firstName?.message}>
          <Input placeholder="Manikandan" {...register("firstName")} />
        </Field>
        <Field label="Last Name" error={errors.lastName?.message}>
          <Input placeholder="Kumar" {...register("lastName")} />
        </Field>
      </div>

      {/* Employee ID */}
      <Field
        label="Employee ID"
        error={errors.employeeId?.message}
        hint="Your permanent organizational identifier — e.g. MX001, MX-CEO-001"
      >
        <Input
          placeholder="MX001"
          {...register("employeeId", {
            onChange: (e) =>
              setValue("employeeId", e.target.value.toUpperCase(), {
                shouldValidate: true,
              }),
          })}
          className="font-mono tracking-wider"
        />
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="manikandan@mergex.in"
          {...register("email")}
        />
      </Field>

      {/* Company Name */}
      <Field label="Company Name (optional)" error={errors.companyName?.message}>
        <Input placeholder="MergeX Solutions" {...register("companyName")} />
      </Field>

      {/* Password */}
      <Field label="Password" error={errors.password?.message}>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            {...register("password")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      {/* Confirm Password */}
      <Field label="Confirm Password" error={errors.confirmPassword?.message}>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            {...register("confirmPassword")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing platform…
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            Initialize Platform
          </>
        )}
      </button>
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

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Platform Initialized</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Save your recovery codes before continuing
          </p>
        </div>
        {/* Employee ID badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
          <KeyRound className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-bold text-violet-400 font-mono tracking-wider">
            Your ID: {employeeId}
          </span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-amber-300/90 leading-relaxed">
          These codes will <strong>never be shown again</strong>. Store them in a password
          manager, printed document, or secure offline location. Each code can only be used once.
        </p>
      </div>

      {/* Recovery codes list */}
      <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Recovery Codes ({codes.length})
          </span>
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-violet-400 transition-colors"
          >
            {copiedAll ? (
              <><Check className="h-3 w-3 text-emerald-400" /> Copied!</>
            ) : (
              <><Copy className="h-3 w-3" /> Copy all</>
            )}
          </button>
        </div>
        <div className="divide-y divide-border/20">
          {codes.map((code, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
            >
              <span className="font-mono text-sm font-semibold tracking-wider text-foreground/90">
                {code}
              </span>
              <CopyButton text={code} />
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
              saved
                ? "border-violet-500 bg-violet-500"
                : "border-border group-hover:border-violet-400"
            }`}
          >
            {saved && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className="text-xs text-muted-foreground leading-relaxed">
          I have securely saved all 5 recovery codes. I understand they will never
          be shown again.
        </span>
      </label>

      {/* CTA */}
      <button
        onClick={onDone}
        disabled={!saved}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/6 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header */}
          <div className="border-b border-border/30 bg-muted/20 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
                <Building2 className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-foreground tracking-tight">
                    MergeX OS
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                    {screen === "form" ? "Platform Setup" : "Setup Complete"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {screen === "form"
                    ? "One-time initialization — runs only once"
                    : "Save your recovery codes before continuing"}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-7">
            <AnimatePresence mode="wait">
              {screen === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SetupForm onSuccess={handleSetupSuccess} />
                </motion.div>
              )}
              {screen === "codes" && setupResult && (
                <motion.div
                  key="codes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RecoveryCodesScreen
                    employeeId={setupResult.employeeId}
                    codes={setupResult.codes}
                    onDone={() => router.push("/sign-in")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          This page is only accessible before platform initialization.
          All future users are invited by the Super Admin.
        </p>
      </div>
    </div>
  );
}
