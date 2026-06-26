"use client";

import { cn } from "@/lib/utils";
import { Check, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionStage, Lead } from "./types";

// Terminal stage names - shown separately via Win/Loss dialog, not in progress bar
const TERMINAL_STAGE_NAMES = ["WON", "LOST", "ON_HOLD"];

interface StageProgressBarProps {
  stages: OptionStage[];
  currentStageId: string | null;
  onStageClick: (stageId: string) => void;
  saving?: boolean;
  lead?: Lead; // Full lead object to determine checklist progress
}

interface ChecklistItem {
  label: string;
  isFilled: boolean;
}

function getChecklistForStage(stageName: string, lead: Lead): ChecklistItem[] {
  const name = (stageName || "").toUpperCase();
  
  if (name.includes("INTAKE")) {
    return [
      { label: "Company Name", isFilled: !!lead.companyName },
      { label: "Contact Person", isFilled: !!lead.contactPerson },
      { label: "Phone", isFilled: !!lead.phone },
      { label: "Email", isFilled: !!lead.email },
      { label: "Source", isFilled: !!lead.sourceId },
    ];
  }
  
  if (name.includes("REVIEW")) {
    return [
      { label: "Current Systems", isFilled: !!lead.currentSituation },
      { label: "Pain Points", isFilled: !!(lead.painPoints && lead.painPoints.length > 0) },
      { label: "Opportunities", isFilled: !!lead.opportunityNotes },
    ];
  }
  
  if (name.includes("QUALIFICATION") && !name.includes("AUDIT")) {
    return [
      { label: "ICP Fit Set", isFilled: lead.qualIcpFit > 0 },
      { label: "Budget Set", isFilled: lead.qualBudgetLikelihood > 0 },
      { label: "Authority Set", isFilled: lead.qualDecisionMakerAccess > 0 },
      { label: "Need Set", isFilled: lead.qualNeed > 0 },
      { label: "Timeline Set", isFilled: lead.qualTimeline > 0 },
    ];
  }
  
  if (name.includes("CLASSIFICATION")) {
    return [
      { label: "Classification Set", isFilled: !!(lead.classification) },
      { label: "Services Selected", isFilled: !!(lead.services && lead.services.length > 0) },
      { label: "Expected Value", isFilled: !!lead.expectedValue },
    ];
  }

  if (name.includes("NURTURING")) {
    return [
      { label: "Nurturing Status", isFilled: !!(lead.nurturingStatus) },
      { label: "Follow-up Scheduled", isFilled: !!(lead.nextFollowUpAt) },
    ];
  }

  if (name.includes("MEETING")) {
    return [
      { label: "Business Review Complete", isFilled: !!(lead.businessAge || lead.teamSize) && (lead.painPoints?.length ?? 0) > 0 },
      { label: "Qualification Complete", isFilled: !!(lead.qualIcpFit > 0 && lead.qualBudgetLikelihood > 0 && lead.qualDecisionMakerAccess > 0 && lead.qualNeed > 0 && lead.qualTimeline > 0) },
      { label: "Pain Point Identified", isFilled: (lead.painPoints?.length ?? 0) > 0 },
      { label: "Outreach Performed", isFilled: !!lead.lastContactAt || !!lead.nextFollowUpAt || !!lead.lastActivityAt },
      { label: "Lead Classified HOT", isFilled: lead.classification === "HOT" },
      { label: "Decision Maker Identified", isFilled: lead.qualDecisionMakerAccess > 0 },
    ];
  }

  // Default: no specific requirements
  return [];
}

