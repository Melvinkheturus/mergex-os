"use client";

import { Badge } from "@/components/ui/badge";
import { Lead } from "../components/types";

interface LeadSnapshotProps {
  lead: Lead;
}

export function LeadSnapshot({ lead }: LeadSnapshotProps) {
  const dirLabel =
    lead.nurturingDirection === "SHORT_TERM" ? "Short-Term (1–4 wks)"
    : lead.nurturingDirection === "MEDIUM_TERM" ? "Medium-Term (1–3 mo)"
    : lead.nurturingDirection === "LONG_TERM" ? "Long-Term (3–6 mo)"
    : lead.nurturingDirection === "PARTNER_FOLLOWUP" ? "Partner Follow-up"
    : lead.nurturingDirection === "MANUAL_FOLLOWUP" ? "Manual Follow-up"
    : "Not set";

  const value = lead.expectedValue ? Number(lead.expectedValue) : null;
  const formatVal = (v: number) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `₹${v}`;
  };

  const score = lead.qualScore || 0;
  const pct = Math.min(100, Math.round((score / 110) * 100));
  const radius = 28;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  let qualLabel = "Not Evaluated";
  let qualTextColor = "text-muted-foreground bg-muted/20 border-border/30";

  if (score >= 80) {
    qualLabel = "Qualified Lead";
    qualTextColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  } else if (score > 0) {
    qualLabel = "Incomplete Fit";
    qualTextColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  const snapItems = [
    { label: "Services Interested", value: lead.services && lead.services.length > 0 ? lead.services.join(", ") : "—" },
    { label: "Lead Value", value: value ? formatVal(value) : "—" },
    { label: "Nurturing Direction", value: dirLabel },
    { label: "Classification Date", value: new Date(lead.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
    { label: "Pain Points", value: lead.painPoints && lead.painPoints.length > 0 ? `${lead.painPoints.length} identified` : "—" },
  ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card/45 shadow-sm overflow-hidden backdrop-blur-xs">
      <div className="p-5 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Lead Snapshot
          </span>
          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground/60 border border-border/30">
            Read Only
          </span>
        </div>

        {/* 1st: Qualification Score circular progress chart */}
        <div className="space-y-2.5">
          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-wider block">
            Qualification Score
          </span>
          <div className="flex flex-col items-center justify-center py-3.5 border border-border/30 rounded-xl bg-background/25">
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
                  className={`${score > 0 ? "stroke-violet-500" : "stroke-muted/30"} fill-none transition-all duration-500 ease-out`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center score */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-foreground">{score}</span>
                <span className="text-[8px] text-muted-foreground font-semibold uppercase leading-none">/110</span>
              </div>
            </div>
            <Badge variant="outline" className={`mt-2.5 text-[9px] uppercase font-bold px-2 py-0.5 border ${qualTextColor}`}>
              {qualLabel}
            </Badge>
          </div>
        </div>

        <hr className="border-border/10" />

        {/* Then: show all other info stacked one-by-one */}
        <div className="space-y-3.5">
          {snapItems.map((item) => (
            <div key={item.label} className="space-y-1 pb-3 border-b border-border/5 last:border-0 last:pb-0">
              <dt className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">{item.label}</dt>
              <dd className="text-xs font-semibold text-foreground/80 break-words">{item.value}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
