export interface TourStep {
  element: string;
  title: string;
  description: string;
  route: string; // Dynamic path matching, e.g. "/workspaces/[slug]/dashboard"
  side?: "top" | "left" | "right" | "bottom";
  align?: "start" | "center" | "end";
}

export const TOUR_CONFIGS: Record<string, TourStep[]> = {
  "first-login": [
    {
      element: '[data-tour="logo"]',
      title: "Welcome to MergeX OS",
      description: "This is your central command center. Let's take a quick Guided Walkthrough to show you around.",
      route: "/workspaces/[slug]/dashboard",
      side: "right",
      align: "start",
    },
    {
      element: '[data-tour="sidebar-nav"]',
      title: "Navigation Control",
      description: "Quickly access modules such as Dashboard, CRM, and Clients directly from this panel.",
      route: "/workspaces/[slug]/dashboard",
      side: "right",
      align: "center",
    },
    {
      element: '[data-tour="top-nav-search"]',
      title: "Search & Command Center",
      description: "Access files, leads, proposals, or run commands across the OS. Press Ctrl+K anytime.",
      route: "/workspaces/[slug]/dashboard",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="top-nav-help"]',
      title: "Need Assistance?",
      description: "Whenever you want to re-run the Walkthrough for your current screen, just click this Help icon.",
      route: "/workspaces/[slug]/dashboard",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="top-nav-profile"]',
      title: "User Profile & Preferences",
      description: "Modify your profile settings, configure notification preferences, adjust your active theme, or sign out.",
      route: "/workspaces/[slug]/dashboard",
      side: "left",
      align: "center",
    },
  ],

  "crm": [
    {
      element: '[data-tour="crm-header"]',
      title: "Lead Operations Panel",
      description: "Welcome to the CRM. This is where you manage, score, and track your active sales intake funnel.",
      route: "/workspaces/[slug]/crm/leads",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="crm-stats"]',
      title: "Pipeline Vital Signs",
      description: "A summary of active deals, aggregate pipeline value, conversion speeds, and follow-up activities.",
      route: "/workspaces/[slug]/crm/leads",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="crm-pipeline-toggle"]',
      title: "Active Pipeline vs. Nurturing",
      description: "Switch between high-velocity active deals and long-term nurturing leads requiring relationship touchpoints.",
      route: "/workspaces/[slug]/crm/leads",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="crm-filters"]',
      title: "Advanced List Filters",
      description: "Search lead accounts, filter by specific sales stages, lead sources, owners, or swap between List and Grid layouts.",
      route: "/workspaces/[slug]/crm/leads",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="crm-add-lead"]',
      title: "Create Brand Lead",
      description: "Manually inject a new lead card into the CRM stage pipeline from here.",
      route: "/workspaces/[slug]/crm/leads",
      side: "left",
      align: "center",
    },
  ],

  "dashboard": [
    {
      element: '[data-tour="dashboard-header"]',
      title: "Executive Dashboard",
      description: "Your business-critical analytics at a glance. See pipeline velocity, closed-won values, and active actions.",
      route: "/workspaces/[slug]/dashboard",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="dashboard-metrics"]',
      title: "Core Operations Metrics",
      description: "Displays your primary performance indicators: Conversion Rates, Open Deals, and Handoff Values.",
      route: "/workspaces/[slug]/dashboard",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="dashboard-tasks"]',
      title: "Pending Action Tasks",
      description: "Your checklist of urgent follow-ups, upcoming meetings, and due proposal deliveries.",
      route: "/workspaces/[slug]/dashboard",
      side: "left",
      align: "center",
    },
  ],

  "clients": [
    {
      element: '[data-tour="clients-header"]',
      title: "Active Clients & Engagements",
      description: "Track onboarded business clients, service engagements, support statuses, and project lifecycles.",
      route: "/workspaces/[slug]/clients",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="clients-list"]',
      title: "Client Database Matrix",
      description: "Displays core company representatives, assigned engagement managers, and active operational statuses.",
      route: "/workspaces/[slug]/clients",
      side: "top",
      align: "center",
    },
  ],

  "documents": [
    {
      element: '[data-tour="documents-header"]',
      title: "Documents Vault",
      description: "Draft, review, and manage contracts, proposals, and project templates for client sign-offs.",
      route: "/workspaces/[slug]/documents",
      side: "bottom",
      align: "start",
    },
  ],

  "knowledge": [
    {
      element: '[data-tour="knowledge-header"]',
      title: "Operational Wiki",
      description: "Internal documentation, standard operating procedures, sales manuals, and product playbooks.",
      route: "/workspaces/[slug]/knowledge",
      side: "bottom",
      align: "start",
    },
  ],

  "settings": [
    {
      element: '[data-tour="settings-nav"]',
      title: "Settings Navigation",
      description: "Configure user credentials, notification settings, and manage brand rules or crm pipelines from this panel.",
      route: "/workspaces/[slug]/settings",
      side: "right",
      align: "start",
    },
  ],
};
