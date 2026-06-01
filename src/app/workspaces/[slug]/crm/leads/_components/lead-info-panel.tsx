"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Flame,
  Thermometer,
  Snowflake,
  Shield,
  Activity,
  User,
  Users,
  IndianRupee,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead, OptionStage, OptionUser } from "./types";

interface LeadInfoPanelProps {
  lead: Lead;
  stages: OptionStage[];
  owners: OptionUser[];
  savingStage: boolean;
  savingOwner: boolean;
  onStageChange: (stageId: string) => Promise<void>;
  onOwnerChange: (ownerId: string) => Promise<void>;
  onLeadUpdate?: (lead: Lead) => void;
}

export function LeadInfoPanel({
  lead,
  stages,
  owners,
  savingStage,
  savingOwner,
  onStageChange,
  onOwnerChange,
  onLeadUpdate,
}: LeadInfoPanelProps) {
  const initials = `${lead.companyName[0] || "L"}`.toUpperCase();

  // Relationship Intelligence State
  const [relations, setRelations] = useState({
    decisionMaker: lead.decisionMaker || "",
    influencer: lead.influencer || "",
    champion: lead.champion || "",
    financeContact: lead.financeContact || "",
  });
  const [savingRelations, setSavingRelations] = useState<string | null>(null);

  // Sync state if lead changes from parent
  useEffect(() => {
    setRelations({
      decisionMaker: lead.decisionMaker || "",
      influencer: lead.influencer || "",
      champion: lead.champion || "",
      financeContact: lead.financeContact || "",
    });
  }, [lead]);

  const handleRelationBlur = async (field: keyof typeof relations, value: string) => {
    if (lead[field] === value) return; // no change
    try {
      setSavingRelations(field);
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update relations");
      const updated = await res.json();
      toast.success(`${field.replace(/([A-Z])/g, " $1")} updated`);
      if (onLeadUpdate) onLeadUpdate(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save field");
    } finally {
      setSavingRelations(null);
    }
  };

  // Health Score Calculation
  // 1. BANT (40%): bantScore * 0.40
  const bantHealth = Math.round(lead.bantScore * 0.40);
  
  // 2. ICP (20%): icpScore * 0.20
  const icpHealth = Math.round(lead.icpScore * 0.20);
  
  // 3. Engagement (20%): based on last activity date
  let engagementHealth = 0;
  if (lead.lastActivityAt) {
    const diffDays = (Date.now() - new Date(lead.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) engagementHealth = 20;
    else if (diffDays <= 14) engagementHealth = 10;
  }
  
  // 4. Stage Progress (20%): based on stage name
  let stageHealth = 5;
  if (lead.stage) {
    const name = lead.stage.name.toLowerCase();
    if (name.includes("review") || name.includes("stage2") || name.includes("business")) stageHealth = 10;
    else if (name.includes("qualification") || name.includes("bant") || name.includes("stage3") || name.includes("qual")) stageHealth = 15;
    else if (name.includes("classification") || name.includes("stage4") || name.includes("class")) stageHealth = 20;
  }

  const healthScore = Math.min(100, Math.max(0, bantHealth + icpHealth + engagementHealth + stageHealth));

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
    <div className="space-y-4">
      {/* CARD 1: Company Profile */}
      <Card className="border border-border/40 shadow-none overflow-hidden rounded-2xl bg-card/45 backdrop-blur-xs">
        <CardHeader className="flex flex-col items-center p-6 pb-4">
          <Avatar className="h-14 w-14 mb-3 border-2 border-[#8B5CF6]/20 shadow-md">
            <AvatarFallback className="text-base font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-sm text-foreground text-center line-clamp-1">
            {lead.companyName}
          </h3>
          <p className="text-xs text-muted-foreground text-center font-medium line-clamp-1">
            {lead.contactPerson} {lead.designation ? `· ${lead.designation}` : ""}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap justify-center">
            {lead.temperature === "HOT" && (
              <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/10 text-[10px] border border-rose-500/20">
                <Flame className="h-2.5 w-2.5 mr-0.5" /> Hot
              </Badge>
            )}
            {lead.temperature === "WARM" && (
              <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 text-[10px] border border-amber-500/20">
                <Thermometer className="h-2.5 w-2.5 mr-0.5" /> Warm
              </Badge>
            )}
            {lead.temperature === "COLD" && (
              <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/10 text-[10px] border border-sky-500/20">
                <Snowflake className="h-2.5 w-2.5 mr-0.5" /> Cold
              </Badge>
            )}
            <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5">
              {lead.priority}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-2.5 text-xs border-t border-border/10 mt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3">
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate" title={lead.email || ""}>{lead.email || "No Email"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span>{lead.phone || "No Phone"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="hover:underline truncate text-[#8B5CF6]/85 font-medium"
              >
                {lead.website}
              </a>
            ) : (
              <span>No Website</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span>{lead.industry || "No Industry"}</span>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Pipeline Control */}
      <Card className="border border-border/40 shadow-none rounded-2xl bg-card/45 backdrop-blur-xs">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Pipeline Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3.5">
          {/* Stage Selector */}
          <div className="space-y-1">
            <Label className="text-[9px] font-bold text-muted-foreground/80 uppercase">
              Pipeline Stage
            </Label>
            <Select
              disabled={savingStage}
              value={lead.stageId || ""}
              onValueChange={onStageChange}
            >
              <SelectTrigger className="h-8 text-xs bg-background/50 border-border/40">
                <SelectValue placeholder="No Stage Selected" />
              </SelectTrigger>
              <SelectContent>
                {stages
                  .filter((st) => !["WON", "LOST", "ON_HOLD"].includes(st.name))
                  .map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Owner Selector */}
          <div className="space-y-1">
            <Label className="text-[9px] font-bold text-muted-foreground/80 uppercase">
              Lead Owner
            </Label>
            <Select
              disabled={savingOwner}
              value={lead.ownerId || ""}
              onValueChange={onOwnerChange}
            >
              <SelectTrigger className="h-8 text-xs bg-background/50 border-border/40">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((ow) => (
                  <SelectItem key={ow.id} value={ow.id}>
                    {ow.firstName} {ow.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expected Value */}
          {lead.expectedValue && (
            <div className="flex items-center justify-between border-t border-border/10 pt-2.5 text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Est. Deal Value
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center">
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {Number(lead.expectedValue).toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CARD 3: Lead Health Score */}
      <Card className="border border-border/40 shadow-none rounded-2xl bg-card/45 backdrop-blur-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Lead Health
          </CardTitle>
          <Badge className={`text-[9px] px-1.5 py-0 h-4 border font-bold ${healthColor}`}>
            {healthLabel}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {/* Main Score Bar */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Overall Health Score</span>
            <span className="font-black text-foreground text-sm">{healthScore}/100</span>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-2 border border-border/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-[#8B5CF6] rounded-full transition-all duration-500"
              style={{ width: `${healthScore}%` }}
            />
          </div>

          {/* Breakdown List */}
          <div className="border-t border-border/10 pt-2.5 space-y-2 text-[10px]">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>BANT Qualification (40% wt.)</span>
              <span className="font-bold text-foreground">{bantHealth}/40 pts</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>ICP Alignment (20% wt.)</span>
              <span className="font-bold text-foreground">{icpHealth}/20 pts</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Engagement Recency (20% wt.)</span>
              <span className="font-bold text-foreground">{engagementHealth}/20 pts</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Stage Progress (20% wt.)</span>
              <span className="font-bold text-foreground">{stageHealth}/20 pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: Relationship Intelligence */}
      <Card className="border border-border/40 shadow-none rounded-2xl bg-card/45 backdrop-blur-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-violet-500" /> Relationship Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {[
            { id: "decisionMaker", label: "Decision Maker", icon: User },
            { id: "influencer", label: "Influencer", icon: Users },
            { id: "champion", label: "Champion", icon: CheckCircle2 },
            { id: "financeContact", label: "Finance Contact", icon: IndianRupee },
          ].map((role) => {
            const Icon = role.icon;
            const fieldId = role.id as keyof typeof relations;
            const isSaving = savingRelations === fieldId;

            return (
              <div key={role.id} className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/80 uppercase">
                  <span className="flex items-center gap-1">
                    <Icon className="h-2.5 w-2.5 text-muted-foreground/70" /> {role.label}
                  </span>
                  {isSaving && <span className="text-[8px] lowercase text-[#8B5CF6] animate-pulse">saving...</span>}
                </div>
                <Input
                  className="h-8 text-xs bg-background/50 border-border/40 focus-visible:ring-[#8B5CF6]/50"
                  placeholder={`Enter ${role.label.toLowerCase()}`}
                  value={relations[fieldId]}
                  disabled={isSaving}
                  onChange={(e) => setRelations({ ...relations, [fieldId]: e.target.value })}
                  onBlur={(e) => handleRelationBlur(fieldId, e.target.value)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
