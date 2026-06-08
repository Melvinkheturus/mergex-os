"use client";

import { useState, useEffect, useCallback, useRef, ElementType } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Phone, Mail, MessageCircle, Calendar, FileText, Clock,
  Activity, IndianRupee,
  Plus, Loader2, StickyNote, ClipboardList,
  ExternalLink, FileSignature, Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Lead, Meeting, Proposal, OptionUser, Activity as LeadActivity } from "../components/types";

interface LeadSidebarProps {
  lead: Lead;
  owners: OptionUser[];
  onLeadUpdate: (updated: Lead) => void;
  currentStep: number;
}

import { TasksCard } from "../components/crm/operational-layers/tasks-card";
import { SlaCard } from "../components/crm/operational-layers/sla-card";
import { EscalationCard } from "../components/crm/operational-layers/escalation-card";
import { ReopenLogicCard } from "../components/crm/operational-layers/reopen-logic-card";
import { NotesCard } from "../components/crm/operational-layers/notes-card";
import { TimelineCard } from "../components/crm/operational-layers/timeline-card";

// ─── Stage Configuration and Mapping ──────────────────────────────────────────
const stageKeys = [
  "lead_intake",        // Step 1
  "business_review",    // Step 2
  "qualification",      // Step 3
  "classification",     // Step 4
  "nurturing",          // Step 5
  "meeting_readiness",  // Step 6
] as const;

const stageConfig = {
  lead_intake: {
    showTasks: true,
    showSLA: true,
    showEscalation: true,
    showReopenLogic: false,
  },
  business_review: {
    showTasks: true,
    showSLA: true,
    showEscalation: false,
    showReopenLogic: false,
  },
  qualification: {
    showTasks: true,
    showSLA: false,
    showEscalation: false,
    showReopenLogic: false,
  },
  classification: {
    showTasks: false,
    showSLA: false,
    showEscalation: false,
    showReopenLogic: false,
  },
  nurturing: {
    showTasks: true,
    showSLA: true,
    showEscalation: true,
    showReopenLogic: true,
  },
  meeting_readiness: {
    showTasks: false,
    showSLA: false,
    showEscalation: false,
    showReopenLogic: false,
  },
};

// ─── Component 1: Operational Layer Cards ────────────────────────────────────
export function LeadSidebar({ lead, owners, onLeadUpdate, currentStep }: LeadSidebarProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const stageIndex = currentStep - 1;
  const activeStageKey = stageKeys[stageIndex] || "lead_intake";
  const config = stageConfig[activeStageKey];

  return (
    <div className="space-y-4">
      {/* 1. SLA Card */}
      {config.showSLA && (
        <SlaCard lead={lead} />
      )}

      {/* 2. Escalation Card — self-manages visibility (returns null when not breached) but only mounted in stages that support it */}
      {config.showEscalation && (
        <EscalationCard lead={lead} />
      )}

      {/* 3. Tasks Card */}
      {config.showTasks && (
        <TasksCard leadId={lead.id} owners={owners} />
      )}

      {/* 4. Reopen Logic Card */}
      {config.showReopenLogic && (
        <ReopenLogicCard lead={lead} onLeadUpdate={onLeadUpdate} />
      )}

      {/* 5. Notes Card (Persistent - Always True) */}
      <NotesCard leadId={lead.id} owners={owners} onNoteAdded={triggerRefresh} />

      {/* 6. Timeline Card (Persistent - Always True, read-only) */}
      <TimelineCard leadId={lead.id} key={refreshKey} />
    </div>
  );
}

