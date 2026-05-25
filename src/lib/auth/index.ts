import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import type { PermissionKey, PermissionString } from "./permissions";
import { PERMISSIONS } from "./permissions";

// ── Types ─────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  clerkId: string;
  email: string;
  employeeId: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  organizationId: string;
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

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isActive: true,
      organizationId: true,
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

  if (!user || !user.isActive) return null;

  const permissions = user.role.permissions.map(
    (rp) => `${rp.permission.module}.${rp.permission.action}` as PermissionString
  );

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    employeeId: user.employeeId,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    organizationId: user.organizationId,
    role: {
      id: user.role.id,
      name: user.role.name,
      label: user.role.label,
    },
    permissions,
  };
}

// ── Require auth — redirects if not authenticated ─────────

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

// ── Require permission — redirects if unauthorized ────────

export async function requirePermission(key: PermissionKey): Promise<AuthUser> {
  const user = await requireUser();
  if (!hasPermission(user, key)) redirect("/unauthorized");
  return user;
}

// ── Sync Clerk user → DB (call from webhook) ──────────────

export async function syncClerkUser(
  clerkUserId: string,
  orgId: string,
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
      organizationId: orgId,
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
  action: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "LOGIN_OTP_SENT" | "LOGIN_OTP_FAILED" | "LOGIN_LOCKED" | "LOGOUT" | "PASSWORD_RESET" | "ROLE_CHANGED" | "ACCOUNT_DEACTIVATED";
  method?: "GOOGLE" | "EMAIL_OTP" | "EMPLOYEE_ID";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  return db.loginAudit.create({
    data: {
      userId: params.userId,
      email: params.email,
      action: params.action,
      method: params.method,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      // Cast to JSON-compatible type for Prisma
      ...(params.metadata !== undefined && { metadata: params.metadata as object }),
    },
  });
}
