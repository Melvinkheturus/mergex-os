/**
 * MergeX OS — CASL Ability Builder
 *
 * Architecture:
 *   User → Role → Permissions (from DB) → CASL Ability
 *
 * Usage (server-side):
 *   const user = await getCurrentUser();
 *   const ability = buildAbility(user.permissions, user.role.name === "super_admin");
 *   if (!ability.can("create", "Lead")) throw new Error("Forbidden");
 *
 * Usage (client-side, via context):
 *   const { ability } = useAbility();
 *   {ability.can("create", "Lead") && <NewLeadButton />}
 */

import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability";
import type { PermissionString } from "./permissions";

// ── Subject types ─────────────────────────────────────────────
// One type per resource in the system
export type AppSubject =
  | "Lead"
  | "Meeting"
  | "Proposal"
  | "Client"
  | "Document"
  | "KnowledgeArticle"
  | "User"
  | "Role"
  | "Settings"
  | "all";

// ── Action types ──────────────────────────────────────────────
export type AppAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "manage"    // wildcard — implies all actions
  | "upload"    // documents
  | "publish"   // knowledge
  | "complete"  // meetings
  | "assign"    // leads
  | "export"    // leads
  | "invite";   // users

export type AppAbility = MongoAbility<[AppAction, AppSubject]>;

// ── Mapping: permission key segment → CASL Subject ───────────
const RESOURCE_TO_SUBJECT: Record<string, AppSubject> = {
  leads:      "Lead",
  meetings:   "Meeting",
  proposals:  "Proposal",
  clients:    "Client",      // "clients" module, no sub-resource
  documents:  "Document",    // "documents" module
  knowledge:  "KnowledgeArticle",
  users:      "User",
  roles:      "Role",
  settings:   "Settings",
};

/**
 * Parses a permission string like "crm.leads.view" and maps it to a CASL rule.
 *
 * Format: [module.]resource.action
 * - "crm.leads.view"      → can("view", "Lead")
 * - "clients.view"        → can("view", "Client")
 * - "documents.upload"    → can("upload", "Document")
 * - "settings.manage"     → can("manage", "Settings")
 */
function parsePermission(perm: string): { action: AppAction; subject: AppSubject } | null {
  const parts = perm.split(".");
  if (parts.length < 2) return null;

  // Last segment is always the action
  const action = parts[parts.length - 1] as AppAction;
  // Resource is second-to-last (handles "crm.leads", "clients", "documents", etc.)
  const resource = parts[parts.length - 2];

  const subject = RESOURCE_TO_SUBJECT[resource];
  if (!subject) return null;

  return { action, subject };
}

/**
 * Builds a typed CASL AppAbility from the user's DB permission strings.
 *
 * @param permissionStrings - Array of strings like ["crm.leads.view", "crm.leads.create"]
 * @param isSuperAdmin - If true, grants `manage all` regardless of permissionStrings
 */
export function buildAbility(
  permissionStrings: PermissionString[],
  isSuperAdmin = false
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (isSuperAdmin) {
    can("manage", "all");
    return build();
  }

  for (const perm of permissionStrings) {
    const parsed = parsePermission(perm);
    if (parsed) {
      can(parsed.action, parsed.subject);
    }
  }

  return build();
}

/**
 * Returns an ability that can do nothing.
 * Use as a safe default while loading.
 */
export function emptyAbility(): AppAbility {
  const { build } = new AbilityBuilder<AppAbility>(createMongoAbility);
  return build();
}
