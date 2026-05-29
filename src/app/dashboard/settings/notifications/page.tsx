"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Mail, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Prefs {
  inAppEnabled: boolean;
  inAppAssignments: boolean;
  inAppReminders: boolean;
  inAppEscalations: boolean;
  inAppActivity: boolean;
  emailEnabled: boolean;
  emailCriticalOnly: boolean;
  emailReminders: boolean;
  emailDigestMode: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DEFAULT_PREFS: Prefs = {
  inAppEnabled: true,
  inAppAssignments: true,
  inAppReminders: true,
  inAppEscalations: true,
  inAppActivity: true,
  emailEnabled: true,
  emailCriticalOnly: false,
  emailReminders: true,
  emailDigestMode: "instant",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
};

function SettingRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            disabled && "text-muted-foreground"
          )}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/pulse/preferences")
      .then((r) => r.json())
      .then((data) => {
        if (data.preferences) setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof Prefs) => (value: boolean | string) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/pulse/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-10 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* ── In-App Notifications ─────────────────────────────────── */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border-transparent p-5 mb-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <SectionHeader
          icon={Bell}
          title="In-App Notifications"
          subtitle="Control what appears in your Pulse inbox and bell dropdown"
        />
        <div className="divide-y divide-border/50">
          <SettingRow
            label="Enable in-app notifications"
            description="Master toggle for all in-app alerts"
            checked={prefs.inAppEnabled}
            onChange={update("inAppEnabled")}
          />
          <SettingRow
            label="Lead assignments"
            description="Notify when a lead is assigned to you"
            checked={prefs.inAppAssignments}
            disabled={!prefs.inAppEnabled}
            onChange={update("inAppAssignments")}
          />
          <SettingRow
            label="Reminders & follow-ups"
            description="Meeting reminders, overdue follow-ups, MOM deadlines"
            checked={prefs.inAppReminders}
            disabled={!prefs.inAppEnabled}
            onChange={update("inAppReminders")}
          />
          <SettingRow
            label="Escalations & alerts"
            description="Critical pipeline blockers and SLA violations"
            checked={prefs.inAppEscalations}
            disabled={!prefs.inAppEnabled}
            onChange={update("inAppEscalations")}
          />
          <SettingRow
            label="Team activity"
            description="Stage changes, won deals, and team actions"
            checked={prefs.inAppActivity}
            disabled={!prefs.inAppEnabled}
            onChange={update("inAppActivity")}
          />
        </div>
      </div>

      {/* ── Email Notifications ───────────────────────────────────── */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border-transparent p-5 mb-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <SectionHeader
          icon={Mail}
          title="Email Notifications"
          subtitle="Operational emails sent via Resend — only for what matters"
        />
        <div className="divide-y divide-border/50">
          <SettingRow
            label="Enable email notifications"
            description="Master toggle for all operational emails"
            checked={prefs.emailEnabled}
            onChange={update("emailEnabled")}
          />
          <SettingRow
            label="Critical alerts only"
            description="Only email for Critical priority events (MOM overdue, etc.)"
            checked={prefs.emailCriticalOnly}
            disabled={!prefs.emailEnabled}
            onChange={update("emailCriticalOnly")}
          />
          <SettingRow
            label="Reminder emails"
            description="Meeting reminders and follow-up overdue alerts"
            checked={prefs.emailReminders}
            disabled={!prefs.emailEnabled || prefs.emailCriticalOnly}
            onChange={update("emailReminders")}
          />
        </div>

        {/* Digest mode */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-sm font-medium mb-2">Email delivery</p>
          <div className="flex gap-2">
            {["instant", "daily"].map((mode) => (
              <button
                key={mode}
                disabled={!prefs.emailEnabled}
                onClick={() => update("emailDigestMode")(mode)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all",
                  prefs.emailDigestMode === mode
                    ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]"
                    : "border-border text-muted-foreground hover:border-border/80",
                  !prefs.emailEnabled && "opacity-40 pointer-events-none"
                )}
              >
                {mode === "instant" ? "⚡ Instant" : "📋 Daily digest"}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {prefs.emailDigestMode === "instant"
              ? "Emails are sent immediately when events are triggered."
              : "Emails are batched and sent once a day at 9:00 AM."}
          </p>
        </div>
      </div>

      {/* ── Quiet Hours ───────────────────────────────────────────── */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border-transparent p-5 mb-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <SectionHeader
          icon={Clock}
          title="Quiet Hours"
          subtitle="Suppress non-critical notifications during off hours"
        />
        <div className="divide-y divide-border/50">
          <SettingRow
            label="Enable quiet hours"
            description="Critical alerts still come through during quiet hours"
            checked={prefs.quietHoursEnabled}
            onChange={update("quietHoursEnabled")}
          />
        </div>

        {prefs.quietHoursEnabled && (
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                Starts at
              </label>
              <input
                type="time"
                value={prefs.quietHoursStart}
                onChange={(e) => update("quietHoursStart")(e.target.value)}
                className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">
                Ends at
              </label>
              <input
                type="time"
                value={prefs.quietHoursEnd}
                onChange={(e) => update("quietHoursEnd")(e.target.value)}
                className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save button and Info note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 p-5 rounded-[20px] border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 glass-frost-card shadow-sm">
        <div className="flex items-start gap-2 max-w-md">
          <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed text-left">
            <span className="font-semibold text-foreground">Pulse Engine</span> automatically
            processes overdue follow-ups, MOM deadlines, and stale leads. These operational
            rules run independently of your preferences.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
