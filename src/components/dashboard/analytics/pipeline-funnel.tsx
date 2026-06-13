"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Cell, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { ChartGradients } from "./chart-gradients";
import { CustomTooltip } from "./custom-tooltip";
import { EmptyState } from "./empty-state";
import { Lead } from "./types";

export function PipelineFunnel({ leads }: { leads: Lead[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Pipeline Data"
        description="CRM funnel stages will show here once leads are added."
        hint="Go to CRM → Add your first lead"
      />
    );
  }

  const stages = [
    { key: "intake", label: "Lead Intake" },
    { key: "review", label: "Business Review" },
    { key: "qualification", label: "Qualification" },
    { key: "hot", label: "Hot Leads" },
    { key: "discovery", label: "Discovery" },
    { key: "proposal", label: "Proposal" },
    { key: "won", label: "Won" },
  ];

  function getLeadFunnelStageIndex(lead: Lead): number {
    if (lead.winLossStatus === "WON" || lead.stage?.name === "won") return 6;
    
    const stageName = lead.stage?.name?.toLowerCase() || "";
    
    if (
      stageName.includes("proposal") || 
      stageName.includes("negotiation") || 
      stageName.includes("commercial") || 
      stageName.includes("contract") || 
      stageName.includes("agreement")
    ) {
      return 5;
    }
    if (
      stageName.includes("discovery") || 
      stageName.includes("demo") || 
      stageName.includes("meeting") || 
      stageName.includes("call")
    ) {
      return 4;
    }
    if (lead.winLossStatus === "OPEN" && (lead.expectedValue && lead.expectedValue >= 100000)) {
      return 3;
    }
    if (stageName.includes("hot")) {
      return 3;
    }
    if (stageName.includes("qualif") || stageName.includes("qualified")) {
      return 2;
    }
    if (stageName.includes("review") || stageName.includes("business review")) {
      return 1;
    }
    return 0;
  }

  const stageCounts = [0, 0, 0, 0, 0, 0, 0];
  leads.forEach((lead) => {
    if (lead.winLossStatus === "LOST" || lead.stage?.name === "lost") {
      return;
    }
    const idx = getLeadFunnelStageIndex(lead);
    for (let i = 0; i <= idx; i++) {
      stageCounts[i]++;
    }
  });

  const chartData = stages.map((stage, i) => ({
    name: stage.label,
    value: stageCounts[i],
  }));

  const totalLeads = stageCounts[0];
  const wonCount = stageCounts[6];

  return (
    <div className={cn("flex flex-col h-full justify-between py-1 transition-all duration-500 ease-out", animated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
      <div className="text-left mb-2">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
          {totalLeads} Leads → {wonCount} Client{wonCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grow overflow-hidden flex items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <FunnelChart margin={{ top: 10, right: 80, left: 20, bottom: 10 }}>
            <ChartGradients />
            <Tooltip content={<CustomTooltip suffix=" leads" />} />
            <Funnel
              dataKey="value"
              data={chartData}
              isAnimationActive={true}
            >
              <LabelList 
                position="right" 
                fill="currentColor" 
                className="text-[9px] font-bold fill-foreground dark:fill-foreground" 
                dataKey="name" 
              />
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 6 ? "url(#emeraldGrad)" : "url(#purpleGrad)"} 
                />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
