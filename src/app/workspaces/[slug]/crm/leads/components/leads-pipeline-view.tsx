"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Flame, Thermometer, Snowflake, User, IndianRupee, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lead, OptionStage, NEXT_ACTION_LABELS, NextActionType } from "./types";

interface LeadsPipelineViewProps {
  leads: Lead[];
  stages: OptionStage[];
  onStageChange: (leadId: string, stageId: string) => Promise<void>;
}

// ── Stage → Bucket mapping ────────────────────────────────────────────────────
const BUCKET_DEFINITIONS = [
  {
    id: "operations",
    label: "Lead Operations",
    subtitle: "Intake → Nurturing",
    color: "bg-violet-500",
    textColor: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-500/5 border-violet-500/15",
    stageNames: ["LEAD_INTAKE", "BUSINESS_REVIEW", "LEAD_QUALIFICATION", "LEAD_CLASSIFICATION", "LEAD_NURTURING"],
  },
  {
    id: "conversion",
    label: "Sales Conversion",
    subtitle: "Audit → Handover",
    color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/5 border-amber-500/15",
    stageNames: ["QUALIFICATION_AUDIT", "MEETING", "PROPOSAL", "DOCUMENTATION", "ENGAGEMENT_MANAGER"],
  },
  {
    id: "won",
    label: "Won",
    subtitle: "Closed - Won",
    color: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/5 border-emerald-500/15",
    stageNames: ["WON"],
  },
  {
    id: "lost",
    label: "Lost / On Hold",
    subtitle: "Closed - Not Won",
    color: "bg-slate-400",
    textColor: "text-slate-500 dark:text-slate-400",
    bgColor: "bg-slate-500/5 border-slate-500/15",
    stageNames: ["LOST", "ON_HOLD"],
  },
];

function TemperaturePip({ temp }: { temp: string }) {
  if (temp === "HOT")
    return (
      <span className="flex items-center gap-1 text-rose-500 text-[10px] font-semibold">
        <Flame className="h-3 w-3" /> Hot
      </span>
    );
  if (temp === "WARM")
    return (
      <span className="flex items-center gap-1 text-amber-500 text-[10px] font-semibold">
        <Thermometer className="h-3 w-3" /> Warm
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-sky-500 text-[10px] font-semibold">
      <Snowflake className="h-3 w-3" /> Cold
    </span>
  );
}

