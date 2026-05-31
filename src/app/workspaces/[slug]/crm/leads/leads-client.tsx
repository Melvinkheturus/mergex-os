"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { AddLeadDialog } from "./_components/add-lead-dialog";
import { LeadsStats } from "./_components/leads-stats";
import { LeadFilters } from "./_components/lead-filters";
import { LeadsTable } from "./_components/leads-table";
import {
  Lead,
  OptionStage,
  OptionSource,
  OptionUser,
  LeadFormValues,
} from "./_components/types";

export function LeadsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Shared Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<OptionStage[]>([]);
  const [sources, setSources] = useState<OptionSource[]>([]);
  const [owners, setOwners] = useState<OptionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  // Fetch Options & Leads
  const fetchData = async () => {
    try {
      setLoading(true);
      const optRes = await fetch(`/api/crm/options`);
      if (optRes.ok) {
        const { stages: st, sources: src, owners: own } = await optRes.json();
        setStages(st || []);
        setSources(src || []);
        setOwners(own || []);
      }

      const leadsRes = await fetch(`/api/crm/leads`);
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

  // Handle Create Lead
  const handleCreateLead = async (values: LeadFormValues) => {
    try {
      const servicesArray = values.services
        ? values.services.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await fetch(`/api/crm/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, services: servicesArray }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create lead");
      }

      toast.success("Lead created successfully");
      setIsDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      console.error("Create lead error:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    }
  };

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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">CRM Leads</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify, qualify, and track your active sales pipeline.
          </p>
        </div>

        <AddLeadDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          stages={stages}
          sources={sources}
          owners={owners}
          onSubmit={handleCreateLead}
        />
      </div>

      {/* Stats Summary Strip */}
      <LeadsStats leads={leads} />

      {/* Filter strip */}
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

      {/* Leads Table */}
      <LeadsTable
        leads={filteredLeads}
        loading={loading}
        onDelete={handleDeleteLead}
        onAddClick={() => setIsDialogOpen(true)}
      />
    </div>
  );
}
