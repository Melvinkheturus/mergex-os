"use client";

import { UseFormReturn } from "react-hook-form";
import { Save, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessReviewFormValues } from "./types";

import { PAIN_POINTS, OPPORTUNITIES } from "@/config/crm/business-review";


interface BusinessReviewTabProps {
  form: UseFormReturn<any>;
  onSubmit: (values: BusinessReviewFormValues) => Promise<void>;
}

export function BusinessReviewTab({ form, onSubmit }: BusinessReviewTabProps) {
  // Pain points stored as comma-separated string
  const painPointsStr: string = form.watch("painPoints") || "";
  const selectedPainPoints = painPointsStr
    ? painPointsStr.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Opportunities stored in opportunityNotes as comma-separated string
  const oppStr: string = form.watch("opportunityNotes") || "";
  const selectedOpps = oppStr
    ? oppStr.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const togglePainPoint = (label: string) => {
    const current = new Set(selectedPainPoints);
    if (current.has(label)) {
      current.delete(label);
    } else {
      current.add(label);
    }
    form.setValue("painPoints", Array.from(current).join(", "));
  };

  const toggleOpportunity = (label: string) => {
    const current = new Set(selectedOpps);
    if (current.has(label)) {
      current.delete(label);
    } else {
      current.add(label);
    }
    form.setValue("opportunityNotes", Array.from(current).join(", "));
  };

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader>
        <CardTitle className="text-sm font-bold">Business Review</CardTitle>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Document the client&apos;s current situation, pain points, and growth opportunities.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-xs">
          {/* Current Situation */}
          <div className="space-y-2">
            <Label htmlFor="currentSituation" className="font-bold text-xs flex items-center gap-1.5">
              Current Situation
            </Label>
            <Textarea
              id="currentSituation"
              placeholder="e.g. 130K Instagram followers, no ecommerce, primarily Instagram-only presence, no website..."
              rows={3}
              className="text-xs resize-none"
              {...form.register("currentSituation")}
            />
          </div>

          {/* Pain Points */}
          <div className="space-y-3">
            <Label className="font-bold text-xs flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              Pain Points Identified
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAIN_POINTS.map((point) => {
                const isSelected = selectedPainPoints.includes(point);
                return (
                  <button
                    key={point}
                    type="button"
                    id={`pain-point-${point.replace(/\s+/g, "-").toLowerCase()}`}
                    onClick={() => togglePainPoint(point)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-[11px] font-semibold transition-all duration-150 ${
                      isSelected
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                        : "bg-muted/10 border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/20"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-rose-500 border-rose-500"
                          : "border-border/50 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" className="h-2 w-2 text-white fill-current">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {point}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opportunities */}
          <div className="space-y-3">
            <Label className="font-bold text-xs flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Opportunities
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPPORTUNITIES.map((opp) => {
                const isSelected = selectedOpps.includes(opp);
                return (
                  <button
                    key={opp}
                    type="button"
                    id={`opportunity-${opp.replace(/[\s/]+/g, "-").toLowerCase()}`}
                    onClick={() => toggleOpportunity(opp)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-[11px] font-semibold transition-all duration-150 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                        : "bg-muted/10 border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/20"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-amber-500 border-amber-500"
                          : "border-border/50 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" className="h-2 w-2 text-white fill-current">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {opp}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border/20">
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              <Save className="h-4 w-4 mr-1.5" /> Save Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
