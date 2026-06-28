"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Check, Lock, Unlock, Rocket, Repeat2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/r-context-menu";
import { PencilLine, Trash2, UserPlus, Award } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lead, OptionStage, MeetingReadinessFormValues } from "./types";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface StepMeetingReadinessWorkspaceProps {
  form: UseFormReturn<MeetingReadinessFormValues>;
  onSubmit: (values: MeetingReadinessFormValues) => Promise<void>;
  lead: Lead;
  stages: OptionStage[];
  onStepClick: (step: number) => void;
  onStageClick: (stageId: string) => Promise<void>;
  savingStage?: boolean;
  onLeadUpdate?: (lead: Lead) => void;
}


// ─── Step Completion Helpers (align with lead-details-client.tsx) ──────────────

function getStep2Complete(lead: Lead) {
  return !!(lead.businessAge || lead.teamSize) && (lead.painPoints?.length ?? 0) > 0;
}

function getStep3Complete(lead: Lead) {
  return !!(
    lead.qualIcpFit > 0 &&
    lead.qualBudgetLikelihood > 0 &&
    lead.qualDecisionMakerAccess > 0 &&
    lead.qualNeed > 0 &&
    lead.qualTimeline > 0
  );
}

export function StepMeetingReadinessWorkspace({
  form,
  onSubmit,
  lead,
  stages,
  onStepClick,
  onStageClick,
  savingStage = false,
  onLeadUpdate,
}: StepMeetingReadinessWorkspaceProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [updatingStakeholder, setUpdatingStakeholder] = useState(false);

  const handleUpdateStakeholder = async (field: string, value: string | null) => {
    try {
      setUpdatingStakeholder(true);
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error();
      const updatedLead = await res.json();
      onLeadUpdate?.(updatedLead);
      toast.success("Stakeholders updated");
      // Notify other cards (timeline, completeness ring, command center)
      window.dispatchEvent(new CustomEvent("crm-activity-logged"));
    } catch {
      toast.error("Failed to update stakeholder");
    } finally {
      setUpdatingStakeholder(false);
    }
  };

  // 1. Compute Checklist status
  const checkBR = getStep2Complete(lead);
  const checkQual = getStep3Complete(lead);
  const checkPainPoint = (lead.painPoints?.length ?? 0) > 0;
  const checkOutreach = !!lead.lastContactAt || !!lead.nextFollowUpAt || !!lead.lastActivityAt;
  const checkHot = lead.classification === "HOT";
  const checkDM = lead.qualDecisionMakerAccess > 0;

  const checks = [
    { label: "Business Review Complete", isFilled: checkBR, stepNum: 2 },
    { label: "Qualification Complete", isFilled: checkQual, stepNum: 3 },
    { label: "Pain Point Identified", isFilled: checkPainPoint, stepNum: 2 },
    { label: "Outreach Performed", isFilled: checkOutreach, stepNum: 5 },
    { label: "Lead Classified HOT", isFilled: checkHot, stepNum: 4 },
    { label: "Decision Maker Identified", isFilled: checkDM, stepNum: 3 },
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
            <h3 className="text-base font-extrabold text-foreground">
              {passedCount} / 6 Checks Passed
            </h3>
            <p className="text-[10px] text-muted-foreground max-w-md">
              {isReady 
                ? "This lead has successfully cleared all pre-meeting checks and is fully prepared for a commercial discovery session." 
                : "Complete all required data entries and relationship outreach before scheduling a discovery meeting."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {!isReady && (
              <div className="text-[10px] space-y-1 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                <span className="font-bold text-amber-600 block">Missing Checks:</span>
                <ul className="list-disc pl-3 text-muted-foreground/80 space-y-0.5">
                  {checks.filter(c => !c.isFilled).map((c, i) => (
                    <li key={i}>{c.label}</li>
                  ))}
                </ul>
              </div>
            )}
            <Badge className={cn(
              "px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border shadow-2xs select-none",
              isReady
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )}>
              {isReady ? "✓ Lead Operations Complete" : "🟡 Not Ready"}
            </Badge>
          </div>
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
            {[
              {
                id: "primary",
                name: lead.contactPerson,
                role: "Primary Contact",
                field: "contactPerson",
                desc: lead.designation || "Primary Account Contact",
                isSet: true,
                isPrimary: true,
              },
              {
                id: "decisionMaker",
                name: lead.decisionMaker,
                role: "Decision Maker",
                field: "decisionMaker",
                desc: "Authority / Sign-off Power",
                isSet: !!lead.decisionMaker,
                isPrimary: false,
              },
              {
                id: "champion",
                name: lead.champion,
                role: "Champion",
                field: "champion",
                desc: "Internal Advocate / User",
                isSet: !!lead.champion,
                isPrimary: false,
              },
              {
                id: "influencer",
                name: lead.influencer,
                role: "Influencer",
                field: "influencer",
                desc: "Technical/Business Evaluator",
                isSet: !!lead.influencer,
                isPrimary: false,
              },
            ].map((st) => {
              const initials = st.name ? st.name.charAt(0).toUpperCase() : "?";
              return (
                <ContextMenu key={st.id}>
                  <ContextMenuTrigger asChild>
                    <div
                      className={cn(
                        "group/st-item flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-context-menu",
                        st.isSet 
                          ? "border-border/30 bg-background/25 hover:bg-background/60" 
                          : "border-dashed border-border/30 bg-card/10 text-muted-foreground/60 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/3"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                          st.isSet 
                            ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/15" 
                            : "bg-muted text-muted-foreground/40 border border-dashed border-border/40"
                        )}>
                          {st.isSet ? initials : "+"}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={cn("text-xs font-bold", st.isSet ? "text-foreground" : "text-muted-foreground/60")}>
                              {st.name || `No ${st.role} assigned`}
                            </span>
                            <Badge className={cn(
                              "text-[8px] font-bold px-1.5 py-0.25 shrink-0 rounded-full border",
                              st.isPrimary 
                                ? "bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6]" 
                                : st.isSet 
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                  : "bg-muted border-border/25 text-muted-foreground"
                            )}>
                              {st.role}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground/75 block">
                            {st.isSet ? st.desc : "Right-click to assign or set name"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-56">
                    {st.isSet && !st.isPrimary && (
                      <ContextMenuItem onClick={() => {
                        const name = window.prompt(`Edit name for ${st.role}:`, st.name || "");
                        if (name !== null) {
                          handleUpdateStakeholder(st.field, name.trim() || null);
                        }
                      }}>
                        <PencilLine className="size-3.5 opacity-70 mr-2" />
                        Edit Name
                      </ContextMenuItem>
                    )}

                    {!st.isSet && (
                      <ContextMenuItem onClick={() => {
                        const name = window.prompt(`Enter name for ${st.role}:`, "");
                        if (name) {
                          handleUpdateStakeholder(st.field, name.trim());
                        }
                      }}>
                        <UserPlus className="size-3.5 opacity-70 mr-2" />
                        Assign Stakeholder Name
                      </ContextMenuItem>
                    )}

                    {st.isSet && (
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Award className="size-3.5 opacity-70 mr-2" />
                          Set Role
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="w-48">
                          <ContextMenuItem onClick={() => handleUpdateStakeholder("decisionMaker", st.name)}>
                            Mark as Decision Maker
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleUpdateStakeholder("champion", st.name)}>
                            Mark as Champion
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleUpdateStakeholder("influencer", st.name)}>
                            Mark as Influencer
                          </ContextMenuItem>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                    )}

                    {st.isSet && !st.isPrimary && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="destructive" onClick={() => handleUpdateStakeholder(st.field, null)}>
                          <Trash2 className="size-3.5 opacity-70 mr-2" />
                          Remove Role
                        </ContextMenuItem>
                      </>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 6 — SALES CONVERSION HANDOFF */}
      <div className={cn(
        "rounded-2xl border p-5 space-y-5 transition-all duration-300",
        isReady
          ? "bg-gradient-to-br from-[#8B5CF6]/8 via-[#8B5CF6]/4 to-transparent border-[#8B5CF6]/20"
          : "bg-card/30 border-border/30"
      )}>
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
              {isReady ? (
                <Unlock className="h-4 w-4 text-[#8B5CF6] shrink-0" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
              Sales Conversion Handoff
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {isReady
                ? "All lead operations complete. Create a discovery meeting to proceed."
                : "Complete all 6 internal checks to unlock the discovery meeting."}
            </p>
          </div>
          <Badge className={cn(
            "px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border shadow-2xs select-none shrink-0",
            isReady
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border/40"
          )}>
            {isReady ? "✓ Lead Operations Complete" : "Locked"}
          </Badge>
        </div>

        {isReady ? (
          <>
            {/* Status grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/20 bg-background/30 p-3 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                  Lead Operations
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  Complete
                </span>
              </div>
              <div className="rounded-xl border border-border/20 bg-background/30 p-3 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                  Next System
                </span>
                <span className="text-xs font-bold text-foreground/80">
                  Sales Conversion Layer
                </span>
              </div>
              <div className="rounded-xl border border-border/20 bg-background/30 p-3 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                  Next Record
                </span>
                <span className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Discovery Meeting
                </span>
              </div>
            </div>

            {/* Secondary CTA — only when not fully HOT or decision maker missing or budget unclear */}
            {(!checkHot || !checkDM || lead.qualBudgetLikelihood < 3) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onStepClick(5)}
                className="w-full h-8 text-xs font-semibold border-border/40 text-muted-foreground hover:text-foreground rounded-xl flex items-center justify-center gap-2"
              >
                <Repeat2 className="h-3.5 w-3.5" />
                Continue Nurturing
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-4 px-3 rounded-xl border border-dashed border-border/30 bg-muted/10 space-y-1.5">
            <Lock className="h-5 w-5 text-muted-foreground/30 mx-auto" />
            <p className="text-[11px] text-muted-foreground/60 select-none">
              Complete all 6 internal checks above to unlock the sales conversion handoff.
            </p>
            <p className="text-[10px] text-muted-foreground/40">
              {6 - passedCount} check{6 - passedCount !== 1 ? "s" : ""} remaining
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
