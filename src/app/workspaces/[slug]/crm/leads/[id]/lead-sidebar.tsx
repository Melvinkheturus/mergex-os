"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, formatDistanceToNowStrict, isToday, isTomorrow, isPast } from "date-fns";
import {
  Phone, Mail, MessageCircle, Calendar, FileText, Clock,
  ArrowRight, Activity, ChevronDown, ChevronUp, IndianRupee,
  CalendarClock, Zap, Plus, Loader2, StickyNote, ClipboardList,
  ExternalLink, FileSignature, Receipt, FileBarChart2
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Lead, NEXT_ACTION_LABELS, NextActionType, Meeting, Proposal, Activity as LeadActivity } from "../_components/types";

interface LeadSidebarProps {
  lead: Lead;
  activeAction: "CALL" | "EMAIL" | "WHATSAPP" | "NOTE" | null;
  onActiveActionChange: (action: "CALL" | "EMAIL" | "WHATSAPP" | "NOTE" | null) => void;
}

const ACTIVITY_ICONS: Record<string, any> = {
  CALL: Phone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  NOTE: StickyNote,
  TASK: ClipboardList,
};

const ACTIVITY_LABELS: Record<string, string> = {
  CALL: "Logged a Call",
  EMAIL: "Sent an Email",
  WHATSAPP: "Sent WhatsApp message",
  NOTE: "Added a Note",
  TASK: "Created a Task",
};

