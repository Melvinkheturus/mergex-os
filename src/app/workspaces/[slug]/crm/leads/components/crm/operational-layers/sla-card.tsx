"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, Activity as LeadActivity } from "../../types";

// ─── Config ──────────────────────────────────────────────────────────────────
const SLA_HOURS = 4;
const RESPONSE_TYPES = new Set(["CALL", "EMAIL", "WHATSAPP", "TASK"]);

interface SlaCardProps {
  lead: Lead;
}

type SlaState = "ON_TRACK" | "WARNING" | "BREACHED" | "COMPLETED";

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
}

export function SlaCard({ lead }: SlaCardProps) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [slaState, setSlaState] = useState<SlaState>("ON_TRACK");
  const [timeDisplay, setTimeDisplay] = useState("0d 4h 00m 00s");
  const [responseTime, setResponseTime] = useState<string | null>(null);
  const [firstResponseType, setFirstResponseType] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable numeric timestamps — won't change across re-renders
  const createdAtMs = new Date(lead.createdAt).getTime();
  const targetAtMs = createdAtMs + SLA_HOURS * 60 * 60 * 1000;

  // ─── 1. Fetch activities ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/crm/leads/${lead.id}/activities`);
        if (res.ok && !cancelled) {
          const data: LeadActivity[] = await res.json();
          setActivities(data);
        }
      } catch {
        // silent
      }
    };
    load();
    return () => { cancelled = true; };
  }, [lead.id]);

  // ─── 2. Compute response & start/stop timer ───────────────────────────────
  useEffect(() => {
    // Find earliest qualifying activity
    const response = activities
      .filter((a) => RESPONSE_TYPES.has(a.type))
      .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime())[0];

    // Clear any previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (response) {
      // COMPLETED — static display, no timer needed
      const responseAtMs = new Date(response.performedAt).getTime();
      const elapsed = responseAtMs - createdAtMs;
      setSlaState("COMPLETED");
      setTimeDisplay(formatDuration(elapsed));
      setResponseTime(
        new Date(response.performedAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setFirstResponseType(response.type);
      return;
    }

    // LIVE countdown — capture targetAtMs as a stable number in closure
    const tick = () => {
      const now = Date.now();
      const remaining = targetAtMs - now;

      if (remaining <= 0) {
        setSlaState("BREACHED");
        setTimeDisplay(formatDuration(remaining)); // formatDuration handles negative via Math.abs
      } else if (remaining < 30 * 60 * 1000) {
        setSlaState("WARNING");
        setTimeDisplay(formatDuration(remaining));
      } else {
        setSlaState("ON_TRACK");
        setTimeDisplay(formatDuration(remaining));
      }
    };

    tick(); // immediate first paint
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activities, createdAtMs, targetAtMs]);

  // ─── Visual config per state ────────────────────────────────────────────────
  const config = {
    ON_TRACK: {
      border: "border-border/40",
      badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
      badgeText: "🟢 On Track",
      icon: Clock,
      iconClass: "text-emerald-500",
      iconBg: "bg-muted/20",
      label: "Due In",
      timeClass: "text-foreground",
    },
    WARNING: {
      border: "border-amber-500/30",
      badge: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
      badgeText: "🟡 Warning",
      icon: AlertTriangle,
      iconClass: "text-amber-500 animate-pulse",
      iconBg: "bg-amber-500/10",
      label: "Due In",
      timeClass: "text-amber-600 dark:text-amber-400",
    },
    BREACHED: {
      border: "border-red-500/30",
      badge: "bg-red-500/10 text-red-600 border border-red-500/20",
      badgeText: "🔴 Breached",
      icon: ShieldAlert,
      iconClass: "text-red-500 animate-pulse",
      iconBg: "bg-red-500/10",
      label: "Overdue By",
      timeClass: "text-red-600 dark:text-red-400",
    },
    COMPLETED: {
      border: "border-emerald-500/20",
      badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
      badgeText: "✓ Responded",
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      label: "Response Time",
      timeClass: "text-emerald-600 dark:text-emerald-400",
    },
  };

  const c = config[slaState];
  const Icon = c.icon;

  const createdAt = new Date(createdAtMs);
  const targetAt = new Date(targetAtMs);

  return (
    <Card className={`border ${c.border} shadow-sm rounded-2xl bg-card`}>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#8B5CF6]" />
          Response SLA
        </CardTitle>
        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${c.badge}`}>
          {c.badgeText}
        </span>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Main countdown/result */}
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
            <Icon className={`h-4.5 w-4.5 ${c.iconClass}`} />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium">{c.label}</p>
            {/* ↓ font-semibold instead of font-black, tabular nums for stable width */}
            <p className={`text-lg font-semibold tracking-tight tabular-nums ${c.timeClass}`}>
              {timeDisplay}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="border-t border-border/10 pt-2.5 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
          <div>
            <p className="font-bold uppercase tracking-wide text-[9px] mb-0.5">Created At</p>
            <p className="font-medium text-foreground">
              {createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })},{" "}
              {createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-wide text-[9px] mb-0.5">
              {slaState === "COMPLETED" ? "Responded At" : "Response Due"}
            </p>
            <p className={`font-medium ${slaState === "BREACHED" ? "text-red-500" : "text-foreground"}`}>
              {slaState === "COMPLETED" && responseTime
                ? responseTime
                : targetAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) +
                  ", " +
                  targetAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[9px] text-muted-foreground/50 italic">
          {slaState === "COMPLETED"
            ? `First response via ${firstResponseType?.toLowerCase() ?? "activity"}.`
            : `Target: ${SLA_HOURS}h from creation. Counts on first call, email, WhatsApp, or task.`}
        </p>
      </CardContent>
    </Card>
  );
}
