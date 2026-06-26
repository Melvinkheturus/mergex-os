"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Check } from "lucide-react";
import { OptionStage, Lead } from "./types";

interface PipelineBreadcrumbProps {
  stages: OptionStage[];
  currentStageId: string | null;
  lead?: Lead; // Optional — used to filter Nurturing for HOT leads
}

const TERMINAL_STAGE_NAMES = ["WON", "LOST", "ON_HOLD"];

export function PipelineBreadcrumb({ stages, currentStageId, lead }: PipelineBreadcrumbProps) {
  const needsNurturing = lead?.classification === "WARM" || lead?.classification === "COLD";

  const workflowStages = stages
    .filter((s) => !TERMINAL_STAGE_NAMES.includes(s.name) && s.name !== "QUALIFICATION_AUDIT")
    .filter((s) => {
      if ((s.name || "").toUpperCase().includes("NURTURING")) {
        return needsNurturing;
      }
      return true;
    });

  const currentIndex = workflowStages.findIndex((s) => s.id === currentStageId);

  return (
    <div className="w-full overflow-hidden glass-frost-card border border-border/40 rounded-xl shadow-xs">
      <div className="flex items-center justify-between w-full overflow-x-auto py-2.5 px-4 text-xs font-semibold whitespace-nowrap scrollbar-none [&::-webkit-scrollbar]:hidden">
        {workflowStages.map((stage, idx) => {
          const isCompleted = currentIndex >= 0 && idx < currentIndex;
          const isCurrent = stage.id === currentStageId;
 
          return (
            <div key={stage.id} className="flex items-center justify-between flex-1 shrink-0 min-w-[140px] last:flex-none last:min-w-0">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all select-none mx-auto",
                  isCurrent
                    ? "bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#a78bfa] border border-[#8B5CF6]/20 font-bold"
                    : isCompleted
                    ? "text-[#8B5CF6]/70 dark:text-[#a78bfa]/75 font-semibold"
                    : "text-muted-foreground/50 font-normal"
                )}
              >
                {isCompleted && (
                  <Check className="h-3.5 w-3.5 text-[#8B5CF6] shrink-0" strokeWidth={3} />
                )}
                <span>{stage.label}</span>
              </div>
              
              {idx < workflowStages.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 ml-auto" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
