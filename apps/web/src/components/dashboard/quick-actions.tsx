"use client";

import { toast } from "sonner";
import { Plus, Users, FileText, Briefcase } from "lucide-react";

export function QuickActions() {
  const handleAction = (feature: string) => {
    toast.info(`Feature Coming Soon`, {
      description: `${feature} capability is currently being reconstructed as part of the Phase 1 implementation plan.`,
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => handleAction("New Lead creation")}
        className="h-8 px-3 rounded-md bg-[#4C1D95] hover:bg-[#3B0764] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <Briefcase className="w-3.5 h-3.5" />
        <span>+ New Lead</span>
      </button>

      <button
        onClick={() => handleAction("New Client onboarding")}
        className="h-8 px-3 rounded-md border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
      >
        <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
        <span>+ New Client</span>
      </button>

      <button
        onClick={() => handleAction("Document upload")}
        className="h-8 px-3 rounded-md border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5 text-[#8B5CF6]" />
        <span>+ Upload Document</span>
      </button>
    </div>
  );
}
