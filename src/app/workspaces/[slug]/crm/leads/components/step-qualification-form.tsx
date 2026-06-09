"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Target, IndianRupee, UserCheck, AlertTriangle, Clock,
  CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { QualificationFormValues } from "./types";

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

const RISK_OPTIONS = [
  "No Budget",
  "Decision Maker Missing",
  "No Urgency",
  "Need Unclear",
  "Internal Delays",
  "Competitor Involved",
  "Already Using Alternative",
  "Not Responsive",
  "Other",
];

const OUTCOME_OPTIONS = [
  { label: "Qualified",           value: "Qualified",           Icon: CheckCircle2, cls: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10 text-xs px-2.5 py-1.5" },
  { label: "Partial",             value: "Partially Qualified", Icon: MinusCircle,  cls: "text-amber-500 border-amber-500/40 bg-amber-500/10 text-xs px-2.5 py-1.5"   },
  { label: "Not Qualified",       value: "Not Qualified",       Icon: XCircle,      cls: "text-rose-500 border-rose-500/40 bg-rose-500/10 text-xs px-2.5 py-1.5"     },
];

// ─── Score Circle SVG ─────────────────────────────────────────────────────────
function ScoreCircle({ score, max = 125 }: { score: number; max?: number }) {
  const R = 38;
  const C = 2 * Math.PI * R;
  const pct = Math.min(score / max, 1);
  const offset = C * (1 - pct);

  // Gradient definitions based on score value
  let gradStart = "#3f3f46";
  let gradEnd = "#27272a";

  if (score >= 80) {
    gradStart = "#10b981"; // Emerald
    gradEnd = "#059669";   // Green
  } else if (score >= 45) {
    gradStart = "#f59e0b"; // Amber
    gradEnd = "#d97706";   // Orange
  } else if (score > 0) {
    gradStart = "#f43f5e"; // Rose
    gradEnd = "#e11d48";   // Red
  }

  return (
    <svg width="112" height="112" viewBox="0 0 100 100" className="rotate-[-90deg] overflow-visible">
      <defs>
        {/* Glow Filter */}
        <filter id="circle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Gradient */}
        <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradStart} />
          <stop offset="100%" stopColor={gradEnd} />
        </linearGradient>
      </defs>
      
      {/* Background Track */}
      <circle 
        cx="50" cy="50" r={R} 
        fill="none" 
        stroke="rgba(255,255,255,0.06)" 
        strokeWidth="7" 
      />
      
      {/* Glow path */}
      {score > 0 && (
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke={gradStart}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          filter="url(#circle-glow)"
          className="transition-all duration-500 ease-out"
          style={{ 
            opacity: 0.65,
          }}
        />
      )}

      {/* Foreground path */}
      <circle
        cx="50" cy="50" r={R}
        fill="none"
        stroke="url(#score-grad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}

// ─── Custom Multi-Select Dropdown ─────────────────────────────────────────────
function RiskDropdown({
  selected,
  onChange,
  otherValue,
  onOtherChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  otherValue: string;
  onOtherChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCustomInput(false);
        setCustomVal("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (risk: string) => {
    onChange(
      selected.includes(risk) ? selected.filter((r) => r !== risk) : [...selected, risk]
    );
  };

  const remove = (risk: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((r) => r !== risk));
  };

  const handleAddCustom = () => {
    const val = customVal.trim();
    if (val) {
      if (!selected.includes(val)) {
        onChange([...selected, val]);
      }
      setCustomVal("");
      setShowCustomInput(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full min-h-[34px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left",
          "bg-background/40 border-border/40 hover:border-border/70 transition-colors cursor-pointer",
          open && "border-[#8B5CF6]/40 ring-1 ring-[#8B5CF6]/25"
        )}
      >
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground/50">Select risks…</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selected.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-500 text-[10px] font-semibold"
              >
                {r}
                <X 
                  className="h-2.5 w-2.5 cursor-pointer hover:text-rose-400" 
                  onClick={(e) => remove(r, e)} 
                />
              </span>
            ))}
          </div>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/40 ml-auto shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {/* Dropdown Box */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-popover shadow-xl p-1.5 space-y-0.5 animate-in fade-in-50 duration-100">
          {RISK_OPTIONS.filter(o => o !== "Other").map((risk) => {
            const isSelected = selected.includes(risk);
            return (
              <button
                key={risk}
                type="button"
                onClick={() => toggle(risk)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  isSelected
                    ? "bg-rose-500/10 text-rose-500"
                    : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {risk}
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
              </button>
            );
          })}

          {/* Custom "Other" entry */}
          <div className="border-t border-border/20 my-1 pt-1" />

          {showCustomInput ? (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                placeholder="Type custom risk..."
                className="h-7 w-full border border-border/40 rounded px-2 text-xs bg-background text-foreground focus:outline-none focus:border-[#8B5CF6]/50"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="text-xs font-bold text-violet-600 hover:text-[#8B5CF6] cursor-pointer px-1 shrink-0"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCustomInput(true);
              }}
              className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <span className="h-4 w-4 shrink-0 rounded border flex items-center justify-center border-border/50 bg-transparent text-[10px]">
                +
              </span>
              Other (Type custom...)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Option Pill Button ───────────────────────────────────────────────────────
interface OptionPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function OptionPill({ label, selected, onClick }: OptionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap",
        selected
          ? "border-[#8B5CF6]/45 bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#a78bfa] shadow-xs"
          : "border-border/30 bg-muted/10 text-muted-foreground hover:border-border/50 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

// ─── Custom Number Spinner (Scroll Slider with Up/Down Arrows) ────────────────
interface CustomNumberSpinnerProps {
  value: number;
  onChange: (v: number) => void;
}

function CustomNumberSpinner({ value, onChange }: CustomNumberSpinnerProps) {
  const increment = () => {
    if (value < 10) onChange(value + 1);
  };
  const decrement = () => {
    if (value > 1) onChange(value - 1);
  };

  return (
    <div className="flex items-center border border-[#8B5CF6]/50 bg-background rounded-md h-[24px] overflow-hidden select-none">
      {/* Number Display with Vertical Sliding Animation */}
      <div className="w-7 h-[24px] relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute left-0 right-0 flex flex-col items-center transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateY(${-((value - 1) * 24)}px)`,
            top: "0px"
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div key={n} className="h-[24px] flex items-center justify-center text-[11px] font-black text-[#8B5CF6]">
              {n}
            </div>
          ))}
        </div>
      </div>
      
      {/* Up/Down buttons stacked vertically */}
      <div className="flex flex-col border-l border-[#8B5CF6]/25 h-full w-[16px] bg-muted/20">
        <button
          type="button"
          onClick={increment}
          className="flex-1 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-[#8B5CF6] border-b border-[#8B5CF6]/15 transition-colors cursor-pointer"
        >
          <ChevronUp className="h-2 w-2 shrink-0" />
        </button>
        <button
          type="button"
          onClick={decrement}
          className="flex-1 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-[#8B5CF6] transition-colors cursor-pointer"
        >
          <ChevronDown className="h-2 w-2 shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ─── Custom Desc & Rating Input Component ──────────────────────────────────────
interface CustomScoreInputProps {
  descValue: string;
  scoreValue: number;
  isCustomSelected: boolean;
  onUpdate: (desc: string, score: number) => void;
  isActiveMode: boolean;
  setActiveMode: (active: boolean) => void;
}

function CustomScoreInput({
  descValue,
  scoreValue,
  isCustomSelected,
  onUpdate,
  isActiveMode,
  setActiveMode,
}: CustomScoreInputProps) {
  const currentRating = scoreValue > 0 ? Math.round(scoreValue / 2.5) : 10;
  const [desc, setDesc] = useState(isCustomSelected ? descValue : "");
  const [rating, setRating] = useState(currentRating);

  useEffect(() => {
    if (isCustomSelected) {
      setDesc(descValue);
      setRating(currentRating);
    } else {
      setDesc("");
      setRating(10);
    }
  }, [descValue, scoreValue, isCustomSelected, currentRating]);

  const handleSave = () => {
    const trimmedDesc = desc.trim();
    if (trimmedDesc) {
      const calculatedScore = Math.round(rating * 2.5);
      onUpdate(trimmedDesc, calculatedScore);
      setActiveMode(false);
    }
  };

  if (isActiveMode) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in-30 duration-150">
        {/* Rectangle Text Input */}
        <input
          type="text"
          placeholder="Enter custom value..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          className="h-[24px] flex-1 min-w-[120px] max-w-[200px] px-2 rounded-md border border-[#8B5CF6]/50 bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30"
          autoFocus
        />
        
        {/* Custom scroll animation spinner */}
        <CustomNumberSpinner value={rating} onChange={setRating} />

        {/* Small check button */}
        <button
          type="button"
          onClick={handleSave}
          className="h-[24px] px-2 rounded-md bg-[#8B5CF6] text-white hover:bg-[#7C3AED] text-[10px] font-bold shrink-0 cursor-pointer"
        >
          Add
        </button>

        {/* Small cancel button */}
        <button
          type="button"
          onClick={() => setActiveMode(false)}
          className="h-[24px] w-[24px] flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-muted-foreground shrink-0 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActiveMode(true)}
      className={cn(
        "px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap",
        isCustomSelected
          ? "border-[#8B5CF6]/45 bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#a78bfa] shadow-xs"
          : "border-border/30 bg-muted/10 text-muted-foreground hover:border-border/50 hover:text-foreground"
      )}
    >
      {isCustomSelected ? `${descValue} (Rating: ${currentRating}/10)` : "Custom"}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
        {BANT_CARDS.map((card, i) => {
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
