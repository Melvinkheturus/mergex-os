import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRoleRank } from "@/lib/auth/permissions";

/**
 * POST /api/team/members/delete
 * Permanently deletes a user from both Neon (Postgres) and Clerk.
 * Irreversible. Requires super_admin and the target must already be ARCHIVED.
 *
 * Failure handling: the DB delete and the Clerk delete run inside a single
 * Prisma interactive transaction. Neon is deleted first; Clerk is called as the
 * last step. If Clerk throws, the transaction aborts and Postgres rolls back the
 * delete (and all cascaded child rows) atomically — leaving no orphans.
 *
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  const caller = await getCurrentUser();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete is Super Admin only — it is permanent
  if (caller.role.name !== "super_admin") {
    return NextResponse.json(
      { error: "Only Super Admins can delete users" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { userId?: string };
  const { userId: targetId } = body;

  if (!targetId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent deleting self
  if (target.id === caller.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  // Prevent deleting another super admin
  const targetRole = await db.role.findUnique({ where: { id: target.roleId } });
  if (targetRole?.name === "super_admin") {
    return NextResponse.json({ error: "Super Admin accounts cannot be deleted" }, { status: 403 });
  }

  // Enforce privilege hierarchy rank check
  const callerRank = getRoleRank(caller.role.name);
  const targetRank = getRoleRank(targetRole?.name);
  if (callerRank <= targetRank) {
    return NextResponse.json(
      { error: "You cannot delete a user with equal or higher access level" },
      { status: 403 }
    );
  }

  // Safety: only ARCHIVED users may be permanently deleted
  if (target.status !== "ARCHIVED") {
    return NextResponse.json(
      { error: "User must be archived before they can be permanently deleted" },
      { status: 400 }
    );
  }

  // Snapshot fields needed for the audit trail before the row is removed
  const { email, clerkId } = target;
  const isPlaceholderClerkId = clerkId.startsWith("pending_");

  // Resolve every Clerk account tied to this email. We cannot trust the stored
  // clerkId alone: a placeholder ("pending_") row can still have a real Clerk
  // user behind the same email (e.g. a half-completed invite signup). Leaving it
  // behind makes Clerk report "email address is taken" on re-invite.
  const clerkUserIds = new Set<string>();
  try {
    const client = await clerkClient();
    if (!isPlaceholderClerkId) clerkUserIds.add(clerkId);
    const matches = await client.users.getUserList({ emailAddress: [email] });
    for (const u of matches.data) clerkUserIds.add(u.id);
  } catch (lookupErr) {
    console.error("[team/members/delete] Clerk lookup failed:", lookupErr);
    // Fall back to the stored id so a Clerk outage doesn't block a real delete
    if (!isPlaceholderClerkId) clerkUserIds.add(clerkId);
  }

  // Delete Neon first, then Clerk — both inside one transaction so a Clerk
  // failure rolls back the DB delete and all cascaded child rows.
  // Stale invites are keyed by email (no FK to User) so clean them here too.
  try {
    await db.$transaction(async (tx) => {
      await tx.userInvite.deleteMany({ where: { email } });
      await tx.user.delete({ where: { id: targetId } });

      if (clerkUserIds.size > 0) {
        const client = await clerkClient();
        for (const id of clerkUserIds) {
          await client.users.deleteUser(id);
        }
      }
    });
  } catch (err) {
    console.error("[team/members/delete] Deletion failed, rolled back:", err);
    return NextResponse.json(
      { error: "Deletion failed and was rolled back. No changes were made." },
      { status: 500 }
    );
  }

  // Write a durable audit entry AFTER the commit succeeds. userId is null because
  // the user row no longer exists (FK), but email + metadata preserve the trail.
  try {
    await db.loginAudit.create({
      data: {
        id: crypto.randomUUID(),
        userId: null,
        email,
        action: "ACCOUNT_DELETED",
        metadata: {
          deletedUserId: targetId,
          deletedBy: caller.id,
          deletedByEmail: caller.email,
          clerkId,
          deletedClerkIds: Array.from(clerkUserIds),
        },
      },
    });
  } catch (auditErr) {
    // Non-critical — deletion already committed
    console.error("[team/members/delete] Failed to write audit log:", auditErr);
  }

  return NextResponse.json({ ok: true, email });
}
