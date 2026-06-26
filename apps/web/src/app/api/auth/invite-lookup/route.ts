import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/invite-lookup?token=xxx
 *
 * Returns invite details for the /invite/[token] activation page.
 * Public endpoint — no auth required (token is the secret).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token required" }, { status: 400 });
  }

  const invite = await db.userInvite.findUnique({
    where: { token },
    include: {
      UserInviteBrand: {
        include: {
          Brand: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
        },
      },
    },
  });

  if (!invite) {
    return NextResponse.json({ valid: false, error: "Invalid or expired invitation" }, { status: 404 });
  }

  if (invite.status !== "PENDING") {
    return NextResponse.json(
      {
        valid: false,
        error: invite.status === "ACCEPTED"
          ? "This invitation has already been accepted"
          : "This invitation has expired or been revoked",
      },
      { status: 410 }
    );
  }

  if (invite.expiresAt < new Date()) {
    // Mark as expired
    await db.userInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ valid: false, error: "This invitation has expired" }, { status: 410 });
  }

  // Look up the pre-created user for this invite (to get employeeId)
  const preCreatedUser = await db.user.findFirst({
    where: { email: invite.email },
    select: { employeeId: true, roleId: true, Role: { select: { label: true } } },
  });

  const brands = invite.UserInviteBrand.map((ib) => ({
    id: ib.Brand.id,
    name: ib.Brand.name,
    slug: ib.Brand.slug,
    logoUrl: ib.Brand.logoUrl,
  }));

  // Fallback: use the direct brandId if no pivot records exist yet
  if (brands.length === 0 && invite.brandId) {
    const brand = await db.brand.findUnique({
      where: { id: invite.brandId },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });
    if (brand) brands.push(brand);
  }

  return NextResponse.json({
    valid: true,
    email: invite.email,
    employeeId: preCreatedUser?.employeeId ?? null,
    roleLabel: preCreatedUser?.Role?.label ?? "Team Member",
    brands,
    inviteId: invite.id,
    moduleAccess: invite.moduleAccess ?? [],
    permissionAccess: invite.permissionAccess ?? [],
  });
}
