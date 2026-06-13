"use client";

import { useState, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  CheckCircle2, Circle, Phone, MessageSquare, Mail, Video, ExternalLink,
  CalendarClock, Clock, Sparkles, ArrowRight, Loader2,
  Target, Activity, ChevronDown, ChevronUp, Zap, X,
  Wallet, UserCheck, Ghost, Pause,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { cn } from "@/lib/utils";
import { NurturingFormValues, Lead } from "./types";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { motion, useScroll, useSpring, useMotionValue, useTransform } from "motion/react";

// ─── Constants ────────────────────────────────────────────────────────────────

const NURTURING_STATUS_OPTIONS: {
  value: NurturingFormValues["nurturingStatus"];
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}[] = [
  { value: "ACTIVE",            label: "Active",            icon: Zap,        color: "text-emerald-500",  bg: "bg-emerald-500/10",  border: "border-emerald-500/25" },
  { value: "WAITING_BUDGET",    label: "Wait Budget",       icon: Wallet,     color: "text-amber-500",    bg: "bg-amber-500/10",    border: "border-amber-500/25" },
  { value: "WAITING_APPROVAL",  label: "Wait Approval",     icon: UserCheck,  color: "text-blue-500",     bg: "bg-blue-500/10",     border: "border-blue-500/25" },
  { value: "WAITING_TIMING",    label: "Wait Timing",       icon: Clock,      color: "text-violet-500",   bg: "bg-violet-500/10",   border: "border-violet-500/25" },
  { value: "UNRESPONSIVE",      label: "Unresponsive",      icon: Ghost,      color: "text-rose-500",     bg: "bg-rose-500/10",     border: "border-rose-500/25" },
  { value: "PAUSED",            label: "Paused",            icon: Pause,      color: "text-zinc-400",     bg: "bg-zinc-500/10",     border: "border-zinc-500/25" },
];

const NURTURING_OBJECTIVES = [
  "Budget cycle next quarter",
  "Need founder/board approval",
  "Need technical evaluation",
  "Waiting for hiring cycle",
  "Not an immediate priority",
  "Exploring competitors first",
  "Internal restructuring",
  "Seasonal business",
];

const CHANNEL_OPTIONS: { value: NurturingFormValues["nurturingChannel"]; label: string; icon: React.ElementType }[] = [
  { value: "CALL",     label: "Call",      icon: Phone        },
  { value: "WHATSAPP", label: "WhatsApp",  icon: MessageSquare },
  { value: "EMAIL",    label: "Email",     icon: Mail         },
  { value: "MEETING",  label: "Meeting",   icon: Video        },
  { value: "LINKEDIN", label: "LinkedIn",  icon: ExternalLink },
];

const BUYING_SIGNALS = [
  { id: "pricing",    label: "Pricing Discussed",       weight: 20 },
  { id: "timeline",   label: "Timeline Discussed",      weight: 20 },
  { id: "proposal",   label: "Proposal Requested",      weight: 20 },
  { id: "budget",     label: "Budget Confirmed",        weight: 20 },
  { id: "dm",         label: "Decision Maker Engaged",  weight: 20 },
];

const ACTIVITY_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
  // ─── Story events (shown in Relationship Timeline) ───
  CALL:              { icon: Phone,         label: "Call Logged" },
  EMAIL:             { icon: Mail,          label: "Email Sent" },
  WHATSAPP:          { icon: MessageSquare, label: "WhatsApp Sent" },
  MEETING:           { icon: Video,         label: "Meeting" },
  PROPOSAL:          { icon: Wallet,        label: "Proposal Sent" },
  LEAD:              { icon: UserCheck,     label: "Lead Created" },
  NOTE:              { icon: MessageSquare, label: "Note Added" },
  NURTURING_ENTERED: { icon: Target,        label: "Entered Nurturing" },
  PROMOTED_READY:    { icon: Sparkles,      label: "Promoted to Ready Now" },
  TASK:              { icon: CheckCircle2,  label: "Task" },
  // ─── Audit events (shown under "Show System Activity" toggle) ───
  SYS_STAGE:         { icon: ArrowRight,    label: "Stage Changed" },
  SYS_OWNER:         { icon: UserCheck,     label: "Owner Changed" },
  SYS_BR:            { icon: Activity,      label: "Business Review Saved" },
  SYS_QUAL:          { icon: Activity,      label: "Qualification Completed" },
  SYS_CLASS:         { icon: Activity,      label: "Classification Updated" },
  SYS_NURTURING:     { icon: Activity,      label: "Nurturing Updated" },
  SYS_CLOSED:        { icon: Activity,      label: "Lead Closed" },
  SYS_REOPEN:        { icon: Activity,      label: "Reopen Scheduled" },
  // ─── Legacy fallback (old records before SYS_ rename) ───
  STAGE:             { icon: ArrowRight,    label: "Stage Changed" },
  OWNER:             { icon: UserCheck,     label: "Owner Changed" },
  DEFAULT:           { icon: Activity,      label: "Activity" },
};

