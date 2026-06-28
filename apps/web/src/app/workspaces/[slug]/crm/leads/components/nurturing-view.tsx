"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Clock, Users, AlertTriangle, ExternalLink, Search,
  ChevronDown, IndianRupee, CalendarClock, Inbox, LayoutList, LayoutGrid, User,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow, isThisWeek, formatDistanceToNow } from "date-fns";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead, OptionUser } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

type DirectionFilter = "all" | "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";
type FollowUpFilter = "all" | "upcoming" | "due_today" | "overdue";

interface NurturingViewProps {
  leads: Lead[];
  loading: boolean;
  owners: OptionUser[];
  showStats?: boolean;
}

const COLOR_MAP: Record<string, { stroke: string; gradient: string }> = {
  "text-violet-500": { stroke: "#8B5CF6", gradient: "url(#violetAreaSpark)" },
  "text-rose-500": { stroke: "#F43F5E", gradient: "url(#roseAreaSpark)" },
  "text-amber-500": { stroke: "#F59E0B", gradient: "url(#amberAreaSpark)" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatShort(val: number): string {
  if (val >= 10000000) return (val / 10000000).toFixed(1).replace(/\.0$/, "") + "Cr";
  if (val >= 100000)   return (val / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (val >= 1000)     return (val / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return val.toString();
}

const DIR_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  SHORT_TERM:   { label: "Short-Term",  color: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-500/10 border-violet-500/20" },
  MEDIUM_TERM:  { label: "Medium-Term", color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-500/10 border-amber-500/20"   },
  LONG_TERM:    { label: "Long-Term",   color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/10 border-sky-500/20"       },
  PARTNER_FOLLOWUP: { label: "Partner",  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  MANUAL_FOLLOWUP:  { label: "Manual",   color: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-500/10 border-rose-500/20"     },
};

function getFollowUpStatus(dateStr: string | null): { label: string; cls: string; status: FollowUpFilter } {
  if (!dateStr) return { label: "Not scheduled", cls: "text-muted-foreground/40", status: "upcoming" };
  const d = new Date(dateStr);
  if (isPast(d) && !isToday(d)) return { label: `${formatDistanceToNow(d)} ago`, cls: "text-rose-500 font-semibold", status: "overdue" };
  if (isToday(d))     return { label: "Due Today",   cls: "text-amber-500 font-semibold", status: "due_today" };
  if (isTomorrow(d))  return { label: "Tomorrow",    cls: "text-amber-400 font-semibold", status: "upcoming" };
  if (isThisWeek(d))  return { label: format(d, "EEE, d MMM"), cls: "text-foreground/80 font-medium", status: "upcoming" };
  return { label: format(d, "d MMM yyyy"), cls: "text-muted-foreground", status: "upcoming" };
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function NurtureMetricCard({
  label, value, icon: Icon, colorClass, bgClass, sparklineData,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  sparklineData: number[];
}) {
  const bgOpacityClass = colorClass.replace("text-", "bg-") + "/10";
  const theme = COLOR_MAP[colorClass] || { stroke: "#8B5CF6", gradient: "url(#violetAreaSpark)" };

  return (
    <div className="relative group border border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-[#111114]/70 backdrop-blur-md rounded-2xl p-5 transition-all flex flex-col justify-between h-[135px] text-left hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
      <div className={`absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 ${bgClass}`} />
      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        <div className="flex justify-between items-start w-full gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-tight">{label}</span>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${bgOpacityClass} border border-border/10`}>
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </div>
        </div>
        <div className="flex items-end justify-between w-full mt-2 gap-2">
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground font-mono leading-none group-hover:text-[#8B5CF6] transition-colors duration-300">
            {value}
          </h3>
          
          {/* Sparkline chart */}
          <div className="h-8 w-16 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={sparklineData.map((v, i) => ({ id: i, value: v }))}
                margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
              >
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={theme.stroke}
                  strokeWidth={1.5}
                  fillOpacity={0.1}
                  fill={theme.gradient}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function NurturingEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
        <Inbox className="h-7 w-7 text-amber-500" />
      </div>
      <h3 className="text-base font-semibold">No nurturing leads</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Leads classified as &quot;Nurture&quot; in the Classification step will appear here.
      </p>
    </div>
  );
}

// ─── Nurturing Grid Card ──────────────────────────────────────────────────────

function NurturingCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const initials = lead.companyName[0]?.toUpperCase() || "L";
  const dir = lead.nurturingDirection ? DIR_LABELS[lead.nurturingDirection] : null;
  const fup = getFollowUpStatus(lead.nextFollowUpAt);
  const value = lead.expectedValue ? Number(lead.expectedValue) : 0;

  return (
    <Card 
      onClick={() => router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)}
      className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-[20px] hover:shadow-lg transition-all duration-300 cursor-pointer group p-5 flex flex-col justify-between gap-4"
    >
      <div>
        {/* Top Section: Avatar left, Text right */}
        <div className="flex items-start gap-4">
          <div
            className="h-[72px] w-[72px] shrink-0 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-800/80 rounded-xl overflow-hidden"
          >
            {lead.avatarUrl ? (
              <img
                src={lead.avatarUrl}
                alt={lead.companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-black text-[#8B5CF6]">
                {initials}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {dir ? (
              <Badge
                variant="outline"
                className={`text-[9px] font-bold px-2 py-0.5 border ${dir.bg} ${dir.color}`}
              >
                {dir.label}
              </Badge>
            ) : (
              <span className="text-muted-foreground/30 text-[9px]">—</span>
            )}

            <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-base leading-snug tracking-tight truncate mt-1">
              {lead.companyName}
            </h4>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate mb-1.5">
              {lead.industry || lead.location || "General Prospect"}
            </p>
          </div>
        </div>

        {/* Contact details */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-750 dark:text-zinc-300 font-bold truncate">
            <User className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span className="truncate">{lead.contactPerson || "No contact"}</span>
          </div>
          {lead.designation && (
            <p className="text-[10px] text-muted-foreground pl-5 truncate">
              {lead.designation}
            </p>
          )}
        </div>

        {/* Owner */}
        <div className="flex items-center px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 mt-3.5">
          <div className="flex items-center gap-2 min-w-0">
            {lead.owner?.avatarUrl ? (
              <img 
                src={lead.owner.avatarUrl} 
                alt={lead.owner.firstName || "Owner"} 
                className="h-4 w-4 rounded-full object-cover border border-zinc-200/80 dark:border-zinc-805" 
              />
            ) : (
              <div className="h-4 w-4 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20">
                <User className="h-2.5 w-2.5 text-[#8B5CF6]" />
              </div>
            )}
            <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 truncate">
              {lead.owner ? `Owner: ${lead.owner.firstName} ${lead.owner.lastName || ""}` : "Owner: Unassigned"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section: Value & Follow-up */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {/* Value */}
        <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-center min-w-0">
          <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 block truncate max-w-full">
            Value
          </span>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 max-w-full">
            {value > 0 ? (
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 justify-center">
                <IndianRupee className="h-3 w-3" />
                {formatShort(value)}
              </span>
            ) : (
              <span className="text-muted-foreground/30 font-medium">₹—</span>
            )}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-center min-w-0">
          <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 block truncate max-w-full">
            Follow-up
          </span>
          <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 max-w-full">
            <span className={fup.cls}>{fup.label}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NurturingView({ leads, loading, owners, showStats = true }: NurturingViewProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  // View mode
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filters
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>("all");
  const [ownerOpen, setOwnerOpen] = useState(false);

  // Only WARM leads
  const nurturingLeads = useMemo(() => leads.filter((l) => l.classification === "WARM"), [leads]);

  // Metrics
  const metrics = useMemo(() => {
    const total = nurturingLeads.length;

    const dueThisWeek = nurturingLeads.filter((l) => {
      if (!l.nextFollowUpAt) return false;
      const d = new Date(l.nextFollowUpAt);
      return isThisWeek(d) && !isPast(d);
    }).length;

    const overdue = nurturingLeads.filter((l) => {
      if (!l.nextFollowUpAt) return false;
      const d = new Date(l.nextFollowUpAt);
      return isPast(d) && !isToday(d);
    }).length;

    return { total, dueThisWeek, overdue };
  }, [nurturingLeads]);

  // Dynamic Sparkline trend calculations based on creation date
  const trends = useMemo(() => {
    const now = new Date();
    // 6 intervals (last 5 days to today)
    const days = [5, 4, 3, 2, 1, 0].map(d => {
      const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      date.setHours(23, 59, 59, 999);
      return date;
    });

    const totalNurturingTrend = days.map(day => 
      nurturingLeads.filter(l => new Date(l.createdAt) <= day).length
    );

    const dueThisWeekTrend = days.map(day => 
      nurturingLeads.filter(l => {
        if (!l.nextFollowUpAt) return false;
        const d = new Date(l.nextFollowUpAt);
        return new Date(l.createdAt) <= day && isThisWeek(d) && !isPast(d);
      }).length
    );

    const overdueTrend = days.map(day => 
      nurturingLeads.filter(l => {
        if (!l.nextFollowUpAt) return false;
        const d = new Date(l.nextFollowUpAt);
        return new Date(l.createdAt) <= day && isPast(d) && !isToday(d);
      }).length
    );

    return {
      totalNurturingTrend,
      dueThisWeekTrend,
      overdueTrend,
    };
  }, [nurturingLeads]);

  // Filtered leads
  const filtered = useMemo(() => {
    return nurturingLeads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        l.companyName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q);

      const matchDir =
        directionFilter === "all" || l.nurturingDirection === directionFilter;

      const matchOwner = ownerFilter === "all" || l.ownerId === ownerFilter;

      const fup = getFollowUpStatus(l.nextFollowUpAt);
      const matchFollowUp = followUpFilter === "all" || fup.status === followUpFilter;

      return matchSearch && matchDir && matchOwner && matchFollowUp;
    });
  }, [nurturingLeads, search, directionFilter, ownerFilter, followUpFilter]);

  const dirButtons: { value: DirectionFilter; label: string }[] = [
    { value: "all",        label: "All" },
    { value: "SHORT_TERM", label: "Short-Term" },
    { value: "MEDIUM_TERM",label: "Medium-Term" },
    { value: "LONG_TERM",  label: "Long-Term" },
  ];

  const followUpButtons: { value: FollowUpFilter; label: string }[] = [
    { value: "all",      label: "All" },
    { value: "upcoming", label: "Upcoming" },
    { value: "due_today",label: "Due Today" },
    { value: "overdue",  label: "Overdue" },
  ];

  return (
    <div className="space-y-5">
      {/* Sparkline Gradient Definitions */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <linearGradient id="roseAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="violetAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="amberAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>

      {/* Metrics */}
      {showStats && (
        <div className="grid grid-cols-3 gap-3">
          <NurtureMetricCard
            label="Total Nurturing"
            value={metrics.total}
            icon={Users}
            colorClass="text-violet-500"
            bgClass="bg-linear-to-b from-transparent to-violet-500/10"
            sparklineData={trends.totalNurturingTrend}
          />
          <NurtureMetricCard
            label="Due This Week"
            value={metrics.dueThisWeek}
            icon={Clock}
            colorClass="text-amber-500"
            bgClass="bg-linear-to-b from-transparent to-amber-500/10"
            sparklineData={trends.dueThisWeekTrend}
          />
          <NurtureMetricCard
            label="Overdue Follow-ups"
            value={metrics.overdue}
            icon={AlertTriangle}
            colorClass="text-rose-500"
            bgClass="bg-linear-to-b from-transparent to-rose-500/10"
            sparklineData={trends.overdueTrend}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Search company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-card/50 border-border/40"
          />
        </div>

        {/* Direction Filter Pills */}
        <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20">
          {dirButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setDirectionFilter(btn.value)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                directionFilter === btn.value
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Follow-up Status Filter Pills */}
        <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20">
          {followUpButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFollowUpFilter(btn.value)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                followUpFilter === btn.value
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Owner dropdown */}
        <div className="relative">
          <button
            onClick={() => setOwnerOpen((o) => !o)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/40 bg-muted/20 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Owner
            <ChevronDown className="h-3 w-3" />
          </button>
          {ownerOpen && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1 w-44 z-20 animate-in fade-in-50 slide-in-from-top-1 duration-150">
              <div
                onClick={() => { setOwnerFilter("all"); setOwnerOpen(false); }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${ownerFilter === "all" ? "bg-accent text-foreground" : "hover:bg-muted text-muted-foreground"}`}
              >
                All Owners
              </div>
              {owners.map((o) => (
                <div
                  key={o.id}
                  onClick={() => { setOwnerFilter(o.id); setOwnerOpen(false); }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${ownerFilter === o.id ? "bg-accent text-foreground" : "hover:bg-muted text-muted-foreground"}`}
                >
                  {o.firstName} {o.lastName}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20 ml-auto shrink-0">
          <button
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
      </div>

      {/* Leads Render */}
      {loading ? (
        viewMode === "list" ? (
          <Card className="border border-border/40 shadow-sm overflow-hidden rounded-xl">
            <CardHeader className="px-5 py-3.5 border-b border-border bg-card/10">
              <div className="grid grid-cols-[2fr_1.3fr_1.1fr_1.2fr_1fr_1.1fr_72px] gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                <span>Company</span>
                <span>Contact</span>
                <span>Direction</span>
                <span>Next Follow-up</span>
                <span>Owner</span>
                <span>Value</span>
                <span className="text-right">Action</span>
              </div>
            </CardHeader>
            <CardContent className="p-2 bg-card/5">
              <div className="divide-y divide-border/20">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1.3fr_1.1fr_1.2fr_1fr_1.1fr_72px] items-center gap-3 px-4 py-3">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <div key={j} className="h-4 rounded bg-muted/50 animate-pulse" />
                    ))}
                    <div className="flex justify-end">
                      <div className="h-7 w-14 rounded-md bg-muted/50 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border border-zinc-200 dark:border-zinc-800/80 rounded-[20px] p-5 bg-card/5 space-y-4 shadow-xs">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-[72px] w-[72px] rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full rounded-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <NurturingEmpty />
      ) : viewMode === "list" ? (
        <Card className="border border-border/40 shadow-sm overflow-hidden rounded-xl">
          <CardHeader className="px-5 py-3.5 border-b border-border bg-card/10">
            <div className="grid grid-cols-[2fr_1.3fr_1.1fr_1.2fr_1fr_1.1fr_72px] gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              <span>Company</span>
              <span>Contact</span>
              <span>Direction</span>
              <span>Next Follow-up</span>
              <span>Owner</span>
              <span>Value</span>
              <span className="text-right">Action</span>
            </div>
          </CardHeader>

          <CardContent className="p-2 bg-card/5">
            <div className="divide-y divide-border/20">
              {filtered.map((lead) => {
                const initials = lead.companyName[0]?.toUpperCase() || "L";
                const dir = lead.nurturingDirection ? DIR_LABELS[lead.nurturingDirection] : null;
                const fup = getFollowUpStatus(lead.nextFollowUpAt);
                const value = lead.expectedValue ? Number(lead.expectedValue) : 0;

                return (
                  <div
                    key={lead.id}
                    className="grid grid-cols-[2fr_1.3fr_1.1fr_1.2fr_1fr_1.1fr_72px] items-center gap-3 px-4 py-3 hover:bg-muted/20 rounded-lg transition-all group text-xs border border-transparent hover:border-border/30 hover:shadow-xs cursor-pointer"
                    onClick={() => router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)}
                  >
                    {/* Company */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0 border border-amber-500/20">
                        <AvatarImage src={lead.avatarUrl || ""} alt={lead.companyName} />
                        <AvatarFallback className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{lead.companyName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {lead.industry || lead.location || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{lead.contactPerson}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {lead.designation || lead.email || "—"}
                      </p>
                    </div>

                    {/* Direction */}
                    <div>
                      {dir ? (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 border ${dir.bg} ${dir.color}`}
                        >
                          {dir.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/30 text-[10px]">—</span>
                      )}
                    </div>

                    {/* Next Follow-up */}
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                      <span className={`text-[10px] ${fup.cls}`}>{fup.label}</span>
                    </div>

                    {/* Owner */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {lead.owner ? (
                        <>
                          <Avatar className="h-5 w-5 shrink-0 border border-[#8B5CF6]/10">
                            <AvatarImage
                              src={lead.owner.avatarUrl || ""}
                              alt={`${lead.owner.firstName || ""} ${lead.owner.lastName || ""}`.trim()}
                            />
                            <AvatarFallback className="text-[8px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
                              {`${lead.owner.firstName?.[0] || ""}${lead.owner.lastName?.[0] || ""}`.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {lead.owner.firstName}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground/30 text-[11px]">—</span>
                      )}
                    </div>

                    {/* Value */}
                    <div>
                      {value > 0 ? (
                        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <IndianRupee className="h-3 w-3" />
                          {formatShort(value)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30 font-medium">₹—</span>
                      )}
                    </div>

                    {/* Action */}
                    <div
                      className="flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-bold px-2.5 border-border/40 hover:border-[#8B5CF6]/40 hover:text-[#8B5CF6] transition-colors"
                        onClick={() => router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lead) => (
            <NurturingCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
