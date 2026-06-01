"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Receipt,
  FileSignature,
  ClipboardList,
  FileBarChart2,
  ExternalLink,
  Calendar,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DocumentsTabProps {
  leadId: string;
}

interface LinkedProposal {
  id: string;
  proposalNumber: string;
  title: string;
  value: string;
  status: string;
  createdAt: string;
}

interface LinkedMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  mode: string;
  status: string;
}

const DOCUMENT_TYPES = [
  {
    key: "proposal",
    label: "Proposals",
    icon: FileText,
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    border: "border-[#8B5CF6]/20",
    description: "Commercial proposals sent to client",
  },
  {
    key: "quotation",
    label: "Quotations",
    icon: Receipt,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description: "Pricing quotations and estimates",
  },
  {
    key: "agreement",
    label: "Agreements",
    icon: FileSignature,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description: "Signed contracts and agreements",
  },
  {
    key: "invoice",
    label: "Invoices",
    icon: FileBarChart2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "Billing and payment invoices",
  },
  {
    key: "intake",
    label: "Intake Form",
    icon: ClipboardList,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    description: "Onboarding intake and requirements form",
  },
];

function ModeLabel({ mode }: { mode: string }) {
  const labels: Record<string, string> = {
    GOOGLE_MEET: "Google Meet",
    ZOOM: "Zoom",
    PHONE: "Phone",
    IN_PERSON: "In Person",
  };
  return <span>{labels[mode] || mode}</span>;
}

function ProposalStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    DRAFT: "bg-muted/50 text-muted-foreground border-border/30",
    SENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    NEGOTIATION: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <Badge className={`text-[10px] border ${variants[status] || "bg-muted/50 border-border/30"}`}>
      {status}
    </Badge>
  );
}

export function DocumentsTab({ leadId }: DocumentsTabProps) {
  const [proposals, setProposals] = useState<LinkedProposal[]>([]);
  const [meetings, setMeetings] = useState<LinkedMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [propRes, meetRes] = await Promise.all([
        fetch(`/api/crm/leads/${leadId}/proposals`),
        fetch(`/api/crm/leads/${leadId}/meetings`),
      ]);
      if (propRes.ok) setProposals(await propRes.json());
      if (meetRes.ok) setMeetings(await meetRes.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader>
        <CardTitle className="text-sm font-bold">Documents</CardTitle>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          All documents linked to this lead. Full DMS integration coming soon.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Linked Proposals */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <h4 className="text-xs font-bold text-foreground">Proposals</h4>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {proposals.length}
            </Badge>
          </div>

          {loading ? (
            <div className="h-12 rounded-xl bg-muted/20 animate-pulse" />
          ) : proposals.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border/30 bg-muted/5">
              <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-[#8B5CF6]/50" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">No proposals yet</p>
                <p className="text-[10px] text-muted-foreground/60">Create a proposal from the Proposals tab</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-[#8B5CF6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-foreground truncate">
                        {p.proposalNumber} - {p.title}
                      </span>
                      <ProposalStatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <IndianRupee className="h-2.5 w-2.5" />
                      <span>{Number(p.value).toLocaleString("en-IN")}</span>
                      <span>·</span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Meetings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <h4 className="text-xs font-bold text-foreground">Meeting Records</h4>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {meetings.length}
            </Badge>
          </div>

          {loading ? (
            <div className="h-12 rounded-xl bg-muted/20 animate-pulse" />
          ) : meetings.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border/30 bg-muted/5">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4 text-blue-400/50" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">No meetings logged</p>
                <p className="text-[10px] text-muted-foreground/60">Schedule a meeting from the Meetings tab</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{new Date(m.scheduledAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <ModeLabel mode={m.mode} />
                      <span>·</span>
                      <Badge
                        className={`text-[9px] border px-1 py-0 h-3.5 ${
                          m.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon: Other Docs */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">
            Document Management (Coming Soon)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DOCUMENT_TYPES.filter((d) => !["proposal"].includes(d.key)).map((docType) => {
              const Icon = docType.icon;
              return (
                <div
                  key={docType.key}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border ${docType.border} ${docType.bg} opacity-50`}
                >
                  <Icon className={`h-4 w-4 ${docType.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-[11px] font-bold ${docType.color}`}>
                      {docType.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground truncate">
                      {docType.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