// Types that represent real business story events
const RELATIONSHIP_EVENTS = new Set([
  "CALL", "EMAIL", "WHATSAPP", "MEETING", "PROPOSAL", "LEAD",
  "NURTURING_ENTERED", "PROMOTED_READY",
]);

function isStoryEvent(act: { type: string; content: string }): boolean {
  if (RELATIONSHIP_EVENTS.has(act.type)) return true;
  // Task completed (not created) is meaningful
  if (act.type === "TASK" && act.content.startsWith("Task completed:")) return true;
  // Notes are user-authored content, include them
  if (act.type === "NOTE") return true;
  return false;
}

function getActivityConfig(type: string, content: string) {
  const t = type.toUpperCase();
  if (ACTIVITY_CONFIG[t]) return ACTIVITY_CONFIG[t];
  const lower = (content || "").toLowerCase();
  if (lower.includes("stage")) return ACTIVITY_CONFIG.STAGE;
  if (lower.includes("owner") || lower.includes("assigned")) return ACTIVITY_CONFIG.OWNER;
  if (lower.includes("meeting")) return ACTIVITY_CONFIG.MEETING;
  if (lower.includes("proposal")) return ACTIVITY_CONFIG.PROPOSAL;
  if (lower.includes("lead created")) return ACTIVITY_CONFIG.LEAD;
  return ACTIVITY_CONFIG.DEFAULT;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepNurturingFormProps {
  form: UseFormReturn<NurturingFormValues>;
  onSubmit: (values: NurturingFormValues) => Promise<void>;
  lead: Lead;
  onPromoteToReadyNow?: () => Promise<void>;
  promoting?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-amber-500" />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-foreground/80">{title}</p>
      </div>
    </div>
  );
}

