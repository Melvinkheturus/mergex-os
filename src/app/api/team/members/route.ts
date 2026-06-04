import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/team/members
 * Returns all active members with their brand access.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = user.role.name === "super_admin";
  const canManage = isSuperAdmin || user.permissions.includes("users.invite");
  if (!canManage) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const members = await db.user.findMany({
    where: { isActive: true },
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
 * DELETE /api/team/members?id=<userId>
 * Suspends a member: deactivates in DB, deletes from Clerk.
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

  // 1. Mark as inactive in DB
  await db.user.update({
    where: { id: targetId },
    data: { isActive: false, updatedAt: new Date() },
  });

  // 2. Delete from Clerk (this prevents future logins)
  const isPlaceholderClerkId = target.clerkId.startsWith("pending_");
  if (!isPlaceholderClerkId) {
    try {
      const client = await clerkClient();
      await client.users.deleteUser(target.clerkId);
    } catch (clerkErr) {
      console.error("[team/members] Failed to delete Clerk user:", clerkErr);
      // Don't fail — DB is already updated
    }
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
