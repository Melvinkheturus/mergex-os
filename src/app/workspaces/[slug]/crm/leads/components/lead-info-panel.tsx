"use client";

import { useState } from "react";
import {
  Flame,
  Thermometer,
  Snowflake,
  Loader2,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead, OptionUser } from "./types";

interface LeadInfoPanelProps {
  lead: Lead;
  owners: OptionUser[];
  onLeadUpdate?: (lead: Lead) => void;
  onOwnerChange: (ownerId: string) => Promise<void>;
  savingOwner: boolean;
}

export function LeadInfoPanel({
  lead,
  owners,
  onOwnerChange,
  savingOwner,
}: LeadInfoPanelProps) {
  const [now] = useState(() => Date.now());

  // ── Health Score (computed from live qualification + pipeline data) ───────────
  //
  // The old formula used bantScore + icpScore (legacy fields that are no longer
  // updated by the new 6-step wizard forms) and lead.stage.name (which can lag).
  // We now derive the score entirely from fields that the wizard DOES write:
  //
  //  Qualification dimension scores  → max 5 each × 5 dims = 25 pts  (50%)
  //    • qualIcpFit                  → ICP match (0-5 scale in Step 3 = 0-25 raw)
  //    • qualBudgetLikelihood        → Budget readiness
  //    • qualDecisionMakerAccess     → Decision maker reach
  //    • qualNeed                    → Business need urgency
  //    • qualTimeline                → Timeline pressure
  //
  //  Classification                  → 0-20 pts  (20%)
  //    • HOT = 20, WARM = 12, COLD = 5, null = 0
  //
  //  Engagement recency              → 0-20 pts  (20%)
  //    • last activity ≤7d=20, ≤14d=12, ≤30d=6, else=0
  //
  //  Pipeline completeness           → 0-10 pts  (10%)
  //    • steps completed (1-6) × 10/6 per completed step

  // 1. Qualification score: each dim is stored 0-25 in DB, normalise to 0-5 max each → sum 0-25 pts total
  const q1 = Math.min(5, Math.round((lead.qualIcpFit || 0) / 5));
  const q2 = Math.min(5, Math.round((lead.qualBudgetLikelihood || 0) / 5));
  const q3 = Math.min(5, Math.round((lead.qualDecisionMakerAccess || 0) / 5));
  const q4 = Math.min(5, Math.round((lead.qualNeed || 0) / 5));
  const q5 = Math.min(5, Math.round((lead.qualTimeline || 0) / 5));
  const qualPoints = (q1 + q2 + q3 + q4 + q5) * 2; // 0-50

  // 2. Classification points
  let classPoints = 0;
  if (lead.classification === "HOT") classPoints = 20;
  else if (lead.classification === "WARM") classPoints = 12;
  else if (lead.classification === "COLD") classPoints = 5;

  // 3. Engagement recency
  let engPoints = 0;
  const lastActive = lead.lastActivityAt || lead.lastContactAt;
  if (lastActive) {
    const diffDays = (now - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) engPoints = 20;
    else if (diffDays <= 14) engPoints = 12;
    else if (diffDays <= 30) engPoints = 6;
  }

  // 4. Pipeline completeness (how many steps are non-trivially filled)
  const stepsComplete = [
    !!(lead.companyName && lead.contactPerson && lead.sourceId && (lead.phone || lead.email)), // s1
    !!((lead.businessAge || lead.teamSize) && (lead.painPoints?.length ?? 0) > 0),             // s2
    !!(lead.qualIcpFit > 0 && lead.qualBudgetLikelihood > 0 && lead.qualDecisionMakerAccess > 0 && lead.qualNeed > 0 && lead.qualTimeline > 0), // s3
    !!(lead.classification && lead.services?.length > 0),                                      // s4
    !!(lead.nurturingStatus),                                                                  // s5
    lead.classification === "HOT",                                                             // s6 unlock condition
  ];
  const completedSteps = stepsComplete.filter(Boolean).length;
  const pipelinePoints = Math.round((completedSteps / 6) * 10);

  const healthScore = Math.min(100, qualPoints + classPoints + engPoints + pipelinePoints);

  // Health Score Label & Color mapping — also respect classification as a source of truth
  const isHotLead = lead.classification === "HOT" || healthScore > 80;
  const isWarmLead = lead.classification === "WARM" || (healthScore > 60 && !isHotLead);
  const isWarmingUp = healthScore > 30 && !isHotLead && !isWarmLead;

  let healthLabel = "Cold Lead";
  let healthRingColor = "stroke-rose-500";
  let healthTextColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
  if (isHotLead) {
    healthLabel = "Hot Opportunity";
    healthRingColor = "stroke-emerald-500";
    healthTextColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  } else if (isWarmLead) {
    healthLabel = "Strong Prospect";
    healthRingColor = "stroke-[#8B5CF6]";
    healthTextColor = "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20";
  } else if (isWarmingUp) {
    healthLabel = "Warming Up";
    healthRingColor = "stroke-amber-500";
    healthTextColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  // Circular progress dimensions
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  const activeOwner = owners?.find((o) => o.id === lead.ownerId);

  return (
    <Card className="border border-border/40 shadow-sm overflow-hidden rounded-2xl bg-card/45 backdrop-blur-xs">
      <CardContent className="p-5 flex flex-col space-y-4">
        {/* Section 1: Health Score Ring */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Health Score
          </span>
          <div className="flex flex-col items-center justify-center py-2.5 border border-border/30 rounded-xl bg-background/25">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-muted/30 fill-none"
                  strokeWidth={strokeWidth}
                />
                {/* Foreground progress ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className={`${healthRingColor} fill-none transition-all duration-500 ease-out`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center score */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-foreground">{healthScore}</span>
                <span className="text-[8px] text-muted-foreground font-semibold uppercase leading-none">Pts</span>
              </div>
            </div>
            <Badge className={`mt-2.5 text-[9px] uppercase font-bold px-2 py-0.5 border ${healthTextColor}`}>
              {healthLabel}
            </Badge>
          </div>
        </div>

        <hr className="border-border/10" />

        {/* Section 2: Lead Owner Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Lead Owner
            </span>
            {savingOwner && <Loader2 className="h-3 w-3 animate-spin text-[#8B5CF6]" />}
          </div>
          
          <Select
            value={lead.ownerId || ""}
            onValueChange={onOwnerChange}
            disabled={savingOwner}
          >
            <SelectTrigger className="h-10 text-xs focus:ring-[#8B5CF6]/50 rounded-xl border-border/40 bg-background/50 flex items-center justify-between gap-2">
              <SelectValue placeholder="Select Owner">
                {activeOwner && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 shrink-0">
                      {activeOwner.avatarUrl ? (
                        <AvatarImage src={activeOwner.avatarUrl} alt={activeOwner.firstName || ""} />
                      ) : null}
                      <AvatarFallback className="text-[8px] bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold">
                        {`${activeOwner.firstName?.[0] || ""}${activeOwner.lastName?.[0] || ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-semibold">{`${activeOwner.firstName || ""} ${activeOwner.lastName || ""}`.trim()}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {owners?.map((o) => {
                const initials = `${o.firstName?.[0] || ""}${o.lastName?.[0] || ""}`.toUpperCase();
                return (
                  <SelectItem key={o.id} value={o.id} className="text-xs rounded-lg my-0.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 shrink-0">
                        {o.avatarUrl ? (
                          <AvatarImage src={o.avatarUrl} alt={o.firstName || ""} />
                        ) : null}
                        <AvatarFallback className="text-[8px] bg-muted/60 text-muted-foreground font-bold">
                          {initials || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{o.firstName} {o.lastName}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <hr className="border-border/10" />

        {/* Section 3: Parameters (Priority & Temperature) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Priority</span>
            <Badge variant="outline" className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border-border/50">
              {lead.priority}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Temperature</span>
            <div className="flex items-center">
              {lead.temperature === "HOT" && (
                <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/10 text-[9px] uppercase border border-rose-500/20 font-bold px-2 py-0.5 rounded-lg">
                  <Flame className="h-2.5 w-2.5 mr-0.5" /> Hot
                </Badge>
              )}
              {lead.temperature === "WARM" && (
                <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 text-[9px] uppercase border border-amber-500/20 font-bold px-2 py-0.5 rounded-lg">
                  <Thermometer className="h-2.5 w-2.5 mr-0.5" /> Warm
                </Badge>
              )}
              {lead.temperature === "COLD" && (
                <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/10 text-[9px] uppercase border border-sky-500/20 font-bold px-2 py-0.5 rounded-lg">
                  <Snowflake className="h-2.5 w-2.5 mr-0.5" /> Cold
                </Badge>
              )}
            </div>
          </div>
        </div>

        <hr className="border-border/10" />

        {/* Section 4: Dates */}
        <div className="space-y-2 text-[11px] font-medium">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" /> Created
            </span>
            <span className="font-bold text-foreground">
              {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground/60" /> Updated
            </span>
            <span className="font-bold text-foreground">
              {new Date(lead.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
