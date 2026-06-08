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
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenAbove(spaceBelow < 220);
    }
    setOpen((p) => !p);
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
          onClick={handleOpen}
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 text-xs">
      {/* Property Sheet */}
      <div className="rounded-xl border border-border/30 bg-card/60 px-4 py-2">
        <div className="grid grid-cols-2 gap-x-6">
          <SectionLabel>Snapshot</SectionLabel>

          <PropertyRow label="Business Model">
            <Input
              className="h-7 w-full border border-border/40 bg-muted/20 text-[11px] font-medium px-2.5 hover:border-border/70 transition-colors shadow-none focus-visible:ring-0"
              placeholder="e.g. D2C, SaaS, Agency..."
              {...register("businessModel")}
            />
          </PropertyRow>

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

          <PropertyRow label="Revenue Range">
            <CompactSelect
              value={localWatch("revenueRange")}
              onValueChange={(v) => setValue("revenueRange", v, { shouldDirty: true })}
              options={REVENUE_RANGE_OPTIONS}
            />
          </PropertyRow>

          <PropertyRow label="Primary Channel">
            <CompactSelect
              value={localWatch("primaryChannel")}
              onValueChange={(v) => setValue("primaryChannel", v, { shouldDirty: true })}
              options={PRIMARY_CHANNEL_OPTIONS}
            />
          </PropertyRow>

          <SectionLabel>Discovery</SectionLabel>

          <PropertyRow label="Pain Points" alignTop>
            <ChipMultiSelect
              options={PAIN_POINTS}
              selected={painPoints}
              onToggle={togglePainPoint}
              placeholder="None identified"
              chipClass="bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
              checkClass="bg-rose-500 border-rose-500"
              dropdownHighlightClass="bg-rose-500/8 text-rose-600 dark:text-rose-400"
            />
          </PropertyRow>

          <PropertyRow label="Opportunities" alignTop>
            <ChipMultiSelect
              options={OPPORTUNITIES}
              selected={opportunities}
              onToggle={toggleOpportunity}
              placeholder="None identified"
              chipClass="bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400"
              checkClass="bg-amber-500 border-amber-500"
              dropdownHighlightClass="bg-amber-500/8 text-amber-700 dark:text-amber-400"
            />
          </PropertyRow>

          <SectionLabel>Digital Presence</SectionLabel>

          <PropertyRow label="Active Channels" alignTop>
            <div className="grid grid-cols-2 gap-2 mt-1 py-1">
              {([
                { key: "hasWebsite",   label: "Website" },
                { key: "hasEcommerce", label: "Ecommerce" },
                { key: "hasInstagram", label: "Instagram" },
                { key: "hasFacebook",  label: "Facebook" },
                { key: "hasLinkedIn",  label: "LinkedIn" },
                { key: "hasGoogleBiz", label: "Google Business" },
              ] as const).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-[11px] font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={watch(key) || false}
                    onChange={(e) => setValue(key, e.target.checked, { shouldDirty: true })}
                    className="h-3.5 w-3.5 rounded border-border/40 text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </PropertyRow>
        </div>
      </div>

      {/* Strategic positioning fields */}
      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Current Situation
          </Label>
          <Textarea
            id="currentSituation"
            placeholder="Describe the current operational state, systems, tools, and processes..."
            rows={3}
            className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
            {...register("currentSituation")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Outreach Angle
          </Label>
          <Textarea
            id="outreachAngle"
            placeholder="How will you approach them? What's the hook?"
            rows={2}
            className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
            {...register("outreachAngle")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Relevant MergeX Services
          </Label>
          <Textarea
            id="relevantServices"
            placeholder="Which services could help this business most?"
            rows={2}
            className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
            {...register("relevantServices")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Value Proposition Direction
          </Label>
          <Textarea
            id="valueProposition"
            placeholder="What's the core value story for this lead?"
            rows={2}
            className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
            {...register("valueProposition")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Discovery Notes
          </Label>
          <Textarea
            id="opportunityNotes"
            placeholder="Add additional notes, context, or observations from this review..."
            rows={2}
            className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30"
            {...register("opportunityNotes")}
          />
        </div>
      </div>
    </form>
  );
}
