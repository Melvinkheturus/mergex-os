import React from "react";
import { Loader2, RefreshCw, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Teammate } from "../../types";
import { StatusBadge } from "./status-badge";

interface MemberCardProps {
  teammate: Teammate;
  onClick: () => void;
  isSuperAdmin: boolean;
  restoring: string | null;
  archiving: string | null;
  onSuspend: (t: Teammate) => void;
  onRestore: (t: Teammate) => void;
  onArchive: (t: Teammate) => void;
}

function getInitials(t: { firstName: string | null; lastName: string | null; email: string }) {
  return ((t.firstName?.[0] ?? "") + (t.lastName?.[0] ?? t.email[0])).toUpperCase();
}

export function MemberCard({
  teammate,
  onClick,
  isSuperAdmin,
  restoring,
  archiving,
  onSuspend,
  onRestore,
  onArchive,
}: MemberCardProps) {
  const name = teammate.firstName ? `${teammate.firstName} ${teammate.lastName ?? ""}`.trim() : teammate.email;
  const isSuspended = teammate.status === "SUSPENDED";
  const isArchived = teammate.status === "ARCHIVED";
  const initials = getInitials(teammate);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border rounded-xl shadow-sm transition-all hover:border-neutral-300 dark:hover:border-white/12 cursor-pointer",
        isSuspended
          ? "border-amber-500/20 bg-amber-500/3 dark:bg-amber-500/5"
          : isArchived
          ? "border-red-500/15 bg-red-500/3 dark:bg-red-500/5 opacity-70"
          : "border-neutral-200 dark:border-white/5 bg-white dark:bg-[#0A0A0E]"
      )}
    >
      <div className="flex items-center gap-3">
        {teammate.avatarUrl ? (
          <img
            src={teammate.avatarUrl}
            alt={name}
            className={cn(
              "h-8 w-8 rounded-lg object-cover border border-neutral-200 dark:border-white/6 shrink-0",
              (isSuspended || isArchived) && "grayscale opacity-60"
            )}
          />
        ) : (
          <div
            className={cn(
              "h-8 w-8 rounded-lg border flex items-center justify-center text-xs font-extrabold shrink-0",
              isSuspended
                ? "bg-amber-500/5 border-amber-500/20 text-amber-600"
                : isArchived
                ? "bg-red-500/5 border-red-500/20 text-red-400"
                : "bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6]"
            )}
          >
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={cn(
                "text-xs font-bold truncate leading-none",
                (isSuspended || isArchived) && "text-muted-foreground"
              )}
            >
              {name}
            </p>
            <StatusBadge status={teammate.status} />
          </div>
          <p className="text-[10px] text-muted-foreground/60 truncate mt-1">{teammate.email}</p>
          {teammate.designation && (
            <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{teammate.designation}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap justify-end">
        <Badge
          variant="outline"
          className="text-[9px] uppercase tracking-wider border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold"
        >
          {teammate.role.label}
        </Badge>

        {teammate.status === "ACTIVE" && teammate.role.name !== "super_admin" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSuspend(teammate);
            }}
            className="h-7 px-3 text-[10px] font-bold text-neutral-500 hover:text-amber-600 hover:bg-amber-500/8 rounded-lg transition-colors cursor-pointer"
          >
            Suspend
          </button>
        )}

        {teammate.status === "SUSPENDED" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(teammate);
              }}
              disabled={restoring === teammate.id}
              className="h-7 px-3 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/8 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              {restoring === teammate.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Restore
            </button>
            {isSuperAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(teammate);
                }}
                disabled={archiving === teammate.id}
                className="h-7 px-3 text-[10px] font-bold text-red-400 hover:bg-red-500/8 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {archiving === teammate.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Archive className="w-3 h-3" />
                )}
                Archive
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
