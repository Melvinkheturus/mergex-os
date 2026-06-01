"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format, formatDistanceToNowStrict, isToday, isTomorrow, isPast } from "date-fns";
import {
  Phone, Mail, MessageCircle, Calendar, FileText, Clock,
  ArrowRight, Activity, ChevronDown, ChevronUp, IndianRupee,
  CalendarClock, Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Lead, NEXT_ACTION_LABELS, NextActionType, AuditLogEntry } from "../_components/types";


interface LeadSidebarProps {
  lead: Lead;
}

const ACTIVITY_ACTION_META: Record<string, { label: string; color: string }> = {
  STAGE_CHANGED: { label: "Stage changed", color: "text-violet-500" },
  OWNER_CHANGED: { label: "Owner changed", color: "text-sky-500" },
  PROPOSAL_CREATED: { label: "Proposal created", color: "text-amber-500" },
  MEETING_SCHEDULED: { label: "Meeting scheduled", color: "text-emerald-500" },
  STATUS_CHANGED: { label: "Status changed", color: "text-rose-500" },
};

function formatFollowUpDate(dateStr: string | null): { text: string; urgent: boolean } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isToday(d)) return { text: "Today", urgent: true };
  if (isTomorrow(d)) return { text: "Tomorrow", urgent: false };
  if (isPast(d)) return { text: `${formatDistanceToNowStrict(d)} overdue`, urgent: true };
  return { text: format(d, "d MMM yyyy"), urgent: false };
}

export function LeadSidebar({ lead }: LeadSidebarProps) {
  const params = useParams();
  const leadId = lead.id;

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    fetch(`/api/crm/leads/${leadId}/audit`)
      .then((r) => r.ok ? r.json() : [])
      .then(setAuditLogs)
      .catch(() => {});
  }, [leadId]);

  const displayedLogs = showAllLogs ? auditLogs : auditLogs.slice(0, 4);

  const followUp = formatFollowUpDate(lead.nextFollowUpAt);
  const leadAge = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <aside className="flex flex-col gap-4 min-w-0">

      {/* ── Next Action ─────────────────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5">
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
                  Due: <span className="font-medium text-foreground">
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

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Quick Actions
          </p>
        </div>
        <div className="p-3 grid grid-cols-3 gap-2">
          {[
            {
              id: "call",
              icon: Phone,
              label: "Call",
              action: () => lead.phone && (window.location.href = `tel:${lead.phone}`),
              disabled: !lead.phone,
            },
            {
              id: "whatsapp",
              icon: MessageCircle,
              label: "WhatsApp",
              action: () => {
                if (lead.phone) {
                  const clean = lead.phone.replace(/\D/g, "");
                  window.open(`https://wa.me/${clean}`, "_blank");
                }
              },
              disabled: !lead.phone,
            },
            {
              id: "email",
              icon: Mail,
              label: "Email",
              action: () => lead.email && (window.location.href = `mailto:${lead.email}`),
              disabled: !lead.email,
            },
          ].map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                id={`sidebar-qa-${qa.id}`}
                onClick={qa.action}
                disabled={qa.disabled}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all duration-150 text-[10px] font-semibold ${
                  qa.disabled
                    ? "border-border/20 bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
                    : "border-border/30 bg-card hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] text-muted-foreground cursor-pointer active:scale-95"
                }`}
              >
                <Icon className="h-4 w-4" />
                {qa.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quick Stats ──────────────────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Quick Stats
          </p>
        </div>
        <div className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Lead Age
            </span>
            <span className="font-semibold text-foreground">
              {leadAge === 0 ? "Today" : `${leadAge}d`}
            </span>
          </div>

          {lead.expectedValue && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <IndianRupee className="h-3.5 w-3.5" />
                Est. Value
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ₹{Number(lead.expectedValue).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {followUp && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                Follow-up
              </span>
              <span className={`font-semibold ${followUp.urgent ? "text-rose-500" : "text-foreground"}`}>
                {followUp.text}
              </span>
            </div>
          )}

          {lead.lastContactAt && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Last Contact
              </span>
              <span className="font-semibold text-foreground">
                {formatDistanceToNowStrict(new Date(lead.lastContactAt), { addSuffix: true })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              BANT Score
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8B5CF6] rounded-full"
                  style={{ width: `${lead.bantScore}%` }}
                />
              </div>
              <span className="font-semibold text-foreground w-8 text-right">{lead.bantScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Audit History ────────────────────────────────────── */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-muted/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            Recent Activity
          </p>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground/50">
            No activity recorded yet
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {displayedLogs.map((log) => {
              const meta = ACTIVITY_ACTION_META[log.action] ?? { label: log.action, color: "text-muted-foreground" };
              const actorName = log.actor
                ? `${log.actor.firstName ?? ""} ${log.actor.lastName ?? ""}`.trim()
                : "System";
              const initials = actorName[0]?.toUpperCase() ?? "?";

              return (
                <div key={log.id} className="flex items-start gap-2.5 px-4 py-3">
                  <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-semibold ${meta.color}`}>{meta.label}</p>
                    {(log.oldValue || log.newValue) && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {log.oldValue && <span className="line-through">{log.oldValue}</span>}
                        {log.oldValue && log.newValue && " → "}
                        {log.newValue && <span>{log.newValue}</span>}
                      </p>
                    )}
                    <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                      {actorName} · {format(new Date(log.changedAt), "d MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}

            {auditLogs.length > 4 && (
              <button
                onClick={() => setShowAllLogs((v) => !v)}
                className="w-full px-4 py-2.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
              >
                {showAllLogs ? (
                  <><ChevronUp className="h-3 w-3" /> Show less</>
                ) : (
                  <><ChevronDown className="h-3 w-3" /> Show {auditLogs.length - 4} more</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
