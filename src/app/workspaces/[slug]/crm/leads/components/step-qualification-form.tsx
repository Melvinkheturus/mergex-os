"use client";

import { UseFormReturn } from "react-hook-form";
import { CheckCircle2, XCircle, Target, DollarSign, UserCheck, Settings, Zap, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { QualificationFormValues } from "./types";

interface StepQualificationFormProps {
  form: UseFormReturn<QualificationFormValues>;
  onSubmit: (values: QualificationFormValues) => Promise<void>;
}

const DIMENSIONS = [
  {
    key: "qualIcpFit" as const,
    label: "ICP Fit",
    description: "Ideal Customer Profile fit level",
    Icon: Target,
    options: [
      { label: "Strong",   value: 25 },
      { label: "Moderate", value: 15 },
      { label: "Weak",     value: 5  },
    ],
  },
  {
    key: "qualBudgetLikelihood" as const,
    label: "Budget Likelihood",
    description: "Budget availability probability",
    Icon: DollarSign,
    options: [
      { label: "High",    value: 25 },
      { label: "Medium",  value: 15 },
      { label: "Low",     value: 5  },
      { label: "Unknown", value: 0  },
    ],
  },
  {
    key: "qualDecisionMakerAccess" as const,
    label: "Decision Maker Access",
    description: "Access to the signing authority",
    Icon: UserCheck,
    options: [
      { label: "Direct",   value: 25 },
      { label: "Indirect", value: 15 },
      { label: "Unknown",  value: 0  },
    ],
  },
  {
    key: "qualOperationalFeasibility" as const,
    label: "Operational Feasibility",
    description: "Ability to deliver services",
    Icon: Settings,
    options: [
      { label: "High",   value: 15 },
      { label: "Medium", value: 10 },
      { label: "Low",    value: 5  },
    ],
  },
  {
    key: "qualServiceAlignment" as const,
    label: "Service Alignment",
    description: "Service mapping to needs",
    Icon: Zap,
    options: [
      { label: "Strong",   value: 10 },
      { label: "Moderate", value: 6  },
      { label: "Weak",     value: 2  },
    ],
  },
  {
    key: "qualGrowthPotential" as const,
    label: "Growth Potential",
    description: "Long term account growth scale",
    Icon: TrendingUp,
    options: [
      { label: "High",   value: 10 },
      { label: "Medium", value: 6  },
      { label: "Low",    value: 2  },
    ],
  },
] as const;

const MAX_SCORE = 110;
const QUALIFIED_THRESHOLD = 60;

export function StepQualificationForm({ form, onSubmit }: StepQualificationFormProps) {
  const { watch, setValue, register } = form;

  const vals = {
    qualIcpFit:              watch("qualIcpFit") || 0,
    qualBudgetLikelihood:    watch("qualBudgetLikelihood") || 0,
    qualDecisionMakerAccess: watch("qualDecisionMakerAccess") || 0,
    qualOperationalFeasibility: watch("qualOperationalFeasibility") || 0,
    qualServiceAlignment:    watch("qualServiceAlignment") || 0,
    qualGrowthPotential:     watch("qualGrowthPotential") || 0,
  };

  const totalScore = Object.values(vals).reduce((acc, v) => acc + v, 0);
  const isQualified = totalScore >= QUALIFIED_THRESHOLD;
  const dimensionsAnswered = Object.values(vals).filter(v => v > 0).length;
  const pct = Math.round((totalScore / MAX_SCORE) * 100);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-xs">
      {/* Qualification Score Banner */}
      <div className={cn(
        "rounded-2xl border p-4 flex items-center gap-4 transition-all duration-300 bg-muted/10 border-border/40",
        dimensionsAnswered > 0 && (isQualified ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5")
      )}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              {dimensionsAnswered === 0 ? (
                <span className="text-xs font-bold text-muted-foreground uppercase">Score Lead Across Dimensions</span>
              ) : isQualified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Lead Qualified</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-500" />
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Lead Disqualified</span>
                </>
              )}
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-black text-[#8B5CF6]">{totalScore}</span>
              <span className="text-[10px] text-muted-foreground">/110</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 rounded-full bg-border/30 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                dimensionsAnswered === 0
                  ? "w-0"
                  : isQualified
                    ? "bg-emerald-500"
                    : totalScore >= 40 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground/60">0</span>
            <span className="text-[9px] text-amber-500 font-semibold">Threshold: {QUALIFIED_THRESHOLD}</span>
            <span className="text-[9px] text-muted-foreground/60">{MAX_SCORE}</span>
          </div>
        </div>
      </div>

      {/* Qualification Cards Grid */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest pb-1">
          Qualification Dimensions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIMENSIONS.map((dim) => {
            const currentVal = watch(dim.key) || 0;
            const OptIcon = dim.Icon;
            const selectedOption = dim.options.find((o) => o.value === currentVal);

            return (
              <div key={dim.key} className="p-3.5 rounded-xl border border-border/40 bg-card/45 flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground/60 uppercase flex items-center gap-1">
                    <OptIcon className="h-3.5 w-3.5 text-[#8B5CF6]/80" /> {dim.label}
                  </span>
                  {currentVal > 0 && selectedOption && (
                    <span className="text-[9px] text-[#8B5CF6] font-semibold">
                      {selectedOption.label} (+{currentVal}pts)
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {dim.options.map((opt) => {
                    const isSelected = currentVal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue(dim.key, opt.value, { shouldDirty: true })}
                        className={cn(
                          "px-2.5 py-2 rounded-lg border text-[10px] font-semibold transition-all duration-150 flex-1 text-center flex items-center justify-center gap-1 cursor-pointer",
                          isSelected
                            ? "bg-[#8B5CF6]/15 border-[#8B5CF6]/40 text-[#8B5CF6] shadow-sm"
                            : "bg-muted/10 border-border/30 text-muted-foreground hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6]"
                        )}
                      >
                        {opt.label}
                        <span className="opacity-60 ml-0.5">({opt.value > 0 ? `+${opt.value}` : "0"})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Qualification Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="qualificationNotes" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
          Qualification Notes
        </Label>
        <Textarea
          id="qualificationNotes"
          className="text-xs resize-none min-h-[80px] bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
          placeholder="Document your reasoning, any red flags, or additional context that informed these scores…"
          {...register("qualificationNotes")}
        />
      </div>
    </form>
  );
}
