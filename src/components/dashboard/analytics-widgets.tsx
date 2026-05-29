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

interface AnalyticsWidgetProps {
  type: string;
  teammates: Teammate[];
  brands: Brand[];
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
export function AnalyticsWidget({ type, teammates, brands }: AnalyticsWidgetProps) {
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
      return <PipelineFunnel />;
    case "lead-sources":
      return <LeadSources />;
    case "proposal-win-rate":
      return <ProposalWinRate />;

    // ── Client Analytics ────────────────────────────────────
    case "client-health":
      return <ClientHealth />;
    case "projects-by-status":
      return <ProjectsByStatus />;

    // ── Team Analytics ──────────────────────────────────────
    case "cx-workload":
      return <CXWorkload teammates={teammates} />;

    // ── Document Analytics ──────────────────────────────────
    case "pending-agreements":
      return <PendingAgreements brands={brands} />;
    case "invoice-status":
      return <InvoiceStatus />;

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

function PipelineFunnel() {
  return (
    <EmptyState
      icon={TrendingUp}
      title="No Pipeline Data Yet"
      description="Your CRM pipeline stages will appear here once leads are added and qualified."
      hint="Go to CRM → Add your first lead to get started"
    />
  );
}

function LeadSources() {
  return (
    <EmptyState
      icon={BarChart2}
      title="No Lead Sources Tracked"
      description="Once leads are added to your CRM with a source tag, their distribution will appear here."
      hint="Tag your leads with a source in the CRM module"
    />
  );
}

function ProposalWinRate() {
  return (
    <EmptyState
      icon={PieChartIcon}
      title="No Proposals Yet"
      description="Your proposal win rate, accepted, pending, and declined counts will populate here as you send proposals."
      hint="Create your first proposal in the Documents module"
    />
  );
}

// ─────────────────────────────────────────────────────────────
// 2. CLIENT WIDGETS
// ─────────────────────────────────────────────────────────────

function ClientHealth() {
  return (
    <EmptyState
      icon={Users}
      title="No Clients Onboarded"
      description="Client health scores — Healthy, Needs Attention, At Risk — will display here once clients are added."
      hint="Go to Clients → Add your first client"
    />
  );
}

function ProjectsByStatus() {
  return (
    <EmptyState
      icon={BarChart2}
      title="No Projects Yet"
      description="Project breakdown by status (Setup, Active, Review, Done) will appear here once projects are created."
      hint="Projects are created inside a Client record"
    />
  );
}

// ─────────────────────────────────────────────────────────────
// 3. TEAM WIDGETS
// ─────────────────────────────────────────────────────────────

function CXWorkload({ teammates }: { teammates: Teammate[] }) {
  if (teammates.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No Team Members Yet"
        description="Invite teammates to your workspace and their lead workload will appear here."
        hint="Go to Settings → Team → Invite Members"
      />
    );
  }

  // Teammates exist but no real lead data yet — show team list with zero state
  return (
    <div className="space-y-4 py-1 max-h-[280px] overflow-y-auto pr-1">
      {teammates.map((mate) => {
        const initials = ((mate.firstName?.[0] ?? "") + (mate.lastName?.[0] ?? mate.email[0])).toUpperCase();
        const displayName = mate.firstName ? `${mate.firstName} ${mate.lastName ?? ""}` : mate.email;

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
              <span className="font-mono text-muted-foreground/40 font-semibold shrink-0 text-[10px]">
                0 leads
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6] rounded-full" />
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

function PendingAgreements({ brands }: { brands: Brand[] }) {
  void brands;

  return (
    <EmptyState
      icon={FileText}
      title="No Pending Agreements"
      description="Contracts and agreements awaiting signatures or approval will appear here once documents are created."
      hint="Go to Documents → Create Agreement"
    />
  );
}

function InvoiceStatus() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No Invoice Data"
      description="Collected vs. unpaid invoice trends will display here once invoices are generated and sent."
      hint="Go to Documents → Create Invoice"
    />
  );
}
