"use client";

import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { ChevronDown, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BusinessReviewV2FormValues } from "./types";
import {
  PAIN_POINTS,
  OPPORTUNITIES,
  BUSINESS_AGE_OPTIONS,
  TEAM_SIZE_OPTIONS,
  REVENUE_RANGE_OPTIONS,
  PRIMARY_CHANNEL_OPTIONS,
} from "@/config/crm/business-review";

interface StepBusinessReviewFormProps {
  form: UseFormReturn<BusinessReviewV2FormValues>;
  onSubmit: (values: BusinessReviewV2FormValues) => Promise<void>;
}

// ─── Property Row ──────────────────────────────────────────────────────────────
function PropertyRow({
  label,
  children,
  alignTop = false,
}: {
  label: string;
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 py-1.5 border-b border-border/20",
        alignTop ? "items-start" : "items-center",
        "min-h-[36px]"
      )}
    >
      <span className="w-28 shrink-0 text-[11px] text-foreground/60 font-semibold leading-none pt-1">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── Compact Select ────────────────────────────────────────────────────────────
function CompactSelect({
  value,
  onValueChange,
  options,
  placeholder = "Not set",
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-7 w-full border border-border/40 shadow-none text-[11px] font-medium px-2.5 hover:border-border/70 transition-colors bg-muted/20",
          value ? "text-foreground" : "text-muted-foreground/50 italic"
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-xs">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Multi-Select with chips ───────────────────────────────────────────────────
function ChipMultiSelect({
  options,
  selected,
  onToggle,
  placeholder = "None identified",
  chipClass,
  checkClass,
  dropdownHighlightClass,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  placeholder?: string;
  chipClass: string;
  checkClass: string;
  dropdownHighlightClass: string;
}) {
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenAbove(spaceBelow < 220);
    }
    setOpen((p) => {
      const next = !p;
      if (!next) {
        setShowCustomInput(false);
        setCustomValue("");
      }
      return next;
    });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        role="button"
        onClick={handleOpen}
        className={cn(
          "flex flex-wrap items-center gap-1 min-h-7 w-full px-2 py-1 rounded-md border border-border/40 bg-muted/20 cursor-pointer hover:border-border/70 transition-colors select-none"
        )}
      >
        {selected.length === 0 ? (
          <span className="text-[11px] text-muted-foreground/50 italic flex-1 leading-none">
            {placeholder}
          </span>
        ) : (
          <>
            {selected.map((item) => (
              <span
                key={item}
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                  chipClass
                )}
              >
                {item}
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(item);
                  }}
                  className="hover:opacity-70 cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </span>
              </span>
            ))}
          </>
        )}
        <ChevronDown
          className={cn(
            "h-3 w-3 ml-auto shrink-0 text-muted-foreground/50 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setShowCustomInput(false);
            setCustomValue("");
          }}
        />
      )}

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 rounded-lg border border-border/40 bg-popover shadow-lg p-1 max-h-52 overflow-y-auto space-y-0.5 animate-in fade-in-50 duration-100",
            openAbove
              ? "bottom-full mb-1 slide-in-from-bottom-1"
              : "top-full mt-1 slide-in-from-top-1"
          )}
        >
          {options.map((opt) => {
            if (opt === "Other") {
              return showCustomInput ? (
                <div
                  key="other-input"
                  className="flex items-center gap-1.5 px-2 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (customValue.trim()) {
                          onToggle(customValue.trim());
                          setCustomValue("");
                          setShowCustomInput(false);
                        }
                      }
                    }}
                    placeholder="Type custom option..."
                    className="h-6 w-full border border-border/40 rounded px-2 text-[10px] bg-background text-foreground focus:outline-hidden focus:border-border/70"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customValue.trim()) {
                        onToggle(customValue.trim());
                        setCustomValue("");
                        setShowCustomInput(false);
                      }
                    }}
                    className="text-[9px] font-bold text-violet-600 hover:text-violet-500 cursor-pointer px-1 shrink-0"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  key="other-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCustomInput(true);
                  }}
                  className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer text-foreground hover:bg-muted/60"
                >
                  <span className="h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center border-border/50 bg-transparent text-muted-foreground/60 text-[10px]">
                    +
                  </span>
                  Other (Type custom...)
                </button>
              );
            }

            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                className={cn(
                  "flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer",
                  isSelected
                    ? dropdownHighlightClass
                    : "text-foreground hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center transition-colors",
                    isSelected ? checkClass : "border-border/50 bg-transparent"
                  )}
                >
                  {isSelected && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="col-span-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest pb-1 pt-3 first:pt-1">
      {children}
    </p>
  );
}

