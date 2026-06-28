"use client";

import React from "react";
import { Label } from "@/components/ui/label";

interface AgreementClosureStepProps {
  negotiationNotes: string;
  setNegotiationNotes: (v: string) => void;
  finalAgreement: string;
  setFinalAgreement: (v: string) => void;
  ndaSigned: boolean;
  setNdaSigned: (v: boolean) => void;
  proposalSigned: boolean;
  setProposalSigned: (v: boolean) => void;
  decisionMaker: string;
  setDecisionMaker: (v: string) => void;
  champion: string;
  setChampion: (v: string) => void;
  influencer: string;
  setInfluencer: (v: string) => void;
}

export function AgreementClosureStep({
  negotiationNotes,
  setNegotiationNotes,
  finalAgreement,
  setFinalAgreement,
  ndaSigned,
  setNdaSigned,
  proposalSigned,
  setProposalSigned,
  decisionMaker,
  setDecisionMaker,
  champion,
  setChampion,
  influencer,
  setInfluencer,
}: AgreementClosureStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Negotiation Notes</Label>
          <textarea
            value={negotiationNotes}
            onChange={(e) => setNegotiationNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Log notes from commercials/discounts negotiation..."
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Final Agreement Details</Label>
          <textarea
            value={finalAgreement}
            onChange={(e) => setFinalAgreement(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Summarize agreed terms, deliverables schedule..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-muted/10 p-4 rounded-xl border border-border/20">
        <div className="space-y-1">
          <p className="text-xs font-bold text-foreground">Contractual Checks</p>
          <p className="text-[10px] text-muted-foreground leading-normal">Verify signature and agreement status before handoff.</p>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-foreground/80 cursor-pointer">
            <input
              type="checkbox"
              checked={ndaSigned}
              onChange={(e) => setNdaSigned(e.target.checked)}
              className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6]"
            />
            NDA Signed
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-foreground/80 cursor-pointer">
            <input
              type="checkbox"
              checked={proposalSigned}
              onChange={(e) => setProposalSigned(e.target.checked)}
              className="rounded text-[#8B5CF6] focus:ring-[#8B5CF6]"
            />
            Proposal Signed
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Decision Maker (DM)</Label>
          <input
            type="text"
            value={decisionMaker}
            onChange={(e) => setDecisionMaker(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Name of DM"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Champion</Label>
          <input
            type="text"
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Name of Champion"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Influencer</Label>
          <input
            type="text"
            value={influencer}
            onChange={(e) => setInfluencer(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Name of Influencer"
          />
        </div>
      </div>
    </div>
  );
}