// Custom multiselect dropdown for buying signals
function BuyingSignalsDropdown({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger Button with Pile of Badges */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full min-h-[38px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left",
          "bg-background/40 border-border/40 hover:border-border/70 transition-colors cursor-pointer",
          open && "border-emerald-500/40 ring-1 ring-emerald-500/25"
        )}
      >
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground/50">Select buying signals…</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((id) => {
              const sig = BUYING_SIGNALS.find((s) => s.id === id);
              if (!sig) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider"
                >
                  {sig.label}
                  <X
                    className="h-2.5 w-2.5 cursor-pointer hover:text-emerald-500/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(id);
                    }}
                  />
                </span>
              );
            })}
          </div>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/40 ml-auto shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {/* Dropdown Options List */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-popover shadow-xl p-1.5 space-y-0.5 animate-in fade-in-50 duration-100">
          {BUYING_SIGNALS.map((sig) => {
            const isSelected = selected.includes(sig.id);
            return (
              <button
                key={sig.id}
                type="button"
                onClick={() => onToggle(sig.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  isSelected
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{sig.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold opacity-60">+{sig.weight}pts</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepNurturingForm({
  form,
  onSubmit,
  lead,
  onPromoteToReadyNow,
  promoting = false,
}: StepNurturingFormProps) {
  const { register, watch, setValue } = form;

  // Buying signals state
  const [signals, setSignals] = useState<string[]>([]);
  const [objectiveOpen, setObjectiveOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`buying-signals-${lead.id}`);
    if (saved) {
      try { setSignals(JSON.parse(saved)); } catch { setSignals([]); }
    }
  }, [lead.id]);

  const toggleSignal = (id: string) => {
    const next = signals.includes(id) ? signals.filter(s => s !== id) : [...signals, id];
    setSignals(next);
    localStorage.setItem(`buying-signals-${lead.id}`, JSON.stringify(next));
  };

  // Engagement score (0–100, derived from signals)
  const engagementScore = BUYING_SIGNALS.filter(s => signals.includes(s.id))
    .reduce((acc, s) => acc + s.weight, 0);

  const scoreLabel = engagementScore <= 30 ? "Cold" : engagementScore <= 70 ? "Warm" : "Ready Now";
  const scoreColor = engagementScore <= 30
    ? "text-rose-500"
    : engagementScore <= 70
    ? "text-amber-500"
    : "text-emerald-500";

  // Parsed values
  const nurturingStatus = watch("nurturingStatus");
  const nurturingChannel = watch("nurturingChannel");
  const nextFollowUpAt = watch("nextFollowUpAt");
  const nurturingObjective = watch("nurturingObjective");

  // Last interaction info (derived from lead data)
  const lastInteractionDate = lead.lastActivityAt || lead.lastContactAt;

  // Follow-up status
  const followUpDate = nextFollowUpAt ? new Date(nextFollowUpAt) : null;
  const followUpIsOverdue = followUpDate && isPast(followUpDate);

  // Accordion timeline state
  const [expandedTimelineIndex, setExpandedTimelineIndex] = useState<number | null>(null);

  // Activities state for db-driven timeline
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const res = await fetch(`/api/crm/leads/${lead.id}/activities`);
        if (res.ok) {
          const data = await res.json();
          // Sort chronologically (oldest first) so timeline flows down
          const sorted = data.sort((a: any, b: any) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());
          setActivities(sorted);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
    
    // Listen for custom logged activity events to refresh
    const handleActivityLogged = () => {
      fetchActivities();
    };
    window.addEventListener("crm-activity-logged", handleActivityLogged);
    return () => window.removeEventListener("crm-activity-logged", handleActivityLogged);
  }, [lead.id]);

  useEffect(() => {
    if (activities.length > 0 && expandedTimelineIndex === null) {
      // Expand the last item (either follow-up or the latest activity)
      setExpandedTimelineIndex(followUpDate ? activities.length : activities.length - 1);
    }
  }, [activities, followUpDate, expandedTimelineIndex]);

  // Custom scroll parent tracker for accurate scroll progress using Motion Values
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrollProgressMV = useMotionValue(1);
  const springProgress = useSpring(scrollProgressMV, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const dotTop = useTransform(springProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    let scrollParent: HTMLElement | null = null;
    let parent = timelineRef.current?.parentElement;
    
    // Find closest scrollable parent container in layout
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        scrollParent = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const handleScroll = () => {
      if (!timelineRef.current) return;
      const elementRect = timelineRef.current.getBoundingClientRect();
      
      // Target the middle of the viewport (or middle of scroll parent if present)
      let targetY = window.innerHeight / 2;
      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        targetY = parentRect.top + parentRect.height / 2;
      }

      // Calculate how much of the timeline has scrolled past the midpoint
      const start = elementRect.top - targetY;
      const end = elementRect.bottom - targetY;
      const total = end - start;

      if (total > 0) {
        const progress = Math.min(Math.max(-start / total, 0), 1);
        scrollProgressMV.set(progress);
      }
    };

    if (scrollParent) {
      scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Trigger initial calculation
    setTimeout(handleScroll, 100);

    return () => {
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activities]);

  return (
    <div className="space-y-8">
      {/* ── 1. Engagement Score + Follow-up Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Custom SVG Engagement Score Gauge */}
        <div className="col-span-1 p-4 rounded-xl border border-border/40 bg-card/60 space-y-2 flex flex-col justify-between items-center text-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block w-full text-left">
            Engagement Score
          </span>
          
          <div className="relative flex flex-col items-center justify-center w-full my-1">
            <svg viewBox="0 0 100 55" className="w-full max-w-[130px] overflow-visible">
              <defs>
                <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
                  <stop offset="50%" stopColor="#f59e0b" /> {/* Amber */}
                  <stop offset="100%" stopColor="#10b981" /> {/* Green */}
                </linearGradient>
              </defs>
              
              {/* Background Arc */}
              <path
                d="M 12 50 A 38 38 0 0 1 88 50"
                fill="none"
                className="stroke-muted/30"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Active Arc */}
              <path
                d="M 12 50 A 38 38 0 0 1 88 50"
                fill="none"
                stroke="url(#gauge-grad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={119.38}
                strokeDashoffset={119.38 * (1 - engagementScore / 100)}
                className="transition-all duration-500 ease-out"
              />

              {/* Ticks */}
              {[0, 25, 50, 75, 100].map((t) => {
                const rad = (t / 100) * Math.PI;
                const x1 = 50 - 32 * Math.cos(rad);
                const y1 = 50 - 32 * Math.sin(rad);
                const x2 = 50 - 35 * Math.cos(rad);
                const y2 = 50 - 35 * Math.sin(rad);
                return (
                  <line
                    key={t}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="stroke-muted-foreground/40"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2="20" // Pointing left at 0
                y2="50"
                style={{
                  transform: `rotate(${(engagementScore / 100) * 180}deg)`,
                  transformOrigin: "50px 50px",
                }}
                className="stroke-foreground transition-transform duration-700 ease-out"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Center Pin */}
              <circle
                cx="50"
                cy="50"
                r="4.5"
                className="fill-background stroke-foreground"
                strokeWidth="2"
              />
            </svg>
            
            {/* Center Score Numbers - Clean spacing without overlap */}
            <div className="flex flex-col items-center justify-center mt-3">
              <span className={`text-2xl font-black font-mono leading-none ${scoreColor}`}>
                {engagementScore}
              </span>
              <span className="text-[9px] font-extrabold text-muted-foreground/60 block mt-1 uppercase tracking-wider">
                {scoreLabel}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-[9px] text-muted-foreground/40 font-bold border-t border-border/10 pt-2.5 mt-1 w-full">
            <span>0 · Cold</span>
            <span>31 · Warm</span>
            <span>71 · Ready</span>
          </div>
        </div>

        {/* Last Interaction */}
        <div className="p-4 rounded-xl border border-border/40 bg-card/60 flex flex-col justify-start gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">Last Interaction</span>
          <div className="flex-1 flex flex-col justify-center">
            {lastInteractionDate ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">{format(new Date(lastInteractionDate), "d MMM yyyy")}</p>
                <p className="text-[10px] text-muted-foreground/70 font-medium">
                  {formatDistanceToNow(new Date(lastInteractionDate), { addSuffix: true })}
                </p>
                {lead.nurturingChannel && (
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest block pt-0.5">
                    via {lead.nurturingChannel}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 px-3 rounded-lg border border-dashed border-border/30 bg-muted/5 text-center h-[62px] select-none">
                <MessageSquare className="h-4 w-4 text-muted-foreground/30 mb-0.5 animate-pulse" />
                <span className="text-[10px] text-muted-foreground/40 font-semibold">No interactions logged</span>
              </div>
            )}
          </div>
        </div>

        {/* Next Follow-up Summary */}
        <div className={cn(
          "p-4 rounded-xl border bg-card/60 flex flex-col justify-start gap-2",
          followUpIsOverdue ? "border-rose-500/30 bg-rose-500/5" : "border-border/40"
        )}>
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 block">Next Follow-up</span>
          <div className="flex-1 flex flex-col justify-center">
            {followUpDate ? (
              <div className="space-y-1">
                <p className={cn("text-sm font-bold", followUpIsOverdue ? "text-rose-500" : "text-foreground")}>
                  {format(followUpDate, "d MMM yyyy")}
                </p>
                <p className={cn("text-[10px]", followUpIsOverdue ? "text-rose-400 font-semibold" : "text-muted-foreground/70")}>
                  {followUpIsOverdue
                    ? `${Math.abs(Math.ceil((followUpDate.getTime() - Date.now()) / 86400000))}d overdue`
                    : formatDistanceToNow(followUpDate, { addSuffix: true })}
                </p>
                {nurturingChannel && (
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest block pt-0.5">
                    via {nurturingChannel}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 px-3 rounded-lg border border-dashed border-border/30 bg-muted/5 text-center h-[62px] select-none">
                <CalendarClock className="h-4 w-4 text-muted-foreground/30 mb-0.5 animate-pulse" />
                <span className="text-[10px] text-muted-foreground/40 font-semibold">No follow-up scheduled</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* ── 2. Follow-up Center ── */}
        <div className="rounded-xl border border-border/40 bg-card/45 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/10 bg-muted/5">
            <CalendarClock className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-foreground/80">Follow-up Center</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Date + Channel */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Next Follow-up Date & Time</Label>
                <DateTimePicker
                  value={nextFollowUpAt || ""}
                  onChange={(val) => setValue("nextFollowUpAt", val, { shouldDirty: true })}
                  className="h-8 text-xs bg-background/70 border border-border/40 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Channel</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CHANNEL_OPTIONS.map((ch) => {
                    const Icon = ch.icon;
                    const active = nurturingChannel === ch.value;
                    return (
                      <button
                        key={ch.value}
                        type="button"
                        onClick={() => setValue("nurturingChannel", active ? null : ch.value, { shouldDirty: true })}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer",
                          active
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                            : "border-border/40 bg-background/50 text-muted-foreground hover:border-border/70 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Purpose / Outcome notes */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-foreground/60 uppercase tracking-wider">Purpose & Outcome Notes</Label>
              <Textarea
                className="text-xs bg-background/70 resize-none h-[100px] border-border/40 focus-visible:ring-0 focus-visible:border-amber-500/40"
                placeholder="e.g. Check if budget decision has been made. Previous call — postponed to next month..."
                {...register("conversationNotes")}
              />
            </div>
          </div>
        </div>

        {/* ── 3. Nurturing Status + Objective ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nurturing Status */}
          <div className="space-y-3">
            <SectionHeader icon={Activity} title="Nurturing Status" />
            <div className="flex flex-col gap-2 max-w-sm">
              <div className="grid grid-cols-3 gap-2">
                {NURTURING_STATUS_OPTIONS.slice(0, 3).map((opt) => {
                  const active = nurturingStatus === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      onClick={() => setValue("nurturingStatus", active ? null : opt.value, { shouldDirty: true })}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                        active
                          ? `${opt.bg} ${opt.border} ${opt.color} ring-1 ring-current/25 shadow-md shadow-current/5 scale-[1.02]`
                          : "border-border/40 bg-card/30 text-muted-foreground hover:border-border/70 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "animate-pulse" : "opacity-60")} />
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {NURTURING_STATUS_OPTIONS.slice(3, 6).map((opt) => {
                  const active = nurturingStatus === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      onClick={() => setValue("nurturingStatus", active ? null : opt.value, { shouldDirty: true })}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                        active
                          ? `${opt.bg} ${opt.border} ${opt.color} ring-1 ring-current/25 shadow-md shadow-current/5 scale-[1.02]`
                          : "border-border/40 bg-card/30 text-muted-foreground hover:border-border/70 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "animate-pulse" : "opacity-60")} />
                    </button>
                  );
                })}
              </div>
            </div>
            
            {nurturingStatus && (
              <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider mt-2">
                Status: <span className={cn(NURTURING_STATUS_OPTIONS.find(o => o.value === nurturingStatus)?.color, "font-black uppercase")}>
                  {NURTURING_STATUS_OPTIONS.find(o => o.value === nurturingStatus)?.label}
                </span>
              </div>
            )}
          </div>

          {/* Nurturing Objective */}
          <div className="space-y-3">
            <SectionHeader icon={Target} title="Nurturing Objective" />

            {/* Quick-select presets */}
            <div className="relative space-y-1.5">
              <button
                type="button"
                onClick={() => setObjectiveOpen(o => !o)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-muted-foreground uppercase tracking-wider transition-colors"
              >
                Quick Select
                {objectiveOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              {objectiveOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setObjectiveOpen(false)} />
                  <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl border border-border/40 bg-popover shadow-xl p-1.5 space-y-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                    {NURTURING_OBJECTIVES.map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => {
                          setValue("nurturingObjective", obj, { shouldDirty: true });
                          setObjectiveOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Textarea
              className="text-xs bg-card/40 resize-none h-[120px] border-border/40 focus-visible:ring-0 focus-visible:border-amber-500/40"
              placeholder="Describe why this lead is being nurtured rather than closed now..."
              {...register("nurturingObjective")}
              value={nurturingObjective || ""}
            />
          </div>
        </div>

        {/* ── 4. Buying Signals (Signal Tracker) ── */}
        <div className="space-y-3">
          <SectionHeader icon={Zap} title="Buying Signals" />
          <BuyingSignalsDropdown
            selected={signals}
            onToggle={toggleSignal}
          />
        </div>

        {/* ── 5. Relationship Timeline ── */}
        <div className="space-y-4">
          <SectionHeader icon={Clock} title="Relationship Timeline" />

          {loadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6]" />
            </div>
          ) : (() => {
            // Filter story events
            const storyEvents = activities.filter(isStoryEvent);

            // Append next follow-up as a story milestone if scheduled
            const storyMilestones = [
              ...storyEvents.map((act) => {
                const cfg = getActivityConfig(act.type, act.content);
                const actorName = act.user
                  ? `${act.user.firstName || ""} ${act.user.lastName || ""}`.trim() || "System"
                  : "System";
                return {
                  title: act.type === "TASK"
                    ? act.content.startsWith("Task completed:") ? "Task Completed"
                      : act.content.startsWith("Task created:") ? "Task Created"
                      : cfg.label
                    : cfg.label,
                  date: format(new Date(act.performedAt), "d MMM yyyy"),
                  time: format(new Date(act.performedAt), "h:mm a"),
                  desc: act.content,
                  icon: cfg.icon,
                  actor: act.user,
                  actorName,
                };
              }),
            ];

            if (followUpDate) {
              storyMilestones.push({
                title: "Next Follow-up",
                date: format(followUpDate, "d MMM yyyy"),
                time: format(followUpDate, "h:mm a"),
                desc: `${followUpIsOverdue ? "⚠️ Overdue —" : "Scheduled:"} Channel ${nurturingChannel || "not specified"}.`,
                icon: CalendarClock,
                actor: lead.owner,
                actorName: lead.owner ? `${lead.owner.firstName || ""} ${lead.owner.lastName || ""}`.trim() : "Owner",
              });
            }

            return (
              <div>
                {/* ─── Main Relationship Timeline ─── */}
                {storyMilestones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 rounded-xl border border-dashed border-border/30 bg-muted/5">
                    <Clock className="h-6 w-6 text-muted-foreground/25" />
                    <p className="text-[11px] font-semibold text-muted-foreground/40">
                      No story events yet — log a call, email, or meeting to start the timeline.
                    </p>
                  </div>
                ) : (
                  <div ref={timelineRef} className="relative ml-2 space-y-3 py-2">
                    {/* Timeline Line */}
                    <motion.div
                      className="absolute left-[12px] md:left-[20px] transform -translate-x-1/2 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent to-[#aa42ff] origin-top"
                      style={{ scaleY: springProgress }}
                    />
                    {/* Moving Dot at end of line */}
                    <motion.div
                      className="absolute left-[12px] md:left-[20px] z-20 pointer-events-none"
                      style={{ top: dotTop, y: "-50%", x: "-50%" }}
                    >
                      <div className="w-[8px] h-[8px] rounded-full bg-[#aa42ff] shadow-[0_0_10px_rgba(170,66,255,0.8)]" />
                    </motion.div>

                    {storyMilestones.map((m, idx) => {
                      const isExpanded = expandedTimelineIndex === idx;
                      const IconComponent = m.icon;
                      const avatarUrl = m.actor?.avatarUrl || lead.owner?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format";

                      return (
                        <div key={idx} className="relative pl-10 md:pl-12 pb-3 group">
                          {/* Accordion Card */}
                          <div
                            onClick={() => setExpandedTimelineIndex(isExpanded ? null : idx)}
                            className={cn(
                              "transition-all duration-300 rounded-2xl cursor-pointer select-none border",
                              isExpanded
                                ? "bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white p-5 shadow-lg shadow-violet-500/20 border-violet-600/30"
                                : "bg-slate-50/80 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800/40 p-4 shadow-xs"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <IconComponent className={cn("h-4 w-4 shrink-0", isExpanded ? "text-white" : "text-violet-500/70 dark:text-violet-400/70")} />
                                <span className={cn("text-xs font-bold tracking-tight", isExpanded ? "text-white" : "text-slate-800 dark:text-slate-200")}>
                                  {m.title}
                                </span>
                              </div>
                              <span className={cn("text-[10px] font-semibold shrink-0", isExpanded ? "text-violet-100/70" : "text-slate-400 dark:text-slate-500")}>
                                {m.date}{m.time && ` · ${m.time}`}
                              </span>
                            </div>
                            <p className={cn(
                              "text-[11px] mt-1.5 leading-relaxed",
                              isExpanded ? "text-violet-50/90" : "text-slate-500 dark:text-slate-400 line-clamp-2"
                            )}>
                              {m.desc}
                            </p>
                            {isExpanded && (
                              <div className="flex items-end justify-between mt-4 pt-1">
                                <div className="flex items-center gap-2">
                                  <img
                                    className="h-7 w-7 rounded-full ring-2 ring-violet-500 object-cover"
                                    src={avatarUrl}
                                    alt={m.actorName}
                                  />
                                  <span className="text-[10px] font-semibold text-violet-100">{m.actorName}</span>
                                </div>
                                <div className="h-9 w-9 rounded-xl bg-white shadow-md flex items-center justify-center text-[#8B5CF6] transition-transform duration-200 hover:scale-105 active:scale-95 shrink-0">
                                  <IconComponent className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

      </form>

      {/* ── 6. Promote to Ready Now ── */}
      {onPromoteToReadyNow && (
        <div className="rounded-xl border border-border/40 bg-card/45 p-4 flex items-center justify-between gap-4">
          <span className="text-xs font-black uppercase tracking-wider text-foreground/80">
            Promote to Meeting Readiness
          </span>
          <Button
            type="button"
            disabled={promoting}
            onClick={onPromoteToReadyNow}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold h-9 text-xs px-4 rounded-xl transition-all shadow-sm"
          >
            {promoting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Mark as Ready Now"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
