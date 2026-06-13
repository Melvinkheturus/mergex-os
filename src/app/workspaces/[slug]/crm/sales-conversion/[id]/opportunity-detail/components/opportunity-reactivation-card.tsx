"use client";

import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityDetail } from "../hooks/use-opportunity-detail";
import { CardContainer } from "./card-container";
import { getStatus } from "../../../components/types";

export function OpportunityReopenCard({
  detail,
  onReopen,
}: {
  detail: OpportunityDetail;
  onReopen: (targetStage: "MEETING" | "PROPOSAL") => Promise<void>;
}) {
  const [reopening, setReopening] = useState(false);
  const isLost = detail.winLossStatus === "LOST";
  const isStalled = getStatus(detail as any) === "stalled";
  const isPaused = detail.classification === "ARCHIVE" || detail.classification === "COLD";

  if (!isLost && !isStalled && !isPaused) return null;

  return (
    <CardContainer title="Opportunity Reactivation" icon={RefreshCcw} borderStyle="border-violet-500/20">
      <p className="text-[11px] text-muted-foreground leading-normal">
        This opportunity is currently {isLost ? "Lost" : isStalled ? "Stalled" : "Paused/Cold"}. Reactivate it to resume conversion.
      </p>
      <div className="grid grid-cols-1 gap-2 pt-2">
        <Button
          size="sm"
          disabled={reopening}
          onClick={async () => {
            setReopening(true);
            await onReopen("MEETING");
            setReopening(false);
          }}
          className="w-full h-8 text-[10px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold"
        >
          Reopen to Discovery
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={reopening}
          onClick={async () => {
            setReopening(true);
            await onReopen("PROPOSAL");
            setReopening(false);
          }}
          className="w-full h-8 text-[10px] border-border/40 font-bold hover:bg-muted"
        >
          Reopen to Proposal
        </Button>
      </div>
    </CardContainer>
  );
}
