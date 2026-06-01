"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { OptionStage } from "./types";

// Terminal stage names - shown separately via Win/Loss dialog, not in progress bar
const TERMINAL_STAGE_NAMES = ["WON", "LOST", "ON_HOLD"];

interface StageProgressBarProps {
  stages: OptionStage[];
  currentStageId: string | null;
  onStageClick: (stageId: string) => void;
  saving?: boolean;
}

export function StageProgressBar({
  stages,
  currentStageId,
  onStageClick,
  saving,
}: StageProgressBarProps) {
  // Only show the 10 active workflow stages - terminal states (Won/Lost/On Hold)
  // are separate outcomes handled by the Win/Loss dialog
  const workflowStages = stages.filter(
    (s) => !TERMINAL_STAGE_NAMES.includes(s.name)
  );

  const currentIndex = workflowStages.findIndex((s) => s.id === currentStageId);


  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-center min-w-max gap-0">
        {workflowStages.map((stage, idx) => {
          const isCompleted = currentIndex >= 0 && idx < currentIndex;
          const isCurrent = stage.id === currentStageId;
          // Phase A = 0–5 (Lead Operations), Phase B = 6–9 (Sales Conversion)
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
                      ? "bg-[#8B5CF6]/10 border-[#8B5CF6] text-[#8B5CF6] ring-2 ring-[#8B5CF6]/20"
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

              {/* Connector line - thicker dash at phase break */}
              {idx < workflowStages.length - 1 && (
                isPhaseBreak ? (
                  // Phase A → Phase B divider: triple-dot separator
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
  );
}
