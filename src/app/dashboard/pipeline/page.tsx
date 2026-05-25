"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, Download, SlidersHorizontal,
  Flame, Thermometer, Snowflake, ChevronRight, MoreHorizontal,
  User, Building2, Calendar, Target, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ─────────────────────────────────────
type LeadTemperature = "HOT" | "WARM" | "COLD";

type LeadPipelineStage =
  | "LEAD_GENERATED" | "LEAD_ENRICHED" | "ICP_QUALIFIED"
  | "TEMPERATURE_ASSIGNED" | "WARM_NURTURE" | "COLD_NURTURE"
  | "MEETING_PREPARED" | "DISCOVERY_COMPLETED" | "QUALIFICATION_GATE"
  | "PROPOSAL_HANDOFF" | "WON" | "LOST";

type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  industry: string | null;
  email: string | null;
  pipelineStage: LeadPipelineStage;
  temperature: LeadTemperature | null;
  icpScore: number;
  sourceTag: string | null;
  updatedAt: string;
  owner: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null };
  _count: { activities: number; followUps: number; meetings: number };
};

// ── Pipeline config ───────────────────────────
const STAGES: { key: LeadPipelineStage; label: string; color: string; bg: string }[] = [
  { key: "LEAD_GENERATED",    label: "Lead Generated",    color: "#6B7280", bg: "#F9FAFB" },
  { key: "LEAD_ENRICHED",     label: "Lead Enriched",     color: "#3B82F6", bg: "#EFF6FF" },
  { key: "ICP_QUALIFIED",     label: "ICP Qualified",     color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "TEMPERATURE_ASSIGNED", label: "Temp Assigned",  color: "#F59E0B", bg: "#FFFBEB" },
  { key: "WARM_NURTURE",      label: "Warm Nurture",      color: "#F97316", bg: "#FFF7ED" },
  { key: "COLD_NURTURE",      label: "Cold Nurture",      color: "#06B6D4", bg: "#ECFEFF" },
  { key: "MEETING_PREPARED",  label: "Meeting Prep",      color: "#10B981", bg: "#ECFDF5" },
  { key: "DISCOVERY_COMPLETED", label: "Discovery Done",  color: "#059669", bg: "#D1FAE5" },
  { key: "QUALIFICATION_GATE", label: "Qual Gate",        color: "#7C3AED", bg: "#EDE9FE" },
  { key: "PROPOSAL_HANDOFF",  label: "Proposal Handoff",  color: "#DC2626", bg: "#FEF2F2" },
  { key: "WON",               label: "Won ✓",             color: "#16A34A", bg: "#F0FDF4" },
  { key: "LOST",              label: "Lost ✗",            color: "#9CA3AF", bg: "#F3F4F6" },
];

