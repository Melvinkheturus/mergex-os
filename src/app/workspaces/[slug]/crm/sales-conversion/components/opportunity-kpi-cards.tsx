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
import { Opportunity, formatCurrency, getStatus } from "./types";

interface KpiCardsProps {
  opportunities: Opportunity[];
}

function KpiCard({
  label,
  value,
  icon: Icon,
  colorClass,
  gradientClass,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  gradientClass: string;
}) {
  return (
    <div
      className={`relative rounded-xl border border-border/30 p-4 flex items-center gap-3.5 overflow-hidden group hover:border-border/60 transition-all duration-200 ${gradientClass}`}
    >
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}/15`}
      >
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 leading-tight">
          {label}
        </div>
      </div>
    </div>
  );
}

export function OpportunityKpiCards({ opportunities }: KpiCardsProps) {
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
    },
    {
      label: "Discovery",
      value: stats.discovery,
      icon: Users,
      colorClass: "text-sky-500",
      gradientClass: "bg-linear-to-b from-transparent to-sky-500/8",
    },
    {
      label: "Proposal",
      value: stats.proposal,
      icon: FileText,
      colorClass: "text-amber-500",
      gradientClass: "bg-linear-to-b from-transparent to-amber-500/8",
    },
    {
      label: "Closing",
      value: stats.closing,
      icon: HandshakeIcon,
      colorClass: "text-orange-500",
      gradientClass: "bg-linear-to-b from-transparent to-orange-500/8",
    },
    {
      label: "Won Deals",
      value: stats.wonDeals,
      icon: Trophy,
      colorClass: "text-emerald-500",
      gradientClass: "bg-linear-to-b from-transparent to-emerald-500/8",
    },
    {
      label: "Stalled Deals",
      value: stats.stalled,
      icon: AlertCircle,
      colorClass: "text-rose-500",
      gradientClass: "bg-linear-to-b from-transparent to-rose-500/8",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(String(stats.pipelineValue)),
      icon: IndianRupee,
      colorClass: "text-[#C084FC]",
      gradientClass: "bg-linear-to-b from-transparent to-[#C084FC]/8",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c) => (
        <KpiCard key={c.label} {...c} />
      ))}
    </div>
  );
}