// ─── Component 2: Documents, Meeting, and Proposal Row ──────────────────────
export function LeadUtilityGrid({ lead }: { lead: Lead }) {
  const params = useParams();
  const router = useRouter();
  const leadId = lead.id;
  const slug = params?.slug as string;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const [documents, setDocuments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Load Meetings
  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/meetings`);
      if (res.ok) {
        setMeetings(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoadingMeetings(false);
    }
  }, [leadId]);

  // Load Proposals
  const loadProposals = useCallback(async () => {
    setLoadingProposals(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/proposals`);
      if (res.ok) {
        setProposals(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoadingProposals(false);
    }
  }, [leadId]);

  // Load Documents from LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem(`lead-${leadId}-documents`);
      if (stored) {
        setDocuments(JSON.parse(stored));
      }
      // No fallback demo data — documents start empty
    }, 0);
    return () => clearTimeout(timer);
  }, [leadId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMeetings();
      loadProposals();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMeetings, loadProposals]);

  // Upload Document
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to upload document.");
        return;
      }
      
      const updatedDocs = [...documents, file.name];
      setDocuments(updatedDocs);
      localStorage.setItem(`lead-${leadId}-documents`, JSON.stringify(updatedDocs));
      toast.success(`${file.name} uploaded!`);
    } catch {
      toast.error("Failed to upload document.");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const upcomingMeeting = meetings.find(m => m.status === "SCHEDULED" && new Date(m.scheduledAt) > new Date());
  const latestProposal = proposals[0] || null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* 1. DOCUMENTS CARD */}
      <Card className="border border-border/40 shadow-sm rounded-2xl bg-card/45 backdrop-blur-xs flex flex-col justify-between">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileSignature className="h-3 w-3 text-[#8B5CF6]" /> Documents
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingDoc}
            className="h-6 text-[10px] font-bold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
          >
            {uploadingDoc ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1" /> Upload
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleDocUpload}
          />
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 flex-1">
          {documents.map((doc, idx) => (
            <div
              key={`${doc}-${idx}`}
              className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-background/30 hover:bg-background/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">{doc}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-[#8B5CF6]/10 text-muted-foreground hover:text-[#8B5CF6]"
                onClick={() => toast.success(`Viewing file: ${doc}`)}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. UPCOMING MEETING CARD */}
      <Card className="border border-border/40 shadow-sm rounded-2xl bg-card/45 backdrop-blur-xs flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-blue-500" /> Upcoming Meeting
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col justify-between flex-1">
          {loadingMeetings ? (
            <div className="h-10 rounded-xl bg-muted/20 animate-pulse" />
          ) : upcomingMeeting ? (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground leading-tight truncate">{upcomingMeeting.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {format(new Date(upcomingMeeting.scheduledAt), "d MMM yyyy, h:mm a")}
                  </p>
                </div>
                {upcomingMeeting.meetingUrl && (
                  <Button
                    size="sm"
                    className="h-7 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                    onClick={() => window.open(upcomingMeeting.meetingUrl!, "_blank")}
                  >
                    Join
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-muted-foreground/75 italic">No meeting scheduled</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-bold border-border/40"
                onClick={() => router.push(`/workspaces/${slug}/crm/meetings`)}
              >
                Schedule Meeting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. LATEST PROPOSAL CARD */}
      <Card className="border border-border/40 shadow-sm rounded-2xl bg-card/45 backdrop-blur-xs flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-amber-500" /> Latest Proposal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col justify-between flex-1">
          {loadingProposals ? (
            <div className="h-10 rounded-xl bg-muted/20 animate-pulse" />
          ) : latestProposal ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground truncate max-w-[170px]">
                  {latestProposal.proposalNumber} - {latestProposal.title}
                </span>
                <Badge className="text-[9px] border bg-amber-500/10 text-amber-500 border-amber-500/25 shrink-0 px-1 py-0">
                  {latestProposal.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <IndianRupee className="h-3 w-3 mr-0.5" />
                  {Number(latestProposal.value).toLocaleString("en-IN")}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] font-semibold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
                  onClick={() => router.push(`/workspaces/${slug}/crm/proposals`)}
                >
                  View
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-muted-foreground/75 italic">No proposal created</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-bold border-border/40"
                onClick={() => router.push(`/workspaces/${slug}/crm/proposals`)}
              >
                Create Proposal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
