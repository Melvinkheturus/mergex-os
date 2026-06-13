"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpportunityDetail } from "../hooks/use-opportunity-detail";
import { CardContainer } from "./card-container";

export function LostReasonCard({
  detail,
  onSaveReason,
}: {
  detail: OpportunityDetail;
  onSaveReason: (reason: string, notes: string) => Promise<void>;
}) {
  const [reason, setReason] = useState(detail.winLossReason || "Budget");
  const [notes, setNotes] = useState(detail.winLossNotes || "");
  const [saving, setSaving] = useState(false);

  if (detail.winLossStatus !== "LOST") return null;

  const reasons = ["Budget", "Competitor", "No Decision", "Timeline", "Internal Constraints", "Other"];

  return (
    <CardContainer title="Lost Reason Details" icon={AlertCircle} borderStyle="border-rose-500/20">
      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <Label className="text-muted-foreground font-semibold">Primary Reason</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {reasons.map(r => (
                <SelectItem key={r} value={r} className="text-xs rounded-lg">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground font-semibold">Lost Notes</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500/30 resize-none"
            placeholder="Describe why the deal was lost..."
          />
        </div>
        <Button
          size="sm"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSaveReason(reason, notes);
            setSaving(false);
          }}
          className="w-full h-8 text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold"
        >
          {saving ? "Saving..." : "Save Lost Details"}
        </Button>
      </div>
    </CardContainer>
  );
}
