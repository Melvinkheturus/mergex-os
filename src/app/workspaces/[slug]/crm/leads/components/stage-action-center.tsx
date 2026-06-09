"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionStage, Lead } from "./types";

const TERMINAL_STAGE_NAMES = ["WON", "LOST", "ON_HOLD"];

interface StageActionCenterProps {
  stages: OptionStage[];
  currentStageId: string | null;
  onStageClick: (stageId: string) => void;
  saving?: boolean;
  lead: Lead;
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
    const hasReadiness = typeof window !== "undefined" && !!localStorage.getItem(`proposal-readiness-${lead.id}`);
    return [
      { label: "Services Selected", isFilled: !!(lead.services && lead.services.length > 0) },
      { label: "Expected Value", isFilled: !!lead.expectedValue },
      { label: "Proposal Readiness", isFilled: hasReadiness },
    ];
  }
  
  return [
    { label: "Decision Maker Set", isFilled: !!lead.decisionMaker },
    { label: "BANT Complete", isFilled: lead.bantScore > 0 },
  ];
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return "recently";
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function StageActionCenter({
  stages,
  currentStageId,
  onStageClick,
  saving,
  lead,
}: StageActionCenterProps) {
  // Only show active workflow stages
  const workflowStages = stages.filter(
    (s) => !TERMINAL_STAGE_NAMES.includes(s.name)
  );

  const currentIndex = workflowStages.findIndex((s) => s.id === currentStageId);
  const currentStage = workflowStages[currentIndex];

  // Checklist computation
  const checklist = lead && currentStage
    ? getChecklistForStage(currentStage.name, lead)
    : [];

  const completedItems = checklist.filter((item) => item.isFilled);
  const missingItems = checklist.filter((item) => !item.isFilled);
  
  const progressPercent = checklist.length > 0
    ? Math.round((completedItems.length / checklist.length) * 100)
    : 0;

  // Next stage in pipeline
  const nextStage = currentIndex >= 0 && currentIndex < workflowStages.length - 1
    ? workflowStages[currentIndex + 1]
    : null;

  return (
    <div className="glass-frost-card border border-border/40 rounded-2xl p-5 shadow-xs relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: Current Stage & Next Stage */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
              Current Stage
            </span>
            <span className="text-base font-black text-foreground block mt-0.5">
              {currentStage?.label || "No Stage"}
            </span>
          </div>
          {nextStage ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                Next Stage
              </span>
              <span className="text-xs font-bold text-[#8B5CF6] block mt-0.5">
                {nextStage.label}
              </span>
            </div>
          ) : null}
        </div>

        {/* Column 2: Requirements Checklist */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
            Requirements ({completedItems.length}/{checklist.length})
          </span>
          {checklist.length > 0 ? (
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {completedItems.map((item, idx) => (
                <div key={`comp-${idx}`} className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold select-none">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
                  <span>{item.label}</span>
                </div>
              ))}
              {missingItems.map((item, idx) => (
                <div key={`miss-${idx}`} className="flex items-center gap-2 text-xs text-muted-foreground/75 font-normal select-none">
                  <div className="w-3.5 h-3.5 rounded-sm border border-muted-foreground/45 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">No requirements for this stage</p>
          )}
        </div>

        {/* Column 3: Advance Button */}
        <div className="flex flex-col gap-2 justify-center h-full">
          {nextStage ? (
            <div className="space-y-2 w-full">
              <Button
                size="sm"
                disabled={saving || progressPercent < 100}
                onClick={() => onStageClick(nextStage.id)}
                className={cn(
                  "h-10 px-4 text-xs font-bold shadow-2xs border transition-all duration-200 w-full",
                  progressPercent === 100
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600/30 hover:shadow-emerald-500/10 active:scale-95"
                    : "bg-muted text-muted-foreground border-border/30 cursor-not-allowed opacity-60"
                )}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : progressPercent === 100 ? (
                  <>
                    Advance to {nextStage.label}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    Cannot Advance
                  </>
                )}
              </Button>
              {progressPercent < 100 && missingItems.length > 0 && (
                <div className="text-[10px] text-amber-500/90 font-semibold leading-normal w-full bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 mt-2">
                  <span className="font-bold">Blocked by:</span>
                  <ul className="list-disc list-inside mt-0.5 font-normal text-muted-foreground/95 space-y-0.5">
                    {missingItems.map((item, idx) => (
                      <li key={idx} className="text-[10px]">{item.label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5 rounded-xl text-center w-full">
              🎉 Final Pipeline Stage Reached
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
