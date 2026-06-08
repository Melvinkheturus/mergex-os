"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  Lock,
  Phone,
  MessageSquare,
  Mail,
  StickyNote,
  Camera,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from "next/navigation";
import { OptionStage, Lead, NEXT_ACTION_LABELS, NextActionType } from "./types";

const TERMINAL_STAGE_NAMES = ["WON", "LOST", "ON_HOLD"];

interface LeadCommandCenterProps {
  lead: Lead;
  stages: OptionStage[];
  onStageClick: (stageId: string) => void;
  savingStage?: boolean;
  onNoteClick: () => void;
  onLeadUpdate?: (lead: Lead) => void;
  onStepClick?: (step: number) => void;
}

interface ChecklistItem {
  label: string;
  isFilled: boolean;
}

function getChecklistForStage(stageName: string, lead: Lead): ChecklistItem[] {
  const name = (stageName || "").toUpperCase();
  
  if (name.includes("INTAKE")) {
    return [
      { label: "Company Name", isFilled: !!lead.companyName },
      { label: "Contact Person", isFilled: !!lead.contactPerson },
      { label: "Phone", isFilled: !!lead.phone },
      { label: "Email", isFilled: !!lead.email },
      { label: "Source", isFilled: !!lead.sourceId },
    ];
  }
  
  if (name.includes("REVIEW")) {
    return [
      { label: "Current Situation", isFilled: !!lead.currentSituation },
      { label: "Pain Points", isFilled: !!(lead.painPoints && lead.painPoints.length > 0) },
    ];
  }
  
  if (name.includes("QUALIFICATION") && !name.includes("AUDIT")) {
    return [
      { label: "Budget Set", isFilled: lead.bantBudget > 0 },
      { label: "Authority Set", isFilled: lead.bantAuthority > 0 },
      { label: "Need Set", isFilled: lead.bantNeed > 0 },
      { label: "Timeline Set", isFilled: lead.bantTimeline > 0 },
    ];
  }
  
  if (name.includes("CLASSIFICATION")) {
    const hasReadiness = typeof window !== "undefined" && !!localStorage.getItem(`proposal-readiness-${lead.id}`);
    return [
      { label: "Services Selected", isFilled: !!(lead.services && lead.services.length > 0) },
      { label: "Expected Value", isFilled: !!lead.expectedValue },
      { label: "Proposal Readiness", isFilled: hasReadiness },
    ];
  }
  
  return [
    { label: "Decision Maker Set", isFilled: !!lead.decisionMaker },
    { label: "BANT Complete", isFilled: lead.bantScore > 0 },
  ];
}

function calculateCompleteness(lead: Lead) {
  const hasReadiness = typeof window !== "undefined" && !!localStorage.getItem(`proposal-readiness-${lead.id}`);
  const fields = [
    lead.companyName,
    lead.contactPerson,
    lead.phone,
    lead.email,
    lead.website,
    lead.sourceId,
    lead.currentSituation,
    lead.painPoints && lead.painPoints.length > 0 ? "filled" : null,
    lead.opportunityNotes,
    lead.bantBudget > 0 ? "filled" : null,
    lead.bantAuthority > 0 ? "filled" : null,
    lead.bantNeed > 0 ? "filled" : null,
    lead.bantTimeline > 0 ? "filled" : null,
    hasReadiness ? "filled" : null,
    lead.services && lead.services.length > 0 ? "filled" : null,
    lead.priority,
    lead.expectedValue,
    lead.decisionMaker,
    lead.influencer,
    lead.champion,
    lead.financeContact,
  ];
  const filled = fields.filter((val) => val !== null && val !== undefined && val !== "").length;
  return {
    completeness: Math.round((filled / fields.length) * 100),
    filledFields: filled,
    totalFields: fields.length,
  };
}

