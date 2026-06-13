"use client";

import { Search, Filter, LayoutList, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { OptionStage, OptionSource, OptionUser } from "./types";

interface LeadFiltersProps {
  search: string;
  setSearch: (search: string) => void;
  stageFilter: string;
  setStageFilter: (stage: string) => void;
  ownerFilter: string;
  setOwnerFilter: (owner: string) => void;
  sourceFilter: string;
  setSourceFilter: (source: string) => void;
  stages: OptionStage[];
  owners: OptionUser[];
  sources: OptionSource[];
  viewMode?: "list" | "grid";
  setViewMode?: (mode: "list" | "grid") => void;
}

export function LeadFilters({
  search,
  setSearch,
  stageFilter,
  setStageFilter,
  ownerFilter,
  setOwnerFilter,
  sourceFilter,
  setSourceFilter,
  stages,
  owners,
  sources,
  viewMode,
  setViewMode,
}: LeadFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap items-center bg-card/30 p-3 rounded-xl border border-border/40">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search company, contacts, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-xs bg-muted/20"
        />
      </div>

      <Select value={stageFilter} onValueChange={setStageFilter}>
        <SelectTrigger className="w-36 h-8 text-xs bg-muted/20">
          <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/60" />
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {stages.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={ownerFilter} onValueChange={setOwnerFilter}>
        <SelectTrigger className="w-36 h-8 text-xs bg-muted/20">
          <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/60" />
          <SelectValue placeholder="All Owners" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Owners</SelectItem>
          {owners.map((o) => (
            <SelectItem key={o.id} value={o.id}>{o.firstName} {o.lastName}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sourceFilter} onValueChange={setSourceFilter}>
        <SelectTrigger className="w-36 h-8 text-xs bg-muted/20">
          <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/60" />
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          {sources.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {viewMode && setViewMode && (
        <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20 ml-auto shrink-0">
          <button
            id="crm-view-list"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              viewMode === "list"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="h-3 w-3" />
            List
          </button>
          <button
            id="crm-view-grid"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              viewMode === "grid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3 w-3" />
            Grid
          </button>
        </div>
      )}
    </div>
  );
}
