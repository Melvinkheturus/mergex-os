"use client";

import React, { useState, useEffect } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, PolarAngleAxis, RadialBar } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { EmptyState } from "./empty-state";
import { Lead } from "./types";

export function ProposalWinRate({ leads }: { leads: Lead[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const wonLeadsCount = leads.filter(l => l.winLossStatus === "WON").length;
  const lostLeadsCount = leads.filter(l => l.winLossStatus === "LOST").length;
  const closedCount = wonLeadsCount + lostLeadsCount;
  
  if (closedCount === 0) {
    return (
      <EmptyState
        icon={PieChartIcon}
        title="No Proposals Closed"
        description="Win rate statistics will display once proposals are closed won or lost."
        hint="Close leads in CRM as Won or Lost"
      />
    );
  }

  const winRate = Math.round((wonLeadsCount / closedCount) * 100);
  const data = [
    {
      name: "Win Rate",
      value: winRate,
    }
  ];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-1 transition-all duration-500 ease-out", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <ResponsiveContainer width="100%" height={180}>
        <RadialBarChart
          data={data}
          innerRadius={55}
          outerRadius={75}
          startAngle={90}
          endAngle={450}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <ChartGradients />
          <PolarAngleAxis tick={false} domain={[0, 100]} type="number" reversed />
          <RadialBar
            isAnimationActive={true}
            dataKey="value"
            cornerRadius={99}
            fill="url(#purpleGrad)"
            background={{
              className: "fill-zinc-100 dark:fill-zinc-800/60",
            }}
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan 
              x="50%" 
              dy="-0.3em" 
              className="fill-current text-muted-foreground/60 text-[9px] uppercase font-bold tracking-widest"
            >
              Win Rate
            </tspan>
            <tspan 
              x="50%" 
              dy="1.25em" 
              className="fill-current text-foreground text-2xl font-black font-mono"
            >
              {winRate}%
            </tspan>
          </text>
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="flex gap-6 text-xs font-semibold mt-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
          <span>Won: {wonLeadsCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Lost: {lostLeadsCount}</span>
        </div>
      </div>
    </div>
  );
}
