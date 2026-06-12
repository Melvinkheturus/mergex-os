import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { PermissionKey, PermissionString } from "./permissions";
import { PERMISSIONS } from "./permissions";
import { buildAbility, type AppAbility } from "./ability";
import crypto from "crypto";

// ── Types ─────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  clerkId: string;
  email: string;
  employeeId: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  activeBrandId: string | null;
  role: {
    id: string;
    name: string;
    label: string;
  };
  permissions: PermissionString[];
  moduleAccess: string[];
  permissionAccess: string[];
};

// ── Ability helper ─────────────────────────────────────────────

/**
 * Build a typed CASL ability for this user.
 * Use on both server and client (pass AuthUser from context on client).
 */
export function getAbility(user: AuthUser): AppAbility {
  return buildAbility(user.permissions, user.role.name === "super_admin");
}

// ── The user select shape ─────────────────────────────────────

const USER_SELECT = {
  id: true,
  clerkId: true,
  email: true,
  employeeId: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  status: true,
  suspendedAt: true,
  archivedAt: true,
  activeBrandId: true,
  roleId: true,
  moduleAccess: true,
  permissionAccess: true,
  Role: {
    select: {
      id: true,
      name: true,
      label: true,
      RolePermission: {
        select: {
          Permission: {
            select: { module: true, action: true },
          },
        },
      },
    },
  },
} as const;

type UserWithRole = {
  id: string;
  clerkId: string;
  email: string;
  employeeId: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  suspendedAt: Date | null;
  archivedAt: Date | null;
  activeBrandId: string | null;
  roleId: string;
  moduleAccess: string[];
  permissionAccess: string[];
  Role: {
    id: string;
    name: string;
    label: string;
    RolePermission: {
      Permission: {
        module: string;
        action: string;
      };
    }[];
  };
};

function buildAuthUser(user: UserWithRole, overrideRole?: UserWithRole["Role"]): AuthUser {
  const activeRole = overrideRole ?? user.Role;
  const permissions = user.permissionAccess && user.permissionAccess.length > 0
    ? (user.permissionAccess as PermissionString[])
    : activeRole.RolePermission.map(
        (rp) => `${rp.Permission.module}.${rp.Permission.action}` as PermissionString
      );

  // Derive modules from role permissions
  const roleModules = Array.from(
    new Set(
      activeRole.RolePermission.map((rp) => {
        const mod = rp.Permission.module.split(".")[0];
        if (mod === "crm") return "CRM";
        return mod.charAt(0).toUpperCase() + mod.slice(1);
      })
    )
  );

  // Inject default/shared modules if they have permissions
  if (roleModules.length > 0) {
    if (!roleModules.includes("Projects")) roleModules.push("Projects");
  }

  const moduleAccess = user.moduleAccess && user.moduleAccess.length > 0
    ? user.moduleAccess
    : roleModules;

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    employeeId: user.employeeId,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    status: user.status,
    activeBrandId: user.activeBrandId,
    role: {
      id: activeRole.id,
      name: activeRole.name,
      label: activeRole.label,
    },
    permissions,
    moduleAccess,
    permissionAccess: user.permissionAccess ?? [],
  };
}

