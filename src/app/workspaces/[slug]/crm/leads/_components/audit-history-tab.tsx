"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { History, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lead, AuditLogEntry } from "./types";

const ACTION_META: Record<string, { label: string; colorClass: string; dot: string }> = {
  STAGE_CHANGED: {
    label: "Stage changed",
    colorClass: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  OWNER_CHANGED: {
    label: "Owner changed",
    colorClass: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  PROPOSAL_CREATED: {
    label: "Proposal created",
    colorClass: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  MEETING_SCHEDULED: {
    label: "Meeting scheduled",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  STATUS_CHANGED: {
    label: "Status changed",
    colorClass: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

interface AuditHistoryTabProps {
  leadId: string;
  lead: Lead;
}

export function AuditHistoryTab({ leadId, lead }: AuditHistoryTabProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/crm/leads/${leadId}/audit`)
      .then((r) => r.ok ? r.json() : [])
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [leadId]);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border/20 bg-muted/5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <History className="h-4 w-4 text-[#8B5CF6]" />
            Audit History
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tracked changes to stage, ownership, status, proposals, and meetings
          </p>
        </div>

        {/* Lead creation entry */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-border/10">
          <div className="relative flex flex-col items-center">
            <div className="h-7 w-7 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-black text-[#8B5CF6]">L</span>
            </div>
            <div className="w-px flex-1 bg-border/20 mt-1 min-h-[16px]" />
          </div>
          <div className="min-w-0 flex-1 pb-2">
            <p className="text-xs font-semibold text-[#8B5CF6]">Lead created</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {lead.companyName} · {format(new Date(lead.createdAt), "d MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6]" />
            <span className="text-xs">Loading history...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mb-3">
              <History className="h-6 w-6 text-[#8B5CF6]" />
            </div>
            <p className="text-sm font-medium">No changes recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Stage, owner, and status changes appear here automatically
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {logs.map((log, i) => {
              const meta = ACTION_META[log.action] ?? {
                label: log.action,
                colorClass: "text-muted-foreground",
                dot: "bg-muted-foreground",
              };
              const actorName = log.actor
                ? `${log.actor.firstName ?? ""} ${log.actor.lastName ?? ""}`.trim()
                : "System";
              const initials = actorName[0]?.toUpperCase() ?? "?";
              const isLast = i === logs.length - 1;

              return (
                <div key={log.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="relative flex flex-col items-center">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[9px] font-bold bg-muted/60 text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {!isLast && (
                      <div className="w-px flex-1 bg-border/20 mt-1 min-h-[16px]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <p className={`text-xs font-semibold ${meta.colorClass}`}>{meta.label}</p>
                    {(log.oldValue || log.newValue) && (
                      <div className="flex items-center gap-1.5 mt-1">
                        {log.oldValue && (
                          <span className="text-[10px] bg-muted/40 text-muted-foreground px-1.5 py-0.5 rounded line-through">
                            {log.oldValue}
                          </span>
                        )}
                        {log.oldValue && log.newValue && (
                          <span className="text-[10px] text-muted-foreground/60">→</span>
                        )}
                        {log.newValue && (
                          <span className="text-[10px] bg-[#8B5CF6]/10 text-[#8B5CF6] px-1.5 py-0.5 rounded font-semibold">
                            {log.newValue}
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {actorName} · {format(new Date(log.changedAt), "d MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
