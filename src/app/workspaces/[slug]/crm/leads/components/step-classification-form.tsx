"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Tag, BadgeCent, CheckSquare, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ClassificationFormValues, Lead, OptionStage } from "./types";

const PRESETS = [
  "Website",
  "Branding",
  "Marketing",
  "CRM",
  "AI",
  "Operations",
];

const CLASSIFICATION_OPTIONS = [
  { value: "HOT", label: "Ready Now (Proceed to Meeting Readiness)" },
  { value: "WARM", label: "Nurturing (Waiting / Relationship Building)" },
  { value: "COLD", label: "Lost (Low immediate probability)" },
  { value: "ARCHIVE", label: "Archived (Dead / Disqualified)" },
] as const;

const NURTURING_DIR_OPTIONS = [
  { value: "IMMEDIATE_SALES", label: "Immediate Sales — Schedule discovery now" },
  { value: "SHORT_TERM", label: "Short-Term Nurture — 1–4 weeks" },
  { value: "LONG_TERM", label: "Long-Term Nurture — 1–3 months" },
  { value: "ARCHIVE", label: "Archive — No immediate action" },
] as const;

interface StepClassificationFormProps {
  form: UseFormReturn<ClassificationFormValues>;
  onSubmit: (values: ClassificationFormValues) => Promise<void>;
  lead: Lead;
  stages: OptionStage[];
}

export function StepClassificationForm({
  form,
  onSubmit,
  lead,
  stages,
}: StepClassificationFormProps) {
  const { register, watch, setValue } = form;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newCustomService, setNewCustomService] = useState("");

  const services = watch("services") || [];
  const classification = watch("classification");
  const nurturingDirection = watch("nurturingDirection");

  const addService = (service: string) => {
    const trimmed = service.trim();
    if (trimmed && !services.includes(trimmed)) {
      setValue("services", [...services, trimmed], { shouldDirty: true });
    }
  };

  const removeService = (service: string) => {
    setValue("services", services.filter((s) => s !== service), { shouldDirty: true });
  };

  const handleAddCustomService = () => {
    const trimmed = newCustomService.trim();
    if (trimmed) {
      addService(trimmed);
      setNewCustomService("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-xs">
        {/* Core Classification Fields */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/10 pb-1.5">
            Classification Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Services Interested */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="font-bold text-xs flex items-center gap-1.5 text-foreground/75">
                <Tag className="h-3.5 w-3.5 text-[#8B5CF6]/80" />
                Services Interested
              </Label>
              
              <div 
                className="min-h-10 w-full rounded-md border border-input bg-background/50 px-3 py-1.5 flex flex-wrap gap-1.5 items-center justify-between cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {services.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {services.map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 px-2 py-0.5 text-xs flex items-center gap-1 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{service}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeService(service);
                          }}
                          className="hover:bg-[#8B5CF6]/20 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </span>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Select services...</span>
                )}
                <span className="text-muted-foreground/60 text-[10px] ml-auto shrink-0 select-none">{dropdownOpen ? "▲" : "▼"}</span>
              </div>

              {dropdownOpen && (
                <div className="w-full bg-popover text-popover-foreground border border-border rounded-lg shadow-md p-1.5 max-h-64 overflow-y-auto space-y-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                  {PRESETS.map((preset) => {
                    const isChecked = services.includes(preset);
                    return (
                      <div
                        key={preset}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors select-none",
                          isChecked ? "bg-accent/50 text-[#8B5CF6]" : "hover:bg-muted"
                        )}
                        onClick={() => isChecked ? removeService(preset) : addService(preset)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="h-3.5 w-3.5 rounded border-input text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                        />
                        <span>{preset}</span>
                      </div>
                    );
                  })}

                  {services.filter(s => !PRESETS.includes(s)).map((customVal) => (
                    <div
                      key={customVal}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer bg-accent/30 text-[#8B5CF6] transition-colors select-none"
                      onClick={() => removeService(customVal)}
                    >
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="h-3.5 w-3.5 rounded border-input text-[#8B5CF6] focus:ring-[#8B5CF6] cursor-pointer"
                      />
                      <span>{customVal}</span>
                    </div>
                  ))}

                  <div className="border-t border-border/40 my-1.5" />

                  {!showCustomInput ? (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 w-full text-left px-2.5 py-1.5 rounded-md text-xs font-bold text-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCustomInput(true);
                      }}
                    >
                      <span>+ Add Custom Service</span>
                    </button>
                  ) : (
                    <div className="p-1 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      <Input
                        placeholder="Type service name..."
                        value={newCustomService}
                        onChange={(e) => setNewCustomService(e.target.value)}
                        className="h-8 text-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomService();
                          }
                        }}
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomInput(false);
                            setNewCustomService("");
                          }}
                          className="h-7 text-[10px] px-2 border border-border/30 rounded-md hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomService}
                          className="h-7 text-[10px] px-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-md"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lead Status */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs flex items-center gap-1.5 text-foreground/75">
                <CheckSquare className="h-3.5 w-3.5 text-[#8B5CF6]/80" />
                Lead Status
              </Label>
              <Select
                value={classification || "none"}
                onValueChange={(v) => setValue("classification", v === "none" ? null : v as ClassificationFormValues["classification"], { shouldDirty: true })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Classified</SelectItem>
                  {CLASSIFICATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nurturing Direction */}
            <div className="space-y-1.5">
              <Label className="font-bold text-xs flex items-center gap-1.5 text-foreground/75">
                <CheckSquare className="h-3.5 w-3.5 text-[#8B5CF6]/80" />
                Nurturing Direction
              </Label>
              <Select
                value={nurturingDirection || "none"}
                onValueChange={(v) => setValue("nurturingDirection", v === "none" ? null : v as ClassificationFormValues["nurturingDirection"], { shouldDirty: true })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select direction..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Direction</SelectItem>
                  {NURTURING_DIR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Value */}
            <div className="space-y-1.5">
              <Label htmlFor="expectedValue" className="font-bold text-xs flex items-center gap-1.5 text-foreground/75">
                <BadgeCent className="h-3.5 w-3.5 text-[#8B5CF6]/80" />
                Estimated Opportunity Value (₹)
              </Label>
              <Input
                id="expectedValue"
                type="number"
                placeholder="e.g. 500000"
                className="h-9 text-xs"
                {...register("expectedValue")}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="classificationNotes" className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest block">
            Classification &amp; Stage Notes
          </Label>
          <Textarea
            id="classificationNotes"
            className="text-xs resize-none bg-background/30 border-border/40 focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/30 min-h-[60px]"
            placeholder="Log details about proposal status, next steps or notes..."
            {...register("classificationNotes")}
          />
        </div>
      </form>
    </div>
  );
}
