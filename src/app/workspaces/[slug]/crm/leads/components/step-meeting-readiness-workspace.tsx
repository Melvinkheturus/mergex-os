"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import {
  Check, Lock, Unlock, AlertCircle, Building2, User,
  DollarSign, Sparkles, AlertTriangle, ArrowRight, Loader2, CalendarDays
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Lead, OptionStage, MeetingReadinessFormValues } from "./types";

interface StepMeetingReadinessWorkspaceProps {
  form: UseFormReturn<MeetingReadinessFormValues>;
  onSubmit: (values: MeetingReadinessFormValues) => Promise<void>;
  lead: Lead;
  stages: OptionStage[];
  onStepClick: (step: number) => void;
  onStageClick: (stageId: string) => Promise<void>;
  savingStage?: boolean;
}

// ─── Step Completion Helpers (align with lead-details-client.tsx) ──────────────

function getStep2Complete(lead: Lead) {
  return !!(lead.businessAge || lead.teamSize) && (lead.painPoints?.length ?? 0) > 0;
}

function getStep3Complete(lead: Lead) {
  return (
    lead.qualIcpFit > 0 ||
    lead.qualBudgetLikelihood >= 0 ||
    lead.qualDecisionMakerAccess >= 0
  ) &&
    lead.qualIcpFit > 0 &&
    lead.qualOperationalFeasibility > 0 &&
    lead.qualServiceAlignment > 0 &&
    lead.qualGrowthPotential > 0;
}

