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
      { label: "Budget Set", isFilled: lead.bantBudget > 0 },
      { label: "Authority Set", isFilled: lead.bantAuthority > 0 },
      { label: "Need Set", isFilled: lead.bantNeed > 0 },
      { label: "Timeline Set", isFilled: lead.bantTimeline > 0 },
    ];
  }
  
  if (name.includes("CLASSIFICATION")) {
    return [
      { label: "ICP Status", isFilled: lead.icpScore > 0 },
      { label: "Services Selected", isFilled: !!(lead.services && lead.services.length > 0) },
      { label: "Priority Assigned", isFilled: !!lead.priority },
      { label: "Expected Value", isFilled: !!lead.expectedValue },
    ];
  }
  
  // Default checklist for subsequent/other stages
  return [
    { label: "Decision Maker Set", isFilled: !!lead.decisionMaker },
    { label: "BANT Complete", isFilled: lead.bantScore > 0 },
  ];
}

export function StageProgressBar({
  stages,
  currentStageId,
  onStageClick,
  saving,
  lead,
}: StageProgressBarProps) {
  // Only show the active workflow stages
  const workflowStages = stages.filter(
    (s) => !TERMINAL_STAGE_NAMES.includes(s.name)
  );

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
    <div className="w-full space-y-4">
      {/* 1. Horizontal Stepper Stepper Nodes */}
      <div className="w-full overflow-x-auto pb-1">
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
                        ? "bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6] ring-2 ring-[#8B5CF6]/25"
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

      {/* 2. Premium Stage Guidance Banner */}
      {lead && currentStage && (
        <div className={cn(
          "border rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all",
          isStageComplete
            ? "bg-emerald-500/5 border-emerald-500/20"
            : "bg-[#8B5CF6]/5 border-[#8B5CF6]/15"
        )}>
          {/* Stage Name & Completeness */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
              Active Stage Guidance
            </p>
            <h4 className="text-xs font-bold text-foreground">
              {currentStage.label}
              <span className={cn(
                "ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border",
                isStageComplete
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                  : "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20"
              )}>
                {progressPercent}% Complete
              </span>
            </h4>
          </div>

          {/* Checklist of required fields */}
          {checklist.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 max-w-xl">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-[10px] font-medium">
                  {item.isFilled ? (
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" strokeWidth={3} />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={item.isFilled ? "text-foreground/90" : "text-muted-foreground/60"}>
                    {item.label}
                  </span>
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
                "h-8 text-xs font-bold shrink-0 shadow-none border transition-all active:scale-95 duration-700",
                isStageComplete
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600/30"
                  : "bg-background text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5"
              )}
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              ) : (
                <>
                  Advance Stage
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
