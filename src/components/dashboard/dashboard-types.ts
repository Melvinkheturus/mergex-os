export interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  role: {
    label: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  status: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  title: string;
  proposalNumber: string;
  status: string;
  value: number;
  createdAt: string;
}

export interface Meeting {
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

export interface Lead {
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

export const KPI_POOL = {
  "active-leads": { label: "Active Leads", value: "0", trend: "0%", trendUp: false, desc: "vs last week" },
  "meetings-week": { label: "Meetings This Week", value: "0", trend: "0", trendUp: false, desc: "vs last week" },
  "proposal-conversion": { label: "Proposal Conversion", value: "0.0%", trend: "0%", trendUp: false, desc: "vs last month" },
  "active-clients": { label: "Active Clients", value: "0", trend: "0", trendUp: false, desc: "this month" },
  "payments-collected": { label: "Payments Collected", value: "₹0K", trend: "0%", trendUp: false, desc: "vs last month" },
  "unpaid-invoices": { label: "Unpaid Invoices", value: "₹0K", trend: "0%", trendUp: false, desc: "outstanding balance" },
  "overdue-actions": { label: "Overdue Actions", value: "0", trend: "None", trendUp: false, desc: "high priority items" },
  "completed-tasks": { label: "Completed Tasks", value: "0", trend: "0", trendUp: false, desc: "this week" },
};

export type KpiType = keyof typeof KPI_POOL;

export const WIDGET_POOL = {
  // CRM
  "pipeline-funnel": { label: "Pipeline Funnel", category: "CRM" },
  "pipeline-health": { label: "Pipeline Health", category: "CRM" },
  "pipeline-value": { label: "Pipeline Value", category: "CRM" },
  "lead-sources": { label: "Lead Sources", category: "CRM" },
  "proposal-win-rate": { label: "Proposal Win Rate", category: "CRM" },
  // Clients
  "client-health": { label: "Client Health", category: "Clients" },
  "projects-by-status": { label: "Projects by Status", category: "Clients" },
  // Documents
  "pending-agreements": { label: "Pending Agreements", category: "Documents" },
  "invoice-status": { label: "Invoice Status", category: "Documents" },
};

export type WidgetType = keyof typeof WIDGET_POOL;

export const parseKpiValue = (valStr: string) => {
  let prefix = "";
  let suffix = "";
  let cleanStr = valStr.trim();

  if (cleanStr.startsWith("$")) {
    prefix = "$";
    cleanStr = cleanStr.substring(1);
  } else if (cleanStr.startsWith("₹")) {
    prefix = "₹";
    cleanStr = cleanStr.substring(1);
  }

  if (cleanStr.endsWith("K")) {
    suffix = "K";
    cleanStr = cleanStr.slice(0, -1);
  } else if (cleanStr.endsWith("%")) {
    suffix = "%";
    cleanStr = cleanStr.slice(0, -1);
  }

  const parsed = parseFloat(cleanStr);
  const decimals = cleanStr.includes(".") ? cleanStr.split(".")[1].length : 0;

  return {
    value: isNaN(parsed) ? 0 : parsed,
    prefix,
    suffix,
    decimals,
    original: valStr
  };
};
