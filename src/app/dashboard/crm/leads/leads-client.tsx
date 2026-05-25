"use client";

import { useState } from "react";
import {
  TrendingUp, Search, Plus, Filter, MoreHorizontal,
  Flame, Thermometer, Snowflake, ChevronUp, ChevronDown,
  Minus, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineStage =
  | "LEAD_GENERATED" | "LEAD_ENRICHED" | "ICP_QUALIFIED" | "TEMPERATURE_ASSIGNED"
  | "WARM_NURTURE" | "COLD_NURTURE" | "MEETING_PREPARED" | "DISCOVERY_COMPLETED"
  | "QUALIFICATION_GATE" | "PROPOSAL_HANDOFF" | "WON" | "LOST";

type Temperature = "HOT" | "WARM" | "COLD";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  company?: string;
  industry?: string;
  jobTitle?: string;
  pipelineStage: PipelineStage;
  temperature?: Temperature;
  icpScore: number;
  sourceTag?: string;
  owner: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<PipelineStage, string> = {
  LEAD_GENERATED: "Generated",
  LEAD_ENRICHED: "Enriched",
  ICP_QUALIFIED: "ICP Qualified",
  TEMPERATURE_ASSIGNED: "Temp. Set",
  WARM_NURTURE: "Warm Nurture",
  COLD_NURTURE: "Cold Nurture",
  MEETING_PREPARED: "Mtg. Prepared",
  DISCOVERY_COMPLETED: "Discovery Done",
  QUALIFICATION_GATE: "Qual. Gate",
  PROPOSAL_HANDOFF: "Proposal",
  WON: "Won",
  LOST: "Lost",
};

const STAGE_COLORS: Record<PipelineStage, string> = {
  LEAD_GENERATED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  LEAD_ENRICHED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ICP_QUALIFIED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  TEMPERATURE_ASSIGNED: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  WARM_NURTURE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  COLD_NURTURE: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  MEETING_PREPARED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DISCOVERY_COMPLETED: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
  QUALIFICATION_GATE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  PROPOSAL_HANDOFF: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  WON: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  LOST: "bg-red-500/10 text-red-500 border-red-500/20",
};

function TemperatureIcon({ temp }: { temp?: Temperature }) {
  if (!temp) return <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />;
  if (temp === "HOT") return <Flame className="h-3.5 w-3.5 text-red-500" />;
  if (temp === "WARM") return <Thermometer className="h-3.5 w-3.5 text-amber-500" />;
  return <Snowflake className="h-3.5 w-3.5 text-blue-500" />;
}

function IcpBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-600 bg-emerald-500/10" :
    score >= 60 ? "text-amber-600 bg-amber-500/10" :
    score >= 40 ? "text-orange-600 bg-orange-500/10" :
    "text-muted-foreground bg-muted";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>
      {score}
      {score >= 80 ? <ChevronUp className="h-2.5 w-2.5" /> :
       score >= 40 ? <ArrowUpRight className="h-2.5 w-2.5" /> :
       <ChevronDown className="h-2.5 w-2.5" />}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <TrendingUp className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-base font-semibold">No leads yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Add your first lead manually or import from the Pipeline board.
      </p>
      <Button size="sm" className="mt-4" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1.5" />
        Add Lead
      </Button>
    </div>
  );
}

// ─── Lead Row ─────────────────────────────────────────────────────────────────

function LeadRow({ lead }: { lead: Lead }) {
  const initials = `${lead.firstName[0]}${lead.lastName[0]}`.toUpperCase();
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_40px] items-center gap-4 px-4 py-3 hover:bg-muted/40 rounded-lg transition-colors group text-sm">
      {/* Name + Company */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium truncate">{lead.firstName} {lead.lastName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {lead.jobTitle ?? "—"}{lead.company ? ` · ${lead.company}` : ""}
          </p>
        </div>
      </div>

      {/* Stage */}
      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${STAGE_COLORS[lead.pipelineStage]}`}>
        {STAGE_LABELS[lead.pipelineStage]}
      </span>

      {/* Temperature */}
      <div className="flex items-center gap-1.5">
        <TemperatureIcon temp={lead.temperature} />
        <span className="text-xs text-muted-foreground capitalize">
          {lead.temperature?.toLowerCase() ?? "—"}
        </span>
      </div>

      {/* ICP Score */}
      <div className="flex items-center gap-2">
        <IcpBadge score={lead.icpScore} />
        <Progress value={lead.icpScore} className="h-1 w-12 hidden sm:block" />
      </div>

      {/* Source */}
      <span className="text-xs text-muted-foreground truncate">
        {lead.sourceTag ?? "—"}
      </span>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="text-xs">View Details</DropdownMenuItem>
          <DropdownMenuItem className="text-xs">Edit Lead</DropdownMenuItem>
          <DropdownMenuItem className="text-xs">Move Stage</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function LeadsPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const leads: Lead[] = []; // TODO: fetch from API

  const filtered = leads.filter((l) => {
    const matchSearch = `${l.firstName} ${l.lastName} ${l.company ?? ""} ${l.email ?? ""}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || l.pipelineStage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All leads across every pipeline stage
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Lead
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length },
          { label: "Hot", value: leads.filter(l => l.temperature === "HOT").length },
          { label: "Won", value: leads.filter(l => l.pipelineStage === "WON").length },
          { label: "Avg ICP Score", value: leads.length ? Math.round(leads.reduce((s, l) => s + l.icpScore, 0) / leads.length) : 0 },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {(Object.keys(STAGE_LABELS) as PipelineStage[]).map(s => (
              <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="px-4 py-3 border-b border-border">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_40px] gap-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            <span>Lead</span>
            <span>Pipeline Stage</span>
            <span>Temp</span>
            <span>ICP Score</span>
            <span>Source</span>
            <span />
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {filtered.length === 0
            ? <EmptyState onAdd={() => {}} />
            : filtered.map(l => <LeadRow key={l.id} lead={l} />)
          }
        </CardContent>
      </Card>
    </div>
  );
}
