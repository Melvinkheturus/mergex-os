"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Check, Clock, Sparkles, CheckSquare, BadgeCent,
  Tag, X, ArrowRight, Loader2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NurturingFormValues, Lead } from "./types";

const NURTURING_CHANNEL_OPTIONS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "EMAIL",    label: "Email"    },
  { value: "CALL",     label: "Call"     },
  { value: "MEETING",  label: "Meeting"  },
  { value: "LINKEDIN", label: "LinkedIn" },
] as const;

const BUYING_SIGNALS = [
  { id: "pricing",  label: "Asked About Pricing" },
  { id: "timeline", label: "Asked About Timeline" },
  { id: "proposal", label: "Requested Proposal" },
  { id: "meeting",  label: "Requested Meeting" },
  { id: "budget",   label: "Budget Confirmed" },
] as const;

interface StepNurturingFormProps {
  form: UseFormReturn<NurturingFormValues>;
  onSubmit: (values: NurturingFormValues) => Promise<void>;
  lead: Lead;
  onPromoteToReadyNow?: () => Promise<void>;
  promoting?: boolean;
}

export function StepNurturingForm({
  form,
  onSubmit,
  lead,
  onPromoteToReadyNow,
  promoting = false,
}: StepNurturingFormProps) {
  const { register, watch, setValue } = form;

  // Local state for Buying Signals checklist
  const [signals, setSignals] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`buying-signals-${lead.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setSignals(parsed), 0);
      } catch {
        setTimeout(() => setSignals([]), 0);
      }
    } else {
      setTimeout(() => setSignals([]), 0);
    }
  }, [lead.id]);

  const toggleSignal = (id: string) => {
    const next = signals.includes(id) ? signals.filter(s => s !== id) : [...signals, id];
    setSignals(next);
    localStorage.setItem(`buying-signals-${lead.id}`, JSON.stringify(next));
  };

  // Engagement Score is length of signals * 20
  const score = signals.length * 20;
  const services = lead.services || [];

  return (
    <div className="space-y-6">
      {/* ─── Nurturing Workspace Panel ────────────────────────── */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-xs">
        
        {/* Header / Hero Section */}
        <div className="flex items-center justify-between border-b border-border/20 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">Nurturing Controls</h4>
            <p className="text-[10px] text-muted-foreground">Manage relationship touchpoints, engagement activities, and commercial readiness.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-black text-amber-600 dark:text-amber-400 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            🟡 NURTURING HOLDING STATE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Engagement Score & Buying Signals */}
          <div className="space-y-4">
            {/* Score slider */}
            <div className="p-4 rounded-xl border border-border/30 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Engagement Score</span>
                <span className="text-sm font-black text-[#8B5CF6]">{score}<span className="text-[9px] font-medium text-muted-foreground">/100</span></span>
              </div>
              
              {/* Visual Line Slider */}
              <div className="relative h-6 flex items-center select-none">
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted/40" />
                <div 
                  className="absolute left-0 h-1.5 rounded-full bg-[#8B5CF6] transition-all duration-300" 
                  style={{ width: `${score}%` }} 
                />
                <div 
                  className="absolute h-3.5 w-3.5 rounded-full bg-[#8B5CF6] border-2 border-background shadow-xs -ml-1.5 transition-all duration-300"
                  style={{ left: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground/60 mt-1">
                <span className={cn(score < 40 && "text-sky-500")}>Cold</span>
                <span className={cn(score >= 40 && score < 80 && "text-amber-500")}>Warm</span>
                <span className={cn(score >= 80 && "text-rose-500")}>Hot</span>
              </div>
            </div>

            {/* Buying Signals Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Buying Signals</span>
              <div className="grid grid-cols-1 gap-2">
                {BUYING_SIGNALS.map((sig) => {
                  const checked = signals.includes(sig.id);
                  return (
                    <button
                      key={sig.id}
                      type="button"
                      onClick={() => toggleSignal(sig.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 border rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer select-none",
                        checked 
                          ? "bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6]" 
                          : "border-border/30 bg-card/20 hover:border-border/60"
                      )}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                        checked ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "border-border/50 bg-background"
                      )}>
                        {checked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                      </div>
                      <span>{sig.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Next Follow-Up Details */}
          <div className="space-y-4 p-4 rounded-xl border border-border/30 bg-card/50 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#8B5CF6]/80" /> Next Follow-Up
              </span>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-foreground/60">Follow-up Date & Time</Label>
                <Input type="datetime-local" className="h-8 text-xs bg-background/50" {...register("nextFollowUpAt")} />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-foreground/60">Channel</Label>
                <Select
                  value={watch("nurturingChannel") || "none"}
                  onValueChange={(v) => setValue("nurturingChannel", v === "none" ? null : v as NurturingFormValues["nurturingChannel"], { shouldDirty: true })}
                >
                  <SelectTrigger className="h-8 text-xs bg-background/50">
                    <SelectValue placeholder="Select channel..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Channel</SelectItem>
                    {NURTURING_CHANNEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-foreground/60">Follow-up Purpose</Label>
              <Textarea
                className="text-xs bg-background/50 resize-none h-16 focus-visible:ring-0 focus-visible:border-border"
                placeholder="e.g. Check budget readiness..."
                {...register("conversationNotes")}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vertical Communication Timeline */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Communication Timeline</span>
            <div className="relative border-l border-border/40 ml-2.5 pl-4 py-1 space-y-4 text-[11px]">
              <div className="relative">
                <div className="absolute left-[-21.5px] top-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                <p className="font-bold text-foreground">Intake Completed</p>
                <p className="text-[10px] text-muted-foreground/70">{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="relative">
                <div className="absolute left-[-21.5px] top-0.5 h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-background" />
                <p className="font-bold text-foreground">Business Review Logged</p>
                <p className="text-[10px] text-muted-foreground/70">Snapshot details and pain points identified</p>
              </div>
              {lead.qualScore > 0 && (
                <div className="relative">
                  <div className="absolute left-[-21.5px] top-0.5 h-3 w-3 rounded-full bg-[#8B5CF6] border-2 border-background" />
                  <p className="font-bold text-foreground">Lead Qualified</p>
                  <p className="text-[10px] text-muted-foreground/70">Qualification score: {lead.qualScore}/110</p>
                </div>
              )}
              <div className="relative">
                <div className="absolute left-[-21.5px] top-0.5 h-3 w-3 rounded-full bg-amber-500 border-2 border-background animate-pulse" />
                <p className="font-bold text-foreground">Entered Nurturing state</p>
                <p className="text-[10px] text-muted-foreground/70">Awaiting commercial readiness</p>
              </div>
            </div>
          </div>

          {/* AI Suggested Actions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Suggested Action
            </span>
            
            {services.some(s => s.toLowerCase().includes("website") || s.toLowerCase().includes("ecommerce")) ? (
              <div className="p-3.5 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-1">
                <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400">Send Website Case Study</p>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Why: Lead selected Website or Ecommerce services and might want to review our delivery portfolio.
                </p>
              </div>
            ) : !signals.includes("budget") ? (
              <div className="p-3.5 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-1">
                <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400">Schedule Budget Review Call</p>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Why: Budget discussion is currently pending/not confirmed.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-1">
                <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400">Schedule Discovery Session</p>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Why: A discovery meeting is required to establish commercial alignment.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Promotion Action Card */}
      {onPromoteToReadyNow && (
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
              Promote to Ready Now
            </h4>
            <p className="text-[10px] text-muted-foreground">If the lead shows commercial readiness, bypass nurturing and advance them to the Meeting Readiness gate.</p>
          </div>
          <Button
            type="button"
            disabled={promoting}
            onClick={onPromoteToReadyNow}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold h-9 text-xs shrink-0 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
          >
            {promoting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                Mark as Ready Now
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
