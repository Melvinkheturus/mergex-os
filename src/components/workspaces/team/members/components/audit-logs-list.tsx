import React from "react";
import { Loader2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditLogsListProps {
  auditLoading: boolean;
  auditLogs: any[];
}

export function AuditLogsList({ auditLoading, auditLogs }: AuditLogsListProps) {
  const filteredAudits = auditLogs.filter((a) =>
    ["ROLE_CHANGED", "ACCOUNT_DEACTIVATED", "ACCOUNT_RESTORED", "ACCOUNT_ARCHIVED", "ACCESS_UPDATED"].includes(a.action)
  );

  return (
    <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4 grow flex flex-col">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-[#8B5CF6]" />
          Access History
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Audit log of permissions, roles, and administrative events for this user.
        </p>
      </div>

      <div className="grow bg-neutral-50/50 dark:bg-white/1 border border-neutral-100 dark:border-white/5 rounded-xl p-3 min-h-[180px]">
        {auditLoading ? (
          <div className="flex items-center justify-center h-full py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/60 space-y-1">
            <Activity className="w-6 h-6 stroke-[1.25px] opacity-40" />
            <p className="text-[10px] font-semibold">No logs recorded</p>
          </div>
        ) : (
          <div className="relative border-l border-neutral-200 dark:border-white/5 pl-3.5 space-y-3.5 py-1 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {filteredAudits.map((audit) => {
              const date = new Date(audit.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              });
              
              let title = "";
              let detail = "";
              let dotColor = "bg-[#8B5CF6]";

              switch (audit.action) {
                case "ROLE_CHANGED":
                  title = "Role Changed";
                  const metaRole = audit.metadata as any;
                  detail = `${metaRole?.oldRole ?? "Unknown"} → ${metaRole?.newRole ?? "Unknown"}`;
                  dotColor = "bg-purple-500";
                  break;
                case "ACCESS_UPDATED":
                  title = "Access Updated";
                  const metaAccess = audit.metadata as any;
                  const detailsList = [];
                  if (metaAccess?.newBrands && metaAccess.newBrands.length > 0) {
                    detailsList.push(`Brands: ${metaAccess.newBrands.join(", ")}`);
                  }
                  if (metaAccess?.newModules && metaAccess.newModules.length > 0) {
                    detailsList.push(`Modules: ${metaAccess.newModules.join(", ")}`);
                  }
                  if (metaAccess?.newDesignation) {
                    detailsList.push(`Designation: ${metaAccess.newDesignation}`);
                  }
                  detail = detailsList.join(" | ") || "Settings saved";
                  dotColor = "bg-blue-500";
                  break;
                case "ACCOUNT_DEACTIVATED":
                  title = "Account Suspended";
                  dotColor = "bg-amber-500";
                  break;
                case "ACCOUNT_RESTORED":
                  title = "Account Restored";
                  dotColor = "bg-emerald-500";
                  break;
                case "ACCOUNT_ARCHIVED":
                  title = "Account Archived";
                  dotColor = "bg-red-500";
                  break;
              }

              return (
                <div key={audit.id} className="relative space-y-0.5">
                  <div className={cn("absolute left-[-20.5px] top-1.5 w-2 h-2 rounded-full border border-white dark:border-[#07070B] shadow-sm", dotColor)} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-foreground leading-none">{title}</span>
                    <span className="text-[9px] text-muted-foreground/60 leading-none">{date}</span>
                  </div>
                  {detail && <p className="text-[9.5px] text-muted-foreground leading-normal mt-0.5">{detail}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
