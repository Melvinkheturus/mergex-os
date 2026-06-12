import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/team/members/restore
 * Restores a SUSPENDED user back to ACTIVE.
 * Only works on SUSPENDED users — ARCHIVED users require Super Admin action.
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  const caller = await getCurrentUser();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = caller.role.name === "super_admin";
  const canManage = isSuperAdmin || caller.permissions.includes("users.manage");
  if (!canManage) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await request.json() as { userId?: string };
  const { userId: targetId } = body;

  if (!targetId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.status === "ACTIVE") {
    return NextResponse.json({ error: "User is already active" }, { status: 400 });
  }

  if (target.status === "ARCHIVED") {
    return NextResponse.json(
      { error: "Archived users cannot be restored from here. Contact Super Admin." },
      { status: 403 }
    );
  }

  // Restore in DB
  await db.user.update({
    where: { id: targetId },
    data: {
      status: "ACTIVE",
      suspendedAt: null,
      suspendedBy: null,
      updatedAt: new Date(),
    },
  });

  // Unban on Clerk
  const isPlaceholderClerkId = target.clerkId.startsWith("pending_");
  if (!isPlaceholderClerkId) {
    try {
      const client = await clerkClient();
      await client.users.unbanUser(target.clerkId);
    } catch (clerkErr) {
      console.error("[team/members/restore] Failed to unban Clerk user:", clerkErr);
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
        action: "ACCOUNT_RESTORED",
        metadata: { restoredBy: caller.id },
      },
    });
  } catch {
    // Non-critical
  }

  return NextResponse.json({ ok: true, email: target.email });
}
