import { ModuleDef } from "../hooks/use-role-actions";

export const MODULE_DEFINITIONS: ModuleDef[] = [
  {
    id: "CRM",
    label: "CRM Portal",
    description: "Leads pipeline, client meetings scheduling, and proposal generation.",
    permissions: [
      { id: "crm.leads.view", label: "View Leads", description: "View list and details of leads" },
      { id: "crm.leads.create", label: "Create Lead", description: "Add new leads into the pipeline" },
      { id: "crm.leads.edit", label: "Edit Lead", description: "Modify lead contact/status info" },
      { id: "crm.leads.delete", label: "Delete Lead", description: "Permanently delete lead files" },
      { id: "crm.leads.assign", label: "Assign Lead", description: "Assign leads to team members" },
      { id: "crm.leads.export", label: "Export Leads", description: "Download leads list as CSV" },
      { id: "crm.opportunities.view", label: "View Opportunities", description: "Read conversion boards and statuses" },
      { id: "crm.opportunities.create", label: "Create Opportunity", description: "Convert leads into active opportunities" },
      { id: "crm.opportunities.edit", label: "Edit Opportunity", description: "Modify opportunity fields and details" },
      { id: "crm.opportunities.delete", label: "Delete Opportunity", description: "Delete opportunity files" },
      { id: "crm.meetings.view", label: "View Meetings", description: "View upcoming/past schedule" },
      { id: "crm.meetings.create", label: "Schedule Meeting", description: "Add client meeting events" },
      { id: "crm.meetings.complete", label: "Resolve Meetings", description: "Mark meeting status completed" },
      { id: "crm.proposals.view", label: "View Proposals", description: "View sent and draft proposals" },
      { id: "crm.proposals.create", label: "Create Proposals", description: "Draft and generate new proposals" },
      { id: "crm.proposals.edit", label: "Edit Proposals", description: "Edit existing proposals" },
    ],
    subpages: [
      {
        id: "crm.leads",
        label: "Lead Operations",
        description: "Manage leads pipeline, contacts, and classification.",
        viewPermission: "crm.leads.view",
        permissions: [
          { id: "crm.leads.view", label: "View Leads", description: "View list and details of leads" },
          { id: "crm.leads.create", label: "Create Lead", description: "Add new leads into the pipeline" },
          { id: "crm.leads.edit", label: "Edit Lead", description: "Modify lead contact/status info" },
          { id: "crm.leads.delete", label: "Delete Lead", description: "Permanently delete lead files" },
          { id: "crm.leads.assign", label: "Assign Lead", description: "Assign leads to team members" },
          { id: "crm.leads.export", label: "Export Leads", description: "Download leads list as CSV" },
        ],
      },
      {
        id: "crm.opportunities",
        label: "Sales Conversion",
        description: "Track qualified opportunities, proposals, and customer conversion.",
        viewPermission: "crm.opportunities.view",
        permissions: [
          { id: "crm.opportunities.view", label: "View Opportunities", description: "Read conversion boards and statuses" },
          { id: "crm.opportunities.create", label: "Create Opportunity", description: "Convert leads into active opportunities" },
          { id: "crm.opportunities.edit", label: "Edit Opportunity", description: "Modify opportunity fields and details" },
          { id: "crm.opportunities.delete", label: "Delete Opportunity", description: "Delete opportunity files" },
          { id: "crm.meetings.view", label: "View Meetings", description: "View upcoming/past schedule" },
          { id: "crm.meetings.create", label: "Schedule Meeting", description: "Add client meeting events" },
          { id: "crm.meetings.complete", label: "Resolve Meetings", description: "Mark meeting status completed" },
          { id: "crm.proposals.view", label: "View Proposals", description: "View sent and draft proposals" },
          { id: "crm.proposals.create", label: "Create Proposals", description: "Draft and generate new proposals" },
          { id: "crm.proposals.edit", label: "Edit Proposals", description: "Edit existing proposals" },
        ],
      },
    ],
  },
  {
    id: "Clients",
    label: "Clients Database",
    description: "Organization listings, contact histories, and account summaries.",
    permissions: [
      { id: "clients.view", label: "View Clients", description: "View client profile directories" },
      { id: "clients.create", label: "Create Client", description: "Register new client firms/contacts" },
      { id: "clients.edit", label: "Edit Client", description: "Update client profile information" },
    ],
  },
  {
    id: "Documents",
    label: "Document Library",
    description: "Storage, organization, and distribution of file repositories.",
    permissions: [
      { id: "documents.view", label: "View Documents", description: "Read and download cataloged files" },
      { id: "documents.upload", label: "Upload Documents", description: "Upload raw files to storage" },
    ],
  },
  {
    id: "Projects",
    label: "Projects Tracking",
    description: "View delivery status, timelines, and execution summaries.",
    permissions: [
      { id: "projects.view", label: "View Projects", description: "Read project boards and timelines" },
    ],
  },
  {
    id: "Finance",
    label: "Finance Ledger",
    description: "Access transaction logs, invoice receipts, and cashflow stats.",
    permissions: [
      { id: "finance.view", label: "View Finance", description: "View reports and overall billing" },
    ],
  },
  {
    id: "Knowledge",
    label: "Knowledge Base",
    description: "Help document drafting, process publishing, and wiki entries.",
    permissions: [
      { id: "knowledge.view", label: "View Wiki", description: "Read knowledge base articles" },
      { id: "knowledge.create", label: "Create Article", description: "Draft standard operating manuals" },
      { id: "knowledge.edit", label: "Edit Articles", description: "Modify help pages details" },
      { id: "knowledge.publish", label: "Publish Wiki", description: "Approve draft pages to live wiki" },
    ],
  },
  {
    id: "Users",
    label: "Users & Security",
    description: "Internal teammate directories, system invites, and audit logs.",
    permissions: [
      { id: "users.view", label: "View Teammates", description: "List internal directory members" },
      { id: "users.invite", label: "Invite Users", description: "Send organization activation emails" },
      { id: "users.manage", label: "Control Accounts", description: "Suspend/restore/archive employees" },
      { id: "roles.manage", label: "Manage Roles", description: "Update roles mapping permissions" },
    ],
  },
  {
    id: "Settings",
    label: "System Settings",
    description: "Global site configs, integrations, and workspace parameters.",
    permissions: [
      { id: "settings.view", label: "View Settings", description: "Access platform dashboard settings" },
      { id: "settings.manage", label: "Modify Settings", description: "Change global variables and keys" },
    ],
  },
  {
    id: "Organization",
    label: "Organization",
    description: "Top-level controls for brand workspaces, team access, and org-wide settings.",
    permissions: [
      {
        id: "org.workspaces.view",
        label: "View Workspaces",
        description: "Browse all brand workspace directories",
      },
      {
        id: "org.workspaces.manage",
        label: "Manage Workspaces",
        description: "Create, edit, archive, and restore brand workspaces",
      },
      {
        id: "org.team.manage",
        label: "Manage Team & Access",
        description: "Invite, suspend, and assign roles to team members",
      },
      {
        id: "org.settings.manage",
        label: "Manage Org Settings",
        description: "Control organization-wide configuration and policies",
      },
    ],
  },
];

export const STEPS = [
  { id: 1, name: "Enterprise Scope", desc: "Org-level control" },
  { id: 2, name: "Workspace Scope", desc: "Workspace admin" },
  { id: 3, name: "Feature Toggles", desc: "Module activation" },
  { id: 4, name: "Granular Access", desc: "Fine-tune capabilities" },
];
