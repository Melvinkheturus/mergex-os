"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  Trophy,
  Building2,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Target,
  Calendar,
  FileText,
  Plus,
  Clock,
  CheckCircle,
  Handshake,
  TrendingUp,
  Edit2,
  Video,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
  XCircle,
  Lock,
  ArrowRight,
  Save,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { formatCurrency, relativeTime, getStatus } from "../components/types";

// Operational Cards from Lead Operations
import { SlaCard } from "../../leads/components/crm/operational-layers/sla-card";
import { EscalationCard } from "../../leads/components/crm/operational-layers/escalation-card";
import { TasksCard } from "../../leads/components/crm/operational-layers/tasks-card";
import { NotesCard } from "../../leads/components/crm/operational-layers/notes-card";
import { TimelineCard } from "../../leads/components/crm/operational-layers/timeline-card";
import { KnowledgeCaptureCard } from "../../leads/components/crm/operational-layers/knowledge-capture-card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeetingRecord {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  mode: string;
  meetingUrl: string | null;
  summary: string | null;
  outcome: string | null;
  status: string;
  organizer: { firstName: string | null; lastName: string | null } | null;
}

interface ProposalRecord {
  id: string;
  proposalNumber: string;
  title: string;
  value: string;
  status: string;
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
}

interface Activity {
  id: string;
  type: string;
  content: string;
  performedAt: string;
  user: { firstName: string | null; lastName: string | null } | null;
}

interface OpportunityDetail {
  id: string;
  leadNumber: string | null;
  companyName: string;
  contactPerson: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  expectedValue: string | null;
  services: string[];
  temperature: string;
  classification: string | null;
  qualScore: number;
  avatarUrl: string | null;
  winLossStatus: string | null;
  winLossReason: string | null;
  winLossNotes: string | null;
  lastActivityAt: string | null;
  updatedAt: string;
  createdAt: string;
  decisionMaker: string | null;
  influencer: string | null;
  champion: string | null;
  valueProposition: string | null;
  painPoints: string[];
  opportunities: string[];
  ownerId: string | null;
  owner: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null } | null;
  stage: { id: string; name: string; label: string; color: string | null } | null;
  opportunityNotes: string | null;
  currentSituation: string | null;
  nextFollowUpAt: string | null;
  nextActionDate: string | null;
}

// ─── Helper InfoRow ──────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <div className="h-6 w-6 rounded-md bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-xs text-foreground font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Section Container ────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children, className }: { title: string; icon: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/30 bg-card/30 overflow-hidden", className)}>
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/20">
        <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-violet-500" />
        </div>
        <span className="text-xs font-bold text-foreground">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const MEETING_MODE_LABELS: Record<string, string> = {
  GOOGLE_MEET: "Google Meet",
  ZOOM: "Zoom",
  PHONE: "Phone Call",
  IN_PERSON: "In Person",
};

