"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Target, IndianRupee, UserCheck, AlertTriangle, Clock,
  CheckCircle2, XCircle, MinusCircle,
} from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { QualificationFormValues } from "./types";

import { ScoreCircle } from "./score-circle";
import { RiskDropdown } from "./risk-dropdown";
import { OptionPill, CustomScoreInput } from "./custom-score-input";

interface StepQualificationFormProps {
  form: UseFormReturn<QualificationFormValues>;
  onSubmit: (values: QualificationFormValues) => Promise<void>;
}

// ─── ICP Options ──────────────────────────────────────────────────────────────
const ICP_OPTIONS = [
  { label: "Strong Fit",   value: 25 },
  { label: "Moderate Fit", value: 15 },
  { label: "Weak Fit",     value: 5  },
  { label: "Unknown",      value: 0  },
];

// ─── BANT 4 Cards ─────────────────────────────────────────────────────────────
const BANT_CARDS = [
  {
    key:     "qualBudgetLikelihood" as const,
    descKey: "qualBudgetLikelihoodDesc" as const,
    label:   "Budget",
    Icon:    IndianRupee,
    color:   "#10b981",
    bg:      "rgba(16,185,129,0.08)",
    options: [
      { label: "High",    value: 25 },
      { label: "Medium",  value: 15 },
      { label: "Low",     value: 5  },
      { label: "Unknown", value: 0  },
    ],
  },
  {
    key:     "qualDecisionMakerAccess" as const,
    descKey: "qualDecisionMakerAccessDesc" as const,
    label:   "Authority",
    Icon:    UserCheck,
    color:   "#3b82f6",
    bg:      "rgba(59,130,246,0.08)",
    options: [
      { label: "Founder",  value: 25 },
      { label: "Director", value: 20 },
      { label: "Manager",  value: 15 },
      { label: "Staff",    value: 10 },
      { label: "Unknown",  value: 0  },
    ],
  },
  {
    key:     "qualNeed" as const,
    descKey: "qualNeedDesc" as const,
    label:   "Need",
    Icon:    AlertTriangle,
    color:   "#f59e0b",
    bg:      "rgba(245,158,11,0.08)",
    options: [
      { label: "Critical", value: 25 },
      { label: "High",     value: 20 },
      { label: "Medium",   value: 15 },
      { label: "Low",      value: 5  },
      { label: "Unknown",  value: 0  },
    ],
  },
  {
    key:     "qualTimeline" as const,
    descKey: "qualTimelineDesc" as const,
    label:   "Timeline",
    Icon:    Clock,
    color:   "#0ea5e9",
    bg:      "rgba(14,165,233,0.08)",
    options: [
      { label: "Immediate",      value: 25 },
      { label: "Within 30 Days", value: 20 },
      { label: "Within 90 Days", value: 15 },
      { label: "Future",         value: 5  },
      { label: "Unknown",        value: 0  },
    ],
  },
] as const;

