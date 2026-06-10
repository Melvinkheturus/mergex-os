// ─── Types for Sales Conversion Module ───────────────────────────────────────

export interface OpportunityOwner {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface OpportunityStage {
  id: string;
  name: string;
  label: string;
  color: string | null;
}

export interface LatestMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
}

export interface LatestProposal {
  id: string;
  title: string;
  value: string;
  status: string;
}

export interface Opportunity {
  id: string;
  leadNumber: string | null;
  companyName: string;
  contactPerson: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  location: string | null;
  expectedValue: string | null;
  services: string[];
  temperature: string;
  classification: string | null;
  nurturingDirection: string | null;
  stageId: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string | null;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  winLossStatus: string | null;
  winLossReason: string | null;
  qualScore: number;
  avatarUrl: string | null;
  bantScore: number;
  decisionMaker: string | null;
  influencer: string | null;
  // Funnel stage derived
  funnelStage: "discovery" | "solution" | "proposal" | "closure" | "handoff";
  owner: OpportunityOwner | null;
  stage: OpportunityStage | null;
  latestMeeting: LatestMeeting | null;
  latestProposal: LatestProposal | null;
}

// Funnel stage classification logic
export function deriveFunnelStage(opp: {
  winLossStatus?: string | null;
  stage?: OpportunityStage | null;
  latestProposal?: LatestProposal | null;
}): "discovery" | "solution" | "proposal" | "closure" | "handoff" {
  if (opp.winLossStatus === "WON") return "handoff";
  const stageName = opp.stage?.name || "";
  if (stageName === "ENGAGEMENT_MANAGER_ASSIGNED") return "handoff";
  if (stageName === "DOCUMENTATION") return "closure";
  if (stageName === "PROPOSAL") {
    if (opp.latestProposal) return "proposal";
    return "solution";
  }
  return "discovery";
}

export function getStatus(opp: { winLossStatus?: string | null; lastActivityAt?: string | null }): "active" | "stalled" | "won" {
  if (opp.winLossStatus === "WON") return "won";
  if (opp.lastActivityAt) {
    const daysSince =
      (Date.now() - new Date(opp.lastActivityAt).getTime()) / 86400000;
    if (daysSince > 14) return "stalled";
  }
  return "active";
}


// Format currency for display
export function formatCurrency(value: string | null | undefined): string {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
}

// Relative time helper
export function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
