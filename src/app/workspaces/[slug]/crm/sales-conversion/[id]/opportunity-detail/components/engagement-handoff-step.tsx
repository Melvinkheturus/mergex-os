"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EngagementHandoffStepProps {
  projectType: string;
  setProjectType: (v: string) => void;
  assignedEM: string;
  setAssignedEM: (v: string) => void;
  clientExpectations: string;
  setClientExpectations: (v: string) => void;
  successCriteria: string;
  setSuccessCriteria: (v: string) => void;
  handoffNotes: string;
  setHandoffNotes: (v: string) => void;
  deliveryRisksHandoff: string;
  setDeliveryRisksHandoff: (v: string) => void;
  convertingToClient: boolean;
  onConvertToClient: () => void;
  owners: any[];
}

export function EngagementHandoffStep({
  projectType,
  setProjectType,
  assignedEM,
  setAssignedEM,
  clientExpectations,
  setClientExpectations,
  successCriteria,
  setSuccessCriteria,
  handoffNotes,
  setHandoffNotes,
  deliveryRisksHandoff,
  setDeliveryRisksHandoff,
  convertingToClient,
  onConvertToClient,
  owners,
}: EngagementHandoffStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Project Delivery Type *</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger className="h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {["Retainer", "Fixed Bid", "Time & Materials", "Discovery Pilot"].map(opt => (
                <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Engagement Manager (EM) *</Label>
          <Select value={assignedEM} onValueChange={setAssignedEM}>
            <SelectTrigger className="h-8 text-xs rounded-lg">
              <SelectValue placeholder="Assign EM" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {owners.map((o) => (
                <SelectItem key={o.id} value={o.id} className="text-xs rounded-lg">
                  {o.firstName} {o.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Client Expectations</Label>
          <textarea
            value={clientExpectations}
            onChange={(e) => setClientExpectations(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Document any special expectations or SLAs discussed..."
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Success Criteria</Label>
          <textarea
            value={successCriteria}
            onChange={(e) => setSuccessCriteria(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="What indicators will prove successful implementation?"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Internal Handoff Notes</Label>
          <textarea
            value={handoffNotes}
            onChange={(e) => setHandoffNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Scope summary, kick-off dates, team resources details..."
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Delivery Risks</Label>
          <textarea
            value={deliveryRisksHandoff}
            onChange={(e) => setDeliveryRisksHandoff(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Technical limitations, execution hurdles, delivery dependencies..."
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          size="sm"
          onClick={onConvertToClient}
          disabled={convertingToClient || !assignedEM}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {convertingToClient ? "Initiating Handover..." : "Convert Opportunity to Client & Trigger Handoff"}
        </Button>
      </div>
    </div>
  );
}
