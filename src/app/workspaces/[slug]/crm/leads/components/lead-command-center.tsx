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
import { ImageCropperModal } from "@/components/ui/image-cropper";
import {
  getStep1Complete,
  getStep2Complete,
  getStep3Complete,
  getStep4Complete,
} from "./wizard-helpers";

const TERMINAL_STAGE_NAMES = ["WON", "LOST", "ON_HOLD"];

interface LeadCommandCenterProps {
  lead: Lead;
  stages: OptionStage[];
  onStageClick: (stageId: string) => void;
  savingStage?: boolean;
  onNoteClick: () => void;
  onLeadUpdate?: (lead: Lead) => void;
  onStepClick?: (step: number) => void;
  currentStep?: number;
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
      { label: "ICP Fit Set", isFilled: lead.qualIcpFit > 0 },
      { label: "Budget Set", isFilled: lead.qualBudgetLikelihood > 0 },
      { label: "Authority Set", isFilled: lead.qualDecisionMakerAccess > 0 },
      { label: "Need Set", isFilled: lead.qualNeed > 0 },
      { label: "Timeline Set", isFilled: lead.qualTimeline > 0 },
    ];
  }
  
  if (name.includes("CLASSIFICATION")) {
    return [
      { label: "Classification Set", isFilled: !!(lead.classification) },
      { label: "Services Selected", isFilled: !!(lead.services && lead.services.length > 0) },
      { label: "Expected Value", isFilled: !!lead.expectedValue },
    ];
  }
  
  if (name.includes("NURTURING")) {
    return [
      { label: "Nurturing Status", isFilled: !!(lead.nurturingStatus) },
      { label: "Follow-up Scheduled", isFilled: !!(lead.nextFollowUpAt) },
    ];
  }

  if (name.includes("MEETING")) {
    return [
      { label: "Business Review Complete", isFilled: !!(lead.businessAge || lead.teamSize) && (lead.painPoints?.length ?? 0) > 0 },
      { label: "Qualification Complete", isFilled: !!(lead.qualIcpFit > 0 && lead.qualBudgetLikelihood > 0 && lead.qualDecisionMakerAccess > 0 && lead.qualNeed > 0 && lead.qualTimeline > 0) },
      { label: "Pain Point Identified", isFilled: (lead.painPoints?.length ?? 0) > 0 },
      { label: "Outreach Performed", isFilled: !!lead.lastContactAt || !!lead.nextFollowUpAt || !!lead.lastActivityAt },
      { label: "Lead Classified HOT", isFilled: lead.classification === "HOT" },
      { label: "Decision Maker Identified", isFilled: lead.qualDecisionMakerAccess > 0 },
    ];
  }

  return [];
}

