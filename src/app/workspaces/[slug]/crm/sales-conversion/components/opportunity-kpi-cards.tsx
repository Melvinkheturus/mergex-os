"use client";

import { useMemo } from "react";
import {
  Briefcase,
  Users,
  FileText,
  HandshakeIcon,
  Trophy,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Opportunity, formatCurrency, getStatus } from "./types";

interface KpiCardsProps {
  opportunities: Opportunity[];
}

const COLOR_MAP: Record<string, { stroke: string; gradient: string }> = {
  "text-violet-500": { stroke: "#8B5CF6", gradient: "url(#violetAreaSpark)" },
  "text-rose-500": { stroke: "#F43F5E", gradient: "url(#roseAreaSpark)" },
  "text-amber-500": { stroke: "#F59E0B", gradient: "url(#amberAreaSpark)" },
  "text-emerald-500": { stroke: "#10B981", gradient: "url(#emeraldAreaSpark)" },
  "text-sky-500": { stroke: "#0EA5E9", gradient: "url(#skyAreaSpark)" },
  "text-orange-500": { stroke: "#F97316", gradient: "url(#orangeAreaSpark)" },
  "text-[#C084FC]": { stroke: "#C084FC", gradient: "url(#violetAreaSpark)" },
};

function KpiCard({
  label,
  value,
  icon: Icon,
  colorClass,
  gradientClass,
  sparklineData,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  gradientClass: string;
  sparklineData: number[];
}) {
  const bgOpacityClass = colorClass.replace("text-", "bg-") + "/10";
  const theme = COLOR_MAP[colorClass] || { stroke: "#8B5CF6", gradient: "url(#violetAreaSpark)" };

  return (
    <div className="relative group border border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-[#111114]/70 backdrop-blur-md rounded-2xl p-5 transition-all flex flex-col justify-between h-[135px] text-left hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
      {/* Background Gradient overlay */}
      <div className={`absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 ${gradientClass}`} />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        {/* Top row: Label + Icon */}
        <div className="flex justify-between items-start w-full gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-tight">
            {label}
          </span>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${bgOpacityClass} border border-border/10`}>
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </div>
        </div>

        {/* Bottom row: Value + Sparkline */}
        <div className="flex items-end justify-between w-full mt-2 gap-4">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground font-mono leading-none group-hover:text-[#8B5CF6] transition-colors duration-300 truncate">
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

export function OpportunityKpiCards({ opportunities }: KpiCardsProps) {
  const now = new Date();

  // Dynamic Sparkline trend calculations based on creation date
  const trends = useMemo(() => {
    // 6 intervals (last 5 days to today)
    const days = [5, 4, 3, 2, 1, 0].map(d => {
      const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      date.setHours(23, 59, 59, 999);
      return date;
    });

    const openTrend = days.map(day => 
      opportunities.filter(o => new Date(o.createdAt) <= day && !o.winLossStatus).length
    );

    const discoveryTrend = days.map(day => 
      opportunities.filter(o => new Date(o.createdAt) <= day && o.funnelStage === "discovery" && !o.winLossStatus).length
    );

    const proposalTrend = days.map(day => 
      opportunities.filter(o => new Date(o.createdAt) <= day && (o.funnelStage === "proposal" || o.funnelStage === "solution") && !o.winLossStatus).length
    );

    const closingTrend = days.map(day => 
      opportunities.filter(o => new Date(o.createdAt) <= day && (o.funnelStage === "closure" || o.funnelStage === "handoff") && !o.winLossStatus).length
    );

    const wonTrend = days.map(day => 
      opportunities.filter(o => new Date(o.createdAt) <= day && o.winLossStatus === "WON").length
    );

    const stalledTrend = days.map(day => 
      opportunities.filter(o => new Date(o.createdAt) <= day && getStatus(o) === "stalled" && !o.winLossStatus).length
    );

    const pipelineTrend = days.map(day => 
      opportunities.filter(o => new Date(o.createdAt) <= day && !o.winLossStatus)
                   .reduce((sum, o) => sum + (o.expectedValue ? parseFloat(o.expectedValue) : 0), 0)
    );

    return {
      openTrend,
      discoveryTrend,
      proposalTrend,
      closingTrend,
      wonTrend,
      stalledTrend,
      pipelineTrend,
    };
  }, [opportunities]);

  const stats = useMemo(() => {
    const open = opportunities.filter((o) => !o.winLossStatus).length;

    const discovery = opportunities.filter(
      (o) => o.funnelStage === "discovery" && !o.winLossStatus
    ).length;

    const proposal = opportunities.filter(
      (o) => (o.funnelStage === "proposal" || o.funnelStage === "solution") && !o.winLossStatus
    ).length;

    const closing = opportunities.filter(
      (o) => (o.funnelStage === "closure" || o.funnelStage === "handoff") && !o.winLossStatus
    ).length;

    const wonDeals = opportunities.filter(
      (o) => o.winLossStatus === "WON"
    ).length;

    const stalled = opportunities.filter(
      (o) => getStatus(o) === "stalled" && !o.winLossStatus
    ).length;

    const pipelineValue = opportunities
      .filter((o) => !o.winLossStatus)
      .reduce((sum, o) => sum + (o.expectedValue ? parseFloat(o.expectedValue) : 0), 0);

    return { open, discovery, proposal, closing, wonDeals, stalled, pipelineValue };
  }, [opportunities]);

  const cards = [
    {
      label: "Open Opportunities",
      value: stats.open,
      icon: Briefcase,
      colorClass: "text-violet-500",
      gradientClass: "bg-linear-to-b from-transparent to-violet-500/8",
      sparklineData: trends.openTrend,
    },
    {
      label: "Won Deals",
      value: stats.wonDeals,
      icon: Trophy,
      colorClass: "text-emerald-500",
      gradientClass: "bg-linear-to-b from-transparent to-emerald-500/8",
      sparklineData: trends.wonTrend,
    },
    {
      label: "Stalled Deals",
      value: stats.stalled,
      icon: AlertCircle,
      colorClass: "text-rose-500",
      gradientClass: "bg-linear-to-b from-transparent to-rose-500/8",
      sparklineData: trends.stalledTrend,
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(String(stats.pipelineValue)),
      icon: IndianRupee,
      colorClass: "text-[#C084FC]",
      gradientClass: "bg-linear-to-b from-transparent to-[#C084FC]/8",
      sparklineData: trends.pipelineTrend,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sparkline Gradient Definitions */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <linearGradient id="emeraldAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
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
          <linearGradient id="skyAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="orangeAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
