"use client";

import { useState } from "react";
import {
  Handshake, Plus, Search, IndianRupee, MoreHorizontal,
  Calendar, TrendingUp, Target, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DealStage = "PROSPECTING" | "QUALIFICATION" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";

interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedClose?: string;
  lead?: { firstName: string; lastName: string };
  company?: { name: string };
  owner: { firstName: string; lastName: string };
  createdAt: string;
}

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string }> = {
  PROSPECTING:   { label: "Prospecting",   color: "text-slate-600",   bg: "bg-slate-50 dark:bg-slate-900/30" },
  QUALIFICATION: { label: "Qualification", color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20" },
  PROPOSAL:      { label: "Proposal",      color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20" },
  NEGOTIATION:   { label: "Negotiation",   color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20" },
  CLOSED_WON:    { label: "Closed Won",    color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  CLOSED_LOST:   { label: "Closed Lost",   color: "text-red-600",     bg: "bg-red-50 dark:bg-red-900/20" },
};

function formatCurrency(value: number, currency: string) {
  if (currency === "INR") return `₹${(value / 100000).toFixed(1)}L`;
  return `$${(value / 1000).toFixed(0)}k`;
}

function DealCard({ deal }: { deal: Deal }) {
  const config = STAGE_CONFIG[deal.stage];
  return (
    <div className="group p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-all space-y-2">
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-medium leading-tight">{deal.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem className="text-xs">View Deal</DropdownMenuItem>
            <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5">
        <IndianRupee className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="text-sm font-bold">{formatCurrency(deal.value, deal.currency)}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{deal.probability}% close</span>
      </div>

      <Progress value={deal.probability} className="h-1" />

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{deal.company?.name ?? deal.lead?.firstName ?? "—"}</span>
        {deal.expectedClose && (
          <span className="flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5" />
            {new Date(deal.expectedClose).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}

function StageColumn({ stage, deals }: { stage: DealStage; deals: Deal[] }) {
  const config = STAGE_CONFIG[stage];
  const total = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className={`flex flex-col rounded-xl ${config.bg} border border-border min-w-56 w-56 shrink-0`}>
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{deals.length}</Badge>
        </div>
        {total > 0 && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatCurrency(total, "INR")} pipeline
          </p>
        )}
      </div>
      <div className="p-2 space-y-2 flex-1">
        {deals.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-[10px] text-muted-foreground/50">No deals</p>
          </div>
        ) : (
          deals.map(d => <DealCard key={d.id} deal={d} />)
        )}
        <button className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-dashed border-border text-[10px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
          <Plus className="h-3 w-3" /> Add Deal
        </button>
      </div>
    </div>
  );
}

export function DealsPage() {
  const [search, setSearch] = useState("");
  const deals: Deal[] = []; // TODO: fetch from API

  const filtered = deals.filter(d =>
    `${d.title} ${d.company?.name ?? ""} ${d.lead?.firstName ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const stages = Object.keys(STAGE_CONFIG) as DealStage[];
  const totalPipeline = filtered.filter(d => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const wonValue = filtered.filter(d => d.stage === "CLOSED_WON").reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Deals</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Revenue opportunities across all stages</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Pipeline", value: formatCurrency(totalPipeline, "INR"), icon: TrendingUp, color: "text-primary" },
          { label: "Revenue Won",     value: formatCurrency(wonValue, "INR"),       icon: Target,    color: "text-emerald-500" },
          { label: "Total Deals",     value: String(deals.length),                  icon: Handshake, color: "text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <div className="text-lg font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search deals…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {/* Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {stages.map(stage => (
            <StageColumn
              key={stage}
              stage={stage}
              deals={filtered.filter(d => d.stage === stage)}
            />
          ))}
        </div>
      </div>

      {deals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Handshake className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            Deals will appear here as leads progress through your pipeline.
          </p>
        </div>
      )}
    </div>
  );
}
