"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, User, Clock, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lead, Activity as LeadActivity } from "../../types";

// ─── Config ──────────────────────────────────────────────────────────────────
const SLA_HOURS = 4;
const RESPONSE_TYPES = new Set(["CALL", "EMAIL", "WHATSAPP", "TASK"]);

const ESCALATION_LEVELS = [
  { level: 1, afterHours: 2,  escalateTo: "Lead Owner",       reason: "No Response" },
  { level: 2, afterHours: 6,  escalateTo: "Sales Manager",    reason: "Extended No Response" },
  { level: 3, afterHours: 24, escalateTo: "Operations Head",  reason: "Critical — No Response" },
];

interface EscalationCardProps {
  lead: Lead;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function EscalationCard({ lead }: EscalationCardProps) {
  const [isBreached, setIsBreached] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [overdueMs, setOverdueMs] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

  const createdAt = new Date(lead.createdAt);
  const slaTargetAt = new Date(createdAt.getTime() + SLA_HOURS * 60 * 60 * 1000);

  // Fetch activities to check for response
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/crm/leads/${lead.id}/activities`);
        if (res.ok) {
          const data: LeadActivity[] = await res.json();

          const hasResponse = data.some((a) => RESPONSE_TYPES.has(a.type));
          if (hasResponse) {
            setIsResolved(true);
            setIsBreached(false);
            return;
          }
        }
      } catch {
        // silent
      }
    };
    load();
  }, [lead.id]);

  // Live clock: recalculate breach + escalation level every minute
  useEffect(() => {
    if (isResolved) return;

    const tick = () => {
      const now = Date.now();
      const breachMs = now - slaTargetAt.getTime();

      if (breachMs > 0) {
        setIsBreached(true);
        setOverdueMs(breachMs);

        // Determine current escalation level
        const breachHours = breachMs / (1000 * 60 * 60);
        let level = 0;
        for (const esc of ESCALATION_LEVELS) {
          if (breachHours >= esc.afterHours) level = esc.level;
        }
        setCurrentLevel(level);
      } else {
        setIsBreached(false);
        setCurrentLevel(0);
      }
    };

    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [isResolved, lead.createdAt]);

  // Card is only shown when SLA is breached and NOT resolved
  if (!isBreached || isResolved) return null;

  const activeEscalation = ESCALATION_LEVELS.find((e) => e.level === currentLevel);
  const ownerName = lead.owner
    ? `${lead.owner.firstName || ""} ${lead.owner.lastName || ""}`.trim()
    : "Unassigned";

  return (
    <Card className="border border-red-500/30 shadow-sm rounded-2xl bg-card">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 animate-bounce" />
          Escalation
        </CardTitle>
        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          SLA Breached
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 text-xs">
        {/* Overdue hero */}
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5 text-red-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-red-500/70">Overdue</p>
            <p className="text-lg font-black text-red-600 dark:text-red-400 tracking-tight">
              {formatDuration(overdueMs)}
            </p>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-2.5 text-[10px]">
          <div className="space-y-0.5">
            <p className="font-bold uppercase tracking-wide text-[9px] text-muted-foreground">Owner</p>
            <p className="font-semibold text-foreground flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground/60" />
              {ownerName}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="font-bold uppercase tracking-wide text-[9px] text-muted-foreground">Current Level</p>
            <p className="font-extrabold text-red-600 dark:text-red-400">
              Level {currentLevel}
            </p>
          </div>

          {activeEscalation && (
            <>
              <div className="space-y-0.5">
                <p className="font-bold uppercase tracking-wide text-[9px] text-muted-foreground">Escalated To</p>
                <p className="font-semibold text-foreground">{activeEscalation.escalateTo}</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold uppercase tracking-wide text-[9px] text-muted-foreground">Reason</p>
                <p className="font-semibold text-foreground">{activeEscalation.reason}</p>
              </div>
            </>
          )}
        </div>

        {/* Escalation timeline */}
        <div className="border-t border-border/10 pt-2.5 space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground/60">Escalation Path</p>
          {ESCALATION_LEVELS.map((esc) => {
            const triggered = currentLevel >= esc.level;
            return (
              <div
                key={esc.level}
                className={`flex items-center justify-between text-[9px] px-2 py-1.5 rounded-lg border transition-colors ${
                  triggered
                    ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
                    : "bg-muted/10 border-border/10 text-muted-foreground/50"
                }`}
              >
                <span className="font-bold">Level {esc.level} — {esc.escalateTo}</span>
                <span className="font-semibold">
                  {triggered ? "⚠ Active" : `After SLA +${esc.afterHours}h`}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[9px] text-muted-foreground/40 italic">
          Automatically controlled. Log a call, email, or WhatsApp to resolve.
        </p>
      </CardContent>
    </Card>
  );
}