const OUTCOME_OPTIONS = [
  { label: "Qualified",           value: "Qualified",           Icon: CheckCircle2, cls: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10 text-xs px-2.5 py-1.5" },
  { label: "Partial",             value: "Partially Qualified", Icon: MinusCircle,  cls: "text-amber-500 border-amber-500/40 bg-amber-500/10 text-xs px-2.5 py-1.5"   },
  { label: "Not Qualified",       value: "Not Qualified",       Icon: XCircle,      cls: "text-rose-500 border-rose-500/40 bg-rose-500/10 text-xs px-2.5 py-1.5"     },
];

export function StepQualificationForm({ form, onSubmit }: StepQualificationFormProps) {
  const { watch, setValue, register } = form;

  const icpFit  = watch("qualIcpFit")              || 0;
  const icpFitDesc = watch("qualIcpFitDesc")       || "";
  const budget  = watch("qualBudgetLikelihood")    || 0;
  const budgetDesc = watch("qualBudgetLikelihoodDesc") || "";
  const auth    = watch("qualDecisionMakerAccess") || 0;
  const authDesc = watch("qualDecisionMakerAccessDesc") || "";
  const need    = watch("qualNeed")                || 0;
  const needDesc = watch("qualNeedDesc")           || "";
  const timeline = watch("qualTimeline")           || 0;
  const timelineDesc = watch("qualTimelineDesc")   || "";
  const qualRisks    = watch("qualRisks")    || [];
  const qualOtherRisk = watch("qualOtherRisk") || "";
  const qualOutcome  = watch("qualOutcome");

  const totalScore = icpFit + budget + auth + need + timeline;
  const MAX = 125;
  const pct = Math.round((totalScore / MAX) * 100);
  const autoOutcome = totalScore >= 80 ? "Qualified" : totalScore >= 45 ? "Partially Qualified" : totalScore > 0 ? "Not Qualified" : null;
  const activeOutcome = qualOutcome || autoOutcome;

  // Track which fields are actively displaying their input box
  const [customMode, setCustomMode] = useState<Record<string, boolean>>({});

  const setCustomActive = (field: string, active: boolean) => {
    setCustomMode(prev => ({ ...prev, [field]: active }));
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">

      {/* ━━━━ ROW 1: Circle Score + ICP Fit ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex gap-0 items-stretch">

        {/* Left — Score Circle */}
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-5 shrink-0">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <ScoreCircle score={totalScore} max={MAX} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-foreground leading-none">{totalScore}</span>
              <span className="text-[9px] text-muted-foreground/50 font-medium">/{MAX}</span>
            </div>
          </div>
          <div className="text-center">
            {totalScore === 0 ? (
              <span className="text-[10px] text-muted-foreground/40">Score lead</span>
            ) : totalScore >= 80 ? (
              <span className="text-xs font-bold text-emerald-500">Qualified</span>
            ) : totalScore >= 45 ? (
              <span className="text-xs font-bold text-amber-500">Partial</span>
            ) : (
              <span className="text-xs font-bold text-rose-500">Not Qualified</span>
            )}
            {totalScore > 0 && (
              <p className="text-[9px] text-muted-foreground/40 mt-0.5">{pct}% of max</p>
            )}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-border/20 shrink-0 my-3" />

        {/* Right — ICP Fit */}
        <div className="flex-1 px-5 py-4 flex flex-col justify-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0 bg-violet-500/10 border border-violet-500/15">
              <Target className="h-3 w-3 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground/90">ICP Fit</p>
              <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5">Does this business match our ideal customer profile?</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {ICP_OPTIONS.map((opt) => (
              <OptionPill
                key={opt.label}
                label={opt.label}
                selected={icpFit === opt.value && !icpFitDesc}
                onClick={() => {
                  setValue("qualIcpFit", opt.value, { shouldDirty: true });
                  setValue("qualIcpFitDesc", "", { shouldDirty: true });
                  setCustomActive("qualIcpFit", false);
                }}
              />
            ))}
            <CustomScoreInput
              descValue={icpFitDesc}
              scoreValue={icpFit}
              isCustomSelected={!!icpFitDesc}
              onUpdate={(desc, score) => {
                setValue("qualIcpFit", score, { shouldDirty: true });
                setValue("qualIcpFitDesc", desc, { shouldDirty: true });
              }}
              isActiveMode={!!customMode["qualIcpFit"]}
              setActiveMode={(act) => setCustomActive("qualIcpFit", act)}
            />
          </div>
        </div>
      </div>

      {/* ━━━━ DIVIDER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="h-px bg-border/20 mx-0" />

      {/* ━━━━ ROW 2: BANT 4 Cards ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border/20">
        {BANT_CARDS.map((card) => {
          const currentVal = watch(card.key) || 0;
          const currentDesc = watch(card.descKey) || "";
          const Icon = card.Icon;
          const isCustom = !!currentDesc;

          return (
            <div key={card.key} className="px-5 py-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="h-5.5 w-5.5 rounded-md flex items-center justify-center shrink-0 border border-border/10" style={{ background: card.bg }}>
                  <Icon className="h-2.5 w-2.5" style={{ color: card.color }} />
                </div>
                <span className="text-xs font-bold text-foreground/80">{card.label}</span>
                {currentVal > 0 && (
                  <span className="ml-auto text-[9px] font-black text-[#8B5CF6] bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded-md">
                    +{currentVal}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {card.options.map((opt) => (
                  <OptionPill
                    key={opt.label}
                    label={opt.label}
                    selected={currentVal === opt.value && !isCustom}
                    onClick={() => {
                      setValue(card.key, opt.value, { shouldDirty: true });
                      setValue(card.descKey, "", { shouldDirty: true });
                      setCustomActive(card.key, false);
                    }}
                  />
                ))}
                <CustomScoreInput
                  descValue={currentDesc}
                  scoreValue={currentVal}
                  isCustomSelected={isCustom}
                  onUpdate={(desc, score) => {
                    setValue(card.key, score, { shouldDirty: true });
                    setValue(card.descKey, desc, { shouldDirty: true });
                  }}
                  isActiveMode={!!customMode[card.key]}
                  setActiveMode={(act) => setCustomActive(card.key, act)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ━━━━ DIVIDER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="h-px bg-border/20" />

      {/* ━━━━ QUALIFICATION RISKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="px-5 py-3.5 space-y-1.5">
        <p className="text-xs font-bold text-foreground/75">Qualification Risks</p>
        <RiskDropdown
          selected={qualRisks}
          onChange={(v) => setValue("qualRisks", v, { shouldDirty: true })}
          otherValue={qualOtherRisk}
          onOtherChange={(v) => setValue("qualOtherRisk", v, { shouldDirty: true })}
        />
      </div>

      {/* ━━━━ DIVIDER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="h-px bg-border/20" />

      {/* ━━━━ OUTCOME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="px-5 py-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground/75">Outcome</p>
          {autoOutcome && (
            <span className="text-[9px] text-muted-foreground/40 italic">Auto-calculated</span>
          )}
        </div>
        <div className="flex gap-2">
          {OUTCOME_OPTIONS.map(({ label, value, Icon: OIcon, cls }) => {
            const sel = activeOutcome === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setValue("qualOutcome", sel ? null : value, { shouldDirty: true })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer",
                  sel ? cls : "border-border/30 bg-muted/10 text-muted-foreground hover:border-border/50 hover:text-foreground"
                )}
              >
                <OIcon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━━ DIVIDER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="h-px bg-border/20" />

      {/* ━━━━ NOTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="px-5 py-3.5 space-y-1.5">
        <p className="text-xs font-bold text-foreground/75">Assessment Notes</p>
        <Textarea
          className="text-xs resize-none min-h-[70px] bg-background/25 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30 placeholder:text-muted-foreground/30 rounded-lg"
          placeholder="Summarize your qualification reasoning and next recommendation…"
          {...register("qualificationNotes")}
        />
      </div>

    </form>
  );
}
