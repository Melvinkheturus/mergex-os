import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { PermissionKey, PermissionString } from "./permissions";
import { PERMISSIONS } from "./permissions";

// ── Types ─────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  activeBrandId: string | null;
  role: {
    id: string;
    name: string;
    label: string;
  };
  permissions: PermissionString[];
};

// ── Get current user from DB with role + permissions ──────

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isActive: true,
      activeBrandId: true,
      roleId: true,
      role: {
        select: {
          id: true,
          name: true,
          label: true,
          permissions: {
            select: {
              permission: {
                select: { module: true, action: true },
              },
            },
          },
        },
      },
    },
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
          const userCount = await db.user.count();
          let roleId: string | null = null;
          let brandId: string | null = null;
          let onboardingState: "PLATFORM_SETUP" | "PROFILE_SETUP" | "COMPLETE" = "PROFILE_SETUP";

          if (userCount === 0) {
            const superAdminRole = await db.role.findFirst({ where: { name: "super_admin" } });
            roleId = superAdminRole?.id ?? null;
            onboardingState = "PLATFORM_SETUP";
          } else {
            const invite = await db.userInvite.findFirst({
              where: { email: primaryEmail, status: "PENDING" },
              orderBy: { createdAt: "desc" },
            });

            if (invite) {
              roleId = invite.roleId;
              brandId = invite.brandId;
              onboardingState = "PROFILE_SETUP";

              await db.userInvite.update({
                where: { id: invite.id },
                data: { status: "ACCEPTED", acceptedAt: new Date() },
              });
            } else {
              const viewerRole = await db.role.findFirst({ where: { name: "viewer" } });
              roleId = viewerRole?.id ?? null;
            }
          }

          if (roleId) {
            const createdUser = await db.user.upsert({
              where: { clerkId: userId },
              create: {
                clerkId: userId,
                email: primaryEmail,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                avatarUrl: clerkUser.imageUrl,
                roleId,
                isActive: true,
                onboardingState,
              },
              update: {
                isActive: true,
                email: primaryEmail,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                avatarUrl: clerkUser.imageUrl,
              }
            });

            // Set Clerk publicMetadata so the middleware redirects correctly
            const client = await clerkClient();
            await client.users.updateUserMetadata(userId, {
              publicMetadata: {
                onboardingState,
                role: onboardingState === "PLATFORM_SETUP" ? "super_admin" : "user",
              },
            });

            user = await db.user.findUnique({
              where: { id: createdUser.id },
              select: {
                id: true,
                clerkId: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                isActive: true,
                activeBrandId: true,
                roleId: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                    label: true,
                    permissions: {
                      select: {
                        permission: {
                          select: { module: true, action: true },
                        },
                      },
                    },
                  },
                },
              },
            });
            console.log(`[auth-auto-provision] Provisioned user ${primaryEmail} with roleId=${roleId}`);
          }
        }
      }
    } catch (e) {
      console.error("[auth-auto-provision] Failed to auto-provision user:", e);
    }
  }

  if (!user || !user.isActive) return null;

  // Layer 2 Recovery: If user's email matches ROOT_ADMIN_EMAIL, dynamically force-inject super_admin role/rights
  const rootAdminEmail = process.env.ROOT_ADMIN_EMAIL;
  let activeRole = user.role;

  if (rootAdminEmail && user.email.toLowerCase() === rootAdminEmail.toLowerCase()) {
    const superAdminRole = await db.role.findFirst({
      where: { name: "super_admin" },
      select: {
        id: true,
        name: true,
        label: true,
        permissions: {
          select: {
            permission: {
              select: { module: true, action: true },
            },
          },
        },
      },
    });

    if (superAdminRole && user.role.name !== "super_admin") {
      // Auto-correct DB record to super_admin
      await db.user.update({
        where: { id: user.id },
        data: { roleId: superAdminRole.id }
      });
      activeRole = superAdminRole;
      console.warn(`[recovery] Emergency ROOT_ADMIN_EMAIL match detected. Automatically restored super_admin rights for ${user.email}.`);
    }
  }

  const permissions = activeRole.permissions.map(
    (rp) => `${rp.permission.module}.${rp.permission.action}` as PermissionString
  );

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    activeBrandId: user.activeBrandId,
    role: {
      id: activeRole.id,
      name: activeRole.name,
      label: activeRole.label,
    },
    permissions,
  };
}

// ── Require auth - redirects if not authenticated ─────────

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

// ── Permission check (server-side) ────────────────────────

export function hasPermission(
  user: AuthUser,
  key: PermissionKey
): boolean {
  const p = PERMISSIONS[key];
  const target = `${p.module}.${p.action}` as PermissionString;
  return user.permissions.includes(target);
}

// ── Role check (server-side) ──────────────────────────────

export function hasRole(user: AuthUser, ...roleNames: string[]): boolean {
  return roleNames.includes(user.role.name);
}

// ── Require permission - redirects if unauthorized ────────

export async function requirePermission(key: PermissionKey): Promise<AuthUser> {
  const user = await requireUser();
  if (!hasPermission(user, key)) redirect("/unauthorized");
  return user;
}

// ── Sync Clerk user → DB (call from webhook) ──────────────

export async function syncClerkUser(
  clerkUserId: string,
  brandId: string | null,
  roleId: string
) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No authenticated Clerk user");

  return db.user.upsert({
    where: { clerkId: clerkUserId },
    create: {
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
      roleId,
    },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
    },
  });
}

// ── Write login audit ──────────────────────────────────────

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
      userId: params.userId,
      email: params.email,
      action: params.action,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      // Cast to JSON-compatible type for Prisma
      ...(params.metadata !== undefined && { metadata: params.metadata as object }),
    },
  });
}