export function StepMeetingReadinessWorkspace({
  form,
  onSubmit,
  lead,
  stages,
  onStepClick,
  onStageClick,
  savingStage = false,
}: StepMeetingReadinessWorkspaceProps) {
  const { register, watch, setValue } = form;

  // 1. Compute Checklist status
  const checkBR = getStep2Complete(lead);
  const checkQual = getStep3Complete(lead);
  const checkPainPoint = (lead.painPoints?.length ?? 0) > 0;
  const checkOutreach = !!lead.lastContactAt || !!lead.nextFollowUpAt || !!lead.lastActivityAt;
  const checkHot = lead.classification === "HOT";
  const checkDM = !!lead.decisionMaker;

  const checks = [
    { label: "Business Review Complete", isFilled: checkBR, stepNum: 2 },
    { label: "Qualification Complete", isFilled: checkQual, stepNum: 3 },
    { label: "Pain Point Identified", isFilled: checkPainPoint, stepNum: 2 },
    { label: "Outreach Performed", isFilled: checkOutreach, stepNum: 5 },
    { label: "Lead Classified HOT", isFilled: checkHot, stepNum: 4 },
    { label: "Decision Maker Identified", isFilled: checkDM, stepNum: 2 },
  ];

  const passedCount = checks.filter(c => c.isFilled).length;
  const isReady = passedCount === 6;

  // Find MEETING Stage in database stages
  const meetingStage = stages.find(
    (s) => s.name === "MEETING" || s.label.toLowerCase().includes("meeting")
  );

  const isAlreadyInMeetingStage = lead.stageId === meetingStage?.id;

  // Generate Suggested Agenda based on services interested
  const services = lead.services || [];
  const serviceText = services.length > 0 ? services.join(", ") : "general";

  return (
    <div className="space-y-6 text-xs">
      
      {/* SECTION 1 — READINESS STATUS (HERO CARD) */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        isReady
          ? "bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-xs"
          : "bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 shadow-xs"
      )}>
        {/* Subtle background glow */}
        <div className={cn(
          "absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none",
          isReady ? "bg-emerald-500" : "bg-amber-500"
        )} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
              Meeting Readiness status
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-base font-extrabold text-foreground">
                {passedCount} / 6 Checks Passed
              </h3>
              <Badge className={cn(
                "px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border shadow-2xs select-none",
                isReady
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              )}>
                {isReady ? "🟢 Ready" : "🟡 Not Ready"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground max-w-md">
              {isReady 
                ? "This lead has successfully cleared all pre-meeting checks and is fully prepared for a commercial discovery session." 
                : "Complete all required data entries and relationship outreach before scheduling a discovery meeting."}
            </p>
          </div>

          {!isReady && (
            <div className="text-[10px] space-y-1 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl shrink-0">
              <span className="font-bold text-amber-600 block">Missing Checks:</span>
              <ul className="list-disc pl-3 text-muted-foreground/80 space-y-0.5">
                {checks.filter(c => !c.isFilled).map((c, i) => (
                  <li key={i}>{c.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION 2 — INTERNAL CHECKLIST */}
        <div className="rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border/10 pb-1.5">
            Internal Checklist
          </span>
          <div className="space-y-2.5">
            {checks.map((check, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 text-white transition-all",
                    check.isFilled
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-border/60 bg-muted/20 text-muted-foreground"
                  )}>
                    {check.isFilled ? (
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    ) : (
                      <span className="text-[9px] font-black">!</span>
                    )}
                  </div>
                  <span className={cn(
                    "font-semibold text-xs",
                    check.isFilled ? "text-foreground" : "text-muted-foreground/60"
                  )}>
                    {check.label}
                  </span>
                </div>
                
                {!check.isFilled && (
                  <button
                    type="button"
                    onClick={() => onStepClick(check.stepNum)}
                    className="text-[9px] font-bold text-violet-600 hover:text-violet-500 dark:text-violet-400 cursor-pointer"
                  >
                    Go to Step {check.stepNum}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3 — LEAD SUMMARY SNAPSHOT */}
        <div className="rounded-xl border border-border/30 bg-card/20 p-4 space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border/10 pb-1.5">
            Lead Snapshot
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">Company</span>
              <p className="font-bold text-foreground leading-tight">{lead.companyName}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">Industry</span>
              <p className="font-bold text-foreground truncate">{lead.industry || "Unspecified"}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">Lead Owner</span>
              <p className="font-bold text-foreground">
                {lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : "Unassigned"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">ICP & Lead Score</span>
              <p className="font-bold text-[#8B5CF6]">{lead.qualScore} <span className="text-muted-foreground font-medium text-[10px]">/ 110</span></p>
            </div>
            <div className="space-y-0.5 col-span-2">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">Expected Value</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                {lead.expectedValue ? `₹${Number(lead.expectedValue).toLocaleString("en-IN")}` : "₹0"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 — BUSINESS CONTEXT & SECTION 5 — STAKEHOLDER INFORMATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Business Context */}
        <div className="rounded-xl border border-border/30 bg-card/25 p-4 space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border/10 pb-1.5">
            Business Context
          </span>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground/60 uppercase font-semibold">Identified Pain Points</span>
              {lead.painPoints && lead.painPoints.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {lead.painPoints.map((p, i) => (
                    <Badge key={i} variant="outline" className="bg-red-500/5 border-red-500/10 text-red-600 text-[10px] font-semibold px-2 py-0.5">
                      {p}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground/50 text-[10px] italic">No pain points logged</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground/60 uppercase font-semibold">Envisioned Opportunities</span>
              {lead.opportunities && lead.opportunities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {lead.opportunities.map((o, i) => (
                    <Badge key={i} variant="outline" className="bg-emerald-500/5 border-emerald-500/10 text-emerald-600 text-[10px] font-semibold px-2 py-0.5">
                      {o}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground/50 text-[10px] italic">No opportunities logged</p>
              )}
            </div>
          </div>
        </div>

        {/* Stakeholder Details */}
        <div className="rounded-xl border border-border/30 bg-card/25 p-4 space-y-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border/10 pb-1.5">
            Stakeholder Information
          </span>
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">Primary Contact</span>
              <p className="font-bold text-foreground">{lead.contactPerson}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">Designation</span>
              <p className="font-bold text-foreground">{lead.designation || "Unspecified"}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-muted-foreground/60 block text-[9px] uppercase font-semibold">Decision Maker</span>
              {lead.decisionMaker ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="h-3.5 w-3.5" />
                  {lead.decisionMaker}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-500 font-bold animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  ⚠ Decision Maker Missing
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6 — MEETING PREPARATION (EDITABLE FORM) */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-xl border border-border/30 bg-card/20 p-5 space-y-4">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border/10 pb-1.5">
          Meeting Preparation Console
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="font-bold text-xs">Meeting Objective</Label>
            <Select
              value={watch("meetingObjective") || "DISCOVERY"}
              onValueChange={(v) => setValue("meetingObjective", v as MeetingReadinessFormValues["meetingObjective"], { shouldDirty: true })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select objective..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISCOVERY">Discovery Call</SelectItem>
                <SelectItem value="QUALIFICATION">Qualification Call</SelectItem>
                <SelectItem value="SOLUTION_DISCUSSION">Solution Discussion</SelectItem>
                <SelectItem value="BUDGET_DISCUSSION">Budget Discussion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="font-bold text-xs">Topics to Cover</Label>
            <Textarea
              className="text-xs bg-background/50 h-9 resize-none focus-visible:ring-1 focus-visible:ring-violet-500/20"
              placeholder="e.g. Current pain points, timeline expectations, scope outline..."
              {...register("meetingTopics")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-bold text-xs">Specific Questions to Ask</Label>
          <Textarea
            className="text-xs bg-background/50 min-h-[50px] resize-none focus-visible:ring-1 focus-visible:ring-violet-500/20"
            placeholder="e.g. 1. What is the main blocker for CRM migration? 2. Who else joins the call?"
            {...register("meetingQuestions")}
          />
        </div>
      </form>

      {/* SECTION 7 — RECOMMENDED AGENDA (HELPER) */}
      <div className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Recommended Agenda
        </span>
        <ol className="list-decimal pl-4 space-y-1 text-muted-foreground/80 font-medium">
          <li>Understand current lead processes & digital snapshot.</li>
          <li>Review key business pain points: <strong>{lead.painPoints?.slice(0, 3).join(", ") || "No CRM/Lead tracking"}</strong>.</li>
          <li>Confirm alignment on interested services: <strong>{serviceText}</strong>.</li>
          <li>Discuss approximate budget scope and timeline availability.</li>
        </ol>
      </div>

      {/* SECTION 8 — UNLOCK / ACTION SECTION */}
      <div className="rounded-2xl border border-border/30 bg-card/30 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
              {isReady ? (
                <Unlock className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
              Discovery Stage Control
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {isAlreadyInMeetingStage 
                ? "This lead is currently in the Meeting Readiness stage. Proceed with scheduling." 
                : "Advance lead's stage status in CRM pipeline to unlock scheduling."}
            </p>
          </div>
          <Badge className={cn(
            "px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border shadow-2xs select-none",
            isReady
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border/40"
          )}>
            {isReady ? "Ready to Schedule" : "Locked"}
          </Badge>
        </div>

        {isReady ? (
          <div className="space-y-2">
            {!isAlreadyInMeetingStage && meetingStage && (
              <Button
                type="button"
                disabled={savingStage}
                onClick={() => onStageClick(meetingStage.id)}
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold h-9 text-xs transition-all duration-150 rounded-xl flex items-center justify-center gap-1.5"
              >
                {savingStage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    Move to Meeting Readiness Stage
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Perform form submission to save prep details
                form.handleSubmit(onSubmit)();
                // Custom scheduling mock action
                alert("Opening scheduler dialog... Meeting prep details have been saved.");
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 hover:text-white border-emerald-600/30 text-white font-bold h-9 text-xs transition-all duration-150 rounded-xl flex items-center justify-center gap-1.5"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Schedule Discovery Meeting
            </Button>
          </div>
        ) : (
          <div className="text-center p-3 rounded-xl border border-border/30 bg-muted/15 text-[11px] text-muted-foreground/60 select-none">
            All 6 internal checklists must be satisfied to promote this lead to Meeting Readiness.
          </div>
        )}
      </div>
    </div>
  );
}
