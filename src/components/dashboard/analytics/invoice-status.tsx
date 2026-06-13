"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { ResponsiveContainer, PieChart, Tooltip, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { CustomTooltip } from "./custom-tooltip";
import { EmptyState } from "./empty-state";
import { Proposal } from "./types";

export function InvoiceStatus({ proposals }: { proposals: Proposal[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const collected = proposals.filter(p => p.status === "ACCEPTED" || p.status === "WON").reduce((sum, p) => sum + Number(p.value), 0);
  const unpaid = proposals.filter(p => p.status !== "ACCEPTED" && p.status !== "WON").reduce((sum, p) => sum + Number(p.value), 0);
  const total = collected + unpaid;
  
  if (total === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No Invoice Data"
        description="Collected vs unpaid invoice trends will show here."
        hint="Go to Documents → Create Invoice"
      />
    );
  }

  const collectedPercent = total > 0 ? Math.round((collected / total) * 100) : 0;

  const chartData = [
    { name: "Collected", value: collected, fill: "url(#emeraldGrad)", color: "#10B981" },
    { name: "Unpaid", value: unpaid, fill: "url(#amberGrad)", color: "#F59E0B" }
  ];

  const formatLakhs = (val: number) => {
    return val >= 100000 
      ? `₹${(val / 100000).toFixed(1)}L` 
      : `₹${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className={cn("w-full h-full py-1 transition-all duration-500 ease-out flex flex-col justify-between", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <div className="grow overflow-hidden relative h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ bottom: -30 }}>
            <ChartGradients />
            <Tooltip content={<CustomTooltip prefix="₹" />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <text x="50%" y="72%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="-0.2em" className="fill-current text-muted-foreground/60 text-[9px] uppercase font-bold tracking-widest">
                Collected
              </tspan>
              <tspan x="50%" dy="1.25em" className="fill-current text-foreground text-2xl font-black font-mono">
                {collectedPercent}%
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-6 justify-center text-[10px] font-bold mt-2 border-t border-border/10 pt-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
          <span className="text-muted-foreground">Collected: {formatLakhs(collected)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
          <span className="text-muted-foreground">Unpaid: {formatLakhs(unpaid)}</span>
        </div>
      </div>
    </div>
  );
}
