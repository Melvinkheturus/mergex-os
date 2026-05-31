"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lead } from "./types";

interface LeadsStatsProps {
  leads: Lead[];
}

export function LeadsStats({ leads }: LeadsStatsProps) {
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.temperature === "HOT").length;
  const avgIcp = totalLeads
    ? Math.round(leads.reduce((s, l) => s + l.icpScore, 0) / totalLeads)
    : 0;
  const pipelineValue = Math.round(
    leads.reduce((sum, l) => sum + (l.expectedValue ? parseFloat(l.expectedValue) : 0), 0)
  );

  const stats = [
    { label: "Total Leads", value: totalLeads, bg: "bg-muted/30" },
    { label: "Hot Leads", value: hotLeads, bg: "bg-rose-500/5 text-rose-500" },
    { label: "Avg ICP Score", value: avgIcp, bg: "bg-emerald-500/5 text-emerald-500" },
    {
      label: "Pipeline Value",
      value: `₹${pipelineValue.toLocaleString("en-IN")}`,
      bg: "bg-primary/5 text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ label, value, bg }) => (
        <Card key={label} className="border border-border/30 shadow-none">
          <CardContent className={`p-4 rounded-xl ${bg}`}>
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
