"use client";

import { 
  Check, Lock, ChevronRight, ChevronLeft, Save,
  PlusCircle, Building2, ShieldCheck, Tag, Heart, CalendarCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface WizardStep {
  id: number;
  label: string;
  sublabel: string;
  isComplete: boolean;
  isLocked: boolean;
  canAdvance?: boolean;
  /** User-facing count badge (e.g. "3/6") */
  badge?: string;
}

interface LeadStepStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  onSave: () => void;
  onContinue?: () => void;
  isSaving?: boolean;
  children: React.ReactNode;
}

const STEP_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: PlusCircle,
  2: Building2,
  3: ShieldCheck,
  4: Tag,
  5: Heart,
  6: CalendarCheck,
};

export function LeadStepStepper({
  steps,
  currentStep,
  onStepClick,
  onSave,
  isSaving = false,
  children,
}: LeadStepStepperProps) {
  const step = steps.find((s) => s.id === currentStep);
  const prevStep = currentStep > 1 ? steps.find((s) => s.id === currentStep - 1) : null;

  return (
    <div className="space-y-5">
      {/* ─── Step Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden bg-card border border-border/40 rounded-xl shadow-xs">
        <div className="flex items-center justify-between w-full overflow-x-auto py-2.5 px-4 text-xs font-semibold whitespace-nowrap scrollbar-none [&::-webkit-scrollbar]:hidden">
          {steps.map((s, idx) => {
            const isCurrent = s.id === currentStep;
            const isCompleted = s.isComplete || s.id < currentStep;
            const isClickable = !s.isLocked && (isCompleted || isCurrent);
            const StepIcon = STEP_ICONS[s.id];
 
            return (
              <div key={s.id} className="flex items-center justify-between flex-1 shrink-0 min-w-[140px] last:flex-none last:min-w-0">
                <button
                  type="button"
                  disabled={s.isLocked}
                  onClick={() => isClickable && onStepClick(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 mx-auto",
                    isCurrent
                      ? "bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#a78bfa] border border-[#8B5CF6]/20 font-bold"
                      : isCompleted
                      ? "text-[#8B5CF6]/70 dark:text-[#a78bfa]/75 font-semibold"
                      : "text-muted-foreground/50 font-normal"
                  )}
                >
                  {s.isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                  ) : StepIcon ? (
                    <StepIcon className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isCurrent ? "text-[#8B5CF6]" : isCompleted ? "text-[#8B5CF6]/75" : "text-muted-foreground/50"
                    )} />
                  ) : null}
                  <span>{s.label}</span>
                  {s.badge && !s.isLocked && (
                    <span className="text-[9px] opacity-60 ml-0.5">({s.badge})</span>
                  )}
                </button>
                
                {idx < steps.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      </div>
 
      {/* ─── Step Content Card ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
        {/* Step header inside card */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20 bg-muted/10">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">{step?.label}</p>
            <p className="text-[11px] text-muted-foreground/70">{step?.sublabel}</p>
          </div>
          {step?.isComplete && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Complete</span>
            </div>
          )}
        </div>
 
        {/* Form content */}
        <div className="p-5 sm:p-6">
          {children}
        </div>
 
        {/* Action footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border/20 bg-muted/5">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onStepClick(currentStep - 1)}
                className="h-8 text-xs font-semibold border-border/60 hover:bg-muted text-foreground rounded-lg transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1.5" />
                {prevStep?.label || "Back"}
              </Button>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white hover:text-white rounded-lg transition-all"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
