"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LayoutList, Columns3, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { LeadsStats } from "./_components/leads-stats";
import { LeadFilters } from "./_components/lead-filters";
import { LeadsTable } from "./_components/leads-table";
import { LeadsPipelineView } from "./_components/leads-pipeline-view";
import {
  Lead,
  OptionStage,
  OptionSource,
  OptionUser,
  LeadFormValues,
} from "./_components/types";

type ViewMode = "list" | "pipeline";

export function LeadsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Shared Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<OptionStage[]>([]);
  const [sources, setSources] = useState<OptionSource[]>([]);
  const [owners, setOwners] = useState<OptionUser[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Filter States
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  // Accordion Stats Visibility
  const [showStats, setShowStats] = useState(true);

  // Fetch Options & Leads
  const fetchData = async () => {
    try {
      setLoading(true);
      const optRes = await fetch(`/api/crm/options?brandSlug=${slug}`);
      if (optRes.ok) {
        const { stages: st, sources: src, owners: own } = await optRes.json();
        setStages(st || []);
        setSources(src || []);
        setOwners(own || []);
      }

      const leadsRes = await fetch(`/api/crm/leads?brandSlug=${slug}`);
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData || []);
      }
    } catch (error) {
      console.error("Error loading CRM data:", error);
      toast.error("Failed to load leads list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Handle Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete lead");
      }
      toast.success("Lead deleted successfully");
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (err: unknown) {
      console.error("Delete lead error:", err);
      const msg = err instanceof Error ? err.message : "Failed to delete lead.";
      toast.error(msg);
    }
  };

  // Handle Pipeline Stage Change (optimistic)
  const handlePipelineStageChange = async (leadId: string, stageId: string) => {
    const prevLeads = leads;
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, stageId, stage: stages.find((s) => s.id === stageId) }
          : l
      )
    );
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      const updated: Lead = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      toast.success("Stage updated");
    } catch {
      setLeads(prevLeads); // rollback
      toast.error("Failed to update stage");
    }
  };

  // Local filtering calculation
  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      `${l.companyName} ${l.contactPerson} ${l.email || ""} ${l.phone || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || l.stageId === stageFilter;
    const matchSource = sourceFilter === "all" || l.sourceId === sourceFilter;
    const matchOwner = ownerFilter === "all" || l.ownerId === ownerFilter;
    return matchSearch && matchStage && matchSource && matchOwner;
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            onClick={() => setShowStats((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-purple-400 transition-colors">
              Lead Pipeline
            </h2>
            {showStats ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify, qualify, and track your active sales pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20">
            <button
              id="crm-view-list"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              List
            </button>
            <button
              id="crm-view-pipeline"
              onClick={() => setViewMode("pipeline")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "pipeline"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Pipeline
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => router.push(`/workspaces/${slug}/crm/leads/new`)}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shrink-0 font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      {showStats && <LeadsStats leads={leads} />}

      {/* Filter strip - only in list mode */}
      {viewMode === "list" && (
        <LeadFilters
          search={search}
          setSearch={setSearch}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          ownerFilter={ownerFilter}
          setOwnerFilter={setOwnerFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          stages={stages}
          owners={owners}
          sources={sources}
        />
      )}

      {/* Main Content */}
      {viewMode === "list" ? (
        <LeadsTable
          leads={filteredLeads}
          loading={loading}
          onDelete={handleDeleteLead}
          onAddClick={() => router.push(`/workspaces/${slug}/crm/leads/new`)}
        />
      ) : (
        <LeadsPipelineView
          leads={leads}
          stages={stages}
          onStageChange={handlePipelineStageChange}
        />
      )}
    </div>
  );
}
