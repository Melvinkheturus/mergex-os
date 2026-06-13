import React from "react";
import { ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DbRole } from "../../types";

interface RolesRegistryListProps {
  loading: boolean;
  roles: DbRole[];
  onSelect: (role: DbRole) => void;
  onDelete: (role: DbRole) => void;
}

export function RolesRegistryList({
  loading,
  roles,
  onSelect,
  onDelete,
}: RolesRegistryListProps) {
  return (
    <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-[#8B5CF6]" />
          Roles Registry
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Browse and configure organizational access clearances.
        </p>
      </div>

      {loading && roles.length === 0 ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-lg bg-neutral-200/60 dark:bg-white/5 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 bg-neutral-200/80 dark:bg-white/10 rounded-md w-1/4" />
                  <div className="h-2 bg-neutral-200/50 dark:bg-white/5 rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-neutral-200/70 dark:bg-white/10 rounded-lg w-28 shrink-0 self-end sm:self-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm hover:border-neutral-300 dark:hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-foreground truncate leading-none">
                      {r.label}
                    </p>
                    {r.isSystem ? (
                      <Badge
                        variant="outline"
                        className="text-[7.5px] uppercase tracking-wider border-[#8B5CF6]/25 text-[#8B5CF6] bg-[#8B5CF6]/3 font-extrabold px-1.5 py-0 rounded"
                      >
                        System
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[7.5px] uppercase tracking-wider border-amber-500/25 text-amber-600 bg-amber-500/3 font-extrabold px-1.5 py-0 rounded"
                      >
                        Custom
                      </Badge>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5 leading-relaxed">
                      {r.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className="inline-flex items-center justify-center gap-1.5 h-8 text-[10px] font-bold border border-neutral-200 dark:border-white/8 text-foreground hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/20 transition-all rounded-lg px-3.5 cursor-pointer bg-white dark:bg-black/20"
                >
                  Select Permissions
                </button>

                {!r.isSystem && (
                  <button
                    type="button"
                    onClick={() => onDelete(r)}
                    className="inline-flex items-center justify-center h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-lg cursor-pointer border border-transparent hover:border-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
