"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityKpiCards } from "./components/opportunity-kpi-cards";
import { OpportunityTable } from "./components/opportunity-table";
import { Opportunity, deriveFunnelStage } from "./components/types";

export function SalesConversionClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/crm/opportunities?brandSlug=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      const data = await res.json();

      // Derive funnel stage for each opportunity
      const mapped: Opportunity[] = (data as Opportunity[]).map((opp) => ({
        ...opp,
        funnelStage: deriveFunnelStage(opp),
      }));

      setOpportunities(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const t = setTimeout(fetchData, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className="flex items-center gap-2 cursor-pointer group select-none"
            onClick={() => setShowStats((p) => !p)}
          >
            <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-violet-400 transition-colors">
              Sales Conversion
            </h2>
            {showStats ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-400 transition-colors" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Convert qualified opportunities into paying clients.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/workspaces/${slug}/crm/leads`)}
            className="text-xs font-semibold border-border/40 text-muted-foreground hover:text-foreground h-8"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            View Lead Pipeline
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {showStats && <OpportunityKpiCards opportunities={opportunities} />}

      {/* Opportunity Table */}
      <OpportunityTable
        opportunities={opportunities}
        loading={loading}
        onAddClick={() => router.push(`/workspaces/${slug}/crm/leads`)}
      />
    </div>
  );
}
