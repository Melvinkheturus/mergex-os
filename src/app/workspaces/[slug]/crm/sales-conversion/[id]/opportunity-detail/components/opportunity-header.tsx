"use client";

import React from "react";
import { ChevronLeft, Trophy, XCircle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { OpportunityDetail } from "../hooks/use-opportunity-detail";
import { formatCurrency } from "../../../components/types";

interface OpportunityHeaderProps {
  detail: OpportunityDetail;
  slug: string;
  onBack: () => void;
  onOpenLeadProfile: () => void;
  onCloseDeal: (status: "WON" | "LOST") => void;
}

export function OpportunityHeader({
  detail,
  slug,
  onBack,
  onOpenLeadProfile,
  onCloseDeal,
}: OpportunityHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground -ml-2 h-8 text-xs font-semibold"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Sales Conversion
      </Button>

      <div className="flex items-center gap-2">
        {detail.winLossStatus ? (
          <Badge className={cn(
            "border px-2.5 py-1 text-xs font-bold",
            detail.winLossStatus === "WON"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          )}>
            {detail.winLossStatus === "WON" ? (
              <><Trophy className="h-3.5 w-3.5 mr-1" /> Won Deal</>
            ) : (
              <><XCircle className="h-3.5 w-3.5 mr-1" /> Lost Deal</>
            )}
          </Badge>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCloseDeal("LOST")}
              className="text-xs text-rose-500 hover:text-rose-600 h-8 font-semibold border-border/40"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Mark Lost
            </Button>
            <Button
              size="sm"
              onClick={() => onCloseDeal("WON")}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-8 font-semibold"
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5" />
              Mark Won
            </Button>
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onOpenLeadProfile}
          className="text-xs font-semibold border-border/40 text-muted-foreground hover:text-foreground h-8"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1.5" />
          Open Lead Profile
        </Button>
      </div>
    </div>
  );
}
