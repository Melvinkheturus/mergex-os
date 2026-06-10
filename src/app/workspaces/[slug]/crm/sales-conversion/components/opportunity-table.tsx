"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpRight,
  Trophy,
  Users,
  FileText,
  HandshakeIcon,
  Clock,
  Building2,
} from "lucide-react";
import { Opportunity, formatCurrency, relativeTime, getStatus } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Stage badge configs
const STAGE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  discovery: {
    label: "Discovery Meeting",
    icon: Users,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
  solution: {
    label: "Solution Planning",
    icon: SlidersHorizontal,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  proposal: {
    label: "Proposal & Commercials",
    icon: FileText,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  closure: {
    label: "Agreement & Closure",
    icon: HandshakeIcon,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
  },
  handoff: {
    label: "Engagement Handoff",
    icon: Trophy,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  stalled: { label: "Stalled", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  won: { label: "Won", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
};



function AvatarInitials({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <Avatar className="h-7 w-7 shrink-0 border border-violet-500/10">
      <AvatarImage src={avatarUrl || ""} alt={name} className="object-cover" />
      <AvatarFallback className="text-[10px] font-bold bg-violet-500/15 text-violet-600 dark:text-violet-400">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

interface OpportunityTableProps {
  opportunities: Opportunity[];
  loading: boolean;
  onAddClick: () => void;
}

export function OpportunityTable({
  opportunities,
  loading,
  onAddClick,
}: OpportunityTableProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      const matchSearch = [o.companyName, o.contactPerson, o.industry]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStage = stageFilter === "all" || o.funnelStage === stageFilter;
      const status = getStatus(o);
      const matchStatus = statusFilter === "all" || status === statusFilter;
      return matchSearch && matchStage && matchStatus;
    });
  }, [opportunities, search, stageFilter, statusFilter]);

  return (
    <div className="rounded-2xl border border-border/30 bg-card/30 overflow-hidden">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border/20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-muted/30 border border-border/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="relative">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 text-xs bg-muted/30 border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="discovery">Discovery Meeting</option>
              <option value="solution">Solution Planning</option>
              <option value="proposal">Proposal & Commercials</option>
              <option value="closure">Agreement & Closure</option>
              <option value="handoff">Engagement Handoff</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 text-xs bg-muted/30 border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/40 transition-all cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="stalled">Stalled</option>
              <option value="won">Won</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              {["Company", "Stage", "Next Action", "Owner", "Value", "Last Activity", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-border/10 animate-pulse">
                  {[...Array(7)].map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-3.5 bg-muted/60 rounded-md w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">No opportunities found</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Qualified HOT leads will appear here. Promote a lead to start tracking conversions.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((opp) => {
                const stageCfg = STAGE_CONFIG[opp.funnelStage];
                const StageIcon = stageCfg.icon;
                const status = getStatus(opp);
                const statusCfg = STATUS_CONFIG[status];
                const ownerName = opp.owner
                  ? `${opp.owner.firstName || ""} ${opp.owner.lastName || ""}`.trim()
                  : "—";

                return (
                  <tr
                    key={opp.id}
                    className="border-b border-border/10 hover:bg-muted/20 transition-colors cursor-pointer group"
                    onClick={() =>
                      router.push(`/workspaces/${slug}/crm/sales-conversion/${opp.id}`)
                    }
                  >
                    {/* Company */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 shrink-0 border border-violet-500/10">
                          <AvatarImage src={opp.avatarUrl || ""} alt={opp.companyName} className="object-cover" />
                          <AvatarFallback className="text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            {opp.companyName[0]?.toUpperCase() || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">
                            {opp.companyName}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {opp.contactPerson}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${stageCfg.bg} ${stageCfg.color}`}
                      >
                        <StageIcon className="h-3 w-3" />
                        {stageCfg.label}
                      </span>
                    </td>

                    {/* Next Action */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-foreground">
                        {opp.nextAction || <span className="text-muted-foreground/30 font-medium">Not scheduled</span>}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3.5">
                      {opp.owner ? (
                        <div className="flex items-center gap-2">
                          <AvatarInitials name={ownerName} avatarUrl={opp.owner.avatarUrl} />
                          <span className="text-xs text-foreground">{ownerName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Value */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-foreground">
                        {formatCurrency(opp.expectedValue)}
                      </span>
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {relativeTime(opp.lastActivityAt || opp.updatedAt)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Arrow */}
                    <td className="px-4 py-3.5">
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-violet-500 transition-colors" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer row count */}
      {!loading && filtered.length > 0 && (
        <div className="px-4 py-3 border-t border-border/10 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {filtered.length} of {opportunities.length} opportunities
          </span>
          {stageFilter !== "all" || statusFilter !== "all" || search ? (
            <button
              onClick={() => {
                setSearch("");
                setStageFilter("all");
                setStatusFilter("all");
              }}
              className="text-[11px] text-violet-500 hover:text-violet-400 font-semibold transition-colors"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
