import React from "react";
import { FileText } from "lucide-react";
import { EmptyState } from "./empty-state";
import { Proposal } from "./types";

export function PendingAgreements({ proposals }: { proposals: Proposal[] }) {
  const pending = proposals.filter(p => p.status === "DRAFT" || p.status === "SENT");

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Pending Agreements"
        description="Contracts awaiting signatures will appear here."
        hint="Go to Documents → Create Agreement"
      />
    );
  }

  return (
    <div className="space-y-3 py-1 max-h-[280px] overflow-y-auto pr-1">
      {pending.map((p) => (
        <div key={p.id} className="flex justify-between items-center text-xs p-2 rounded-lg border border-border/10 bg-muted/10">
          <div className="min-w-0">
            <p className="font-semibold text-foreground/80 truncate">{p.title}</p>
            <p className="text-[9px] text-muted-foreground/60 font-medium truncate">{p.proposalNumber}</p>
          </div>
          <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-semibold shrink-0">
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}
