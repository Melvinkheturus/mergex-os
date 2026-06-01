"use client";

import { UseFormReturn } from "react-hook-form";
import { Save, Tag, ShieldAlert, BadgeCent, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const SERVICE_OPTIONS = [
  "Consulting",
  "Strategy",
  "Operations",
  "Branding",
  "Web Development",
  "Marketing",
  "Training",
];

const PRIORITY_OPTIONS = [
  { label: "High", value: "HIGH", color: "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20" },
  { label: "Medium", value: "MEDIUM", color: "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" },
  { label: "Low", value: "LOW", color: "text-sky-500 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20" },
];

const CATEGORY_OPTIONS = [
  "Enterprise",
  "Mid-Market",
  "SMB",
  "Startup",
];

interface ClassificationTabProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => Promise<void>;
  leadId: string;
}

export function ClassificationTab({ form, onSubmit, leadId }: ClassificationTabProps) {
  // Services stored as comma-separated string in form
  const servicesStr: string = form.watch("services") || "";
  const selectedServices = servicesStr
    ? servicesStr.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const currentPriority = form.watch("priority") || "MEDIUM";

  // For Lead Category, since it's not in schema, we persist in localStorage per leadId for rich interactive persistence!
  const [leadCategory, setLeadCategory] = useState<string>("SMB");

  useEffect(() => {
    const saved = localStorage.getItem(`lead-category-${leadId}`);
    if (saved) {
      setLeadCategory(saved);
    }
  }, [leadId]);

  const toggleService = (service: string) => {
    const current = new Set(selectedServices);
    if (current.has(service)) {
      current.delete(service);
    } else {
      current.add(service);
    }
    form.setValue("services", Array.from(current).join(", "));
  };

  const handlePriorityChange = (val: string) => {
    form.setValue("priority", val);
  };

  const handleCategoryChange = (val: string) => {
    setLeadCategory(val);
    localStorage.setItem(`lead-category-${leadId}`, val);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form.getValues());
  };

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-[#8B5CF6]" />
          Lead Classification
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          Define services interested, estimate value, and set deal priorities.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
          
          {/* Service Interest */}
          <div className="space-y-3">
            <Label className="font-bold text-xs flex items-center gap-1.5">
              <BadgeCent className="h-3.5 w-3.5 text-[#8B5CF6]" />
              Service Interest
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SERVICE_OPTIONS.map((service) => {
                const isSelected = selectedServices.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-[11px] font-semibold transition-all duration-150",
                      isSelected
                        ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]"
                        : "bg-muted/10 border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/20"
                    )}
                  >
                    <span
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-[#8B5CF6] border-[#8B5CF6]"
                          : "border-border/50 bg-transparent"
                      )}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" className="h-2 w-2 text-white fill-current">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {service}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-3 pt-4 border-t border-border/10">
            <Label className="font-bold text-xs flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-[#8B5CF6]" />
              Priority Level
            </Label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITY_OPTIONS.map((opt) => {
                const isSelected = currentPriority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePriorityChange(opt.value)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg border text-[11px] font-bold transition-all duration-150",
                      isSelected
                        ? opt.color
                        : "bg-muted/10 border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/20"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Value & Lead Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/10">
            <div className="space-y-2">
              <Label htmlFor="expectedValue" className="font-bold text-xs flex items-center gap-1.5">
                <BadgeCent className="h-3.5 w-3.5 text-[#8B5CF6]" />
                Estimated Value (₹)
              </Label>
              <Input
                id="expectedValue"
                type="number"
                placeholder="e.g. 500000"
                className="h-9 text-xs"
                {...form.register("expectedValue")}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-[#8B5CF6]" />
                Lead Category
              </Label>
              <div className="flex gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = leadCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={cn(
                        "flex-1 py-2 px-1 text-center rounded-lg border text-[10px] font-bold transition-all duration-150",
                        isSelected
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-500"
                          : "bg-muted/10 border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/20"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
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
              <Save className="h-4 w-4 mr-1.5" /> Save Classification
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
