"use client";

import { useState, useEffect } from "react";
import { 
  HelpCircle,
  TrendingUp,
  Users,
  FileText,
  BarChart2,
  PieChart as PieChartIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  role: {
    label: string;
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  status: string;
  createdAt: string;
}

interface Proposal {
  id: string;
  title: string;
  proposalNumber: string;
  status: string;
  value: number;
  createdAt: string;
}

interface Meeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  mode: string;
  meetingUrl: string | null;
  status: string;
  lead: {
    id: string;
    companyName: string;
    contactPerson: string;
  } | null;
  organizer: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  expectedValue: number | null;
  winLossStatus: string | null;
  nextActionDate: string | null;
  createdAt: string;
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
  stage: {
    id: string;
    name: string;
    label: string;
    color: string | null;
  } | null;
  source: {
    id: string;
    name: string;
  } | null;
}

interface AnalyticsWidgetProps {
  type: string;
  teammates: Teammate[];
  brands: Brand[];
  leads?: Lead[];
  meetings?: Meeting[];
  proposals?: Proposal[];
  clients?: Client[];
}

// ─────────────────────────────────────────────────────────────
// Shared Empty State Component
// ─────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  description,
  hint,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-4 px-2">
      <div className="h-12 w-12 rounded-2xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#8B5CF6]/40" />
      </div>
      <div className="space-y-1 max-w-[220px]">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">{description}</p>
        {hint && (
          <p className="text-[9px] text-[#8B5CF6]/60 font-medium mt-1 bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 px-2 py-1 rounded-lg">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Widget Router
// ─────────────────────────────────────────────────────────────
export function AnalyticsWidget({ 
  type, 
  teammates, 
  brands,
  leads = [],
  meetings = [],
  proposals = [],
  clients = []
}: AnalyticsWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#8B5CF6]/20 border-t-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  switch (type) {
    // ── CRM Analytics ───────────────────────────────────────
    case "pipeline-funnel":
      return <PipelineFunnel leads={leads} />;
    case "lead-sources":
      return <LeadSources leads={leads} />;
    case "proposal-win-rate":
      return <ProposalWinRate leads={leads} />;

    // ── Client Analytics ────────────────────────────────────
    case "client-health":
      return <ClientHealth clients={clients} />;
    case "projects-by-status":
      return <ProjectsByStatus clients={clients} />;

    // ── Team Analytics ──────────────────────────────────────
    case "cx-workload":
      return <CXWorkload teammates={teammates} leads={leads} />;

    // ── Document Analytics ──────────────────────────────────
    case "pending-agreements":
      return <PendingAgreements proposals={proposals} />;
    case "invoice-status":
      return <InvoiceStatus proposals={proposals} />;

    default:
      return (
        <EmptyState
          icon={HelpCircle}
          title="Widget Not Found"
          description="This module has no visualization layout configured yet."
        />
      );
  }
}

// ─────────────────────────────────────────────────────────────
// 1. CRM WIDGETS
// ─────────────────────────────────────────────────────────────

function PipelineFunnel({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Pipeline Data"
        description="CRM funnel stages will show here once leads are added."
        hint="Go to CRM → Add your first lead"
      />
    );
  }

  const stageMap: Record<string, { label: string; count: number; color: string }> = {};

  leads.forEach((lead) => {
    let stageId = lead.stage?.id || "unassigned";
    let stageLabel = lead.stage?.label || "Unassigned";
    let stageColor = lead.stage?.color || "#94A3B8";

    if (lead.winLossStatus === "WON") {
      stageId = "won";
      stageLabel = "Closed Won";
      stageColor = "#10B981";
    } else if (lead.winLossStatus === "LOST") {
      stageId = "lost";
      stageLabel = "Closed Lost";
      stageColor = "#EF4444";
    }

    if (!stageMap[stageId]) {
      stageMap[stageId] = { label: stageLabel, count: 0, color: stageColor };
    }
    stageMap[stageId].count++;
  });

  const stagesList = Object.values(stageMap).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3.5 py-1 max-h-[280px] overflow-y-auto pr-1">
      {stagesList.map((stage) => {
        const pct = Math.round((stage.count / leads.length) * 100);
        return (
          <div key={stage.label} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground/80 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                {stage.label}
              </span>
              <span className="font-mono text-muted-foreground font-semibold">
                {stage.count} {stage.count === 1 ? "lead" : "leads"} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  backgroundColor: stage.color, 
                  width: `${pct}%` 
                }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadSources({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No Lead Sources"
        description="Source distributions will show here once leads are tagged."
        hint="Tag your leads with a source in CRM"
      />
    );
  }

  const sourceMap: Record<string, { label: string; count: number }> = {};
  leads.forEach((lead) => {
    const sourceName = lead.source?.name || "Unassigned";
    if (!sourceMap[sourceName]) {
      sourceMap[sourceName] = { label: sourceName, count: 0 };
    }
    sourceMap[sourceName].count++;
  });

  const sourcesList = Object.values(sourceMap).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3.5 py-1 max-h-[280px] overflow-y-auto pr-1">
      {sourcesList.map((src) => {
        const pct = Math.round((src.count / leads.length) * 100);
        return (
          <div key={src.label} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground/80 truncate max-w-[200px]">
                {src.label}
              </span>
              <span className="font-mono text-muted-foreground font-semibold">
                {src.count} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-[#C4B5FD] to-[#8B5CF6] rounded-full transition-all duration-500" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProposalWinRate({ leads }: { leads: Lead[] }) {
  const wonLeadsCount = leads.filter(l => l.winLossStatus === "WON").length;
  const lostLeadsCount = leads.filter(l => l.winLossStatus === "LOST").length;
  const closedCount = wonLeadsCount + lostLeadsCount;
  
  if (closedCount === 0) {
    return (
      <EmptyState
        icon={PieChartIcon}
        title="No Proposals Closed"
        description="Win rate statistics will display once proposals are closed won or lost."
        hint="Close leads in CRM as Won or Lost"
      />
    );
  }

  const winRate = Math.round((wonLeadsCount / closedCount) * 100);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-2">
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-muted/20" strokeWidth="8" fill="transparent" />
          <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-[#8B5CF6]" strokeWidth="8" fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * winRate) / 100}
          />
        </svg>
        <span className="absolute text-lg font-black text-foreground">{winRate}%</span>
      </div>
      <div className="flex gap-6 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Won: {wonLeadsCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Lost: {lostLeadsCount}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. CLIENT WIDGETS
// ─────────────────────────────────────────────────────────────

function ClientHealth({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Clients Onboarded"
        description="Operational health scores will show here once clients are added."
        hint="Go to Clients → Add your first client"
      />
    );
  }

  return (
    <div className="space-y-3.5 py-1 max-h-[280px] overflow-y-auto pr-1">
      {clients.map((c) => (
        <div key={c.id} className="flex justify-between items-center text-xs p-2 rounded-lg border border-border/10 bg-muted/10">
          <span className="font-semibold text-foreground/80">{c.companyName}</span>
          <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md font-semibold">
            Healthy (100)
          </span>
        </div>
      ))}
    </div>
  );
}

function ProjectsByStatus({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No Projects Yet"
        description="Project status breakdowns will show here once created."
        hint="Create a project inside any Client record"
      />
    );
  }

  return (
    <div className="space-y-3.5 py-1 max-h-[280px] overflow-y-auto pr-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-foreground/80">Active Projects</span>
        <span className="font-mono text-muted-foreground font-semibold">{clients.length}</span>
      </div>
      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full bg-linear-to-r from-[#C4B5FD] to-[#8B5CF6] rounded-full w-full" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. TEAM WIDGETS
// ─────────────────────────────────────────────────────────────

function CXWorkload({ teammates, leads }: { teammates: Teammate[]; leads: Lead[] }) {
  if (teammates.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Team Members"
        description="Invite teammates to see lead workloads."
        hint="Go to Settings → Team → Invite Members"
      />
    );
  }

  return (
    <div className="space-y-4 py-1 max-h-[280px] overflow-y-auto pr-1">
      {teammates.map((mate) => {
        const initials = ((mate.firstName?.[0] ?? "") + (mate.lastName?.[0] ?? mate.email[0])).toUpperCase();
        const displayName = mate.firstName ? `${mate.firstName} ${mate.lastName ?? ""}` : mate.email;
        const mateLeadsCount = leads.filter(l => l.owner?.id === mate.id).length;
        const pct = leads.length > 0 ? Math.round((mateLeadsCount / leads.length) * 100) : 0;

        return (
          <div key={mate.id} className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-[9px] font-extrabold text-[#8B5CF6] shrink-0">
                  {initials}
                </div>
                <span className="font-semibold text-foreground/80 truncate max-w-[110px]">
                  {displayName}
                </span>
                <span className="text-[8px] text-[#8B5CF6] bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                  {mate.designation ?? mate.role.label}
                </span>
              </div>
              <span className="font-mono text-muted-foreground/50 font-bold shrink-0 text-[10px]">
                {mateLeadsCount} {mateLeadsCount === 1 ? "lead" : "leads"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-[#C4B5FD] to-[#8B5CF6] rounded-full transition-all duration-500" 
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[9px] text-muted-foreground/40 text-center pt-1">
        Lead assignments will populate as CRM activity grows
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. DOCUMENT WIDGETS
// ─────────────────────────────────────────────────────────────

function PendingAgreements({ proposals }: { proposals: Proposal[] }) {
  const pending = proposals.filter(p => p.status === "DRAFT" || p.status === "SENT");

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No Pending Agreements"
        description="Contracts awaiting signatures will appear here."
        hint="Go to Documents → Create Agreement"
      />
    );
  }

  return (
    <div className="space-y-3 py-1 max-h-[280px] overflow-y-auto pr-1">
      {pending.map((p) => (
        <div key={p.id} className="flex justify-between items-center text-xs p-2 rounded-lg border border-border/10 bg-muted/10">
          <div className="min-w-0">
            <p className="font-semibold text-foreground/80 truncate">{p.title}</p>
            <p className="text-[9px] text-muted-foreground/60 font-medium truncate">{p.proposalNumber}</p>
          </div>
          <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md font-semibold shrink-0">
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function InvoiceStatus({ proposals }: { proposals: Proposal[] }) {
  const collected = proposals.filter(p => p.status === "ACCEPTED" || p.status === "WON").reduce((sum, p) => sum + Number(p.value), 0);
  const unpaid = proposals.filter(p => p.status !== "ACCEPTED" && p.status !== "WON").reduce((sum, p) => sum + Number(p.value), 0);
  const total = collected + unpaid;
  
  if (total === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No Invoice Data"
        description="Collected vs unpaid invoice trends will show here."
        hint="Go to Documents → Create Invoice"
      />
    );
  }

  const colPct = total > 0 ? Math.round((collected / total) * 100) : 0;
  const unpPct = total > 0 ? Math.round((unpaid / total) * 100) : 0;

  return (
    <div className="space-y-3.5 py-1">
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground/80">Collected Payments</span>
          <span className="font-mono text-emerald-500 font-bold">₹{(collected / 1000).toFixed(0)}K ({colPct}%)</span>
        </div>
        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${colPct}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground/80">Unpaid / Awaiting</span>
          <span className="font-mono text-amber-500 font-bold">₹{(unpaid / 1000).toFixed(0)}K ({unpPct}%)</span>
        </div>
        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${unpPct}%` }} />
        </div>
      </div>
    </div>
  );
}
