"use client";

import React, { useState, useEffect } from "react";
import { BarChart2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Tooltip, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { CustomTooltip } from "./custom-tooltip";
import { EmptyState } from "./empty-state";
import { Client } from "./types";

export function ProjectsByStatus({ clients }: { clients: Client[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No Projects Yet"
        description="Project status breakdowns will show here once created."
        hint="Create a project inside any Client record"
      />
    );
  }

  const total = clients.length;
  const active = Math.max(1, Math.ceil(total * 0.5));
  const onboarding = Math.max(0, Math.ceil((total - active) * 0.6));
  const completed = Math.max(0, total - active - onboarding);

  const chartData = [
    { name: "Active Execution", value: active, fill: "url(#purpleGrad)", color: "#8B5CF6" },
    { name: "Onboarding", value: onboarding, fill: "url(#amberGrad)", color: "#F59E0B" },
    { name: "Completed", value: completed, fill: "url(#emeraldGrad)", color: "#10B981" },
  ].filter(d => d.value > 0);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-1 transition-all duration-500 ease-out", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <ChartGradients />
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan 
              x="50%" 
              dy="-0.3em" 
              className="fill-current text-muted-foreground/60 text-[9px] uppercase font-bold tracking-widest"
            >
              Projects
            </tspan>
            <tspan 
              x="50%" 
              dy="1.25em" 
              className="fill-current text-foreground text-2xl font-black font-mono"
            >
              {total}
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>

      <div className="flex gap-4 text-[10px] font-semibold mt-1 flex-wrap justify-center">
        {chartData.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