// ── Temperature badge ─────────────────────────
function TempBadge({ temp }: { temp: LeadTemperature | null }) {
  if (!temp) return null;
  const config = {
    HOT:  { icon: Flame,       color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", label: "Hot" },
    WARM: { icon: Thermometer, color: "text-[#F97316]", bg: "bg-[#F97316]/10", label: "Warm" },
    COLD: { icon: Snowflake,   color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10", label: "Cold" },
  }[temp];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${config.color} ${config.bg}`}>
      <Icon className="w-2.5 h-2.5" /> {config.label}
    </span>
  );
}

// ── ICP Score ring ────────────────────────────
function IcpRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 50 ? "#F97316" : "#6B7280";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="#E5E7EB" strokeWidth="3" />
          <circle cx="16" cy="16" r="12" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 75.4} 75.4`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}

// ── Lead Card ─────────────────────────────────
function LeadCard({ lead, onMove }: {
  lead: Lead;
  onMove: (leadId: string, stage: LeadPipelineStage) => void;
}) {
  const router = useRouter();
  const stageIdx = STAGES.findIndex(s => s.key === lead.pipelineStage);
  const prevStage = stageIdx > 0 ? STAGES[stageIdx - 1] : null;
  const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;

  return (
    <div
      className="group bg-white dark:bg-[#16161A] border border-[#E5E7EB] dark:border-[#26262C] rounded-xl p-3.5 hover:border-[#8B5CF6]/30 hover:shadow-sm transition-all duration-150 cursor-pointer"
      onClick={() => router.push(`/dashboard/pipeline/${lead.id}`)}
    >
      {/* Top row: name + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {lead.firstName} {lead.lastName}
          </p>
          {lead.company && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
              <Building2 className="w-3 h-3 flex-shrink-0" /> {lead.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <IcpRing score={lead.icpScore} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/pipeline/${lead.id}`)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {prevStage && (
                <DropdownMenuItem onClick={() => onMove(lead.id, prevStage.key)}>
                  ← Move to {prevStage.label}
                </DropdownMenuItem>
              )}
              {nextStage && nextStage.key !== "LOST" && (
                <DropdownMenuItem onClick={() => onMove(lead.id, nextStage.key)}>
                  Move to {nextStage.label} →
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[#EF4444]" onClick={() => onMove(lead.id, "LOST")}>
                Mark as Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Temperature */}
      <div className="flex items-center gap-2 mb-2.5">
        <TempBadge temp={lead.temperature} />
        {lead.sourceTag && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md truncate max-w-[80px]">
            {lead.sourceTag}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground border-t border-[#E5E7EB] dark:border-[#26262C] pt-2 mt-1">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {lead._count.meetings}m
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {lead._count.followUps}fu
        </span>
        {lead.owner.avatarUrl ? (
          <img src={lead.owner.avatarUrl} alt="" className="w-4 h-4 rounded-full ml-auto object-cover" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center ml-auto">
            <User className="w-2.5 h-2.5 text-[#8B5CF6]" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stage Column ──────────────────────────────
function StageColumn({
  stage, leads, onMove, loading,
}: {
  stage: typeof STAGES[0]; leads: Lead[]; onMove: (id: string, s: LeadPipelineStage) => void; loading: boolean;
}) {
  return (
    <div className="flex-shrink-0 w-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-xs font-semibold text-foreground">{stage.label}</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className="min-h-[120px] rounded-xl p-2 flex flex-col gap-2 border border-dashed border-[#E5E7EB] dark:border-[#26262C]"
        style={{ backgroundColor: stage.bg }}
      >
        {loading ? (
          <>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </>
        ) : leads.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
            No leads
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onMove={onMove} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Pipeline Page ────────────────────────
export default function PipelinePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tempFilter, setTempFilter] = useState<LeadTemperature | "ALL">("ALL");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (search) params.set("search", search);
      if (tempFilter !== "ALL") params.set("temperature", tempFilter);
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json() as { leads: Lead[] };
      setLeads(data.leads ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, tempFilter, refreshKey]);

  useEffect(() => { void fetchLeads(); }, [fetchLeads]);

  const handleMove = useCallback(async (leadId: string, stage: LeadPipelineStage) => {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipelineStage: stage } : l));
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineStage: stage }),
      });
    } catch {
      setRefreshKey(k => k + 1); // revert on error
    }
  }, []);

  const handleExport = () => {
    const params = new URLSearchParams();
    if (tempFilter !== "ALL") params.set("temperature", tempFilter);
    window.open(`/api/export/leads?${params}`, "_blank");
  };

  // Group leads by stage
  const byStage = STAGES.reduce<Record<string, Lead[]>>((acc, s) => {
    acc[s.key] = leads.filter(l => l.pipelineStage === s.key);
    return acc;
  }, {});

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.temperature === "HOT").length;
  const avgIcp = leads.length ? Math.round(leads.reduce((s, l) => s + l.icpScore, 0) / leads.length) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-[#E5E7EB] dark:border-[#26262C]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Sales Pipeline</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalLeads} leads · {hotLeads} hot · avg ICP {avgIcp}/100
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export XLSX
            </Button>
            <Button size="sm" onClick={() => router.push("/dashboard/pipeline/new")}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Lead
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="pl-9 h-8 text-sm" />
          </div>

          {/* Temperature filter pills */}
          <div className="flex items-center gap-1.5">
            {(["ALL","HOT","WARM","COLD"] as const).map(t => (
              <button key={t} onClick={() => setTempFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  tempFilter === t
                    ? "bg-[#8B5CF6] text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                {t === "ALL" ? "All" : t === "HOT" ? "🔥 Hot" : t === "WARM" ? "🌡 Warm" : "❄️ Cold"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Board — horizontal scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-6 py-5">
        <div className="flex gap-3 min-w-max pb-4">
          {STAGES.map(stage => (
            <StageColumn
              key={stage.key}
              stage={stage}
              leads={byStage[stage.key] ?? []}
              onMove={handleMove}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
