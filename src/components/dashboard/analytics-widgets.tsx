"use client";

import { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./analytics/empty-state";
import { AnalyticsWidgetProps } from "./analytics/types";

// Import modular widgets
import { PipelineFunnel } from "./analytics/pipeline-funnel";
import { PipelineHealth } from "./analytics/pipeline-health";
import { PipelineValue } from "./analytics/pipeline-value";
import { LeadSources } from "./analytics/lead-sources";
import { ProposalWinRate } from "./analytics/proposal-win-rate";
import { ClientHealth } from "./analytics/client-health";
import { ProjectsByStatus } from "./analytics/projects-by-status";
import { Workload } from "./analytics/workload";
import { PendingAgreements } from "./analytics/pending-agreements";
import { InvoiceStatus } from "./analytics/invoice-status";

export function AnalyticsWidget({ 
  type, 
  teammates, 
  brands,
  leads = [],
  meetings = [],
  proposals = [],
  clients = []
}: AnalyticsWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-4/6 rounded" />
        </div>
        <div className="pt-4 flex items-end gap-2 h-32 justify-around">
          <Skeleton className="h-[40%] w-10 rounded-t" />
          <Skeleton className="h-[75%] w-10 rounded-t" />
          <Skeleton className="h-[50%] w-10 rounded-t" />
          <Skeleton className="h-[90%] w-10 rounded-t" />
        </div>
      </div>
    );
  }

  switch (type) {
    // ── CRM Analytics ───────────────────────────────────────
    case "pipeline-funnel":
      return <PipelineFunnel leads={leads} />;
    case "pipeline-health":
      return <PipelineHealth leads={leads} />;
    case "pipeline-value":
      return <PipelineValue leads={leads} />;
    case "lead-sources":
      return <LeadSources leads={leads} />;
    case "proposal-win-rate":
      return <ProposalWinRate leads={leads} />;

    // ── Client Analytics ────────────────────────────────────
    case "client-health":
      return <ClientHealth clients={clients} leads={leads} meetings={meetings} />;
    case "projects-by-status":
      return <ProjectsByStatus clients={clients} />;

    // ── Team Analytics ──────────────────────────────────────
    case "cx-workload":
      return <Workload teammates={teammates} leads={leads} />;

    // ── Document Analytics ──────────────────────────────────
    case "pending-agreements":
      return <PendingAgreements proposals={proposals} />;
    case "invoice-status":
      return <InvoiceStatus proposals={proposals} />;

    default:
      return (
        <EmptyState
          icon={HelpCircle}
          title="Widget Not Found"
          description="This module has no visualization layout configured yet."
        />
      );
  }
}
