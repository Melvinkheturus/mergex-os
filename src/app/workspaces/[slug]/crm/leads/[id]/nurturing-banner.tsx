"use client";

import { CalendarClock, AlertTriangle, Clock3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lead } from "../components/types";

interface NurturingBannerProps {
  lead: Lead;
  onPromoteNurturingToReady: () => Promise<void>;
  isSaving: boolean;
}

export function NurturingBanner({
  lead,
  onPromoteNurturingToReady,
  isSaving,
}: NurturingBannerProps) {
  if (lead.classification !== "WARM") return null;

  const followUpDate = lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null;
  const now = new Date();
  const daysRemaining = followUpDate
    ? Math.ceil((followUpDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const dirLabel =
    lead.nurturingDirection === "SHORT_TERM" ? "Short-Term (1–4 wks)"
    : lead.nurturingDirection === "MEDIUM_TERM" ? "Medium-Term (1–3 mo)"
    : lead.nurturingDirection === "LONG_TERM" ? "Long-Term (3–6 mo)"
    : lead.nurturingDirection === "PARTNER_FOLLOWUP" ? "Partner Follow-up"
    : lead.nurturingDirection === "MANUAL_FOLLOWUP" ? "Manual Follow-up"
    : null;

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/8 via-amber-500/5 to-transparent px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Status pill */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70">Currently In Nurturing</p>
          {dirLabel && (
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5">{dirLabel}</p>
          )}
        </div>
      </div>

      {/* Next follow-up */}
      {followUpDate && (
        <div className="flex items-center gap-2 shrink-0">
          <CalendarClock className="h-3.5 w-3.5 text-amber-500/70 shrink-0" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Next Follow-up</p>
            <p className="text-xs font-bold text-foreground/80">
              {followUpDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      )}

      {/* Days remaining */}
      {daysRemaining !== null && (
        <div className="flex items-center gap-2 shrink-0">
          {isOverdue
            ? <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            : <Clock3 className="h-3.5 w-3.5 text-amber-500/70 shrink-0" />}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {isOverdue ? "Overdue By" : "Days Remaining"}
            </p>
            <p className={`text-xs font-bold ${isOverdue ? "text-rose-500" : "text-foreground/80"}`}>
              {Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      )}

      {/* Move to Meeting Readiness button */}
      <div className="ml-auto shrink-0">
        <Button
          size="sm"
          onClick={onPromoteNurturingToReady}
          disabled={isSaving}
          className="h-8 text-[11px] font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg px-3.5 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Move to Meeting Readiness
        </Button>
      </div>
    </div>
  );
}
