"use client";

import { useMemo } from "react";
import { TrendingUp, Flame, Calendar, FileText, Trophy } from "lucide-react";
import { Lead } from "./types";

interface LeadsStatsProps {
  leads: Lead[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className={`rounded-xl border border-border/30 p-4 flex items-center gap-4 ${bgClass}`}>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass} bg-opacity-10`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

export function LeadsStats({ leads }: LeadsStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalLeads = leads.length;

    const hotLeads = leads.filter((l) => l.temperature === "HOT").length;

    // Next follow-up due: leads where nextFollowUpAt is today or past and not won/lost
    const followUpDue = leads.filter((l) => {
      if (!l.nextFollowUpAt) return false;
      if (l.winLossStatus === "WON" || l.winLossStatus === "LOST") return false;
      return new Date(l.nextFollowUpAt) <= now;
    }).length;

    // Won this month
    const wonThisMonth = leads.filter((l) => {
      if (l.winLossStatus !== "WON") return false;
      // use updatedAt as proxy - leads don't carry closedAt yet
      return new Date(l.createdAt) >= startOfMonth;
    }).length;

    // Pipeline value (active leads only)
    const pipelineValue = leads
      .filter((l) => !l.winLossStatus || l.winLossStatus === "OPEN")
      .reduce((sum, l) => sum + (l.expectedValue ? parseFloat(l.expectedValue) : 0), 0);

    return {
      totalLeads,
      hotLeads,
      followUpDue,
      wonThisMonth,
      pipelineValue,
    };
  }, [leads]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        label="Total Leads"
        value={stats.totalLeads}
        icon={TrendingUp}
        colorClass="text-violet-500"
        bgClass="bg-linear-to-b from-transparent to-violet-500/10"
      />
      <StatCard
        label="Hot Leads"
        value={stats.hotLeads}
        icon={Flame}
        colorClass="text-rose-500"
        bgClass="bg-linear-to-b from-transparent to-rose-500/10"
      />
      <StatCard
        label="Follow-up Due"
        value={stats.followUpDue}
        icon={Calendar}
        colorClass="text-amber-500"
        bgClass="bg-linear-to-b from-transparent to-amber-500/10"
      />
      <StatCard
        label="Won This Month"
        value={stats.wonThisMonth}
        icon={Trophy}
        colorClass="text-emerald-500"
        bgClass="bg-linear-to-b from-transparent to-emerald-500/10"
      />
      <StatCard
        label="Pipeline Value"
        value={`₹${Math.round(stats.pipelineValue).toLocaleString("en-IN")}`}
        icon={FileText}
        colorClass="text-sky-500"
        bgClass="bg-linear-to-b from-transparent to-sky-500/10"
      />
    </div>
  );
}
