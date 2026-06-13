"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { CustomTooltip } from "./custom-tooltip";
import { EmptyState } from "./empty-state";
import { Lead } from "./types";

export function PipelineHealth({ leads }: { leads: Lead[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No Health Data"
        description="Pipeline health tracking will display once leads are created."
      />
    );
  }

  const wonCount = leads.filter(l => l.winLossStatus === "WON" || l.stage?.name === "won").length;
  const lostCount = leads.filter(l => l.winLossStatus === "LOST" || l.stage?.name === "lost").length;
  const closedCount = wonCount + lostCount;
  const conversionPct = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 50;

  const openLeads = leads.filter(l => (!l.winLossStatus || l.winLossStatus === "OPEN") && l.stage?.name !== "won" && l.stage?.name !== "lost");
  const stalledCount = openLeads.filter(l => 
    new Date(l.createdAt) < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  ).length;

  const activeCount = Math.max(0, openLeads.length - stalledCount);
  const activeRate = openLeads.length > 0 ? Math.round((activeCount / openLeads.length) * 100) : 80;

  const healthIndex = Math.round((conversionPct * 0.6) + (activeRate * 0.4));

  const chartData = [
    { name: "Conversion Rate", value: conversionPct, fill: "url(#emeraldGrad)", color: "#10B981" },
    { name: "Active Ratio", value: activeRate, fill: "url(#purpleGrad)", color: "#8B5CF6" },
    { name: "Overall Health", value: healthIndex, fill: "url(#indigoGrad)", color: "#6366F1" },
  ];

  return (
    <div className={cn("grid grid-cols-5 gap-4 items-center h-full py-1 transition-all duration-500 ease-out", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <div className="col-span-3 h-[200px] flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="90%"
            barSize={8}
            data={chartData}
            startAngle={90}
            endAngle={450}
          >
            <ChartGradients />
            <Tooltip content={<CustomTooltip suffix="%" />} />
            <RadialBar
              background={{ fill: "rgba(0,0,0,0.03)" }}
              dataKey="value"
              cornerRadius={99}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
          <span className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground/60">Health Index</span>
          <span className="text-xl font-black text-foreground font-mono">{healthIndex}%</span>
        </div>
      </div>
      <div className="col-span-2 space-y-3.5 text-left pr-2">
        {chartData.slice().reverse().map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/80">
              <div className="flex items-center gap-1.5 truncate">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name}</span>
              </div>
              <span className="font-mono">{entry.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ backgroundColor: entry.color, width: `${entry.value}%` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