export function LeadCommandCenter({
  lead,
  stages,
  onStageClick,
  savingStage,
  onNoteClick,
  onLeadUpdate,
  onStepClick,
}: LeadCommandCenterProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const logOutreach = async (type: "CALL" | "WHATSAPP" | "EMAIL", content: string) => {
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });
      if (!res.ok) throw new Error("Failed to log outreach");
      
      // Dispatch custom event to notify sidebar cards to refresh
      window.dispatchEvent(new CustomEvent("crm-activity-logged"));
      
      // Update lastActivityAt on parent lead (optimistic)
      if (onLeadUpdate) {
        onLeadUpdate({
          ...lead,
          lastActivityAt: new Date().toISOString(),
        });
      }
      toast.success(`${type} activity logged`);
    } catch (error) {
      console.error("Outreach logging error:", error);
    }
  };

  // Filter terminal stages out and deduplicate by name (DB may have duplicate rows per workspace)
  const workflowStages = stages
    .filter((s) => !TERMINAL_STAGE_NAMES.includes(s.name))
    .filter((s, idx, arr) => arr.findIndex((x) => x.name === s.name) === idx);

  const currentIndex = workflowStages.findIndex((s) => s.id === lead.stageId);
  // If stageId matched a deduplicated-out duplicate, fall back to matching by name
  const currentStage =
    currentIndex >= 0
      ? workflowStages[currentIndex]
      : workflowStages.find(
          (s) => s.name === stages.find((st) => st.id === lead.stageId)?.name
        );
  const resolvedIndex =
    currentIndex >= 0
      ? currentIndex
      : workflowStages.findIndex((s) => s.id === currentStage?.id);

  // Requirements checklist for current stage
  const checklist = lead && currentStage
    ? getChecklistForStage(currentStage.name, lead)
    : [];

  const completedItems = checklist.filter((item) => item.isFilled);
  const missingItems = checklist.filter((item) => !item.isFilled);

  // Smart recommended action computation
  const currentStageName = currentStage?.name || "";
  const nextStage = resolvedIndex >= 0 && resolvedIndex < workflowStages.length - 1
    ? workflowStages[resolvedIndex + 1]
    : null;

  let recActionTitle = "";
  let recActionDesc = "";
  let recActionBtn = "";
  let recActionFn = () => {};

  if (lead.nextAction) {
    recActionTitle = NEXT_ACTION_LABELS[lead.nextAction as NextActionType] ?? lead.nextAction;
    recActionDesc = lead.nextActionDate 
      ? `Due ${new Date(lead.nextActionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` 
      : "Next action scheduled";
    recActionBtn = "Log Progress";
    recActionFn = () => {
      onNoteClick();
      toast.info("Log an internal note or activity to record action progress.");
    };
  } else if (missingItems.length > 0) {
    recActionTitle = `${missingItems[0].label} Missing`;
    recActionDesc = `Complete requirements for the ${currentStage?.label || "current"} stage.`;
    recActionBtn = "Go to Step";
    recActionFn = () => {
      if (onStepClick) {
        const name = currentStageName.toUpperCase();
        let targetStep = 1;
        if (name.includes("REVIEW")) targetStep = 2;
        else if (name.includes("QUALIFICATION") && !name.includes("AUDIT")) targetStep = 3;
        else if (name.includes("CLASSIFICATION")) targetStep = 4;
        else if (name.includes("NURTURING")) targetStep = 5;
        else if (name.includes("MEETING")) targetStep = 6;
        onStepClick(targetStep);
        const stepper = document.getElementById("lead-wizard-stepper");
        if (stepper) {
          stepper.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
  } else if (nextStage) {
    recActionTitle = "Advance Stage";
    recActionDesc = `Requirements for ${currentStage?.label} are complete. Advance stage to ${nextStage.label}.`;
    recActionBtn = `Advance to ${nextStage.label}`;
    recActionFn = () => {
      onStageClick(nextStage.id);
    };
  } else {
    recActionTitle = "Final Stage Reached";
    recActionDesc = "All pipeline workflow stages have been completed.";
    recActionBtn = "";
  }
  
  const progressPercent = checklist.length > 0
    ? Math.round((completedItems.length / checklist.length) * 100)
    : 0;

  // Global completeness
  const { completeness, filledFields, totalFields } = calculateCompleteness(lead);

  // SVG ring dimensions
  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness / 100) * circumference;

  // Avatar upload logic
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = `${lead.companyName?.[0] || "L"}`.toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Accepted: JPG, PNG, WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to upload profile picture.");
        return;
      }
      
      const saveRes = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: data.url }),
      });
      
      const updated = await saveRes.json();
      if (!saveRes.ok) {
        toast.error(updated.error ?? "Failed to save profile picture.");
        return;
      }

      toast.success("Profile picture updated!");
      if (onLeadUpdate) {
        onLeadUpdate(updated);
      }
    } catch {
      toast.error("Failed to upload profile picture.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="glass-frost-card border border-border/40 rounded-2xl p-6 shadow-xs relative overflow-hidden">
      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (5/12 width): Lead Info & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-5 flex-1 w-full">
            {/* Identity section with Avatar + Name - stacked with Avatar on top */}
            <div className="flex flex-col items-start gap-4">
              {/* Avatar with Upload */}
              <div className="relative group cursor-pointer shrink-0">
                <Avatar className="h-16 w-16 border-2 border-[#8B5CF6]/20 shadow-md overflow-hidden relative">
                  {lead.avatarUrl ? (
                    <AvatarImage src={lead.avatarUrl} alt={lead.companyName} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-lg font-black bg-[#8B5CF6]/10 text-[#8B5CF6]">
                    {initials}
                  </AvatarFallback>
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-[#8B5CF6] animate-spin" />
                    </div>
                  )}

                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 text-[8px] font-bold text-white transition-opacity duration-150 cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5 text-white" />
                      <span>Update</span>
                    </button>
                  )}
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Company Identity Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-tight">
                    {lead.companyName}
                  </h1>
                  {lead.leadNumber && (
                    <Badge variant="outline" className="bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold px-2 h-5">
                      {lead.leadNumber}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {lead.industry && <span>{lead.industry} · </span>}
                  {lead.source?.name && <span>{lead.source.name} · </span>}
                  <span>Created {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                Actions
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!lead.phone}
                  onClick={async () => {
                    if (lead.phone) {
                      window.location.href = `tel:${lead.phone}`;
                      await logOutreach("CALL", "Call outreach initiated");
                    }
                  }}
                  className="h-8 text-xs border-border/40 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] font-semibold flex items-center gap-1.5 transition-all active:scale-95 duration-100"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/75" />
                  Call
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={!lead.phone}
                  onClick={async () => {
                    if (lead.phone) {
                      const clean = lead.phone.replace(/\D/g, "");
                      window.open(`https://wa.me/${clean}`, "_blank");
                      await logOutreach("WHATSAPP", "WhatsApp outreach initiated");
                    }
                  }}
                  className="h-8 text-xs border-border/40 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] font-semibold flex items-center gap-1.5 transition-all active:scale-95 duration-100"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/75" />
                  WhatsApp
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={!lead.email}
                  onClick={async () => {
                    if (lead.email) {
                      window.location.href = `mailto:${lead.email}`;
                      await logOutreach("EMAIL", "Email outreach initiated");
                    }
                  }}
                  className="h-8 text-xs border-border/40 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] font-semibold flex items-center gap-1.5 transition-all active:scale-95 duration-100"
                >
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/75" />
                  Email
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={onNoteClick}
                  className="h-8 text-xs border-border/40 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] font-semibold flex items-center gap-1.5 transition-all active:scale-95 duration-100"
                >
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground/75" />
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column (4/12 width): Recommended Action */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-border/10 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-center">
          <div className="rounded-xl border border-border/40 p-4 bg-linear-to-br from-[#8B5CF6]/5 to-transparent space-y-3 shadow-xs">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5 select-none">
              <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              Recommended Action
            </span>
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-foreground leading-tight">
                {recActionTitle}
              </h5>
              <p className="text-[10px] text-muted-foreground/80 leading-normal">
                {recActionDesc}
              </p>
            </div>
            {recActionBtn && (
              <Button
                size="sm"
                onClick={recActionFn}
                className="w-full h-8 text-[11px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/20 rounded-lg transition-all"
              >
                {recActionBtn}
              </Button>
            )}
          </div>
        </div>

        {/* Right Column (3/12 width): Completeness Ring, Stage Info & Advance Button */}
        <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-border/10 pt-4 lg:pt-0 lg:pl-6 flex flex-col items-center justify-between space-y-4">
          {/* Neumorphic Circular Progress Completeness Widget - Center/Top aligned */}
          <div className="flex flex-col items-center justify-center shrink-0 w-full relative group">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 select-none">
              Completeness
            </span>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="completenessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" /> {/* purple-400 */}
                    <stop offset="100%" stopColor="#8B5CF6" /> {/* purple-500 */}
                  </linearGradient>
                  {/* Subtle blur for realistic glow effect */}
                  <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Drop shadow for central circle */}
                  <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.12" />
                  </filter>
                </defs>

                {/* Beveled background ring path */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-muted/15 fill-none"
                  strokeWidth={strokeWidth}
                />

                {/* Outer shadow / track background */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-muted/5 fill-none"
                  strokeWidth="8"
                />

                {/* Tick marks along the track circumference (12 dots) */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x = 50 + 38 * Math.cos(angle);
                  const y = 50 + 38 * Math.sin(angle);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="1.2"
                      className="fill-muted-foreground/35"
                    />
                  );
                })}

                {/* Active progress ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#completenessGradient)"
                  className="fill-none transition-all duration-500 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ filter: "url(#glow-purple)" }}
                />

                {/* Inner circle overlay */}
                <circle
                  cx="50"
                  cy="50"
                  r="24"
                  className="fill-background dark:fill-card stroke-border/10"
                  strokeWidth="0.5"
                  style={{ filter: "url(#inner-shadow)" }}
                />
              </svg>

              {/* Central Text overlay */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-foreground tracking-tighter leading-none flex items-start">
                  {completeness}
                  <span className="text-[10px] font-bold text-muted-foreground mt-0.5">%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Under completeness: Current Stage & Next Stage */}
          <div className="w-full space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                  Current Stage
                </span>
                <span className="text-sm font-medium text-foreground/80 block mt-0.5">
                  {currentStage?.label || "No Stage"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block">
                  Next Stage
                </span>
                <span className="text-sm font-medium text-[#8B5CF6] block mt-0.5">
                  {nextStage?.label || "None (Final)"}
                </span>
              </div>
            </div>

            {/* Advance Button (under Next Stage / Business Review) */}
            <div className="pt-1">
              {nextStage ? (
                <Button
                  size="sm"
                  disabled={savingStage || progressPercent < 100}
                  onClick={() => onStageClick(nextStage.id)}
                  className={cn(
                    "h-10 px-4 text-xs font-bold shadow-2xs border transition-all duration-200 w-full",
                    progressPercent === 100
                      ? "bg-[#8B5CF6] hover:bg-[#7c4dff] text-white border-[#8B5CF6]/30 hover:shadow-violet-500/10 active:scale-95"
                      : "bg-muted text-muted-foreground border-border/30 cursor-not-allowed opacity-60"
                  )}
                >
                  {savingStage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : progressPercent === 100 ? (
                    <>
                      Advance to {nextStage.label}
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 mr-1.5" />
                      Cannot Advance
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-xl text-center w-full">
                  🎉 Final Stage Reached
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