export function StepBusinessReviewForm({ form, onSubmit }: StepBusinessReviewFormProps) {
  const { register, watch, setValue } = form;
  
  const opportunities = watch("opportunities") || [];
  const painPoints = watch("painPoints") || [];
  const primaryChannel = watch("primaryChannel") || "";
  const businessConfidence = watch("businessConfidence") || "";

  const toggleOpportunity = (val: string) => {
    setValue(
      "opportunities",
      opportunities.includes(val) ? opportunities.filter((o) => o !== val) : [...opportunities, val],
      { shouldDirty: true }
    );
  };

  const togglePainPoint = (val: string) => {
    setValue(
      "painPoints",
      painPoints.includes(val) ? painPoints.filter((o) => o !== val) : [...painPoints, val],
      { shouldDirty: true }
    );
  };

  const localWatch = (field: keyof BusinessReviewV2FormValues) => (watch(field) as string) || "";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-xs">
      {/* Immersive Header Block */}
      <div className="p-4 rounded-xl border border-violet-500/10 bg-violet-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-violet-500">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-extrabold text-foreground tracking-tight">
          What is happening inside this business?
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
          Understand the business.
        </p>
      </div>

      {/* Property Sheet / Business Snapshot */}
      <div className="rounded-xl border border-border/30 bg-card/60 px-4 py-3 space-y-3">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest block border-b border-border/10 pb-1">
          Business Snapshot
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <PropertyRow label="Business Age">
            <CompactSelect
              value={localWatch("businessAge")}
              onValueChange={(v) => setValue("businessAge", v, { shouldDirty: true })}
              options={BUSINESS_AGE_OPTIONS}
            />
          </PropertyRow>

          <PropertyRow label="Team Size">
            <CompactSelect
              value={localWatch("teamSize")}
              onValueChange={(v) => setValue("teamSize", v, { shouldDirty: true })}
              options={TEAM_SIZE_OPTIONS}
            />
          </PropertyRow>

          <PropertyRow label="Revenue Stage">
            <CompactSelect
              value={localWatch("revenueRange")}
              onValueChange={(v) => setValue("revenueRange", v, { shouldDirty: true })}
              options={REVENUE_RANGE_OPTIONS}
            />
          </PropertyRow>

          <PropertyRow label="Primary Sales Channel">
            {primaryChannel === "Other" ? (
              <div className="relative flex items-center animate-in fade-in duration-100">
                <Input
                  className="h-7 w-full border border-border/40 bg-muted/20 text-[11px] font-medium pl-2.5 pr-8 hover:border-border/70 transition-colors shadow-none focus-visible:ring-0"
                  placeholder="Specify custom channel..."
                  autoFocus
                  {...register("primaryChannelOther")}
                />
                <button
                  type="button"
                  onClick={() => {
                    setValue("primaryChannel", "", { shouldDirty: true });
                    setValue("primaryChannelOther", "", { shouldDirty: true });
                  }}
                  className="absolute right-1.5 p-1 hover:bg-muted rounded text-muted-foreground/50 hover:text-foreground cursor-pointer flex items-center justify-center"
                  title="Choose from list"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <CompactSelect
                value={localWatch("primaryChannel")}
                onValueChange={(v) => setValue("primaryChannel", v, { shouldDirty: true })}
                options={PRIMARY_CHANNEL_OPTIONS}
              />
            )}
          </PropertyRow>
        </div>
      </div>

      {/* Current Situation Context Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="currentSituation" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Current Situation
          </Label>
          <span className="text-[10px] text-muted-foreground/40 font-medium">Describe how the business currently operates</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
          <Textarea
            id="currentSituation"
            placeholder="Describe the current operational state, systems, tools, and processes..."
            rows={4}
            className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
            {...register("currentSituation")}
          />
          <div className="rounded-lg border border-border/30 bg-muted/10 p-3 text-[10px] font-medium text-muted-foreground/70 space-y-1 leading-normal select-none">
            <span className="font-extrabold text-[9px] uppercase tracking-wider text-muted-foreground/50 block">Example Context:</span>
            <ul className="list-disc pl-3.5 space-y-0.5 text-muted-foreground/85">
              <li>120K Instagram followers.</li>
              <li>Leads managed through WhatsApp.</li>
              <li>No CRM.</li>
              <li>No website.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pain Points & Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Pain Points
          </Label>
          <ChipMultiSelect
            options={PAIN_POINTS}
            selected={painPoints}
            onToggle={togglePainPoint}
            placeholder="None identified"
            chipClass="bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
            checkClass="bg-rose-500 border-rose-500"
            dropdownHighlightClass="bg-rose-500/8 text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Growth Opportunities
          </Label>
          <ChipMultiSelect
            options={OPPORTUNITIES}
            selected={opportunities}
            onToggle={toggleOpportunity}
            placeholder="None identified"
            chipClass="bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400"
            checkClass="bg-amber-500 border-amber-500"
            dropdownHighlightClass="bg-amber-500/8 text-amber-700 dark:text-amber-400"
          />
        </div>
      </div>

      {/* Business Confidence Segmented Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Business Confidence
          </Label>
          <span className="text-[10px] text-muted-foreground/50 font-medium italic">Does this business look serious and investable?</span>
        </div>
        
        <div className="flex gap-2 max-w-sm">
          {([
            { key: "Strong",   color: "border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 dark:text-emerald-400",   activeColor: "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600" },
            { key: "Moderate", color: "border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10 dark:text-amber-400",   activeColor: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" },
            { key: "Weak",     color: "border-rose-500/20 text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 dark:text-rose-400",       activeColor: "bg-rose-500 text-white border-rose-500 hover:bg-rose-600" },
          ] as const).map(({ key, color, activeColor }) => {
            const isSelected = businessConfidence === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setValue("businessConfidence", key, { shouldDirty: true })}
                className={cn(
                  "flex-1 h-9 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer select-none",
                  isSelected ? activeColor : color
                )}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Review Notes */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="opportunityNotes" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Business Review Notes
          </Label>
          <span className="text-[10px] text-muted-foreground/40 font-medium">Important findings from discussion</span>
        </div>
        <Textarea
          id="opportunityNotes"
          placeholder="Add important findings, notes, or observations from this review..."
          rows={3}
          className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
          {...register("opportunityNotes")}
        />
      </div>
    </form>
  );
}
