"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ProposalRecord } from "../hooks/use-opportunity-detail";
import { formatCurrency } from "../../../components/types";

const PROPOSAL_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10" },
  SENT: { label: "Sent", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  NEGOTIATION: { label: "Negotiation", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  APPROVED: { label: "Approved", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  REJECTED: { label: "Rejected", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
};

interface ProposalBuilderStepProps {
  proposals: ProposalRecord[];
  showProposalForm: boolean;
  setShowProposalForm: (v: boolean) => void;
  proposalForm: {
    title: string;
    proposalNumber: string;
    value: string;
    status: string;
    notes: string;
  };
  setProposalForm: React.Dispatch<React.SetStateAction<{
    title: string;
    proposalNumber: string;
    value: string;
    status: string;
    notes: string;
  }>>;
  savingProposal: boolean;
  onAddProposal: () => void;
  onUpdateProposalStatus: (id: string, status: string) => void;
}

export function ProposalBuilderStep({
  proposals,
  showProposalForm,
  setShowProposalForm,
  proposalForm,
  setProposalForm,
  savingProposal,
  onAddProposal,
  onUpdateProposalStatus,
}: ProposalBuilderStepProps) {
  return (
    <div className="space-y-4">
      {/* Proposal versions history */}
      <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-border/10">
          <span className="text-xs font-bold text-foreground">Commercial Proposal History</span>
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold text-[9px] uppercase">
            {proposals.length} Versions
          </Badge>
        </div>

        {proposals.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/75 italic pt-1">No proposal created yet. Use the tool below to build Version 1.</p>
        ) : (
          <div className="space-y-2">
            {proposals.map((p, idx) => {
              const statusCfg = PROPOSAL_STATUS_CONFIG[p.status] || PROPOSAL_STATUS_CONFIG.DRAFT;
              return (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/20 bg-background/50 text-xs">
                  <div>
                    <p className="font-bold text-foreground">
                      Version {idx + 1}: {p.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Number: {p.proposalNumber} · Value: {formatCurrency(p.value)}
                    </p>
                    {p.notes && <p className="text-[10px] text-muted-foreground/80 mt-1 italic">Notes: {p.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={cn("text-[9px] uppercase font-bold px-2 border", statusCfg.bg, statusCfg.color)}>
                      {statusCfg.label}
                    </Badge>
                    
                    <Select
                      value={p.status}
                      onValueChange={(val) => onUpdateProposalStatus(p.id, val)}
                    >
                      <SelectTrigger className="h-6 text-[10px] w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/40">
                        {Object.keys(PROPOSAL_STATUS_CONFIG).map(s => (
                          <SelectItem key={s} value={s} className="text-[10px] rounded-lg">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add proposal builder block */}
      {showProposalForm ? (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
          <p className="text-xs font-bold text-foreground">Draft Proposal Version</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Proposal title (e.g. Enterprise AI Pilot) *"
              value={proposalForm.title}
              onChange={(e) => setProposalForm((p) => ({ ...p, title: e.target.value }))}
              className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
            />
            <input
              type="number"
              placeholder="Proposal Value (₹) *"
              value={proposalForm.value}
              onChange={(e) => setProposalForm((p) => ({ ...p, value: e.target.value }))}
              className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Proposal # (auto-generated if empty)"
              value={proposalForm.proposalNumber}
              onChange={(e) => setProposalForm((p) => ({ ...p, proposalNumber: e.target.value }))}
              className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
            />
            <Select
              value={proposalForm.status}
              onValueChange={(val) => setProposalForm((p) => ({ ...p, status: val }))}
            >
              <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <textarea
            placeholder="Negotiation / Commercial notes..."
            value={proposalForm.notes}
            onChange={(e) => setProposalForm((p) => ({ ...p, notes: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none resize-none"
          />

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={onAddProposal}
              disabled={savingProposal}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 font-semibold"
            >
              {savingProposal ? "Saving..." : "Create Proposal Version"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowProposalForm(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowProposalForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border/40 text-xs font-semibold text-muted-foreground hover:border-amber-500/40 hover:text-amber-500 hover:bg-amber-500/5 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Create New Proposal Version
        </button>
      )}
    </div>
  );
}
