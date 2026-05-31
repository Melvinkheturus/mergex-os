"use client";

import { UseFormReturn } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BantFormValues } from "./types";

interface BantTabProps {
  form: UseFormReturn<any>;
  bantScore: number;
  onSubmit: (values: BantFormValues) => Promise<void>;
}

export function BantTab({ form, bantScore, onSubmit }: BantTabProps) {
  const fields = [
    { field: "bantBudget" as const, label: "Budget Fit (0 – 100)", hint: "Client has the budget capability aligned with service pricing." },
    { field: "bantAuthority" as const, label: "Authority Fit (0 – 100)", hint: "Communicating with the key decision makers and stakeholders." },
    { field: "bantNeed" as const, label: "Need Fit (0 – 100)", hint: "MergeX services directly resolve structural business pain-points." },
    { field: "bantTimeline" as const, label: "Timeline Fit (0 – 100)", hint: "Opportunity conversion urgency fits operation capacities." },
  ];

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold">BANT Qualification Framework</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Score:</span>
          <span className="text-sm font-black px-2 py-0.5 rounded bg-primary/10 text-primary">{bantScore}/100</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-xs py-2">
          {fields.map(({ field, label, hint }) => (
            <div key={field} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">{label}</Label>
                <span className="font-bold text-primary">{form.watch(field) || 0}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                {...form.register(field)}
              />
              <p className="text-[10px] text-muted-foreground">{hint}</p>
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t border-border/20">
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              <Save className="h-4 w-4 mr-1.5" /> Save Scores
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
