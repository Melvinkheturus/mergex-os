"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { ResponsiveContainer, PieChart, Tooltip, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { CustomTooltip } from "./custom-tooltip";
import { EmptyState } from "./empty-state";
import { Teammate, Lead } from "./types";

export function Workload({ teammates, leads }: { teammates: Teammate[]; leads: Lead[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (teammates.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Team Members"
        description="Invite teammates to see workloads."
        hint="Go to Settings → Team → Invite Members"
      />
    );
  }

  const activeTeammates = teammates
    .map((mate) => {
      const displayName = mate.firstName ? `${mate.firstName} ${mate.lastName ?? ""}` : mate.email;
      const pendingCount = leads.filter(l => 
        l.owner?.id === mate.id && 
        (!l.winLossStatus || l.winLossStatus === "OPEN") && 
        l.stage?.name !== "won" &&
        l.stage?.name !== "lost"
      ).length;

      return {
        id: mate.id,
        name: displayName.length > 18 ? displayName.slice(0, 16) + "..." : displayName,
        fullName: displayName,
        value: pendingCount,
        role: mate.role?.label || "Team Member",
        initials: mate.firstName 
          ? `${mate.firstName[0]}${mate.lastName ? mate.lastName[0] : ""}`.toUpperCase()
          : mate.email.slice(0, 2).toUpperCase(),
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalPending = activeTeammates.reduce((sum, item) => sum + item.value, 0);

  if (totalPending === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Pending Workload"
        description="All team members have cleared their active queues."
        hint="Assign new leads to teammates in CRM"
      />
    );
  }

  const GRADIENTS = [
    { fill: "url(#purpleGrad)", color: "#8B5CF6" },
    { fill: "url(#indigoGrad)", color: "#6366F1" },
    { fill: "url(#blueGrad)", color: "#3B82F6" },
    { fill: "url(#emeraldGrad)", color: "#10B981" },
    { fill: "url(#amberGrad)", color: "#F59E0B" },
    { fill: "url(#roseGrad)", color: "#EF4444" },
  ];

  const chartData = activeTeammates.map((mate, idx) => {
    const colorObj = GRADIENTS[idx % GRADIENTS.length];
    return {
      ...mate,
      fill: colorObj.fill,
      color: colorObj.color,
    };
  });

  return (
    <div className={cn("grid grid-cols-5 gap-4 items-center h-full py-1 transition-all duration-500 ease-out", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <div className="col-span-3 h-[200px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartGradients />
            <Tooltip content={<CustomTooltip suffix=" active leads" />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={chartData.length > 1 ? 3 : 0}
              dataKey="value"
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
          <span className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground/60">Total Active</span>
          <span className="text-2xl font-black text-foreground font-mono">{totalPending}</span>
          <span className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground/60">Leads</span>
        </div>
      </div>

      <div className="col-span-2 space-y-3.5 text-left pr-2 max-h-[220px] overflow-y-auto scrollbar-thin">
        {chartData.map((entry) => {
          const sharePct = Math.round((entry.value / totalPending) * 100);
          return (
            <div key={entry.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/80">
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    className="h-5.5 w-5.5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  >
                    {entry.initials}
                  </div>
                  <span className="truncate text-foreground font-semibold" title={entry.fullName}>{entry.name}</span>
                </div>
                <span className="font-mono text-foreground shrink-0 ml-1.5">{entry.value} ({sharePct})%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ backgroundColor: entry.color, width: `${sharePct}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
