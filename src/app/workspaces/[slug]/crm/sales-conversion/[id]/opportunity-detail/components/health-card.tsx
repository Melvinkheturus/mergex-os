import React from "react";
import { Target } from "lucide-react";
import { CardContainer } from "./card-container";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HealthCheck {
  label: string;
  isComplete: boolean;
}

interface HealthCardProps {
  score: number;
  checks: HealthCheck[];
}

export function HealthCard({ score, checks }: HealthCardProps) {
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "stroke-rose-500 text-rose-500 bg-rose-500/10 border-rose-500/20";
  let label = "At Risk";
  if (score >= 80) {
    color = "stroke-emerald-500 text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    label = "Healthy";
  } else if (score >= 40) {
    color = "stroke-amber-500 text-amber-500 bg-amber-500/10 border-amber-500/20";
    label = "Warning";
  }

  return (
    <CardContainer title="Opportunity Health" icon={Target} borderStyle="border-border/40">
      <div className="space-y-4">
        <div className="flex flex-col items-center py-2.5 border border-border/30 rounded-xl bg-background/25">
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r={radius} className="stroke-muted/30 fill-none" strokeWidth={strokeWidth} />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className={cn(color.split(" ")[0], "fill-none transition-all duration-500 ease-out")}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-black text-foreground">{score}</span>
              <span className="text-[8px] text-muted-foreground font-semibold uppercase leading-none">Pts</span>
            </div>
          </div>
          <Badge className={cn("mt-2.5 text-[9px] uppercase font-bold px-2 py-0.5 border", color.split(" ").slice(1).join(" "))}>
            {label}
          </Badge>
        </div>

        {/* Milestone checklist */}
        <div className="space-y-2 text-[11px] font-medium">
          {checks.map((chk, i) => (
            <div key={i} className="flex items-center justify-between text-muted-foreground">
              <span>{chk.label}</span>
              <span className={chk.isComplete ? "text-emerald-500 font-bold" : "text-muted-foreground/30"}>
                {chk.isComplete ? "✓" : "○"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardContainer>
  );
}
