/**
 * MergeX Sales OS - Permission Engine
 *
 * Convention: "module.resource.action"
 * Examples: "crm.leads.view", "crm.meetings.create", "settings.manage"
 *
 * These strings are stored verbatim in the DB as Permission.module + Permission.action
 * and assembled as `${module}.${action}` when loading.
 */

// ── Canonical permission strings ──────────────────────────────
export const PERMISSIONS = {
  // ── CRM — Leads ──────────────────────────────────────────────
  "crm.leads.view":   { module: "crm.leads",   action: "view"   },
  "crm.leads.create": { module: "crm.leads",   action: "create" },
  "crm.leads.edit":   { module: "crm.leads",   action: "edit"   },
  "crm.leads.delete": { module: "crm.leads",   action: "delete" },
  "crm.leads.assign": { module: "crm.leads",   action: "assign" },
  "crm.leads.export": { module: "crm.leads",   action: "export" },

  // ── CRM — Meetings ────────────────────────────────────────────
  "crm.meetings.view":     { module: "crm.meetings",   action: "view"     },
  "crm.meetings.create":   { module: "crm.meetings",   action: "create"   },
  "crm.meetings.complete": { module: "crm.meetings",   action: "complete" },

  // ── CRM — Proposals ───────────────────────────────────────────
  "crm.proposals.view":   { module: "crm.proposals", action: "view"   },
  "crm.proposals.create": { module: "crm.proposals", action: "create" },
  "crm.proposals.edit":   { module: "crm.proposals", action: "edit"   },

  // ── Clients ───────────────────────────────────────────────────
  "clients.view":   { module: "clients", action: "view"   },
  "clients.create": { module: "clients", action: "create" },
  "clients.edit":   { module: "clients", action: "edit"   },

  // ── Documents ─────────────────────────────────────────────────
  "documents.view":   { module: "documents", action: "view"   },
  "documents.upload": { module: "documents", action: "upload" },

  // ── Knowledge Base ────────────────────────────────────────────
  "knowledge.view":    { module: "knowledge", action: "view"    },
  "knowledge.create":  { module: "knowledge", action: "create"  },
  "knowledge.edit":    { module: "knowledge", action: "edit"    },
  "knowledge.publish": { module: "knowledge", action: "publish" },

  // ── Users & Roles ─────────────────────────────────────────────
  "users.view":   { module: "users", action: "view"   },
  "users.invite": { module: "users", action: "invite" },
  "users.manage": { module: "users", action: "manage" },
  "roles.manage": { module: "roles", action: "manage" },

  // ── Settings ──────────────────────────────────────────────────
  "settings.view":   { module: "settings", action: "view"   },
  "settings.manage": { module: "settings", action: "manage" },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionString = PermissionKey;

// ── Default role → permission mapping ────────────────────────
// Used to seed the database initial roles
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  super_admin: Object.keys(PERMISSIONS) as PermissionKey[],

  admin: [
    "crm.leads.view", "crm.leads.create", "crm.leads.edit", "crm.leads.delete",
    "crm.leads.assign", "crm.leads.export",
    "crm.meetings.view", "crm.meetings.create", "crm.meetings.complete",
    "crm.proposals.view", "crm.proposals.create", "crm.proposals.edit",
    "clients.view", "clients.create", "clients.edit",
    "documents.view", "documents.upload",
    "knowledge.view", "knowledge.create", "knowledge.edit", "knowledge.publish",
    "users.view", "users.invite", "users.manage",
    "settings.view", "settings.manage",
  ],

  sales_manager: [
    "crm.leads.view", "crm.leads.create", "crm.leads.edit",
    "crm.leads.assign", "crm.leads.export",
    "crm.meetings.view", "crm.meetings.create", "crm.meetings.complete",
    "crm.proposals.view", "crm.proposals.create", "crm.proposals.edit",
    "clients.view", "clients.create", "clients.edit",
    "documents.view", "documents.upload",
    "knowledge.view", "knowledge.create", "knowledge.edit",
    "users.view", "users.invite",
    "settings.view",
  ],

  cx_executive: [
    "crm.leads.view", "crm.leads.create", "crm.leads.edit", "crm.leads.assign",
    "crm.meetings.view", "crm.meetings.create", "crm.meetings.complete",
    "crm.proposals.view", "crm.proposals.create",
    "clients.view",
    "documents.view",
    "knowledge.view",
    "users.view",
  ],

  proposal_manager: [
    "crm.leads.view",
    "crm.proposals.view", "crm.proposals.create", "crm.proposals.edit",
    "crm.meetings.view",
    "clients.view",
    "knowledge.view", "knowledge.create", "knowledge.edit",
    "documents.view", "documents.upload",
  ],

  analyst: [
    "crm.leads.view", "crm.leads.export",
    "crm.proposals.view",
    "crm.meetings.view",
    "clients.view",
    "knowledge.view",
    "documents.view",
  ],

  viewer: [
    "crm.leads.view",
    "crm.proposals.view",
    "crm.meetings.view",
    "clients.view",
    "knowledge.view",
    "documents.view",
  ],
};

// ── Client-side permission check helper ──────────────────────
// Pass the permission strings from the session/API
export function can(
  userPermissions: PermissionString[],
  key: PermissionKey
): boolean {
  return userPermissions.includes(key);
}
