"use client";

import { UseFormReturn } from "react-hook-form";
import { Save, Flame, Thermometer, Snowflake, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Maps label values to numeric scores
const BUDGET_OPTIONS = [
  { label: "High", value: 75, hint: "Budget aligned with service pricing" },
  { label: "Medium", value: 50, hint: "Budget partially aligned" },
  { label: "Low", value: 25, hint: "Budget constraints present" },
];

const AUTHORITY_OPTIONS = [
  { label: "Decision Maker", value: 75, hint: "Speaking with key decision makers" },
  { label: "Influencer", value: 50, hint: "Contact influences decision" },
  { label: "Unknown", value: 0, hint: "Decision authority unclear" },
];

const TIMELINE_OPTIONS = [
  { label: "Immediate", value: 75, hint: "Ready to proceed now" },
  { label: "30 Days", value: 60, hint: "Looking to start within a month" },
  { label: "90 Days", value: 35, hint: "Planning ahead for Q next" },
  { label: "Unknown", value: 0, hint: "Timeline not established" },
];

const NEED_OPTIONS = [
  { label: "High", value: 75, hint: "Services directly resolve pain points" },
  { label: "Medium", value: 50, hint: "Partial fit with MergeX services" },
  { label: "Low", value: 25, hint: "Nice-to-have, not critical" },
];

interface RadioGroupProps {
  id: string;
  label: string;
  options: { label: string; value: number; hint: string }[];
  fieldName: string;
  form: UseFormReturn<any>;
}

function RadioGroup({ id, label, options, fieldName, form }: RadioGroupProps) {
  const currentValue = Number(form.watch(fieldName) || 0);
  const selectedOption = options.find((o) => o.value === currentValue);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground">{label}</p>
        {selectedOption && (
          <span className="text-[10px] text-muted-foreground font-medium">
            {selectedOption.hint}
          </span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => {
          const isSelected = currentValue === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              id={`bant-${id}-${opt.label.replace(/\s+/g, "-").toLowerCase()}`}
              onClick={() => form.setValue(fieldName, opt.value)}
              className={cn(
                "px-3.5 py-2 rounded-lg border text-[11px] font-semibold transition-all duration-150",
                isSelected
                  ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-sm"
                  : "bg-muted/10 border-border/30 text-muted-foreground hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6]"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BantTabProps {
  form: UseFormReturn<any>;
  bantScore: number;
  onSubmit: (values: any) => Promise<void>;
}

export function BantTab({ form, bantScore, onSubmit }: BantTabProps) {
  // Derive temperature from BANT score
  const getTemperature = (score: number) => {
    if (score >= 70) return "HOT";
    if (score >= 40) return "WARM";
    return "COLD";
  };

  const temperature = getTemperature(bantScore);

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-sm font-bold">Qualification</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Rate Budget, Authority, Need &amp; Timeline to auto-calculate lead temperature.
            </p>
          </div>

          {/* Score + Temperature Badge */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Score
              </span>
              <span className="text-xl font-black text-primary">{bantScore}</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border",
                temperature === "HOT"
                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : temperature === "WARM"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-sky-500/10 text-sky-500 border-sky-500/20"
              )}
            >
              {temperature === "HOT" && <Flame className="h-3.5 w-3.5" />}
              {temperature === "WARM" && <Thermometer className="h-3.5 w-3.5" />}
              {temperature === "COLD" && <Snowflake className="h-3.5 w-3.5" />}
              {temperature}
            </div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-3 space-y-1">
          <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                temperature === "HOT"
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : temperature === "WARM"
                  ? "bg-gradient-to-r from-sky-500 to-amber-500"
                  : "bg-sky-400"
              )}
              style={{ width: `${bantScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground/50 font-medium">
            <span>Cold</span>
            <span>Warm</span>
            <span>Hot</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-4">
              <TrendingUp className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                BANT Dimensions
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 divide-y divide-border/20">
              <RadioGroup
                id="budget"
                label="Budget"
                options={BUDGET_OPTIONS}
                fieldName="bantBudget"
                form={form}
              />
              <div className="pt-5">
                <RadioGroup
                  id="authority"
                  label="Authority"
                  options={AUTHORITY_OPTIONS}
                  fieldName="bantAuthority"
                  form={form}
                />
              </div>
              <div className="pt-5">
                <RadioGroup
                  id="timeline"
                  label="Timeline"
                  options={TIMELINE_OPTIONS}
                  fieldName="bantTimeline"
                  form={form}
                />
              </div>
              <div className="pt-5">
                <RadioGroup
                  id="need"
                  label="Need"
                  options={NEED_OPTIONS}
                  fieldName="bantNeed"
                  form={form}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/20">
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              <Save className="h-4 w-4 mr-1.5" /> Save Qualification
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
