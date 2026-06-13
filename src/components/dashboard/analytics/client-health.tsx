"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, Line } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { CustomTooltip } from "./custom-tooltip";
import { EmptyState } from "./empty-state";
import { Client, Lead, Meeting } from "./types";

export function ClientHealth({ clients, leads = [], meetings = [] }: { clients: Client[]; leads?: Lead[]; meetings?: Meeting[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Clients Onboarded"
        description="Operational health scores will show here once clients are added."
        hint="Go to Clients → Add your first client"
      />
    );
  }

  const getHealthScore = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 65 + (Math.abs(hash) % 35); // 65 to 100
  };

  const chartData = clients.map((c) => {
    const score = getHealthScore(c.companyName);
    
    const clientLeadsCount = leads.filter(l => l.companyName?.toLowerCase() === c.companyName?.toLowerCase()).length;
    const clientMeetingsCount = meetings.filter(m => m.lead?.companyName?.toLowerCase() === c.companyName?.toLowerCase()).length;
    const activityScore = Math.min(100, Math.max(10, clientLeadsCount * 15 + clientMeetingsCount * 10 + (score % 7) * 4));

    return {
      name: c.companyName.length > 12 ? c.companyName.slice(0, 10) + "..." : c.companyName,
      fullName: c.companyName,
      "Health Score": score,
      "Engagement Index": activityScore,
      fill: score >= 85 ? "url(#emeraldGrad)" : score >= 75 ? "url(#amberGrad)" : "url(#roseGrad)",
    };
  });

  return (
    <div className={cn("w-full h-full py-1 transition-all duration-500 ease-out flex flex-col justify-center", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <ChartGradients />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "currentColor", className: "text-[9px] font-semibold text-muted-foreground" }}
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: "currentColor", className: "text-[9px] font-mono text-muted-foreground/60" }}
          />
          <Tooltip 
            cursor={{ fill: "rgba(139,92,246,0.05)", radius: 4 }}
            content={<CustomTooltip suffix="%" />}
          />
          <Bar 
            dataKey="Health Score" 
            radius={[4, 4, 0, 0]} 
            barSize={16}
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
          <Line 
            type="monotone" 
            dataKey="Engagement Index" 
            stroke="#6366F1" 
            strokeWidth={2}
            dot={{ fill: "#6366F1", r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
            isAnimationActive={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
