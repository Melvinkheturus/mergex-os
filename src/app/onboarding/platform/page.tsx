"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight, Check, Loader2, Plus, Trash2, Building2,
  Settings2, Users,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface Brand {
  name: string;
  slug: string;
}

// ── Helpers ───────────────────────────────────────────────────
function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Step Indicator ────────────────────────────────────────────
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

// ── STEP 1: Create Brands ─────────────────────────────────────
function StepBrands({ brands, onChange }: {
  brands: Brand[];
  onChange: (brands: Brand[]) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const addBrand = (brandName: string = name) => {
    const s = slugify(brandName);
    if (!brandName.trim() || brands.find((b) => b.slug === s)) return;
    onChange([...brands, { name: brandName.trim(), slug: s }]);
    setName("");
    setSlug("");
  };

  const removeBrand = (slug: string) => onChange(brands.filter((b) => b.slug !== slug));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Create your brand divisions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add the operational brands in your workspace. You can edit these later.
        </p>
      </div>



      {/* Manual add */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }}
            onKeyDown={(e) => e.key === "Enter" && addBrand()}
            placeholder="Custom brand name…"
            className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all"
          />
        </div>
        <button
          onClick={() => addBrand()}
          disabled={!name.trim()}
          className="h-10 px-4 rounded-lg bg-[#8B5CF6] text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7C3AED] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Added brands */}
      {brands.length > 0 && (
        <div className="space-y-2">
          {brands.map((b) => (
            <div
              key={b.slug}
              className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#16161A]"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{b.name}</p>
                <p className="text-xs text-muted-foreground font-mono">/{b.slug}</p>
              </div>
              <button onClick={() => removeBrand(b.slug)} className="text-muted-foreground hover:text-[#EF4444] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {brands.length === 0 && (
        <div className="flex items-center justify-center py-6 rounded-xl border border-dashed border-[#E5E7EB] dark:border-[#26262C] text-xs text-muted-foreground">
          Add at least one brand to continue
        </div>
      )}
    </div>
  );
}

// ── STEP 2: Platform Preferences ─────────────────────────────
function StepPreferences({ prefs, onChange }: {
  prefs: { timezone: string; currency: string };
  onChange: (p: { timezone: string; currency: string }) => void;
}) {
  const timezones = [
    "Asia/Kolkata", "America/New_York", "America/Los_Angeles",
    "Europe/London", "Europe/Berlin", "Asia/Singapore", "Asia/Dubai", "Australia/Sydney",
  ];
  const currencies = ["INR", "USD", "GBP", "EUR", "AED", "SGD", "AUD"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Platform preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set the default timezone and currency for your workspace.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Timezone</label>
          <select
            value={prefs.timezone}
            onChange={(e) => onChange({ ...prefs, timezone: e.target.value })}
            className="h-12 px-3 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Currency</label>
          <select
            value={prefs.currency}
            onChange={(e) => onChange({ ...prefs, currency: e.target.value })}
            className="h-12 px-3 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ── STEP 3: Invite Team ───────────────────────────────────────
function StepInviteTeam({ invites, onChange }: {
  invites: string[];
  onChange: (emails: string[]) => void;
}) {
  const [email, setEmail] = useState("");

  const addEmail = () => {
    const e = email.trim().toLowerCase();
    if (!e || invites.includes(e) || !e.includes("@")) return;
    onChange([...invites, e]);
    setEmail("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Invite your core team</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Optional. Add teammates to join the workspace. You can do this later from Settings → Users.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEmail()}
          placeholder="colleague@mergex.in"
          className="flex-1 h-10 px-3 rounded-lg border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#111114] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 focus:border-[#8B5CF6] transition-all"
        />
        <button
          onClick={addEmail}
          disabled={!email.includes("@")}
          className="h-10 px-4 rounded-lg bg-[#8B5CF6] text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7C3AED] transition-colors"
        >
          <Plus className="w-4 h-4" /> Invite
        </button>
      </div>

      {invites.length > 0 ? (
        <div className="space-y-2">
          {invites.map((e) => (
            <div key={e} className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] dark:border-[#26262C] bg-white dark:bg-[#16161A]">
              <p className="text-sm text-foreground">{e}</p>
              <button onClick={() => onChange(invites.filter((i) => i !== e))} className="text-muted-foreground hover:text-[#EF4444] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 rounded-xl border border-dashed border-[#E5E7EB] dark:border-[#26262C] text-xs text-muted-foreground">
          No invites added - you can skip this step
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
const STEPS = [
  { icon: Building2, label: "Brands" },
  { icon: Settings2, label: "Preferences" },
  { icon: Users, label: "Team" },
];

export default function PlatformOnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [prefs, setPrefs] = useState({ timezone: "Asia/Kolkata", currency: "INR" });
  const [invites, setInvites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canProceed = step === 0 ? brands.length > 0 : true;

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/platform-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brands, prefs, invites }),
      });

      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Setup failed");
      }

      // Reload Clerk session to pick up new publicMetadata
      await user?.reload();

      // super_admin still needs to complete personal profile
      router.push("/onboarding/profile");
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
              Platform setup · Step {step + 1} of {STEPS.length}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {step === 0 && <StepBrands brands={brands} onChange={setBrands} />}
          {step === 1 && <StepPreferences prefs={prefs} onChange={setPrefs} />}
          {step === 2 && <StepInviteTeam invites={invites} onChange={setInvites} />}

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

          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip invites
              </button>
            )}
            <button
              onClick={next}
              disabled={!canProceed || loading}
              className="h-10 px-5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : step < STEPS.length - 1
                ? <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
                : <><span>Complete Setup</span><Check className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