// ── Get current user from DB with role + permissions ──────────

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await db.user.findUnique({
    where: { clerkId: userId },
    select: USER_SELECT,
  });

  if (!user) {
    // Proactive Auto-Provisioning for local dev when Clerk webhooks are bypassed
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const primaryEmail = clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";

        if (primaryEmail) {
          // Check platform initialization — if not initialized, do NOT auto-provision.
          // The Setup Wizard owns super-admin creation; proxy will redirect to /setup.
          const settings = await db.platformSettings.findUnique({
            where: { id: "singleton" },
            select: { initialized: true },
          });

          if (!settings?.initialized) {
            console.log("[auth-auto-provision] Platform not initialized — skipping auto-provision, redirecting to /setup.");
            return null;
          }

          // Platform initialized — handle invite-based provisioning only.
          let roleId: string | null = null;
          const onboardingState = "COMPLETE" as const;

          const invite = await db.userInvite.findFirst({
            where: { email: primaryEmail, status: "PENDING" },
            orderBy: { createdAt: "desc" },
            include: { UserInviteBrand: true },
          });

          if (invite) {
            roleId = invite.roleId ?? null;
            await db.userInvite.update({
              where: { id: invite.id },
              data: { status: "ACCEPTED", acceptedAt: new Date() },
            });
          } else {
            const viewerRole = await db.role.findFirst({ where: { name: "viewer" } });
            roleId = viewerRole?.id ?? null;
          }

          if (roleId) {
            // ── Check for a pre-created invite User record ──────────────────────
            // When an invite is sent, the User row is pre-created with the invitee's
            // email but no clerkId (or a placeholder). After Clerk signup completes,
            // we must link that existing row to the new Clerk user rather than
            // attempting to create a second row (which would violate the email unique constraint).
            const existingByEmail = await db.user.findUnique({
              where: { email: primaryEmail },
            });

            let createdUser: { id: string };

            if (existingByEmail && existingByEmail.clerkId !== userId) {
              // Found pre-created invite row — patch it with the real Clerk user ID
              createdUser = await db.user.update({
                where: { id: existingByEmail.id },
                data: {
                  clerkId: userId,
                  firstName: clerkUser.firstName ?? existingByEmail.firstName,
                  lastName: clerkUser.lastName ?? existingByEmail.lastName,
                  avatarUrl: clerkUser.imageUrl ?? existingByEmail.avatarUrl,
                  status: "ACTIVE",
                  roleId: existingByEmail.roleId ?? roleId,
                  onboardingState: existingByEmail.onboardingState ?? "COMPLETE",
                  updatedAt: new Date(),
                },
              });
              console.log(`[auth-auto-provision] Linked invite User row to Clerk ID for ${primaryEmail}`);
            } else {
              // No pre-created row — create from scratch (normal auto-provision path)
              createdUser = await db.user.upsert({
                where: { clerkId: userId },
                create: {
                  id: crypto.randomUUID(),
                  clerkId: userId,
                  email: primaryEmail,
                  firstName: clerkUser.firstName,
                  lastName: clerkUser.lastName,
                  avatarUrl: clerkUser.imageUrl,
                  roleId,
                  status: "ACTIVE",
                  onboardingState,
                  updatedAt: new Date(),
                },
                update: {
                  status: "ACTIVE",
                  email: primaryEmail,
                  firstName: clerkUser.firstName,
                  lastName: clerkUser.lastName,
                  avatarUrl: clerkUser.imageUrl,
                  updatedAt: new Date(),
                },
              });
              console.log(`[auth-auto-provision] Provisioned invited user ${primaryEmail} with roleId=${roleId}`);
            }

            // Set Clerk publicMetadata so the proxy redirects correctly
            const client = await clerkClient();
            await client.users.updateUserMetadata(userId, {
              publicMetadata: { onboardingState, role: "user" },
            });

            user = await db.user.findUnique({
              where: { id: createdUser.id },
              select: USER_SELECT,
            });
            console.log(`[auth-auto-provision] Provisioned invited user ${primaryEmail} with roleId=${roleId}`);
          }
        }
      }
    } catch (e) {
      console.error("[auth-auto-provision] Failed to auto-provision user:", e);
    }
  }

  if (!user || user.status !== "ACTIVE") return null;

  // Layer 2 Recovery: If user's email matches ROOT_ADMIN_EMAIL, force-inject super_admin role
  const rootAdminEmail = process.env.ROOT_ADMIN_EMAIL;

  if (rootAdminEmail && user.email.toLowerCase() === rootAdminEmail.toLowerCase()) {
    const superAdminRole = await db.role.findFirst({
      where: { name: "super_admin" },
      select: {
        id: true,
        name: true,
        label: true,
        RolePermission: {
          select: {
            Permission: {
              select: { module: true, action: true },
            },
          },
        },
      },
    });

    if (superAdminRole && user.Role.name !== "super_admin") {
      await db.user.update({
        where: { id: user.id },
        data: { roleId: superAdminRole.id }
      });
      console.warn(`[recovery] ROOT_ADMIN_EMAIL match — restored super_admin rights for ${user.email}.`);
      return buildAuthUser(user, superAdminRole);
    }
  }

  return buildAuthUser(user);
}

// ── Require auth — redirects if not authenticated ─────────────

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

// ── Permission check (server-side) ────────────────────────────

export function hasPermission(
  user: AuthUser,
  key: PermissionKey
): boolean {
  // Super admin bypasses all permission checks
  if (user.role.name === "super_admin") return true;
  return user.permissions.includes(key);
}

// ── Role check (server-side) ──────────────────────────────────

export function hasRole(user: AuthUser, ...roleNames: string[]): boolean {
  return roleNames.includes(user.role.name);
}

// ── Require permission — redirects if unauthorized ────────────

export async function requirePermission(key: PermissionKey): Promise<AuthUser> {
  const user = await requireUser();
  if (!hasPermission(user, key)) redirect("/unauthorized");
  return user;
}

// ── Sync Clerk user → DB (call from webhook) ──────────────────

export async function syncClerkUser(
  clerkUserId: string,
  roleId: string,
  employeeId: string
) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No authenticated Clerk user");

  return db.user.upsert({
    where: { clerkId: clerkUserId },
    create: {
      id: crypto.randomUUID(),
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      employeeId,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
      roleId,
      updatedAt: new Date(),
    },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
      updatedAt: new Date(),
    },
  });
}

// ── Write login audit ──────────────────────────────────────────

export async function writeAuditLog(params: {
  userId?: string;
  email: string;
  action: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGOUT" | "ROLE_CHANGED" | "ACCOUNT_DEACTIVATED";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  return db.loginAudit.create({
    data: {
      id: crypto.randomUUID(),
      userId: params.userId,
      email: params.email,
      action: params.action,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      ...(params.metadata !== undefined && { metadata: params.metadata as object }),
    },
  });
}

// ── Re-exports ─────────────────────────────────────────────────
export { buildAbility, emptyAbility } from "./ability";
export type { AppAbility, AppAction, AppSubject } from "./ability";
export { PERMISSIONS, can } from "./permissions";
export type { PermissionKey, PermissionString } from "./permissions";
