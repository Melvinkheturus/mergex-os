"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead } from "./types";

interface LeadHealthCardProps {
  lead: Lead;
}

export function LeadHealthCard({ lead }: LeadHealthCardProps) {
  const [now] = useState(() => Date.now());
  const bh = Math.round(lead.bantScore * 0.40);
  const ih = Math.round(lead.icpScore * 0.20);
  
  let eh = 0;
  if (lead.lastActivityAt) {
    const diffDays = (now - new Date(lead.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) eh = 20;
    else if (diffDays <= 14) eh = 10;
  }
  
  let sh = 5;
  if (lead.stage) {
    const name = lead.stage.name.toLowerCase();
    if (name.includes("review") || name.includes("stage2") || name.includes("business")) sh = 10;
    else if (name.includes("qualification") || name.includes("bant") || name.includes("stage3") || name.includes("qual")) sh = 15;
    else if (name.includes("classification") || name.includes("stage4") || name.includes("class")) sh = 20;
  }

  const healthScore = Math.min(100, Math.max(0, bh + ih + eh + sh));

  // Health Score Label
  let healthLabel = "Cold Lead";
  let healthColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
  if (healthScore > 80) {
    healthLabel = "Hot Opportunity";
    healthColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  } else if (healthScore > 60) {
    healthLabel = "Strong Prospect";
    healthColor = "text-violet-500 bg-violet-500/10 border-violet-500/20";
  } else if (healthScore > 30) {
    healthLabel = "Warming Up";
    healthColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  return (
    <Card className="border border-border/40 shadow-sm rounded-2xl bg-card/45 backdrop-blur-xs">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-[#8B5CF6]" /> Lead Health Score
        </CardTitle>
        <Badge className={`text-xs px-2.5 py-1 border font-bold ${healthColor}`}>
          {healthLabel}
        </Badge>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-4">
        {/* Main Score Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Overall Health Score</span>
              <span className="font-black text-foreground text-sm">{healthScore}/100</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 border border-border/20 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-violet-500 to-[#8B5CF6] rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown List - horizontal layout */}
        <div className="border-t border-border/10 pt-3.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">BANT Qualification (40%)</span>
            <p className="font-extrabold text-foreground">{bh}/40 pts</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">ICP Alignment (20%)</span>
            <p className="font-extrabold text-foreground">{ih}/20 pts</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Engagement Recency (20%)</span>
            <p className="font-extrabold text-foreground">{eh}/20 pts</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Stage Progress (20%)</span>
            <p className="font-extrabold text-foreground">{sh}/20 pts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