const PROPOSAL_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10" },
  SENT: { label: "Sent", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  NEGOTIATION: { label: "Negotiation", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  APPROVED: { label: "Approved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  REJECTED: { label: "Rejected", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
};

// ─── Reopen & Reactivation Card ──────────────────────────────────────────────

function OpportunityReopenCard({
  detail,
  onReopen,
}: {
  detail: OpportunityDetail;
  onReopen: (targetStage: "MEETING" | "PROPOSAL") => Promise<void>;
}) {
  const [reopening, setReopening] = useState(false);
  const isLost = detail.winLossStatus === "LOST";
  const isStalled = getStatus(detail) === "stalled";
  const isPaused = detail.classification === "ARCHIVE" || detail.classification === "COLD";

  if (!isLost && !isStalled && !isPaused) return null;

  return (
    <CardContainer title="Opportunity Reactivation" icon={RefreshCcw} borderStyle="border-violet-500/20">
      <p className="text-[11px] text-muted-foreground leading-normal">
        This opportunity is currently {isLost ? "Lost" : isStalled ? "Stalled" : "Paused/Cold"}. Reactivate it to resume conversion.
      </p>
      <div className="grid grid-cols-1 gap-2 pt-2">
        <Button
          size="sm"
          disabled={reopening}
          onClick={async () => {
            setReopening(true);
            await onReopen("MEETING");
            setReopening(false);
          }}
          className="w-full h-8 text-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold"
        >
          Reopen to Discovery
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={reopening}
          onClick={async () => {
            setReopening(true);
            await onReopen("PROPOSAL");
            setReopening(false);
          }}
          className="w-full h-8 text-[10px] border-border/40 font-bold hover:bg-muted"
        >
          Reopen to Proposal
        </Button>
      </div>
    </CardContainer>
  );
}

// ─── Lost Reason Card ────────────────────────────────────────────────────────

function LostReasonCard({
  detail,
  onSaveReason,
}: {
  detail: OpportunityDetail;
  onSaveReason: (reason: string, notes: string) => Promise<void>;
}) {
  const [reason, setReason] = useState(detail.winLossReason || "Budget");
  const [notes, setNotes] = useState(detail.winLossNotes || "");
  const [saving, setSaving] = useState(false);

  if (detail.winLossStatus !== "LOST") return null;

  const reasons = ["Budget", "Competitor", "No Decision", "Timeline", "Internal Constraints", "Other"];

  return (
    <CardContainer title="Lost Reason Details" icon={AlertCircle} borderStyle="border-rose-500/20">
      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <Label className="text-muted-foreground font-semibold">Primary Reason</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {reasons.map(r => (
                <SelectItem key={r} value={r} className="text-xs rounded-lg">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground font-semibold">Lost Notes</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500/30 resize-none"
            placeholder="Describe why the deal was lost..."
          />
        </div>
        <Button
          size="sm"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSaveReason(reason, notes);
            setSaving(false);
          }}
          className="w-full h-8 text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold"
        >
          {saving ? "Saving..." : "Save Lost Details"}
        </Button>
      </div>
    </CardContainer>
  );
}

// ─── Simple Helper wrapper Card ──────────────────────────────────────────────

function CardContainer({ title, icon: Icon, borderStyle, children }: { title: string; icon: React.ElementType; borderStyle?: string; children: React.ReactNode }) {
  return (
    <div className={cn("border shadow-xs rounded-2xl bg-card p-4", borderStyle || "border-border/40")}>
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border/10">
        <Icon className="h-3.5 w-3.5 text-[#8B5CF6]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Main Opportunity Workspace Component ─────────────────────────────────────

export function OpportunityDetailClient({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [detail, setDetail] = useState<OpportunityDetail | null>(null);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStage, setSavingStage] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  // Step 1: 6 Discovery Meeting
  const [businessGoals, setBusinessGoals] = useState("");
  const [currentSituation, setCurrentSituation] = useState("");
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [budgetDiscussion, setBudgetDiscussion] = useState("Not Discussed");
  const [timelineDiscussion, setTimelineDiscussion] = useState("Not Discussed");
  const [stakeholders, setStakeholders] = useState("");
  const [decisionMaker, setDecisionMaker] = useState("");
  const [champion, setChampion] = useState("");
  const [risks, setRisks] = useState("");
  const [discoveryNotes, setDiscoveryNotes] = useState("");

  // Step 2: 7 Solution Planning
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [valueProposition, setValueProposition] = useState("");
  const [feasibilityReview, setFeasibilityReview] = useState("");
  const [executionRisks, setExecutionRisks] = useState("");
  const [internalDependencies, setInternalDependencies] = useState("");
  const [estimatedEffort, setEstimatedEffort] = useState("Medium");
  const [deliveryConfidence, setDeliveryConfidence] = useState("Medium");
  const [planningStatus, setPlanningStatus] = useState("Proceed");

  // Step 3: 8 Proposal builder state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: "",
    proposalNumber: "",
    value: "",
    status: "DRAFT",
    notes: "",
  });
  const [savingProposal, setSavingProposal] = useState(false);

  // Step 4: 9 Agreement & Closure
  const [negotiationNotes, setNegotiationNotes] = useState("");
  const [ndaSigned, setNdaSigned] = useState(false);
  const [proposalSigned, setProposalSigned] = useState(false);
  const [finalAgreement, setFinalAgreement] = useState("");
  const [influencer, setInfluencer] = useState("");

  // Step 5: 10 Engagement Handoff
  const [projectType, setProjectType] = useState("Retainer");
  const [assignedEM, setAssignedEM] = useState("");
  const [handoffNotes, setHandoffNotes] = useState("");
  const [clientExpectations, setClientExpectations] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [deliveryRisksHandoff, setDeliveryRisksHandoff] = useState("");
  const [convertingToClient, setConvertingToClient] = useState(false);

  // Sidebar refresh trigger helper
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Load all workspace data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadRes, meetingsRes, proposalsRes, activitiesRes, optionsRes] = await Promise.all([
        fetch(`/api/crm/leads/${opportunityId}`),
        fetch(`/api/crm/leads/${opportunityId}/meetings`),
        fetch(`/api/crm/leads/${opportunityId}/proposals`),
        fetch(`/api/crm/leads/${opportunityId}/activities`),
        fetch(`/api/crm/options?brandSlug=${slug}`),
      ]);

      if (!leadRes.ok) throw new Error("Not found");

      const leadData = await leadRes.json();
      setDetail({
        ...leadData,
        owner: leadData.User || null,
        stage: leadData.LeadStage || null,
      });

      if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      if (proposalsRes.ok) setProposals(await proposalsRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
      
      if (optionsRes.ok) {
        const optData = await optionsRes.json();
        setOwners(optData.owners || []);
        setStages(optData.stages || []);
      }
    } catch {
      toast.error("Failed to load opportunity");
      router.push(`/workspaces/${slug}/crm/sales-conversion`);
    } finally {
      setLoading(false);
    }
  }, [opportunityId, slug, router]);

  useEffect(() => {
    const t = setTimeout(loadData, 0);
    return () => clearTimeout(t);
  }, [loadData]);

  // Sync details to form states when loaded
  useEffect(() => {
    if (!detail) return;
    try {
      let parsed: Record<string, any> = {};
      if (detail.opportunityNotes) {
        const trimmed = detail.opportunityNotes.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            parsed = JSON.parse(trimmed);
          } catch (e) {
            console.error("Failed to parse opportunityNotes JSON", e);
            parsed = { discoveryNotes: detail.opportunityNotes };
          }
        } else {
          parsed = { discoveryNotes: detail.opportunityNotes };
        }
      }
      
      // Step 1
      setBusinessGoals(parsed.businessGoals || "");
      setCurrentSituation(detail.currentSituation || parsed.currentSituation || "");
      setPainPoints(detail.painPoints || parsed.painPoints || []);
      setDesiredOutcome(parsed.desiredOutcome || "");
      setBudgetDiscussion(parsed.budgetDiscussion || "Not Discussed");
      setTimelineDiscussion(parsed.timelineDiscussion || "Not Discussed");
      setStakeholders(parsed.stakeholders || "");
      setDecisionMaker(detail.decisionMaker || parsed.decisionMaker || "");
      setChampion(detail.champion || parsed.champion || "");
      setRisks(parsed.risks || "");
      setDiscoveryNotes(parsed.discoveryNotes || "");

      // Step 2
      setSelectedServices(detail.services || parsed.selectedServices || []);
      setValueProposition(detail.valueProposition || parsed.valueProposition || "");
      setFeasibilityReview(parsed.feasibilityReview || "");
      setExecutionRisks(parsed.executionRisks || "");
      setInternalDependencies(parsed.internalDependencies || "");
      setEstimatedEffort(parsed.estimatedEffort || "Medium");
      setDeliveryConfidence(parsed.deliveryConfidence || "Medium");
      setPlanningStatus(parsed.planningStatus || "Proceed");

      // Step 4
      setNegotiationNotes(parsed.negotiationNotes || "");
      setNdaSigned(parsed.ndaSigned || false);
      setProposalSigned(parsed.proposalSigned || false);
      setFinalAgreement(parsed.finalAgreement || "");
      setInfluencer(detail.influencer || parsed.influencer || "");

      // Step 5
      setProjectType(parsed.projectType || "Retainer");
      setAssignedEM(parsed.assignedEM || "");
      setHandoffNotes(parsed.handoffNotes || "");
      setClientExpectations(parsed.clientExpectations || "");
      setSuccessCriteria(parsed.successCriteria || "");
      setDeliveryRisksHandoff(parsed.deliveryRisksHandoff || "");

    } catch (e) {
      console.error("Failed to parse opportunityNotes JSON", e);
    }
  }, [detail]);

  // API patch logic
  const patchOpportunity = async (payload: Record<string, any>) => {
    const res = await fetch(`/api/crm/leads/${opportunityId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save");
    const updated = await res.json();
    setDetail({
      ...updated,
      owner: updated.User || null,
      stage: updated.LeadStage || null,
    });
    window.dispatchEvent(new CustomEvent("crm-activity-logged"));
    triggerRefresh();
    return updated;
  };

  // Reopen Logic handler
  const handleReopen = async (targetStageName: "MEETING" | "PROPOSAL") => {
    try {
      const stage = stages.find(s => s.name === targetStageName);
      if (!stage) throw new Error("Target stage not found");

      await patchOpportunity({
        winLossStatus: null,
        winLossReason: null,
        winLossNotes: null,
        classification: "HOT",
        temperature: "HOT",
        stageId: stage.id,
      });

      const targetStep = targetStageName === "MEETING" ? 1 : 3;
      setCurrentStep(targetStep);
      toast.success(`Opportunity reopened to ${stage.label}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to reopen opportunity");
    }
  };

  // Lost Reason Handler
  const handleSaveLostReason = async (reason: string, notes: string) => {
    try {
      await patchOpportunity({
        winLossReason: reason,
        winLossNotes: notes,
      });
      toast.success("Lost reason details saved");
    } catch {
      toast.error("Failed to save lost reason details");
    }
  };

  // Save stage form content
  const handleSaveWorkspace = async () => {
    if (!detail) return;
    setSavingStage(true);
    try {
      let currentNotes: Record<string, any> = {};
      if (detail.opportunityNotes) {
        const trimmed = detail.opportunityNotes.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            currentNotes = JSON.parse(trimmed);
          } catch {}
        } else {
          currentNotes = { discoveryNotes: detail.opportunityNotes };
        }
      }

      let payload: Record<string, any> = {};

      if (currentStep === 1) {
        const mergedNotes = {
          ...currentNotes,
          businessGoals,
          desiredOutcome,
          budgetDiscussion,
          timelineDiscussion,
          stakeholders,
          risks,
          discoveryNotes,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
          currentSituation,
          painPoints,
          decisionMaker,
          champion,
        };
      } else if (currentStep === 2) {
        const mergedNotes = {
          ...currentNotes,
          feasibilityReview,
          executionRisks,
          internalDependencies,
          estimatedEffort,
          deliveryConfidence,
          planningStatus,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
          services: selectedServices,
          valueProposition,
        };
      } else if (currentStep === 4) {
        const mergedNotes = {
          ...currentNotes,
          negotiationNotes,
          ndaSigned,
          proposalSigned,
          finalAgreement,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
          influencer,
        };
      } else if (currentStep === 5) {
        const mergedNotes = {
          ...currentNotes,
          projectType,
          assignedEM,
          handoffNotes,
          clientExpectations,
          successCriteria,
          deliveryRisksHandoff,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
        };
      }

      await patchOpportunity(payload);
      toast.success("Workspace saved successfully");
    } catch {
      toast.error("Failed to save stage details");
    } finally {
      setSavingStage(false);
    }
  };

  // Stepper advance stage transition
  const handleAdvanceStage = async () => {
    if (!detail) return;
    setSavingStage(true);
    try {
      let targetStageName = "";
      let targetStep = currentStep;

      if (currentStep === 1) {
        targetStageName = "PROPOSAL";
        targetStep = 2;
      } else if (currentStep === 2) {
        targetStageName = "PROPOSAL";
        targetStep = 3;
      } else if (currentStep === 3) {
        targetStageName = "DOCUMENTATION";
        targetStep = 4;
      } else if (currentStep === 4) {
        targetStageName = "ENGAGEMENT_MANAGER_ASSIGNED";
        targetStep = 5;
      }

      if (targetStageName) {
        const stageObj = stages.find(s => s.name === targetStageName);
        if (stageObj) {
          await patchOpportunity({ stageId: stageObj.id });
        }
      }

      setCurrentStep(targetStep);
      toast.success("Advanced to next stage!");
    } catch {
      toast.error("Failed to advance stage");
    } finally {
      setSavingStage(false);
    }
  };

  // Convert to Client flow
  const handleConvertToClient = async () => {
    if (!assignedEM) {
      toast.error("Please select an Engagement Manager");
      return;
    }
    setConvertingToClient(true);
    try {
      const res = await fetch(`/api/crm/leads/${detail?.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementManagerId: assignedEM }),
      });
      if (!res.ok) throw new Error("Failed to convert opportunity to client");
      toast.success("Opportunity successfully converted to Client! 🎉");
      router.push(`/workspaces/${slug}/crm/sales-conversion`);
    } catch (err: any) {
      toast.error(err.message || "Failed to convert");
    } finally {
      setConvertingToClient(false);
    }
  };

  // Win/Loss Closures
  const handleCloseDeal = async (status: "WON" | "LOST") => {
    try {
      await patchOpportunity({
        winLossStatus: status,
        winLossReason: status === "WON" ? "Closed Won" : "Budget",
      });
      toast.success(`Deal marked as ${status}`);
    } catch {
      toast.error("Failed to close deal");
    }
  };

  // Discovery Meeting Scheduler
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    scheduledAt: "",
    duration: "60",
    mode: "GOOGLE_MEET",
    meetingUrl: "",
  });
  const [editMeetingForm, setEditMeetingForm] = useState({
    title: "",
    scheduledAt: "",
    duration: "60",
    mode: "GOOGLE_MEET",
    meetingUrl: "",
    status: "SCHEDULED",
  });

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      const target = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      const parsed = new URL(target);
      return parsed.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const handleAddMeeting = async () => {
    if (!meetingForm.title || !meetingForm.scheduledAt) {
      toast.error("Meeting title and date/time are required");
      return;
    }
    if (meetingForm.meetingUrl && !isValidUrl(meetingForm.meetingUrl)) {
      toast.error("Please enter a valid meeting link URL");
      return;
    }
    setSavingMeeting(true);
    try {
      const res = await fetch(`/api/crm/leads/${opportunityId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingForm.title,
          scheduledAt: meetingForm.scheduledAt,
          duration: parseInt(meetingForm.duration),
          mode: meetingForm.mode,
          meetingUrl: meetingForm.meetingUrl || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule meeting");
      toast.success("Meeting scheduled successfully");
      setMeetingForm({ title: "", scheduledAt: "", duration: "60", mode: "GOOGLE_MEET", meetingUrl: "" });
      setShowScheduleForm(false);
      loadData();
    } catch {
      toast.error("Failed to schedule meeting");
    } finally {
      setSavingMeeting(false);
    }
  };

  const handleUpdateMeeting = async (meetingId: string) => {
    if (!editMeetingForm.title || !editMeetingForm.scheduledAt) {
      toast.error("Meeting title and date/time are required");
      return;
    }
    if (editMeetingForm.meetingUrl && !isValidUrl(editMeetingForm.meetingUrl)) {
      toast.error("Please enter a valid meeting link URL");
      return;
    }
    setSavingMeeting(true);
    try {
      const res = await fetch(`/api/crm/meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editMeetingForm.title,
          scheduledAt: editMeetingForm.scheduledAt,
          duration: parseInt(editMeetingForm.duration),
          mode: editMeetingForm.mode,
          meetingUrl: editMeetingForm.meetingUrl || null,
          status: editMeetingForm.status,
        }),
      });
      if (!res.ok) throw new Error("Failed to update meeting");
      toast.success("Meeting updated successfully");
      setEditingMeetingId(null);
      loadData();
    } catch {
      toast.error("Failed to update meeting");
    } finally {
      setSavingMeeting(false);
    }
  };

  // Proposal Creation
  const handleAddProposal = async () => {
    if (!proposalForm.title || !proposalForm.value) {
      toast.error("Title and value are required");
      return;
    }
    setSavingProposal(true);
    try {
      const res = await fetch(`/api/crm/leads/${opportunityId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: proposalForm.title,
          proposalNumber: proposalForm.proposalNumber || `PROP-${Date.now().toString().slice(-6)}`,
          value: parseFloat(proposalForm.value),
          status: proposalForm.status,
          notes: proposalForm.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create proposal");
      toast.success("Proposal created successfully");
      setShowProposalForm(false);
      setProposalForm({ title: "", proposalNumber: "", value: "", status: "DRAFT", notes: "" });
      loadData();
    } catch {
      toast.error("Failed to create proposal");
    } finally {
      setSavingProposal(false);
    }
  };

  // Proposal status update
  const handleUpdateProposalStatus = async (proposalId: string, status: string) => {
    try {
      const res = await fetch(`/api/crm/proposals/${proposalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Proposal status updated to ${status}`);
      loadData();
    } catch {
      toast.error("Failed to update proposal status");
    }
  };

  // Opportunity Health Calculation
  const checkDiscovery = meetings.some(m => m.status === "COMPLETED" || m.status === "SCHEDULED");
  const checkDM = !!decisionMaker;
  const checkProposal = proposals.some(p => p.status === "SENT" || p.status === "NEGOTIATION" || p.status === "APPROVED" || p.status === "REJECTED");
  const checkResponsive = (() => {
    if (!detail?.lastActivityAt) return false;
    const diff = Date.now() - new Date(detail.lastActivityAt).getTime();
    return diff < 10 * 86400000;
  })();
  const checkTimeline = !!(detail?.nextFollowUpAt || detail?.nextActionDate);

  const healthScore = [
    checkDiscovery,
    checkDM,
    checkProposal,
    checkResponsive,
    checkTimeline
  ].filter(Boolean).length * 20;

  const healthChecks = [
    { label: "Discovery Complete", isComplete: checkDiscovery },
    { label: "Decision Maker Identified", isComplete: checkDM },
    { label: "Proposal Sent", isComplete: checkProposal },
    { label: "Client Responsive", isComplete: checkResponsive },
    { label: "Timeline Confirmed", isComplete: checkTimeline },
  ];

  // Steps configuration
  const steps = [
    {
      id: 1,
      label: "Discovery Meeting",
      sublabel: "Conduct discovery and document goals",
      icon: Users,
      isComplete: checkDiscovery && !!businessGoals && !!desiredOutcome,
      isLocked: false,
    },
    {
      id: 2,
      label: "Solution Planning",
      sublabel: "Plan solution options & execution feasibility",
      icon: SlidersHorizontal,
      isComplete: selectedServices.length > 0 && !!feasibilityReview && !!estimatedEffort,
      isLocked: !(checkDiscovery && !!businessGoals && !!desiredOutcome),
    },
    {
      id: 3,
      label: "Proposal & Commercials",
      sublabel: "Issue formal commercials & track proposal versions",
      icon: FileText,
      isComplete: proposals.length > 0,
      isLocked: !(selectedServices.length > 0 && !!feasibilityReview),
    },
    {
      id: 4,
      label: "Agreement & Closure",
      sublabel: "Finalize agreement terms & obtain approval",
      icon: Handshake,
      isComplete: proposals.some(p => p.status === "APPROVED") || detail?.winLossStatus === "WON",
      isLocked: proposals.length === 0,
    },
    {
      id: 5,
      label: "Engagement Handoff",
      sublabel: "Handover account context & assign EM",
      icon: Trophy,
      isComplete: detail?.winLossStatus === "WON",
      isLocked: !proposals.some(p => p.status === "APPROVED") && detail?.winLossStatus !== "WON",
    },
  ];

  // Contextual recommended action
  let recommendedAction = null;
  if (currentStep === 1 && (!businessGoals || !desiredOutcome)) {
    recommendedAction = {
      title: "Discovery Details Missing",
      desc: "Complete meeting details and goals to unlock Solution Planning.",
      btnLabel: "Focus Discovery",
      action: () => setCurrentStep(1),
    };
  } else if (currentStep === 2 && !selectedServices.length) {
    recommendedAction = {
      title: "Solution Details Incomplete",
      desc: "Define solutions and feasibility review to prepare commercial proposals.",
      btnLabel: "Define Solution",
      action: () => setCurrentStep(2),
    };
  } else if (currentStep === 3 && proposals.length === 0) {
    recommendedAction = {
      title: "Proposal Creation Pending",
      desc: "Create and send the first proposal version to initiate commercials.",
      btnLabel: "Create Proposal",
      action: () => setCurrentStep(3),
    };
  } else if (currentStep === 4 && !proposals.some(p => p.status === "APPROVED")) {
    recommendedAction = {
      title: "Proposal Approval Pending",
      desc: "Track client proposal feedback. Obtain approval to unlock Agreement & Closure.",
      btnLabel: "Track Proposal",
      action: () => setCurrentStep(3),
    };
  } else if (currentStep === 5 && !assignedEM) {
    recommendedAction = {
      title: "Handoff Context Missing",
      desc: "Assign an Engagement Manager and define expectations to convert to client.",
      btnLabel: "Complete Handoff",
      action: () => setCurrentStep(5),
    };
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const ownerName = detail.owner
    ? `${detail.owner.firstName || ""} ${detail.owner.lastName || ""}`.trim()
    : "—";
  const activeStepConfig = steps.find(s => s.id === currentStep);
  const showAdvance = !activeStepConfig?.isLocked && activeStepConfig?.isComplete && currentStep < 5;

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/workspaces/${slug}/crm/sales-conversion`)}
          className="text-muted-foreground hover:text-foreground -ml-2 h-8 text-xs font-semibold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Sales Conversion
        </Button>

        <div className="flex items-center gap-2">
          {detail.winLossStatus ? (
            <Badge className={cn(
              "border px-2.5 py-1 text-xs font-bold",
              detail.winLossStatus === "WON"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}>
              {detail.winLossStatus === "WON" ? (
                <><Trophy className="h-3.5 w-3.5 mr-1" /> Won Deal</>
              ) : (
                <><XCircle className="h-3.5 w-3.5 mr-1" /> Lost Deal</>
              )}
            </Badge>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCloseDeal("LOST")}
                className="text-xs text-rose-500 hover:text-rose-600 h-8 font-semibold border-border/40"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Mark Lost
              </Button>
              <Button
                size="sm"
                onClick={() => handleCloseDeal("WON")}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-8 font-semibold"
              >
                <Trophy className="h-3.5 w-3.5 mr-1.5" />
                Mark Won
              </Button>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/workspaces/${slug}/crm/leads/${detail.id}`)}
            className="text-xs font-semibold border-border/40 text-muted-foreground hover:text-foreground h-8"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Open Lead Profile
          </Button>
        </div>
      </div>

      {/* Company Header Banner */}
      <div className="rounded-2xl border border-border/30 bg-gradient-to-r from-violet-500/5 to-transparent p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {detail.avatarUrl ? (
          <img src={detail.avatarUrl} alt={detail.companyName} className="h-14 w-14 rounded-2xl object-cover border border-violet-500/10 shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-2xl bg-violet-500/15 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
              {detail.companyName[0]?.toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">{detail.companyName}</h1>
            {detail.leadNumber && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                {detail.leadNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {detail.contactPerson}{detail.designation ? ` · ${detail.designation}` : ""}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {detail.industry && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {detail.industry}
              </span>
            )}
            {detail.location && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {detail.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <div className="text-2xl font-black text-foreground">
            {formatCurrency(detail.expectedValue)}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expected Value</span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-violet-500">Active</span>
          </div>
        </div>
      </div>

      {/* Recommended Action Card */}
      {recommendedAction && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500/70 block">
              RECOMMENDED ACTION
            </span>
            <h4 className="text-xs font-bold text-foreground">{recommendedAction.title}</h4>
            <p className="text-[11px] text-muted-foreground/80 leading-normal">{recommendedAction.desc}</p>
          </div>
          {recommendedAction.btnLabel && (
            <Button
              size="sm"
              onClick={recommendedAction.action}
              className="h-8 text-[11px] font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shrink-0 self-start sm:self-center"
            >
              {recommendedAction.btnLabel}
            </Button>
          )}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
        
        {/* Left Rail (Operational Cards) */}
        <div className="space-y-4">
          
          {/* Health Card */}
          <HealthCard score={healthScore} checks={healthChecks} />

          {/* Ownership Card */}
          <CardContainer title="Opportunity Owner" icon={User}>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0 border border-violet-500/10">
                  <AvatarImage src={detail.owner?.avatarUrl || ""} alt={ownerName} className="object-cover" />
                  <AvatarFallback className="text-sm font-black bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    {ownerName[0]?.toUpperCase() || "—"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{ownerName}</p>
                  <p className="text-[11px] text-muted-foreground">Account Owner</p>
                </div>
              </div>
              
              <div className="pt-2">
                <Select
                  value={detail.ownerId || ""}
                  disabled={savingOwner}
                  onValueChange={async (val) => {
                    try {
                      setSavingOwner(true);
                      await patchOpportunity({ ownerId: val });
                      toast.success("Owner updated");
                    } catch {
                      toast.error("Failed to update owner");
                    } finally {
                      setSavingOwner(false);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs focus:ring-[#8B5CF6]/50 rounded-lg">
                    <SelectValue placeholder="Change Owner" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40">
                    {owners.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs rounded-lg">
                        {o.firstName} {o.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContainer>

          {/* Lost Reason Card */}
          <LostReasonCard detail={detail} onSaveReason={handleSaveLostReason} />

          {/* Reopen Logic Card */}
          <OpportunityReopenCard detail={detail} onReopen={handleReopen} />

          {/* SLA Card */}
          <SlaCard key={`sla-${refreshKey}`} lead={detail as any} />

          {/* Escalation Card */}
          <EscalationCard key={`esc-${refreshKey}`} lead={detail as any} />

          {/* Tasks Card */}
          <TasksCard key={`tasks-${refreshKey}`} leadId={detail.id} owners={owners} />

          {/* Notes Card */}
          <NotesCard key={`notes-${refreshKey}`} leadId={detail.id} owners={owners} onNoteAdded={triggerRefresh} />

          {/* Knowledge Capture Card */}
          <KnowledgeCaptureCard leadId={detail.id} key={`kc-${refreshKey}`} />

          {/* Timeline Card */}
          <TimelineCard leadId={detail.id} key={`timeline-${refreshKey}`} />
        </div>

        {/* Right Column (Stepper + Active Stage Workspace) */}
        <div className="space-y-5">
          
          {/* Stepper Navigator */}
          <div className="w-full overflow-hidden bg-card border border-border/40 rounded-xl shadow-xs">
            <div className="flex items-center justify-between w-full py-2 px-2 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
              {steps.map((s, idx) => {
                const isCurrent = s.id === currentStep;
                const isCompleted = s.isComplete;
                const isOpenedFromLock = !s.isLocked && !s.isComplete;
                const isClickable = !s.isLocked;
                const StepIcon = s.icon;
    
                return (
                  <div key={s.id} className="flex items-center gap-1 flex-1 min-w-0 justify-center">
                    <button
                      type="button"
                      disabled={s.isLocked}
                      onClick={() => isClickable && setCurrentStep(s.id)}
                      className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                        isCurrent
                          ? "bg-gradient-to-t from-[#8B5CF6]/15 via-white/40 to-white dark:from-purple-950/20 dark:to-zinc-900 border border-[#8B5CF6]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(139,92,246,0.15)] text-[#8B5CF6] dark:text-[#a78bfa] font-bold"
                          : isCompleted
                          ? "text-[#8B5CF6]/70 dark:text-[#a78bfa]/75 font-semibold"
                          : isOpenedFromLock
                          ? "text-amber-600 dark:text-amber-400 font-semibold"
                          : "text-muted-foreground/50 font-normal"
                      )}
                    >
                      {s.isLocked ? (
                        <Lock className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                      ) : (
                        <StepIcon className={cn(
                          "h-3 w-3 shrink-0",
                          isCurrent
                            ? "text-[#8B5CF6]"
                            : isCompleted
                            ? "text-[#8B5CF6]/75"
                            : "text-amber-500 dark:text-amber-400"
                        )} />
                      )}
                      <span className="truncate max-w-[80px] sm:max-w-none">{s.label}</span>
                    </button>
                    
                    {idx < steps.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground/25 shrink-0 ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper Card Stage Workspace */}
          <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-visible relative">
            
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20 bg-muted/10 rounded-t-2xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{activeStepConfig?.label}</p>
                <p className="text-[11px] text-muted-foreground/70">{activeStepConfig?.sublabel}</p>
              </div>
              {activeStepConfig?.isComplete && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Complete</span>
                </div>
              )}
            </div>

            {/* Form Content */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* STEP 1: Discovery Meeting */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Meeting Scheduled Display */}
                  <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border/10">
                      <span className="text-xs font-bold text-foreground">Discovery Scheduled Meetings</span>
                      <div className="flex items-center gap-2">
                        {meetings.length > 0 && (
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            onClick={() => setShowScheduleForm(!showScheduleForm)}
                            className="h-6 px-2 text-[10px] font-semibold border-border/60 hover:bg-muted text-foreground rounded-lg"
                          >
                            {showScheduleForm ? "Cancel" : "Schedule Meeting"}
                          </Button>
                        )}
                        <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 font-bold text-[9px] uppercase">
                          {meetings.length} Total
                        </Badge>
                      </div>
                    </div>

                    {meetings.length === 0 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-[11px] text-muted-foreground/75 italic">No meetings scheduled yet.</p>
                      </div>
                    )}

                    {(meetings.length === 0 || showScheduleForm) && (
                      <div className="p-3 border border-violet-500/10 bg-violet-500/5 rounded-xl space-y-2 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">
                          {meetings.length === 0 ? "Schedule First Discovery Meeting" : "Schedule Discovery Meeting"}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Meeting title *"
                            value={meetingForm.title}
                            onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))}
                            className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                          />
                          <input
                            type="text"
                            placeholder="Meeting link (URL)"
                            value={meetingForm.meetingUrl}
                            onChange={(e) => setMeetingForm((p) => ({ ...p, meetingUrl: e.target.value }))}
                            className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                          />
                          <DateTimePicker
                            value={meetingForm.scheduledAt}
                            onChange={(val) => setMeetingForm((p) => ({ ...p, scheduledAt: val }))}
                            className="bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={meetingForm.mode}
                            onValueChange={(val) => setMeetingForm((p) => ({ ...p, mode: val }))}
                          >
                            <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                              <SelectValue placeholder="Select mode..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                              <SelectItem value="ZOOM">Zoom</SelectItem>
                              <SelectItem value="PHONE">Phone Call</SelectItem>
                              <SelectItem value="IN_PERSON">In Person</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            onClick={handleAddMeeting}
                            disabled={savingMeeting}
                            className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED] h-8 text-xs font-semibold rounded-lg"
                          >
                            {savingMeeting ? "Scheduling..." : "Schedule Meeting"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {meetings.length > 0 && (
                      <div className="space-y-2">
                        {meetings.map((m) => {
                          const isEditing = editingMeetingId === m.id;
                          if (isEditing) {
                            return (
                              <div key={m.id} className="p-3 border border-violet-500/30 bg-violet-500/5 rounded-xl space-y-2 text-xs">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">Edit Meeting</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Meeting title *"
                                    value={editMeetingForm.title}
                                    onChange={(e) => setEditMeetingForm((p) => ({ ...p, title: e.target.value }))}
                                    className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Meeting link (URL)"
                                    value={editMeetingForm.meetingUrl}
                                    onChange={(e) => setEditMeetingForm((p) => ({ ...p, meetingUrl: e.target.value }))}
                                    className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                                  />
                                  <DateTimePicker
                                    value={editMeetingForm.scheduledAt}
                                    onChange={(val) => setEditMeetingForm((p) => ({ ...p, scheduledAt: val }))}
                                    className="bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <Select
                                    value={editMeetingForm.mode}
                                    onValueChange={(val) => setEditMeetingForm((p) => ({ ...p, mode: val }))}
                                  >
                                    <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                                      <SelectValue placeholder="Select mode..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                                      <SelectItem value="ZOOM">Zoom</SelectItem>
                                      <SelectItem value="PHONE">Phone Call</SelectItem>
                                      <SelectItem value="IN_PERSON">In Person</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={editMeetingForm.status}
                                    onValueChange={(val) => setEditMeetingForm((p) => ({ ...p, status: val }))}
                                  >
                                    <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                                      <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                      <SelectItem value="COMPLETED">Completed</SelectItem>
                                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateMeeting(m.id)}
                                      disabled={savingMeeting}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 h-8 text-xs font-semibold rounded-lg"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingMeetingId(null)}
                                      className="border-border/60 hover:bg-muted text-foreground flex-1 h-8 text-xs font-semibold rounded-lg"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/20 bg-background/50 text-xs">
                              <div>
                                <p className="font-bold text-foreground">{m.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {new Date(m.scheduledAt).toLocaleString("en-IN", {
                                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                  })} · {MEETING_MODE_LABELS[m.mode] || m.mode}
                                </p>
                                {m.meetingUrl && (
                                  <p className="text-[10px] text-violet-500 font-medium mt-0.5">
                                    <a
                                      href={m.meetingUrl.startsWith('http') ? m.meetingUrl : `https://${m.meetingUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline inline-flex items-center gap-1"
                                    >
                                      <Video className="h-3.5 w-3.5" />
                                      {m.meetingUrl}
                                    </a>
                                  </p>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Attendees: Contact Person ({detail.contactPerson}) & Opportunity Owner ({ownerName})
                                </p>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-center">
                                <Button
                                  type="button"
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingMeetingId(m.id);
                                    setEditMeetingForm({
                                      title: m.title,
                                      scheduledAt: m.scheduledAt,
                                      duration: String(m.duration),
                                      mode: m.mode,
                                      meetingUrl: m.meetingUrl || "",
                                      status: m.status,
                                    });
                                  }}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Badge className={cn(
                                  "text-[9px] uppercase font-bold px-2 border",
                                  m.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : m.status === "CANCELLED"
                                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                    : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                                )}>
                                  {m.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Discovery intelligence inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Business Goals *</Label>
                      <textarea
                        value={businessGoals}
                        onChange={(e) => setBusinessGoals(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                        placeholder="What problem are we solving? What are the key commercial goals?"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Desired Outcome *</Label>
                      <textarea
                        value={desiredOutcome}
                        onChange={(e) => setDesiredOutcome(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                        placeholder="What does success look like for the client?"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Current Situation</Label>
                      <textarea
                        value={currentSituation}
                        onChange={(e) => setCurrentSituation(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Current operational setups, stack, teams..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Pain Points</Label>
                      <input
                        type="text"
                        value={painPoints.join(", ")}
                        onChange={(e) => setPainPoints(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
                        placeholder="Comma-separated (e.g. Low Lead Conversions, Complex Flow)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Budget Discussion</Label>
                      <Select value={budgetDiscussion} onValueChange={setBudgetDiscussion}>
                        <SelectTrigger className="h-8 text-xs rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
                          {["Not Discussed", "Under 1L", "1L to 5L", "5L to 10L", "Above 10L"].map(opt => (
                            <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Timeline Discussion</Label>
                      <Select value={timelineDiscussion} onValueChange={setTimelineDiscussion}>
                        <SelectTrigger className="h-8 text-xs rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
                          {["Not Discussed", "Immediate", "Within 30 Days", "Within 90 Days", "Future"].map(opt => (
                            <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Decision Maker</Label>
                      <input
                        type="text"
                        value={decisionMaker}
                        onChange={(e) => setDecisionMaker(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Name of DM"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Champion</Label>
                      <input
                        type="text"
                        value={champion}
                        onChange={(e) => setChampion(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Name of Champion"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Stakeholders</Label>
                      <input
                        type="text"
                        value={stakeholders}
                        onChange={(e) => setStakeholders(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Other stakeholders"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Execution Risks</Label>
                      <textarea
                        value={risks}
                        onChange={(e) => setRisks(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Any early technical or delivery risks identified..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Discovery Notes</Label>
                      <textarea
                        value={discoveryNotes}
                        onChange={(e) => setDiscoveryNotes(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Additional notes from meeting..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: 7 Solution Planning */}
              {currentStep === 2 && (
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
              )}

              {/* STEP 3: 8 Proposal & Commercials */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  
                  {/* Proposal versions history */}
                  <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border/10">
                      <span className="text-xs font-bold text-foreground">Commercial Proposal History</span>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold text-[9px] uppercase">
                        {proposals.length} Versions
                      </Badge>
                    </div>

                    {proposals.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground/75 italic pt-1">No proposal created yet. Use the tool below to build Version 1.</p>
                    ) : (
                      <div className="space-y-2">
                        {proposals.map((p, idx) => {
                          const statusCfg = PROPOSAL_STATUS_CONFIG[p.status] || PROPOSAL_STATUS_CONFIG.DRAFT;
                          return (
                            <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/20 bg-background/50 text-xs">
                              <div>
                                <p className="font-bold text-foreground">
                                  Version {idx + 1}: {p.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Number: {p.proposalNumber} · Value: {formatCurrency(p.value)}
                                </p>
                                {p.notes && <p className="text-[10px] text-muted-foreground/80 mt-1 italic">Notes: {p.notes}</p>}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge className={cn("text-[9px] uppercase font-bold px-2 border", statusCfg.bg, statusCfg.color)}>
                                  {statusCfg.label}
                                </Badge>
                                
                                <Select
                                  value={p.status}
                                  onValueChange={(val) => handleUpdateProposalStatus(p.id, val)}
                                >
                                  <SelectTrigger className="h-6 text-[10px] w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-border/40">
                                    {Object.keys(PROPOSAL_STATUS_CONFIG).map(s => (
                                      <SelectItem key={s} value={s} className="text-[10px] rounded-lg">
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add proposal builder block */}
                  {showProposalForm ? (
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                      <p className="text-xs font-bold text-foreground">Draft Proposal Version</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Proposal title (e.g. Enterprise AI Pilot) *"
                          value={proposalForm.title}
                          onChange={(e) => setProposalForm((p) => ({ ...p, title: e.target.value }))}
                          className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Proposal Value (₹) *"
                          value={proposalForm.value}
                          onChange={(e) => setProposalForm((p) => ({ ...p, value: e.target.value }))}
                          className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Proposal # (auto-generated if empty)"
                          value={proposalForm.proposalNumber}
                          onChange={(e) => setProposalForm((p) => ({ ...p, proposalNumber: e.target.value }))}
                          className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
                        />
                        <Select
                          value={proposalForm.status}
                          onValueChange={(val) => setProposalForm((p) => ({ ...p, status: val }))}
                        >
                          <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SENT">Sent</SelectItem>
                            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <textarea
                        placeholder="Negotiation / Commercial notes..."
                        value={proposalForm.notes}
                        onChange={(e) => setProposalForm((p) => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none resize-none"
                      />

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={handleAddProposal}
                          disabled={savingProposal}
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 font-semibold"
                        >
                          {savingProposal ? "Saving..." : "Create Proposal Version"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowProposalForm(false)}
                          className="text-xs h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border/40 text-xs font-semibold text-muted-foreground hover:border-amber-500/40 hover:text-amber-500 hover:bg-amber-500/5 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create New Proposal Version
                    </button>
                  )}
                </div>
              )}

              {/* STEP 4: 9 Agreement & Closure */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Negotiation Notes</Label>
                      <textarea
                        value={negotiationNotes}
                        onChange={(e) => setNegotiationNotes(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Log notes from commercials/discounts negotiation..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Final Agreement Details</Label>
                      <textarea
                        value={finalAgreement}
                        onChange={(e) => setFinalAgreement(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Summarize agreed terms, deliverables schedule..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-muted/10 p-4 rounded-xl border border-border/20">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">Contractual Checks</p>
                      <p className="text-[10px] text-muted-foreground leading-normal">Verify signature and agreement status before handoff.</p>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-foreground/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ndaSigned}
                          onChange={(e) => setNdaSigned(e.target.checked)}
                          className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6]"
                        />
                        NDA Signed
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-foreground/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={proposalSigned}
                          onChange={(e) => setProposalSigned(e.target.checked)}
                          className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6]"
                        />
                        Proposal Signed
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Decision Maker (DM)</Label>
                      <input
                        type="text"
                        value={decisionMaker}
                        onChange={(e) => setDecisionMaker(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Name of DM"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Champion</Label>
                      <input
                        type="text"
                        value={champion}
                        onChange={(e) => setChampion(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Name of Champion"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Influencer</Label>
                      <input
                        type="text"
                        value={influencer}
                        onChange={(e) => setInfluencer(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Name of Influencer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: 10 Engagement Handoff */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Project Delivery Type *</Label>
                      <Select value={projectType} onValueChange={setProjectType}>
                        <SelectTrigger className="h-8 text-xs rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
                          {["Retainer", "Fixed Bid", "Time & Materials", "Discovery Pilot"].map(opt => (
                            <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Engagement Manager (EM) *</Label>
                      <Select value={assignedEM} onValueChange={setAssignedEM}>
                        <SelectTrigger className="h-8 text-xs rounded-lg">
                          <SelectValue placeholder="Assign EM" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
                          {owners.map((o) => (
                            <SelectItem key={o.id} value={o.id} className="text-xs rounded-lg">
                              {o.firstName} {o.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Client Expectations</Label>
                      <textarea
                        value={clientExpectations}
                        onChange={(e) => setClientExpectations(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Document any special expectations or SLAs discussed..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Success Criteria</Label>
                      <textarea
                        value={successCriteria}
                        onChange={(e) => setSuccessCriteria(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="What indicators will prove successful implementation?"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Internal Handoff Notes</Label>
                      <textarea
                        value={handoffNotes}
                        onChange={(e) => setHandoffNotes(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Scope summary, kick-off dates, team resources details..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Delivery Risks</Label>
                      <textarea
                        value={deliveryRisksHandoff}
                        onChange={(e) => setDeliveryRisksHandoff(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
                        placeholder="Technical limitations, execution hurdles, delivery dependencies..."
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={handleConvertToClient}
                      disabled={convertingToClient || !assignedEM}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {convertingToClient ? "Initiating Handover..." : "Convert Opportunity to Client & Trigger Handoff"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Card Footer Actions */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border/20 bg-muted/5 rounded-b-2xl">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="h-8 text-xs font-semibold border-border/60 hover:bg-muted text-foreground rounded-lg"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveWorkspace}
                  disabled={savingStage}
                  className="h-8 text-xs font-semibold bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg transition-all"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {savingStage ? "Saving..." : "Save Details"}
                </Button>
                
                {showAdvance && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAdvanceStage}
                    disabled={savingStage}
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                  >
                    Advance Stage <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// ─── Opportunity Health Card Component ────────────────────────────────────────

function HealthCard({
  score,
  checks,
}: {
  score: number;
  checks: { label: string; isComplete: boolean }[];
}) {
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "stroke-rose-500 text-rose-500 bg-rose-500/10 border-rose-500/20";
  let label = "At Risk";
  if (score >= 80) {
    color = "stroke-emerald-500 text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    label = "Healthy";
  } else if (score >= 40) {
    color = "stroke-amber-500 text-amber-500 bg-amber-500/10 border-amber-500/20";
    label = "Warning";
  }

  return (
    <CardContainer title="Opportunity Health" icon={Target} borderStyle="border-border/40">
      <div className="space-y-4">
        <div className="flex flex-col items-center py-2.5 border border-border/30 rounded-xl bg-background/25">
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={radius} className="stroke-muted/30 fill-none" strokeWidth={strokeWidth} />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className={cn(color.split(" ")[0], "fill-none transition-all duration-500 ease-out")}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-foreground">{score}</span>
              <span className="text-[8px] text-muted-foreground font-semibold uppercase leading-none">Pts</span>
            </div>
          </div>
          <Badge className={cn("mt-2.5 text-[9px] uppercase font-bold px-2 py-0.5 border", color.split(" ").slice(1).join(" "))}>
            {label}
          </Badge>
        </div>

        {/* Milestone checklist */}
        <div className="space-y-2 text-[11px] font-medium">
          {checks.map((chk, i) => (
            <div key={i} className="flex items-center justify-between text-muted-foreground">
              <span>{chk.label}</span>
              <span className={chk.isComplete ? "text-emerald-500 font-bold" : "text-muted-foreground/30"}>
                {chk.isComplete ? "✓" : "○"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardContainer>
  );
}
