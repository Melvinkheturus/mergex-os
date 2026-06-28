"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, Calendar, History, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { toast } from "sonner";
import { Lead } from "../../types";

interface ReopenLogicCardProps {
  lead: Lead;
  onLeadUpdate: (updated: Lead) => void;
}

export function ReopenLogicCard({ lead, onLeadUpdate }: ReopenLogicCardProps) {
  // reopenAt comes from the DB (lead.reopenAt field), not localStorage
  const [nextReopen, setNextReopen] = useState(
    lead.reopenAt ? new Date(lead.reopenAt).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [reopening, setReopening] = useState(false);

  // Sync if lead prop changes
  useEffect(() => {
    setNextReopen(
      lead.reopenAt ? new Date(lead.reopenAt).toISOString().split("T")[0] : ""
    );
  }, [lead.reopenAt]);

  // Days since last contact — from DB field
  const lastContactDays = lead.lastContactAt
    ? Math.max(0, Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const handleScheduleReopen = async () => {
    if (!nextReopen) {
      toast.error("Please select a reopen date");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reopenAt: new Date(nextReopen).toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to save reopen date");
      const updated = await res.json();
      onLeadUpdate(updated);
      toast.success(
        `Reactivation scheduled for ${new Date(nextReopen).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })}`
      );
    } catch {
      toast.error("Failed to save reopen date");
    } finally {
      setSaving(false);
    }
  };

  const handleReopenNow = async () => {
    setReopening(true);
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classification: "HOT",
          temperature: "HOT",
          nurturingStatus: "MEETING_REQUESTED",
          reopenAt: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to reopen lead");
      const updated = await res.json();
      onLeadUpdate(updated);
      toast.success("Lead reactivated — stage advanced to HOT.");
    } catch {
      toast.error("Failed to reopen lead");
    } finally {
      setReopening(false);
    }
  };

  return (
    <Card className="border border-violet-500/20 shadow-sm rounded-2xl bg-card">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <RefreshCcw className="h-3.5 w-3.5 text-[#8B5CF6]" /> Reactivation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3.5 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 bg-muted/20 p-2 rounded-xl border border-border/10">
            <p className="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <History className="h-3 w-3" /> Last Contact
            </p>
            <p className="text-sm font-semibold text-foreground">
              {lastContactDays !== null ? `${lastContactDays}d ago` : "—"}
            </p>
          </div>
          <div className="space-y-1 bg-muted/20 p-2 rounded-xl border border-border/10">
            <p className="text-[9px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Next Reopen
            </p>
            <p className="text-sm font-semibold text-foreground">
              {nextReopen
                ? new Date(nextReopen).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "Not Set"}
            </p>
          </div>
        </div>

        {/* Schedule Reopen */}
        <div className="space-y-1.5 pt-1">
          <Label htmlFor="nextReopenDate" className="font-semibold text-foreground/80">
            Schedule Next Reopen
          </Label>
          <div className="flex gap-2">
            <DateTimePicker
              value={nextReopen}
              onChange={(val) => setNextReopen(val)}
              mode="date"
              className="h-8 text-xs flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleScheduleReopen}
              disabled={saving || !nextReopen}
              className="h-8 text-[10px] border-border/40 font-bold px-3 shrink-0"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Schedule"}
            </Button>
          </div>
        </div>

        {/* Reopen Now */}
        <Button
          size="sm"
          onClick={handleReopenNow}
          disabled={reopening}
          className="w-full h-8 text-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold"
        >
          {reopening ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <><Play className="h-3 w-3 mr-1.5" /> Reopen Now</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
