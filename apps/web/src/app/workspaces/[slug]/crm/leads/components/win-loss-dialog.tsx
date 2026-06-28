"use client";

import { Trophy, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface WinLossDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  winLossStatus: "WON" | "LOST";
  setWinLossStatus: (status: "WON" | "LOST") => void;
  winLossReason: string;
  setWinLossReason: (reason: string) => void;
  winLossNotes: string;
  setWinLossNotes: (notes: string) => void;
  onSubmit: () => Promise<void>;
  saving: boolean;
}

export function WinLossDialog({
  open,
  onOpenChange,
  winLossStatus,
  setWinLossStatus,
  winLossReason,
  setWinLossReason,
  winLossNotes,
  setWinLossNotes,
  onSubmit,
  saving,
}: WinLossDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Close Lead</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">Record the outcome of this opportunity.</p>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* WON / LOST toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWinLossStatus("WON")}
              className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold transition-colors ${
                winLossStatus === "WON"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/40"
                  : "border-border/30 text-muted-foreground hover:border-emerald-500/20"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" /> Won
            </button>
            <button
              type="button"
              onClick={() => setWinLossStatus("LOST")}
              className={`flex items-center justify-center gap-2 h-10 rounded-xl border text-xs font-bold transition-colors ${
                winLossStatus === "LOST"
                  ? "bg-red-500/10 text-red-600 border-red-500/40"
                  : "border-border/30 text-muted-foreground hover:border-red-500/20"
              }`}
            >
              <XCircle className="h-3.5 w-3.5" /> Lost
            </button>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="font-semibold">Reason</Label>
            <Select value={winLossReason} onValueChange={setWinLossReason}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Budget">Budget Constraints</SelectItem>
                <SelectItem value="Competitor">Went with Competitor</SelectItem>
                <SelectItem value="No Response">No Response</SelectItem>
                <SelectItem value="Cancelled">Project Cancelled</SelectItem>
                <SelectItem value="Timeline">Timeline Mismatch</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="font-semibold">Notes (optional)</Label>
            <Textarea
              value={winLossNotes}
              onChange={(e) => setWinLossNotes(e.target.value)}
              placeholder="Add any additional context about the outcome..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={saving || !winLossReason}
            className={`text-xs text-white ${
              winLossStatus === "WON" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            Mark as {winLossStatus}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