export function LeadSidebar({ lead, activeAction, onActiveActionChange }: LeadSidebarProps) {
  const params = useParams();
  const router = useRouter();
  const leadId = lead.id;
  const slug = params?.slug as string;

  // States
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  // Inline Log Activity form state
  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState<"CALL" | "EMAIL" | "WHATSAPP" | "NOTE" | "TASK">("CALL");
  const [logContent, setLogContent] = useState("");
  const [submittingLog, setSubmittingLog] = useState(false);

  // Load Activities
  const loadActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/activities`);
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoadingActivities(false);
    }
  }, [leadId]);

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

  useEffect(() => {
    loadActivities();
    loadMeetings();
    loadProposals();
  }, [loadActivities, loadMeetings, loadProposals]);

  // Listen to parent quick actions
  useEffect(() => {
    if (activeAction) {
      setLogType(activeAction === "CALL" ? "CALL" : activeAction === "EMAIL" ? "EMAIL" : activeAction === "WHATSAPP" ? "WHATSAPP" : "NOTE");
      setShowLogForm(true);
      
      // Focus textarea
      setTimeout(() => {
        const textarea = document.getElementById("activity-log-textarea");
        if (textarea) textarea.focus();
      }, 100);
    }
  }, [activeAction]);

  // Submit Activity log
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) {
      toast.error("Please enter activity details");
      return;
    }

    try {
      setSubmittingLog(true);
      const res = await fetch(`/api/crm/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: logType,
          content: logContent,
        }),
      });

      if (!res.ok) throw new Error("Failed to log activity");
      toast.success("Activity logged successfully");
      setLogContent("");
      setShowLogForm(false);
      onActiveActionChange(null);
      loadActivities();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to log activity");
    } finally {
      setSubmittingLog(false);
    }
  };

  // Group activities by date
  const getGroupedActivities = () => {
    const todayList: LeadActivity[] = [];
    const yesterdayList: LeadActivity[] = [];
    const earlierList: LeadActivity[] = [];

    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    activities.forEach((act) => {
      const dateStr = format(new Date(act.performedAt), "yyyy-MM-dd");
      if (dateStr === todayStr) todayList.push(act);
      else if (dateStr === yesterdayStr) yesterdayList.push(act);
      else earlierList.push(act);
    });

    return [
      { title: "Today", items: todayList },
      { title: "Yesterday", items: yesterdayList },
      { title: "Earlier", items: earlierList },
    ].filter((group) => group.items.length > 0);
  };

  const groupedActivities = getGroupedActivities();

  // Meetings Calculations
  const upcomingMeetings = meetings.filter(m => m.status === "SCHEDULED" && new Date(m.scheduledAt) > new Date());
  const completedMeetings = meetings.filter(m => m.status === "COMPLETED" || (m.status === "SCHEDULED" && new Date(m.scheduledAt) <= new Date()));

  // Proposals Calculations
  const latestProposal = proposals[0] || null;

  return (
    <aside className="flex flex-col gap-4 min-w-0">
      
      {/* ── Section 1: Next Action ────────────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500" />
            Next Action
          </p>
        </div>
        <div className="p-4">
          {lead.nextAction ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <span className="text-sm font-semibold text-foreground">
                  {NEXT_ACTION_LABELS[lead.nextAction as NextActionType] ?? lead.nextAction}
                </span>
              </div>
              {lead.nextActionDate && (
                <p className="text-[10px] text-muted-foreground ml-5.5">
                  Due: <span className="font-semibold text-foreground">
                    {format(new Date(lead.nextActionDate), "d MMM yyyy")}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">No next action set</p>
          )}
        </div>
      </div>

      {/* ── Section 2: Log Activity (Inline Form) ───────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Log Activity
          </p>
          {!showLogForm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLogForm(true)}
              className="h-6 text-[10px] font-bold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
            >
              <Plus className="h-3 w-3 mr-1" /> Log
            </Button>
          )}
        </div>

        {showLogForm && (
          <form onSubmit={handleLogSubmit} className="p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  value={logType}
                  onValueChange={(v: string) => setLogType(v as typeof logType)}
                >
                  <SelectTrigger className="h-7 text-[10px] font-semibold bg-background/50 border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL" className="text-xs">Call</SelectItem>
                    <SelectItem value="EMAIL" className="text-xs">Email</SelectItem>
                    <SelectItem value="WHATSAPP" className="text-xs">WhatsApp</SelectItem>
                    <SelectItem value="NOTE" className="text-xs">Internal Note</SelectItem>
                    <SelectItem value="TASK" className="text-xs">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <textarea
              id="activity-log-textarea"
              placeholder="What details did you discuss?"
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              className="flex min-h-[70px] w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 focus-visible:border-[#8B5CF6]/50 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowLogForm(false);
                  onActiveActionChange(null);
                }}
                className="h-7 text-[10px] font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingLog}
                className="h-7 text-[10px] font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
              >
                {submittingLog ? <Loader2 className="h-3 w-3 animate-spin" /> : "Log Activity"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ── Section 3: Live Activity Feed ─────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-[#8B5CF6]" />
            Live Activity Feed
          </p>
        </div>

        {loadingActivities && activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-5 text-center text-xs text-muted-foreground/50 italic">
            No activities logged yet
          </div>
        ) : (
          <div className="p-3.5 max-h-[300px] overflow-y-auto space-y-4">
            {groupedActivities.map((group) => (
              <div key={group.title} className="space-y-2">
                <h5 className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
                  {group.title}
                </h5>
                <div className="relative border-l border-border/20 ml-2.5 pl-4 space-y-3.5">
                  {group.items.map((act) => {
                    const Icon = ACTIVITY_ICONS[act.type] || StickyNote;
                    const actorName = act.user
                      ? `${act.user.firstName ?? ""} ${act.user.lastName ?? ""}`.trim()
                      : "System";
                    const initials = actorName[0]?.toUpperCase() ?? "S";

                    return (
                      <div key={act.id} className="relative flex gap-2.5">
                        {/* Timeline node icon */}
                        <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border border-border bg-card flex items-center justify-center shrink-0">
                          <Icon className="h-2 w-2 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-foreground">
                              {ACTIVITY_LABELS[act.type] || act.type}
                            </span>
                            <span className="text-[9px] text-muted-foreground/60">
                              {format(new Date(act.performedAt), "HH:mm")}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed break-words">
                            {act.content}
                          </p>
                          <p className="text-[8px] text-muted-foreground/40 font-semibold">
                            by {actorName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 4: Meetings Summary Card ────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-blue-500" />
            Meetings
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/workspaces/${slug}/crm/meetings`)}
            className="h-6 text-[9px] font-bold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
          >
            <ExternalLink className="h-2.5 w-2.5 mr-1" /> Open
          </Button>
        </div>
        <div className="p-4 space-y-2">
          {loadingMeetings ? (
            <div className="h-8 rounded-lg bg-muted/20 animate-pulse" />
          ) : (
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-[10px]">Upcoming Meetings</p>
                <p className="font-extrabold text-foreground text-sm">{upcomingMeetings.length}</p>
              </div>
              <div className="w-[1px] h-8 bg-border/20" />
              <div className="space-y-0.5 text-right">
                <p className="text-muted-foreground text-[10px]">Completed Meetings</p>
                <p className="font-extrabold text-muted-foreground text-sm">{completedMeetings.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 5: Proposals Summary Card ───────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3 w-3 text-amber-500" />
            Proposals
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/workspaces/${slug}/crm/proposals`)}
            className="h-6 text-[9px] font-bold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
          >
            <ExternalLink className="h-2.5 w-2.5 mr-1" /> Open
          </Button>
        </div>
        <div className="p-4">
          {loadingProposals ? (
            <div className="h-8 rounded-lg bg-muted/20 animate-pulse" />
          ) : latestProposal ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground truncate max-w-[150px]">
                  {latestProposal.proposalNumber} - {latestProposal.title}
                </span>
                <Badge className="text-[9px] border bg-amber-500/10 text-amber-500 border-amber-500/25">
                  {latestProposal.status}
                </Badge>
              </div>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center">
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {Number(latestProposal.value).toLocaleString("en-IN")}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic text-center py-1">No active proposals</p>
          )}
        </div>
      </div>

      {/* ── Section 6: Documents Summary Card ───────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <FileSignature className="h-3 w-3 text-emerald-500" />
            Documents
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/workspaces/${slug}/crm/documents`)}
            className="h-6 text-[9px] font-bold px-2 text-[#8B5CF6] hover:bg-[#8B5CF6]/5"
          >
            <ExternalLink className="h-2.5 w-2.5 mr-1" /> Open
          </Button>
        </div>
        <div className="p-4 text-xs flex items-center justify-between">
          <span className="text-muted-foreground font-semibold">Linked Documents</span>
          <span className="font-black text-foreground">{proposals.length + meetings.length} Files</span>
        </div>
      </div>

    </aside>
  );
}
