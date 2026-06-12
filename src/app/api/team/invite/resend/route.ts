import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendTeamInviteEmail } from "@/lib/notifications";
import crypto from "crypto";

/**
 * POST /api/team/invite/resend
 *
 * Resends a pending invitation.
 * Body: { inviteId: string }
 */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Permission check
  const isSuperAdmin = user.role.name === "super_admin";
  const canInvite = isSuperAdmin || user.permissions.includes("users.invite");
  if (!canInvite) {
    return NextResponse.json({ error: "Insufficient permissions to invite users" }, { status: 403 });
  }

  const body = await request.json();
  const { inviteId } = body as { inviteId?: string };

  if (!inviteId) {
    return NextResponse.json({ error: "Invite ID is required" }, { status: 400 });
  }

  const invite = await db.userInvite.findUnique({
    where: { id: inviteId },
    include: {
      UserInviteBrand: {
        include: { Brand: { select: { name: true } } },
      },
    },
  });

  if (!invite || invite.status !== "PENDING") {
    return NextResponse.json({ error: "Invite not found or not pending" }, { status: 404 });
  }

  const userRecord = await db.user.findUnique({
    where: { email: invite.email },
  });

  if (!userRecord) {
    return NextResponse.json({ error: "Associated user profile not found" }, { status: 404 });
  }

  // Generate a new secure invite token and extend expiration
  const newToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.$transaction([
    db.userInvite.update({
      where: { id: inviteId },
      data: {
        token: newToken,
        expiresAt,
      },
    }),
    db.user.update({
      where: { id: userRecord.id },
      data: {
        clerkId: `pending_${newToken.slice(0, 16)}`,
        updatedAt: new Date(),
      },
    }),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://os.mergex.in";
  const activationUrl = `${appUrl}/invite/${newToken}`;

  // 1. Revoke existing Clerk invite if it exists to avoid duplicate invitation error
  try {
    const client = await clerkClient();
    const invitationsResponse = await client.invitations.getInvitationList({ status: "pending" });
    const matching = invitationsResponse.data.filter((inv) => inv.emailAddress === invite.email);
    for (const inv of matching) {
      await client.invitations.revokeInvitation(inv.id);
    }
  } catch (err) {
    console.error("[team/invite/resend] Failed to revoke old Clerk invitation:", err);
  }

  // 2. Create new Clerk invitation
  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: invite.email,
      redirectUrl: `${appUrl}/invite/${newToken}`,
      publicMetadata: {
        inviteToken: newToken,
        employeeId: userRecord.employeeId ?? "",
        roleId: invite.roleId ?? "",
        invitedBy: user.id,
      },
    });
  } catch (clerkErr) {
    console.error("[team/invite/resend] Clerk invitation failed:", clerkErr);
  }

  // 3. Send Resend invite email
  try {
    const role = invite.roleId ? await db.role.findUnique({ where: { id: invite.roleId } }) : null;
    const inviterName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Your Administrator";
    
    await sendTeamInviteEmail({
      to: invite.email,
      employeeId: userRecord.employeeId ?? "",
      roleLabel: role?.label ?? role?.name ?? "Member",
      brandNames: invite.UserInviteBrand.map((ib) => ib.Brand.name),
      invitedByName: inviterName,
      activationUrl,
    });
  } catch (emailErr) {
    console.error("[team/invite/resend] Resend email failed:", emailErr);
  }

  return NextResponse.json({
    ok: true,
    activationUrl,
    message: `Invitation resent to ${invite.email}`,
  });
}
