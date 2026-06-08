"use client";

import { useState, useEffect, ElementType } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Activity,
  Phone,
  Mail,
  MessageCircle,
  StickyNote,
  CheckCircle2,
  Calendar,
  FileText,
  ArrowRight,
  User,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as LeadActivity } from "../../types";

interface TimelineCardProps {
  leadId: string;
}

// ─── Icon mapping ─────────────────────────────────────────────────────────────
// Maps activity type keywords → icon + color
const ACTIVITY_CONFIG: Record<string, { icon: ElementType; color: string; label: string }> = {
  CALL:       { icon: Phone,        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",       label: "Call Logged" },
  EMAIL:      { icon: Mail,         color: "text-amber-500 bg-amber-500/10 border-amber-500/20",     label: "Email Sent" },
  WHATSAPP:   { icon: MessageCircle,color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "WhatsApp Sent" },
  NOTE:       { icon: StickyNote,   color: "text-violet-500 bg-violet-500/10 border-violet-500/20", label: "Note Added" },
  TASK:       { icon: CheckCircle2, color: "text-rose-500 bg-rose-500/10 border-rose-500/20",       label: "Task" },
  MEETING:    { icon: Calendar,     color: "text-sky-500 bg-sky-500/10 border-sky-500/20",          label: "Meeting" },
  PROPOSAL:   { icon: FileText,     color: "text-orange-500 bg-orange-500/10 border-orange-500/20", label: "Proposal" },
  STAGE:      { icon: ArrowRight,   color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", label: "Stage Changed" },
  OWNER:      { icon: User,         color: "text-teal-500 bg-teal-500/10 border-teal-500/20",       label: "Owner Changed" },
  LEAD:       { icon: UserPlus,     color: "text-purple-500 bg-purple-500/10 border-purple-500/20", label: "Lead Created" },
  DEFAULT:    { icon: Activity,     color: "text-muted-foreground bg-muted/10 border-border/20",    label: "Activity" },
};

function getConfig(type: string, content: string) {
  // Try exact type match first
  if (ACTIVITY_CONFIG[type.toUpperCase()]) return ACTIVITY_CONFIG[type.toUpperCase()];
  // Fallback: scan content for keywords
  const lower = content.toLowerCase();
  if (lower.includes("stage")) return ACTIVITY_CONFIG.STAGE;
  if (lower.includes("owner") || lower.includes("assigned")) return ACTIVITY_CONFIG.OWNER;
  if (lower.includes("meeting")) return ACTIVITY_CONFIG.MEETING;
  if (lower.includes("proposal")) return ACTIVITY_CONFIG.PROPOSAL;
  if (lower.includes("lead created")) return ACTIVITY_CONFIG.LEAD;
  return ACTIVITY_CONFIG.DEFAULT;
}

function groupByDate(activities: LeadActivity[]) {
  const groups: Record<string, LeadActivity[]> = {};
  for (const act of activities) {
    const date = new Date(act.performedAt);
    const key = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "d MMM yyyy");
    if (!groups[key]) groups[key] = [];
    groups[key].push(act);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export function TimelineCard({ leadId }: TimelineCardProps) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/crm/leads/${leadId}/activities`);
        if (res.ok) setActivities(await res.json());
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [leadId]);

  const groups = groupByDate(activities);

  return (
    <Card className="border border-border/40 shadow-sm rounded-2xl bg-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-[#8B5CF6]" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {loading && activities.length === 0 ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/40 italic text-center py-4">
            No events logged yet.
          </p>
        ) : (
          <div className="space-y-5 max-h-[360px] overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Date header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 shrink-0">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border/20" />
                </div>

                {/* Events */}
                <div className="relative ml-2.5 border-l border-border/20 pl-4 space-y-4">
                  {group.items.map((act) => {
                    const cfg = getConfig(act.type, act.content);
                    const Icon = cfg.icon;
                    const actorName = act.user
                      ? `${act.user.firstName || ""} ${act.user.lastName || ""}`.trim() || "System"
                      : "System";

                    return (
                      <div key={act.id} className="relative flex gap-2.5">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${cfg.color}`}>
                          <Icon className="h-2.5 w-2.5" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          {/* Header row: type + time */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-foreground leading-tight">
                              {/* For TASK events, derive label from content */}
                              {act.type === "TASK"
                                ? act.content.startsWith("Task completed:") ? "Task Completed"
                                  : act.content.startsWith("Task created:") ? "Task Created"
                                  : cfg.label
                                : cfg.label}
                            </span>
                            <span className="text-[9px] text-muted-foreground/50 shrink-0">
                              {format(new Date(act.performedAt), "HH:mm")}
                            </span>
                          </div>

                          {/* Content */}
                          {act.content && (
                            <p className="text-[10px] text-muted-foreground/75 leading-relaxed break-words">
                              {act.content}
                            </p>
                          )}

                          {/* Actor */}
                          <span className="text-[9px] text-muted-foreground/40">
                            by {actorName}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