function calculateCompleteness(lead: Lead) {
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
    lead.qualIcpFit > 0 ? "filled" : null,
    lead.qualBudgetLikelihood > 0 ? "filled" : null,
    lead.qualDecisionMakerAccess > 0 ? "filled" : null,
    lead.qualNeed > 0 ? "filled" : null,
    lead.qualTimeline > 0 ? "filled" : null,
    lead.classification ? "filled" : null,
    lead.services && lead.services.length > 0 ? "filled" : null,
    lead.priority,
    lead.expectedValue,
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
  currentStep,
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
  const allWorkflowStages = stages
    .filter((s) => !TERMINAL_STAGE_NAMES.includes(s.name) && s.name !== "QUALIFICATION_AUDIT")
    .filter((s, idx, arr) => arr.findIndex((x) => x.name === s.name) === idx);

  // ── Compute the EFFECTIVE current stage from first-incomplete-stage logic ──
  // This ensures that editing an earlier step never regresses the displayed stage.
  // The stage only moves forward (or stays at the last stage if all are complete).
  const needsNurturing = lead.classification === "WARM" || lead.classification === "COLD";

  const s1Complete = getStep1Complete(lead);
  const s2Complete = getStep2Complete(lead);
  const s3Complete = getStep3Complete(lead);
  const s4Complete = getStep4Complete(lead);
  const s5Complete = needsNurturing ? !!(lead.nurturingStatus) : true;

  let effectiveStageName: string;
  if (!s1Complete) {
    effectiveStageName = "LEAD_INTAKE";
  } else if (!s2Complete) {
    effectiveStageName = "BUSINESS_REVIEW";
  } else if (!s3Complete) {
    effectiveStageName = "LEAD_QUALIFICATION";
  } else if (!s4Complete) {
    effectiveStageName = "LEAD_CLASSIFICATION";
  } else if (needsNurturing && !s5Complete) {
    effectiveStageName = "LEAD_NURTURING";
  } else {
    effectiveStageName = "MEETING";
  }

  const currentStage = allWorkflowStages.find((s) => s.name === effectiveStageName)
    ?? allWorkflowStages.find((s) => s.id === lead.stageId)
    ?? allWorkflowStages[0];

  // Determine which stages are visible in breadcrumb:
  // Nurturing is only shown if needed (WARM or COLD classification)
  const workflowStages = allWorkflowStages.filter((s) => {
    if ((s.name || "").toUpperCase().includes("NURTURING")) {
      return needsNurturing;
    }
    return true;
  });

  // Requirements checklist for effective current stage
  const checklist = lead && currentStage
    ? getChecklistForStage(currentStage.name, lead)
    : [];

  const completedItems = checklist.filter((item) => item.isFilled);
  const missingItems = checklist.filter((item) => !item.isFilled);

  // Smart recommended action computation
  const currentStageName = currentStage?.name || "";

  // Next stage routing logic:
  // - If effective stage is MEETING (all complete) → no next stage
  // - Otherwise follow sequential order in workflowStages
  let nextStage: typeof workflowStages[0] | null = null;
  const filteredCurrentIndex = workflowStages.findIndex((s) => s.name === effectiveStageName);
  if (filteredCurrentIndex >= 0 && filteredCurrentIndex < workflowStages.length - 1) {
    nextStage = workflowStages[filteredCurrentIndex + 1];
  }

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
        const firstMissing = missingItems[0].label;
        let targetStep = 1;
        if (firstMissing.includes("Business Review")) targetStep = 2;
        else if (firstMissing.includes("Qualification")) targetStep = 3;
        else if (firstMissing.includes("Pain Point")) targetStep = 2;
        else if (firstMissing.includes("Outreach")) targetStep = 5;
        else if (firstMissing.includes("HOT")) targetStep = 4;
        else if (firstMissing.includes("Decision Maker")) targetStep = 3;
        else {
          const name = currentStageName.toUpperCase();
          if (name.includes("REVIEW")) targetStep = 2;
          else if (name.includes("QUALIFICATION") && !name.includes("AUDIT")) targetStep = 3;
          else if (name.includes("CLASSIFICATION")) targetStep = 4;
          else if (name.includes("NURTURING")) targetStep = 5;
          else if (name.includes("MEETING")) targetStep = 6;
        }
        onStepClick(targetStep);
        const stepper = document.getElementById("lead-wizard-stepper");
        if (stepper) {
          stepper.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
  } else if (nextStage) {
    recActionTitle = "Advance Stage";
    recActionDesc = `Requirements for ${currentStage?.label} are complete. Use the advance button at the bottom of the form to proceed.`;
    recActionBtn = "";
    recActionFn = () => {};
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
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
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
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size for raw upload is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadCroppedAvatar = async (croppedFile: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", croppedFile);

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
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className="relative group cursor-pointer shrink-0"
              >
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
                    <div
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 text-[8px] font-bold text-white transition-opacity duration-150 pointer-events-none"
                    >
                      <Camera className="h-3.5 w-3.5 text-white" />
                      <span>Update</span>
                    </div>
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
              <ImageCropperModal
                isOpen={cropperOpen}
                onClose={() => {
                  setCropperOpen(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                imageSrc={cropperSrc}
                cropShape="square"
                title="Crop Lead Profile Picture"
                onCropComplete={uploadCroppedAvatar}
              />

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

          {/* Under completeness: Current Stage & Next Stage (computed from first-incomplete-stage logic) */}
          <div className="w-full space-y-3 pt-2">
            <div className={cn("grid gap-4", effectiveStageName === "MEETING" ? "grid-cols-1 text-center" : "grid-cols-2")}>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 block">
                  Current Stage
                </span>
                <span className="text-[11px] font-semibold text-foreground/80 block mt-0.5 whitespace-nowrap truncate">
                  {effectiveStageName === "MEETING" ? "Meeting Readiness" : (currentStage?.label || "No Stage")}
                </span>
              </div>
              {effectiveStageName !== "MEETING" && (
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50 block">
                    Next Stage
                  </span>
                  <span className="text-[11px] font-semibold text-[#8B5CF6] block mt-0.5 whitespace-nowrap truncate">
                    {nextStage?.label || "None (Final)"}
                  </span>
                </div>
              )}
            </div>

            {/* Advance button removed per user request */}
          </div>
        </div>
      </div>
    </div>
  );
}