export function StageProgressBar({
  stages,
  currentStageId,
  onStageClick,
  saving,
  lead,
}: StageProgressBarProps) {
  const needsNurturing = lead?.classification === "WARM" || lead?.classification === "COLD";
  // Only show the active workflow stages
  const workflowStages = stages
    .filter((s) => !TERMINAL_STAGE_NAMES.includes(s.name) && s.name !== "QUALIFICATION_AUDIT")
    .filter((s) => {
      if ((s.name || "").toUpperCase().includes("NURTURING")) {
        return needsNurturing;
      }
      return true;
    });

  const currentIndex = workflowStages.findIndex((s) => s.id === currentStageId);
  const currentStage = workflowStages[currentIndex];

  // Checklist computation
  const checklist = lead && currentStage
    ? getChecklistForStage(currentStage.name, lead)
    : [];
  
  const filledCount = checklist.filter((item) => item.isFilled).length;
  const isStageComplete = checklist.length > 0 && filledCount === checklist.length;
  const progressPercent = checklist.length > 0
    ? Math.round((filledCount / checklist.length) * 100)
    : 0;

  // Next stage in pipeline
  const nextStage = currentIndex >= 0 && currentIndex < workflowStages.length - 1
    ? workflowStages[currentIndex + 1]
    : null;

  return (
    <div className="w-full space-y-5">
      {/* 1. Horizontal Stepper Stepper Nodes */}
      <div className="w-full overflow-x-auto pt-2.5 pb-6">
        <div className="flex items-center min-w-max gap-0">
          {workflowStages.map((stage, idx) => {
            const isCompleted = currentIndex >= 0 && idx < currentIndex;
            const isCurrent = stage.id === currentStageId;
            const isPhaseBreak = idx === 5; // insert divider after Qualification Audit

            return (
              <div key={stage.id} className="flex items-center">
                {/* Stage Node */}
                <button
                  id={`stage-progress-${stage.id}`}
                  disabled={saving}
                  onClick={() => !saving && onStageClick(stage.id)}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 px-1 disabled:cursor-not-allowed transition-all",
                    saving ? "opacity-50" : "cursor-pointer"
                  )}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                      isCompleted
                        ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                        : isCurrent
                        ? "bg-gradient-to-t from-[#8B5CF6]/15 via-white/40 to-white dark:from-purple-950/20 dark:via-transparent dark:to-zinc-900 border-[#8B5CF6] text-[#8B5CF6] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(139,92,246,0.15)] ring-2 ring-[#8B5CF6]/25"
                        : "bg-muted/30 border-border/40 text-muted-foreground group-hover:border-[#8B5CF6]/40 group-hover:bg-[#8B5CF6]/5"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={cn(
                      "text-[9px] font-semibold whitespace-nowrap leading-tight transition-colors",
                      isCurrent
                        ? "text-[#8B5CF6]"
                        : isCompleted
                        ? "text-[#8B5CF6]/70"
                        : "text-muted-foreground/60 group-hover:text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>
                </button>

                {/* Connector line */}
                {idx < workflowStages.length - 1 && (
                  isPhaseBreak ? (
                    <div className="flex items-center gap-0.5 mx-1.5 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-border/40" />
                      <div className="w-1 h-1 rounded-full bg-border/25" />
                      <div className="w-1.5 h-1.5 rounded-full bg-border/40" />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "h-[2px] w-8 mx-0.5 rounded-full transition-colors duration-300",
                        idx < currentIndex
                          ? "bg-[#8B5CF6]"
                          : "bg-border/30"
                      )}
                    />
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Premium Stage Guidance Card */}
      {lead && currentStage && (
        <div className={cn(
          "relative overflow-hidden rounded-xl border p-5 transition-all duration-300",
          isStageComplete
            ? "bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-xs"
            : "bg-linear-to-br from-[#8B5CF6]/10 via-[#8B5CF6]/5 to-transparent border-[#8B5CF6]/15 shadow-xs"
        )}>
          {/* Subtle background glow */}
          <div className={cn(
            "absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none",
            isStageComplete ? "bg-emerald-500" : "bg-[#8B5CF6]"
          )} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            {/* Stage Info */}
            <div className="space-y-1.5 min-w-[200px]">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  isStageComplete ? "bg-emerald-500" : "bg-[#8B5CF6]"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
                  Active Stage Guidance
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  {currentStage.label}
                </h4>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs transition-all",
                  isStageComplete
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                    : "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20"
                )}>
                  {progressPercent}% Complete
                </span>
              </div>
            </div>

            {/* Checklist of required fields */}
            {checklist.length > 0 && (
              <div className="flex-1 flex flex-wrap items-center gap-2 max-w-xl">
                {checklist.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all duration-200",
                      item.isFilled
                        ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-muted/30 border-border/40 text-muted-foreground/60"
                    )}
                  >
                    {item.isFilled ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={3} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Advance Action Button */}
            {nextStage && (
              <Button
                size="sm"
                disabled={saving}
                onClick={() => onStageClick(nextStage.id)}
                className={cn(
                  "h-8 px-4 text-xs font-bold shrink-0 shadow-xs border transition-all active:scale-95 duration-200",
                  isStageComplete
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600/30 hover:shadow-emerald-500/10"
                    : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/10"
                )}
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                ) : (
                  <>
                    Advance Stage
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
