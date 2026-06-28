"use client";

import React, { useState, useEffect } from "react";
import { BarChart2 } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Radar } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { CustomTooltip } from "./custom-tooltip";
import { EmptyState } from "./empty-state";
import { Lead } from "./types";

export function LeadSources({ leads }: { leads: Lead[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No Lead Sources"
        description="Source distributions will show here once leads are tagged."
        hint="Tag your leads with a source in CRM"
      />
    );
  }

  const sourceMap: Record<string, { subject: string; count: number }> = {};
  leads.forEach((lead) => {
    const sourceName = lead.source?.name || "Unassigned";
    if (!sourceMap[sourceName]) {
      sourceMap[sourceName] = { subject: sourceName, count: 0 };
    }
    sourceMap[sourceName].count++;
  });

  const chartData = Object.values(sourceMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(item => ({
      subject: item.subject.length > 12 ? item.subject.slice(0, 10) + "..." : item.subject,
      fullName: item.subject,
      count: item.count,
    }));

  return (
    <div className={cn("w-full h-[240px] py-1 flex items-center justify-center transition-all duration-500 ease-out", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <ChartGradients />
          <PolarGrid stroke="rgba(0,0,0,0.06)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "currentColor", className: "text-[9px] font-semibold text-muted-foreground" }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 'auto']} 
            tick={{ fill: "currentColor", className: "text-[8px] font-mono text-muted-foreground/60" }}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip suffix=" lead" />} />
          <Radar
            name="Leads"
            dataKey="count"
            stroke="#8B5CF6"
            fill="url(#purpleGrad)"
            fillOpacity={0.5}
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
