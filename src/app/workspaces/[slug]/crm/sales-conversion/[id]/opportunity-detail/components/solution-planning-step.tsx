"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SolutionPlanningStepProps {
  selectedServices: string[];
  setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;
  valueProposition: string;
  setValueProposition: (v: string) => void;
  feasibilityReview: string;
  setFeasibilityReview: (v: string) => void;
  executionRisks: string;
  setExecutionRisks: (v: string) => void;
  internalDependencies: string;
  setInternalDependencies: (v: string) => void;
  estimatedEffort: string;
  setEstimatedEffort: (v: string) => void;
  deliveryConfidence: string;
  setDeliveryConfidence: (v: string) => void;
  planningStatus: string;
  setPlanningStatus: (v: string) => void;
}

export function SolutionPlanningStep({
  selectedServices,
  setSelectedServices,
  valueProposition,
  setValueProposition,
  feasibilityReview,
  setFeasibilityReview,
  executionRisks,
  setExecutionRisks,
  internalDependencies,
  setInternalDependencies,
  estimatedEffort,
  setEstimatedEffort,
  deliveryConfidence,
  setDeliveryConfidence,
  planningStatus,
  setPlanningStatus,
}: SolutionPlanningStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs font-semibold block mb-1">Recommended Solution Options *</Label>
        <div className="flex flex-wrap gap-2 pt-1">
          {["AI Automation", "CRM Setup", "Lead Management", "Custom Development", "Operations Support", "Sales Enablement"].map(s => {
            const isSel = selectedServices.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSelectedServices(prev =>
                    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                  );
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-border/40 select-none",
                  isSel
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 font-bold"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold">Value Proposition</Label>
        <textarea
          value={valueProposition}
          onChange={(e) => setValueProposition(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
          placeholder="Why is MergeX the best fit for this opportunity?"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Feasibility Review *</Label>
          <textarea
            value={feasibilityReview}
            onChange={(e) => setFeasibilityReview(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            placeholder="Can we successfully deliver the requested solutions? Note technical limitations."
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Execution Risks</Label>
          <textarea
            value={executionRisks}
            onChange={(e) => setExecutionRisks(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Dependencies, timing, resource availability..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Internal Dependencies</Label>
          <textarea
            value={internalDependencies}
            onChange={(e) => setInternalDependencies(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Requires expert approval, dev squad, custom integrations?"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Estimated Effort *</Label>
            <Select value={estimatedEffort} onValueChange={setEstimatedEffort}>
              <SelectTrigger className="h-8 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                {["Low", "Medium", "High", "Critical"].map(opt => (
                  <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Delivery Confidence</Label>
            <Select value={deliveryConfidence} onValueChange={setDeliveryConfidence}>
              <SelectTrigger className="h-8 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                {["High", "Medium", "Low"].map(opt => (
                  <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-1 pt-1.5">
        <Label className="text-xs font-semibold block mb-1">Planning Status</Label>
        <div className="flex gap-4">
          {["Proceed", "Revise Solution", "Reject Opportunity"].map(status => (
            <label key={status} className="flex items-center gap-2 text-xs font-semibold text-foreground/80 cursor-pointer">
              <input
                type="radio"
                name="planningStatus"
                value={status}
                checked={planningStatus === status}
                onChange={(e) => setPlanningStatus(e.target.value)}
                className="text-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              {status}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
