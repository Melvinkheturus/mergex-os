import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sendTeamInviteEmail } from "@/lib/notifications";
import crypto from "crypto";

/**
 * POST /api/team/invite
 *
 * Sends an invitation to a new team member.
 * Body: { email, roleId, brandIds: string[], employeeId?: string }
 *
 * Only users with "users.invite" permission can call this endpoint.
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
  const { email, roleId, brandIds, employeeId: rawEmployeeId } = body as {
    email?: string;
    roleId?: string;
    brandIds?: string[];
    employeeId?: string;
  };

  if (!email || !roleId) {
    return NextResponse.json({ error: "Email and roleId are required" }, { status: 400 });
  }

  // Employee ID is required — manually assigned by the admin
  if (!rawEmployeeId?.trim()) {
    return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
  }

  if (!brandIds || brandIds.length === 0) {
    return NextResponse.json({ error: "At least one brand must be selected" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing active user
  const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser?.status === "ACTIVE") {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  // Check for pending invite
  const existingInvite = await db.userInvite.findFirst({
    where: { email: normalizedEmail, status: "PENDING" },
  });
  if (existingInvite) {
    return NextResponse.json(
      { error: "An invitation is already pending for this email" },
      { status: 409 }
    );
  }

  // Validate role exists
  const role = await db.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Validate brands exist and inviter has access to them
  const brands = await db.brand.findMany({ where: { id: { in: brandIds } } });
  if (brands.length !== brandIds.length) {
    return NextResponse.json({ error: "One or more invalid brands" }, { status: 400 });
  }

  // Validate and normalize employeeId
  const employeeId = rawEmployeeId.trim().toUpperCase();
  const taken = await db.user.findUnique({ where: { employeeId } });
  if (taken) {
    return NextResponse.json(
      { error: `Employee ID ${employeeId} is already taken` },
      { status: 409 }
    );
  }

  // Generate secure invite token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invite] = await db.$transaction([
    db.userInvite.create({
      data: {
        id: crypto.randomBytes(16).toString("hex"),
        email: normalizedEmail,
        roleId,
        token,
        status: "PENDING",
        expiresAt,
        invitedBy: user.id,
        UserInviteBrand: {
          create: brandIds.map((brandId) => ({ id: crypto.randomBytes(16).toString("hex"), brandId })),
        },
      },
    }),
    // Pre-create user record with employeeId so it's available on activation page
    db.user.upsert({
      where: { email: normalizedEmail },
      create: {
        id: crypto.randomBytes(16).toString("hex"),
        clerkId: `pending_${token.slice(0, 16)}`, // Placeholder — replaced on activation
        email: normalizedEmail,
        employeeId,
        roleId,
        status: "SUSPENDED", // Not yet active — activated when invite is accepted
        onboardingState: "PROFILE_SETUP",
        updatedAt: new Date(),
      },
      update: {
        employeeId,
        roleId,
        updatedAt: new Date(),
      },
    }),
  ]);

  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://os.mergex.in"}/invite/${token}`;

  // Send Clerk invite email (handles account creation + password setup)
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://os.mergex.in";
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: normalizedEmail,
      redirectUrl: `${appUrl}/invite/${token}`,
      publicMetadata: {
        inviteToken: token,
        employeeId,
        roleId,
        invitedBy: user.id,
      },
    });
  } catch (clerkErr) {
    console.error("[team/invite] Clerk invitation failed:", clerkErr);
    // Don't fail — the invite record exists, user can use direct link
  }

  // Send Resend invite email (branded, shows employee ID + role + activation link)
  try {
    const inviterName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Your Administrator";
    await sendTeamInviteEmail({
      to: normalizedEmail,
      employeeId,
      roleLabel: role.label ?? role.name,
      brandNames: brands.map((b) => b.name),
      invitedByName: inviterName,
      activationUrl,
    });
  } catch (emailErr) {
    console.error("[team/invite] Resend email failed:", emailErr);
    // Don't fail the invite — activation link still works
  }

  return NextResponse.json({
    ok: true,
    inviteId: invite.id,
    employeeId,
    activationUrl,
    message: `Invitation sent to ${normalizedEmail}`,
  });
}

/**
 * DELETE /api/team/invite?id=<inviteId>
 * Revokes a pending invitation.
 */
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = user.role.name === "super_admin";
  const canInvite = isSuperAdmin || user.permissions.includes("users.invite");
  if (!canInvite) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Invite ID is required" }, { status: 400 });
  }

  const invite = await db.userInvite.findUnique({ where: { id } });
  if (!invite || invite.status !== "PENDING") {
    return NextResponse.json({ error: "Invite not found or already resolved" }, { status: 404 });
  }

  await db.userInvite.update({
    where: { id },
    data: { status: "REVOKED" },
  });

  // Also update the pre-created pending user record if it exists
  try {
    await db.user.updateMany({
      where: { email: invite.email, status: "SUSPENDED" },
      data: { updatedAt: new Date() },
    });
  } catch { /* ignore */ }

  return NextResponse.json({ ok: true });
}

/**
 * GET /api/team/invite
 * Returns pending invites for the current brand context.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brandId = request.nextUrl.searchParams.get("brandId");

  const invites = await db.userInvite.findMany({
    where: {
      status: "PENDING",
      ...(brandId ? {
        UserInviteBrand: { some: { brandId } },
      } : {}),
    },
    include: {
      UserInviteBrand: {
        include: { Brand: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites.map((inv) => ({
    id: inv.id,
    email: inv.email,
    roleId: inv.roleId,
    status: inv.status,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
    brands: inv.UserInviteBrand.map((ib) => ({
      id: ib.brandId,
      name: ib.Brand.name,
      slug: ib.Brand.slug,
    })),
  })));
}
