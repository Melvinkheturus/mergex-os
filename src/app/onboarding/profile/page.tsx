"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Check, Loader2, User, Settings, Sparkles } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  designation: string;
}

interface PrefsData {
  theme: "light" | "dark" | "system";
  activeBrandId: string;
  notificationsEnabled: boolean;
}

// ── Helpers ───────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img 
        src="/logo/mergex-logo.png" 
        alt="MergeX Logo" 
        className="w-8 h-8 object-contain shrink-0" 
      />
      <span className="text-sm font-semibold text-foreground tracking-tight">MergeX Sales OS</span>
    </div>
  );
}

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full flex-1 transition-all duration-300 ${
            i < current
              ? "bg-[#8B5CF6]"
              : i === current
              ? "bg-[#8B5CF6]/50"
              : "bg-[#E5E7EB] dark:bg-[#26262C]"
          }`}
        />
      ))}
    </div>
  );
}

function Field({
  label, type = "text", value, onChange, placeholder, disabled, autoFocus,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ── STEP 0: Welcome ───────────────────────────────────────────
function StepWelcome({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-4">
      <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-[#8B5CF6]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          Welcome{firstName ? `, ${firstName}` : ""}!
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
          Let&apos;s set up your personal workspace in MergeX. This takes under a minute.
        </p>
      </div>
    </div>
  );
}

// ── STEP 1: Personal Information ──────────────────────────────
function StepPersonal({
  profile,
  onChange,
}: {
  profile: ProfileData;
  onChange: (p: ProfileData) => void;
}) {
  const designations = [
    "CX Executive", "Engagement Manager", "Proposal Manager",
    "Business Development", "Sales Manager", "Operations Lead",
    "Admin", "Super Admin",
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Personal information</h2>
        <p className="text-sm text-muted-foreground mt-1">How should we address you in the workspace?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="First Name"
          value={profile.firstName}
          onChange={(v) => onChange({ ...profile, firstName: v })}
          placeholder="Alex"
          autoFocus
        />
        <Field
          label="Last Name"
          value={profile.lastName}
          onChange={(v) => onChange({ ...profile, lastName: v })}
          placeholder="Johnson"
        />
      </div>

      <Field
        label="Username"
        value={profile.username}
        onChange={(v) => onChange({ ...profile, username: v.toLowerCase().replace(/\s/g, "") })}
        placeholder="alex.johnson"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Designation</label>
        <select
          value={profile.designation}
          onChange={(e) => onChange({ ...profile, designation: e.target.value })}
          className="h-12 px-3 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all"
        >
          <option value="">Select designation…</option>
          {designations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── STEP 2: Preferences ───────────────────────────────────────
function StepPreferences({
  prefs,
  onChange,
}: {
  prefs: PrefsData;
  onChange: (p: PrefsData) => void;
}) {
  const themes = [
    { value: "system" as const, label: "System", desc: "Match your OS setting" },
    { value: "light" as const, label: "Light", desc: "Always light mode" },
    { value: "dark" as const, label: "Dark", desc: "Always dark mode" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Workspace preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">Customize your experience. You can change these later.</p>
      </div>

      <div>
        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Theme</p>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => onChange({ ...prefs, theme: t.value })}
              className={`p-3 rounded-xl border text-left transition-all ${
                prefs.theme === t.value
                  ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                  : "border-[#E5E7EB] dark:border-[#26262C] hover:border-[#8B5CF6]/40"
              }`}
            >
              <p className="text-xs font-medium text-foreground">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#16161A]">
        <div>
          <p className="text-sm font-medium text-foreground">In-app notifications</p>
          <p className="text-xs text-muted-foreground">Get notified about leads, tasks, and mentions</p>
        </div>
        <button
          onClick={() => onChange({ ...prefs, notificationsEnabled: !prefs.notificationsEnabled })}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            prefs.notificationsEnabled ? "bg-[#8B5CF6]" : "bg-[#E5E7EB] dark:bg-[#26262C]"
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            prefs.notificationsEnabled ? "translate-x-5" : "translate-x-1"
          }`} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
const STEPS = [
  { icon: Sparkles, label: "Welcome" },
  { icon: User, label: "Profile" },
  { icon: Settings, label: "Preferences" },
];

export default function ProfileOnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: "",
    designation: "",
  });
  const [prefs, setPrefs] = useState<PrefsData>({
    theme: "system",
    activeBrandId: "",
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canProceed =
    step === 0 ? true :
    step === 1 ? !!(profile.firstName && profile.lastName && profile.username) :
    true;

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/profile-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, prefs }),
      });

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Setup failed");
      }

      const { brandCount, firstBrandSlug } = await res.json() as {
        ok: boolean;
        brandCount: number;
        firstBrandSlug: string | null;
      };

      // Reload Clerk session to pick up new publicMetadata (COMPLETE state)
      await user?.reload();

      // Route based on brand access:
      //   1 brand  → go directly to that brand's dashboard
      //   0 or 2+  → go to workspace hub to select
      if (brandCount === 1 && firstBrandSlug) {
        router.push(`/workspaces/${firstBrandSlug}/dashboard`);
      } else {
        router.push("/workspaces");
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleComplete();
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="max-w-lg mx-auto w-full">
      <div className="bg-white dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#26262C] rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#E5E7EB] dark:border-[#26262C]">
          <Logo />
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      i < step ? "bg-[#8B5CF6]" : i === step ? "bg-[#8B5CF6]/20 border border-[#8B5CF6]/40" : "bg-[#F3F4F6] dark:bg-[#1C1C21]"
                    }`}>
                      {i < step
                        ? <Check className="w-3.5 h-3.5 text-white" />
                        : <Icon className={`w-3.5 h-3.5 ${i === step ? "text-[#8B5CF6]" : "text-muted-foreground"}`} />
                      }
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px w-6 ${i < step ? "bg-[#8B5CF6]" : "bg-[#E5E7EB] dark:bg-[#26262C]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <StepBar current={step} total={STEPS.length} />
            <p className="text-xs text-muted-foreground mt-2">
              Workspace setup · Step {step + 1} of {STEPS.length}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {step === 0 && <StepWelcome firstName={user?.firstName ?? ""} />}
          {step === 1 && <StepPersonal profile={profile} onChange={setProfile} />}
          {step === 2 && <StepPreferences prefs={prefs} onChange={setPrefs} />}

          {error && (
            <p className="mt-4 text-xs text-[#EF4444] bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-xl px-3 py-2.5">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <button
            onClick={next}
            disabled={!canProceed || loading}
            className="h-10 px-5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : step < STEPS.length - 1
              ? <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
              : <><span>Enter workspace</span><Check className="w-4 h-4" /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
