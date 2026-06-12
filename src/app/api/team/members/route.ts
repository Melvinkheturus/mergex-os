import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/team/members
 * Returns members, filterable by status via ?status=ACTIVE|SUSPENDED|ARCHIVED|all
 * Defaults to all statuses so the UI can show the full lifecycle.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = user.role.name === "super_admin";
  const canManage = isSuperAdmin || user.permissions.includes("users.invite");
  if (!canManage) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const statusFilter =
    statusParam === "all" || !statusParam
      ? undefined
      : statusParam === "ACTIVE" || statusParam === "SUSPENDED" || statusParam === "ARCHIVED"
      ? statusParam
      : undefined;

  const members = await db.user.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      Role: { select: { id: true, name: true, label: true } },
      UserBrandAccess: {
        include: { Brand: { select: { id: true, name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      email: m.email,
      firstName: m.firstName,
      lastName: m.lastName,
      avatarUrl: m.avatarUrl,
      designation: m.designation,
      clerkId: m.clerkId,
      status: m.status,
      suspendedAt: m.suspendedAt,
      archivedAt: m.archivedAt,
      role: { name: m.Role.name, label: m.Role.label, id: m.Role.id },
      brandAccess: m.UserBrandAccess.map((uba) => ({
        id: uba.Brand.id,
        name: uba.Brand.name,
        slug: uba.Brand.slug,
      })),
    }))
  );
}

/**
 * DELETE /api/team/members?id=<userId>[&force=true]
 *
 * Two-phase suspension:
 *  Phase 1 (no ?force): checks owned record counts.
 *    → 409 if user owns records (frontend shows warning modal with counts)
 *    → 200 + suspends immediately if no owned records
 *  Phase 2 (?force=true): suspends regardless of owned records.
 *
 * Uses Clerk banUser (NOT deleteUser) so the account can be restored.
 */
export async function DELETE(request: NextRequest) {
  const { userId: callerClerkId } = await auth();
  if (!callerClerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const caller = await getCurrentUser();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = caller.role.name === "super_admin";
  const canManage = isSuperAdmin || caller.permissions.includes("users.invite");
  if (!canManage) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const targetId = request.nextUrl.searchParams.get("id");
  if (!targetId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const force = request.nextUrl.searchParams.get("force") === "true";
  const checkOnly = request.nextUrl.searchParams.get("checkOnly") === "true";

  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent self-suspension
  if (target.clerkId === callerClerkId) {
    return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 400 });
  }

  // Prevent suspending super admins
  const targetRole = await db.role.findUnique({ where: { id: target.roleId } });
  if (targetRole?.name === "super_admin") {
    return NextResponse.json({ error: "Super Admin accounts cannot be suspended" }, { status: 403 });
  }

  // Prevent suspending already-suspended or archived users
  if (target.status === "SUSPENDED") {
    return NextResponse.json({ error: "User is already suspended" }, { status: 400 });
  }
  if (target.status === "ARCHIVED") {
    return NextResponse.json({ error: "Archived users cannot be suspended. Contact Super Admin." }, { status: 400 });
  }

  // If checkOnly is requested, return counts immediately
  if (checkOnly) {
    const [leadCount, taskCount, clientCount] = await Promise.all([
      db.lead.count({ where: { ownerId: targetId } }),
      db.task.count({ where: { assigneeId: targetId } }),
      db.client.count({ where: { engagementManagerId: targetId } }),
    ]);
    return NextResponse.json({
      hasOwnedRecords: (leadCount + taskCount + clientCount) > 0,
      counts: { leads: leadCount, tasks: taskCount, clients: clientCount },
    });
  }

  // Phase 1 — Ownership check (no ?force)
  if (!force) {
    const [leadCount, taskCount, clientCount] = await Promise.all([
      db.lead.count({ where: { ownerId: targetId } }),
      db.task.count({ where: { assigneeId: targetId } }),
      db.client.count({ where: { engagementManagerId: targetId } }),
    ]);

    const total = leadCount + taskCount + clientCount;
    if (total > 0) {
      return NextResponse.json(
        {
          hasOwnedRecords: true,
          counts: { leads: leadCount, tasks: taskCount, clients: clientCount },
        },
        { status: 409 }
      );
    }
  }

  // Phase 2 — Suspend
  await db.user.update({
    where: { id: targetId },
    data: {
      status: "SUSPENDED",
      suspendedAt: new Date(),
      suspendedBy: caller.id,
      updatedAt: new Date(),
    },
  });

  // Ban on Clerk (prevents login but preserves the account for restoration)
  const isPlaceholderClerkId = target.clerkId.startsWith("pending_");
  if (!isPlaceholderClerkId) {
    try {
      const client = await clerkClient();
      await client.users.banUser(target.clerkId);
    } catch (clerkErr) {
      console.error("[team/members] Failed to ban Clerk user:", clerkErr);
      // Don't fail — DB is already updated
    }
  }

  // Write audit entry
  try {
    await db.loginAudit.create({
      data: {
        id: crypto.randomUUID(),
        userId: targetId,
        email: target.email,
        action: "ACCOUNT_DEACTIVATED",
        metadata: { suspendedBy: caller.id, force },
      },
    });
  } catch {
    // Non-critical — don't fail the request
  }

  return NextResponse.json({ ok: true, email: target.email });
}

/**
 * PATCH /api/team/members?id=<userId>
 * Updates brand access for a member.
 * Body: { brandIds: string[] }
 */
export async function PATCH(request: NextRequest) {
  const caller = await getCurrentUser();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = caller.role.name === "super_admin";
  const canManage = isSuperAdmin || caller.permissions.includes("users.invite");
  if (!canManage) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const targetId = request.nextUrl.searchParams.get("id");
  if (!targetId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const body = await request.json() as { brandIds?: string[] };
  const { brandIds } = body;

  if (!Array.isArray(brandIds)) {
    return NextResponse.json({ error: "brandIds must be an array" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Replace all brand access records
  await db.$transaction([
    db.userBrandAccess.deleteMany({ where: { userId: targetId } }),
    ...brandIds.map((brandId) =>
      db.userBrandAccess.create({
        data: { userId: targetId, brandId },
      })
    ),
  ]);

  return NextResponse.json({ ok: true });
}
