/**
 * MergeX Sales OS — Permission Engine
 * All permissions are structured as "module.action"
 */

// ── Permission definitions ────────────────────────────────
export const PERMISSIONS = {
  // CRM
  CRM_VIEW:    { module: "crm",     action: "view"   },
  CRM_CREATE:  { module: "crm",     action: "create" },
  CRM_EDIT:    { module: "crm",     action: "edit"   },
  CRM_DELETE:  { module: "crm",     action: "delete" },

  // Leads
  LEADS_CREATE: { module: "leads", action: "create" },
  LEADS_ASSIGN: { module: "leads", action: "assign" },
  LEADS_EXPORT: { module: "leads", action: "export" },

  // Deals
  DEALS_VIEW:   { module: "deals", action: "view"   },
  DEALS_CREATE: { module: "deals", action: "create" },
  DEALS_EDIT:   { module: "deals", action: "edit"   },
  DEALS_DELETE: { module: "deals", action: "delete" },

  // Contacts
  CONTACTS_VIEW:   { module: "contacts", action: "view"   },
  CONTACTS_CREATE: { module: "contacts", action: "create" },
  CONTACTS_EDIT:   { module: "contacts", action: "edit"   },

  // Reports & Analytics
  REPORTS_VIEW:   { module: "reports", action: "view"   },
  REPORTS_EXPORT: { module: "reports", action: "export" },

  // Knowledge Base
  KB_VIEW:    { module: "kb", action: "view"    },
  KB_CREATE:  { module: "kb", action: "create"  },
  KB_EDIT:    { module: "kb", action: "edit"    },
  KB_PUBLISH: { module: "kb", action: "publish" },

  // Meetings & Calls
  MEETINGS_CREATE:   { module: "meetings", action: "create"   },
  MEETINGS_COMPLETE: { module: "meetings", action: "complete" },

  // Tasks
  TASKS_VIEW:   { module: "tasks", action: "view"   },
  TASKS_CREATE: { module: "tasks", action: "create" },
  TASKS_ASSIGN: { module: "tasks", action: "assign" },

  // Users & Roles
  USERS_VIEW:   { module: "users", action: "view"   },
  USERS_INVITE: { module: "users", action: "invite" },
  USERS_MANAGE: { module: "users", action: "manage" },
  ROLES_MANAGE: { module: "roles", action: "manage" },

  // Settings
  SETTINGS_VIEW:   { module: "settings", action: "view"   },
  SETTINGS_MANAGE: { module: "settings", action: "manage" },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionString = `${string}.${string}`;

// ── Default role → permission mapping ────────────────────
// Used to seed the database initial roles
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  super_admin: Object.keys(PERMISSIONS) as PermissionKey[],

  admin: [
    "CRM_VIEW", "CRM_CREATE", "CRM_EDIT", "CRM_DELETE",
    "LEADS_CREATE", "LEADS_ASSIGN", "LEADS_EXPORT",
    "DEALS_VIEW", "DEALS_CREATE", "DEALS_EDIT", "DEALS_DELETE",
    "CONTACTS_VIEW", "CONTACTS_CREATE", "CONTACTS_EDIT",
    "REPORTS_VIEW", "REPORTS_EXPORT",
    "KB_VIEW", "KB_CREATE", "KB_EDIT", "KB_PUBLISH",
    "MEETINGS_CREATE", "MEETINGS_COMPLETE",
    "TASKS_VIEW", "TASKS_CREATE", "TASKS_ASSIGN",
    "USERS_VIEW", "USERS_INVITE", "USERS_MANAGE",
    "SETTINGS_VIEW", "SETTINGS_MANAGE",
  ],

  sales_manager: [
    "CRM_VIEW", "CRM_CREATE", "CRM_EDIT",
    "LEADS_CREATE", "LEADS_ASSIGN", "LEADS_EXPORT",
    "DEALS_VIEW", "DEALS_CREATE", "DEALS_EDIT",
    "CONTACTS_VIEW", "CONTACTS_CREATE", "CONTACTS_EDIT",
    "REPORTS_VIEW", "REPORTS_EXPORT",
    "KB_VIEW",
    "MEETINGS_CREATE", "MEETINGS_COMPLETE",
    "TASKS_VIEW", "TASKS_CREATE", "TASKS_ASSIGN",
    "USERS_VIEW",
    "SETTINGS_VIEW",
  ],

  cx_executive: [
    "CRM_VIEW", "CRM_CREATE", "CRM_EDIT",
    "LEADS_CREATE", "LEADS_ASSIGN",
    "DEALS_VIEW", "DEALS_CREATE", "DEALS_EDIT",
    "CONTACTS_VIEW", "CONTACTS_CREATE", "CONTACTS_EDIT",
    "REPORTS_VIEW",
    "KB_VIEW",
    "MEETINGS_CREATE", "MEETINGS_COMPLETE",
    "TASKS_VIEW", "TASKS_CREATE",
  ],

  proposal_manager: [
    "CRM_VIEW",
    "DEALS_VIEW", "DEALS_CREATE", "DEALS_EDIT",
    "CONTACTS_VIEW",
    "KB_VIEW", "KB_CREATE", "KB_EDIT",
  ],

  analyst: [
    "CRM_VIEW",
    "DEALS_VIEW",
    "CONTACTS_VIEW",
    "REPORTS_VIEW", "REPORTS_EXPORT",
    "KB_VIEW",
  ],

  viewer: [
    "CRM_VIEW",
    "DEALS_VIEW",
    "CONTACTS_VIEW",
    "KB_VIEW",
  ],
};

// ── Client-side permission check helper ──────────────────
// Pass the permission strings from the session/API call
export function can(
  userPermissions: PermissionString[],
  key: PermissionKey
): boolean {
  const p = PERMISSIONS[key];
  const target = `${p.module}.${p.action}` as PermissionString;
  return userPermissions.includes(target);
}
