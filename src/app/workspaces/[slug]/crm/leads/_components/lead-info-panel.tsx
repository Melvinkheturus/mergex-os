"use client";

import {
  Building2, Mail, Phone, Globe, Flame, Thermometer, Snowflake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
}

export function LeadInfoPanel({
  lead,
  stages,
  owners,
  savingStage,
  savingOwner,
  onStageChange,
  onOwnerChange,
}: LeadInfoPanelProps) {
  const initials = `${lead.contactPerson[0] || "L"}`.toUpperCase();

  return (
    <Card className="border border-border/40 shadow-none overflow-hidden rounded-2xl bg-card/45 backdrop-blur-xs">
      <CardHeader className="flex flex-col items-center p-6 border-b border-border/20">
        <Avatar className="h-16 w-16 mb-3 border-2 border-[#8B5CF6]/20 shadow-md">
          <AvatarFallback className="text-lg font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-bold text-base text-foreground text-center">{lead.companyName}</h3>
        <p className="text-xs text-muted-foreground text-center mt-0.5">{lead.contactPerson}</p>

        <div className="mt-4 flex items-center gap-1 flex-wrap justify-center">
          {lead.temperature === "HOT" && (
            <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/10">
              <Flame className="h-3 w-3 mr-1" /> Hot
            </Badge>
          )}
          {lead.temperature === "WARM" && (
            <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10">
              <Thermometer className="h-3 w-3 mr-1" /> Warm
            </Badge>
          )}
          {lead.temperature === "COLD" && (
            <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/10">
              <Snowflake className="h-3 w-3 mr-1" /> Cold
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] uppercase font-bold">
            {lead.priority} PRIORITY
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4 text-xs">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pipeline Stage</Label>
          <Select disabled={savingStage} value={lead.stageId || ""} onValueChange={onStageChange}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="No Stage Selected" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lead Owner</Label>
          <Select disabled={savingOwner} value={lead.ownerId || ""} onValueChange={onOwnerChange}>
            <SelectTrigger className="h-9 text-xs">
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

        <div className="border-t border-border/20 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate">{lead.email || "No Email"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span>{lead.phone || "No Phone"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <a
              href={lead.website || "#"}
              target="_blank"
              rel="noreferrer"
              className="hover:underline truncate text-primary/80"
            >
              {lead.website || "No Website"}
            </a>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span>{lead.industry || "No Industry"}</span>
          </div>
        </div>

        {/* BANT Score indicator */}
        <div className="border-t border-border/20 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">BANT Score</span>
            <span className="font-black text-primary">{lead.bantScore}/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-[#8B5CF6] transition-all"
              style={{ width: `${lead.bantScore}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