function LeadCard({
  lead,
  onDragStart,
  onClick,
}: {
  lead: Lead;
  onDragStart: (leadId: string) => void;
  onClick: () => void;
}) {
  const initials = `${lead.companyName[0] || "L"}`.toUpperCase();

  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      onClick={onClick}
      className="group bg-card border border-border/40 rounded-xl p-3.5 cursor-pointer shadow-xs hover:shadow-sm hover:border-[#8B5CF6]/30 transition-all duration-150 space-y-2.5 select-none"
    >
      {/* Company + Contact */}
      <div className="flex items-start gap-2.5">
        <Avatar className="h-8 w-8 shrink-0 border border-[#8B5CF6]/15 mt-0.5">
          <AvatarImage src={lead.avatarUrl || ""} alt={lead.companyName} />
          <AvatarFallback className="text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground truncate leading-tight">
            {lead.companyName}
          </p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {lead.contactPerson}
            {lead.designation ? ` · ${lead.designation}` : ""}
          </p>
        </div>
      </div>

      {/* Current stage pill */}
      {lead.stage && (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-wider">Stage:</span>
          <span className="text-[9px] font-bold text-foreground">{lead.stage.label}</span>
        </div>
      )}

      {/* Next Action */}
      {lead.nextAction && (
        <div className="flex items-center gap-1 text-[9px] text-violet-600 dark:text-violet-400 font-semibold">
          <ArrowRight className="h-2.5 w-2.5 shrink-0" />
          {NEXT_ACTION_LABELS[lead.nextAction as NextActionType] ?? lead.nextAction}
        </div>
      )}

      {/* Temperature + Value */}
      <div className="flex items-center justify-between">
        <TemperaturePip temp={lead.temperature} />
        {lead.expectedValue && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="h-2.5 w-2.5" />
            {Number(lead.expectedValue).toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* Owner */}
      <div className="flex items-center justify-between pt-1 border-t border-border/20">
        {lead.owner ? (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
            <User className="h-2.5 w-2.5 shrink-0" />
            {lead.owner.firstName} {lead.owner.lastName}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">Unassigned</span>
        )}
        {lead.source && (
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 h-4 font-semibold border-border/30"
          >
            {lead.source.name}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function LeadsPipelineView({
  leads,
  stages,
  onStageChange,
}: LeadsPipelineViewProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [draggingOverBucket, setDraggingOverBucket] = useState<string | null>(null);

  const handleDragStart = useCallback((leadId: string) => {
    setDraggingLeadId(leadId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingLeadId(null);
    setDraggingOverBucket(null);
  }, []);

  // Build bucket → leads map
  const bucketLeads = useMemo(() => {
    const stageNameToId = Object.fromEntries(stages.map((s) => [s.name, s.id]));

    return BUCKET_DEFINITIONS.map((bucket) => {
      const stageIds = bucket.stageNames
        .map((n) => stageNameToId[n])
        .filter(Boolean);

      const bucketItems = leads.filter(
        (l) => l.stageId && stageIds.includes(l.stageId)
      );

      const value = bucketItems.reduce(
        (sum, l) => sum + (l.expectedValue ? parseFloat(l.expectedValue) : 0),
        0
      );

      return { ...bucket, leads: bucketItems, value, stageIds };
    });
  }, [leads, stages]);

  // Unassigned = no stage or stage not in any bucket
  const allBucketStageIds = new Set(bucketLeads.flatMap((b) => b.stageIds));
  const unassigned = leads.filter(
    (l) => !l.stageId || !allBucketStageIds.has(l.stageId)
  );

  const handleDrop = useCallback(
    async (bucket: (typeof bucketLeads)[number]) => {
      if (!draggingLeadId) return;
      const lead = leads.find((l) => l.id === draggingLeadId);
      // Drop into first stage of bucket
      const targetStageId = bucket.stageIds[0];
      if (!lead || !targetStageId || lead.stageId === targetStageId) {
        setDraggingLeadId(null);
        setDraggingOverBucket(null);
        return;
      }
      setDraggingLeadId(null);
      setDraggingOverBucket(null);
      try {
        await onStageChange(draggingLeadId, targetStageId);
      } catch {
        toast.error("Failed to update stage");
      }
    },
    [draggingLeadId, leads, onStageChange]
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[400px]" onDragEnd={handleDragEnd}>
      {bucketLeads.map((bucket) => {
        const isOver = draggingOverBucket === bucket.id;

        return (
          <div
            key={bucket.id}
            className="flex-shrink-0 w-[280px]"
            onDragOver={(e) => { e.preventDefault(); setDraggingOverBucket(bucket.id); }}
            onDrop={() => handleDrop(bucket)}
            onDragLeave={() => setDraggingOverBucket(null)}
          >
            {/* Bucket header */}
            <div className={`rounded-xl border p-3 mb-3 ${bucket.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${bucket.color}`} />
                  <span className={`text-xs font-bold ${bucket.textColor}`}>
                    {bucket.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                  {bucket.leads.length}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 ml-4">
                {bucket.subtitle}
              </p>
              {bucket.value > 0 && (
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 ml-4 flex items-center gap-0.5">
                  <IndianRupee className="h-2.5 w-2.5" />
                  {Math.round(bucket.value).toLocaleString("en-IN")}
                </p>
              )}
            </div>

            {/* Drop zone */}
            <div
              className={`space-y-2 min-h-[120px] rounded-xl p-2 transition-all duration-150 ${
                isOver
                  ? "bg-[#8B5CF6]/5 border-2 border-dashed border-[#8B5CF6]/30"
                  : "bg-muted/10 border border-border/20"
              }`}
            >
              {bucket.leads.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-[10px] text-muted-foreground/40 font-medium">
                  {isOver ? "Drop here" : "No leads"}
                </div>
              ) : (
                bucket.leads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={handleDragStart}
                    onClick={() =>
                      router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)
                    }
                  />
                ))
              )}
              {isOver && draggingLeadId && (
                <div className="h-16 rounded-xl border-2 border-dashed border-[#8B5CF6]/40 bg-[#8B5CF6]/5 animate-pulse" />
              )}
            </div>
          </div>
        );
      })}

      {/* Unassigned bucket */}
      {unassigned.length > 0 && (
        <div className="flex-shrink-0 w-[280px]">
          <div className="rounded-xl border border-border/20 bg-muted/5 p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <span className="text-xs font-bold text-muted-foreground">Unassigned</span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground bg-background/60 rounded-full px-2 py-0.5">
                {unassigned.length}
              </span>
            </div>
          </div>
          <div className="space-y-2 min-h-[120px] rounded-xl p-2 bg-muted/10 border border-border/20">
            {unassigned.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onDragStart={handleDragStart}
                onClick={() =>
                  router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
