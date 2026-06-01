"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  Loader2,
  IndianRupee,
  Calendar,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  value: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  lead: { id: string; companyName: string; contactPerson: string };
}

type FilterType = "all" | "DRAFT" | "SENT" | "NEGOTIATION" | "APPROVED" | "REJECTED";

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-muted/50 text-muted-foreground border-border/30",
  SENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  NEGOTIATION: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "SENT", label: "Sent" },
  { key: "NEGOTIATION", label: "Negotiation" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

export function ProposalsPageClient() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        filter === "all"
          ? `/api/crm/proposals`
          : `/api/crm/proposals?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) setProposals(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const totalValue = proposals.reduce((sum, p) => sum + Number(p.value), 0);
  const approvedValue = proposals
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + Number(p.value), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Proposals</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track all commercial proposals across your pipeline.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Proposals",
            value: proposals.length.toString(),
            color: "text-[#8B5CF6]",
          },
          {
            label: "Pipeline Value",
            value: `₹${totalValue.toLocaleString("en-IN")}`,
            color: "text-blue-500",
          },
          {
            label: "Won Value",
            value: `₹${approvedValue.toLocaleString("en-IN")}`,
            color: "text-emerald-500",
          },
          {
            label: "Win Rate",
            value:
              proposals.length > 0
                ? `${Math.round(
                    (proposals.filter((p) => p.status === "APPROVED").length /
                      proposals.length) *
                      100
                  )}%`
                : "-",
            color: "text-amber-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border/30 rounded-xl p-3 bg-card/30"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20 w-fit">
        <Filter className="h-3.5 w-3.5 text-muted-foreground ml-1" />
        {FILTERS.map((f) => (
          <button
            key={f.key}
            id={`proposals-filter-${f.key.toLowerCase()}`}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              filter === f.key
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Proposals Table */}
      <Card className="border border-border/40 shadow-none rounded-xl overflow-hidden">
        <CardHeader className="px-5 py-3 border-b border-border/30 bg-muted/10">
          <div className="grid grid-cols-[80px_2fr_1.5fr_1fr_1fr_100px] gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            <span>No.</span>
            <span>Title & Lead</span>
            <span>Value</span>
            <span>Sent</span>
            <span>Created</span>
            <span>Status</span>
          </div>
        </CardHeader>

        <CardContent className="p-2 bg-card/5">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6]" />
              <span className="text-xs">Loading proposals...</span>
            </div>
          ) : proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                <FileText className="h-6 w-6 text-primary/60" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                No proposals yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create proposals from within a Lead Profile.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  onClick={() =>
                    router.push(`/workspaces/${slug}/crm/leads/${p.lead.id}?tab=proposals`)
                  }
                  className="grid grid-cols-[80px_2fr_1.5fr_1fr_1fr_100px] items-center gap-4 px-4 py-3 hover:bg-muted/20 rounded-lg transition-all text-xs cursor-pointer border border-transparent hover:border-border/30"
                >
                  {/* Proposal Number */}
                  <span className="font-bold text-[#8B5CF6]">{p.proposalNumber}</span>

                  {/* Title + Lead */}
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {p.lead.companyName} · {p.lead.contactPerson}
                    </p>
                  </div>

                  {/* Value */}
                  <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <IndianRupee className="h-3 w-3 shrink-0" />
                    <span>{Number(p.value).toLocaleString("en-IN")}</span>
                  </div>

                  {/* Sent At */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {p.sentAt ? (
                      <>
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{new Date(p.sentAt).toLocaleDateString()}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/40">Not sent</span>
                    )}
                  </div>

                  {/* Created At */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3 shrink-0" />
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge
                      className={`text-[10px] border ${STATUS_CLASS[p.status] || "bg-muted/30 border-border/30"}`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
