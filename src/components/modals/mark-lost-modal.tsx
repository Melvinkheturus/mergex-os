"use client";

import * as React from "react";
import { X, Target, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkLostModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-background rounded-md shadow-lg border border-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-red-500/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Mark Deal as Lost</h2>
              <p className="text-xs text-muted-foreground">Capture deal intelligence before closing</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Lost Reason <span className="text-red-500">*</span></label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select a reason...</option>
                <option value="PRICE">Too expensive / Pricing</option>
                <option value="BUDGET">No budget allocated</option>
                <option value="TIMING">Not a priority right now</option>
                <option value="COMPETITOR">Chose a competitor</option>
                <option value="FIT">Scope or feature mismatch</option>
                <option value="AUTHORITY">No access to decision maker</option>
                <option value="NO_RESPONSE">Ghosted / No response</option>
                <option value="PROPOSAL_DELAY">Delayed proposal delivery</option>
                <option value="TRUST">Lack of confidence/trust</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Stage Lost <span className="text-red-500">*</span></label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Select stage...</option>
                <option value="LEAD_GENERATED">Lead Generated</option>
                <option value="QUALIFICATION">Qualification</option>
                <option value="DISCOVERY">Discovery</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Lost to Competitor (Optional)</label>
              <input type="text" placeholder="e.g. McKinsey, Internal Team..." className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Confidence Level</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="CONFIRMED">Confirmed (Client stated)</option>
                <option value="ASSUMED">Assumed (Rep guess)</option>
                <option value="PARTIAL">Partial (Mixed signals)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Re-engagement Plan</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Do not re-engage</option>
                <option value="REVISIT">Revisit later</option>
                <option value="BUDGET_DELAY">Budget Delay</option>
                <option value="TIMING">Timing Issue</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Follow-up Date</label>
              <input type="date" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Internal Notes / Autopsy</label>
            <textarea 
              placeholder="What really happened? What can we learn?"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-muted/30">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white">
            <Save className="h-4 w-4 mr-1.5" />
            Save & Mark Lost
          </Button>
        </div>
      </div>
    </div>
  );
}
