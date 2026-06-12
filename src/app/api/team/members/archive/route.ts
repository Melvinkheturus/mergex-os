import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/team/members/archive
 * Permanently archives a user (former employee).
 * Requires super_admin role — archiving is irreversible from the normal UI.
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  const caller = await getCurrentUser();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Archive is Super Admin only — it is permanent
  if (caller.role.name !== "super_admin") {
    return NextResponse.json(
      { error: "Only Super Admins can archive users" },
      { status: 403 }
    );
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

  // Prevent archiving self
  if (target.id === caller.id) {
    return NextResponse.json({ error: "You cannot archive your own account" }, { status: 400 });
  }

  // Prevent archiving another super admin
  const targetRole = await db.role.findUnique({ where: { id: target.roleId } });
  if (targetRole?.name === "super_admin") {
    return NextResponse.json({ error: "Super Admin accounts cannot be archived" }, { status: 403 });
  }

  if (target.status === "ARCHIVED") {
    return NextResponse.json({ error: "User is already archived" }, { status: 400 });
  }

  // Archive in DB
  await db.user.update({
    where: { id: targetId },
    data: {
      status: "ARCHIVED",
      archivedAt: new Date(),
      archivedBy: caller.id,
      // Clear suspension fields if moving directly from SUSPENDED
      suspendedAt: null,
      suspendedBy: null,
      updatedAt: new Date(),
    },
  });

  // Ensure Clerk ban is in place
  const isPlaceholderClerkId = target.clerkId.startsWith("pending_");
  if (!isPlaceholderClerkId) {
    try {
      const client = await clerkClient();
      await client.users.banUser(target.clerkId);
    } catch (clerkErr) {
      console.error("[team/members/archive] Failed to ban Clerk user:", clerkErr);
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
        action: "ACCOUNT_ARCHIVED",
        metadata: { archivedBy: caller.id },
      },
    });
  } catch {
    // Non-critical
  }

  return NextResponse.json({ ok: true, email: target.email });
}
