import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const brandSlug = searchParams.get("brandSlug");
  let brandId = searchParams.get("brandId");

  if (brandSlug) {
    const brand = await db.brand.findUnique({
      where: { slug: brandSlug },
      select: { id: true },
    });
    if (brand) {
      brandId = brand.id;
    }
  }

  if (!brandId) {
    brandId = user.activeBrandId;
  }

  if (!brandId) {
    return NextResponse.json({ error: "Active brand workspace is required" }, { status: 400 });
  }

  // Verify access if user is not super_admin or admin
  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    const access = await db.userBrandAccess.findFirst({
      where: { userId: user.id, brandId },
    });
    if (!access) {
      return NextResponse.json({ error: "Forbidden: No access to this workspace" }, { status: 403 });
    }
  }

  try {
    const [stages, sources, owners] = await Promise.all([
      db.leadStage.findMany({
        where: { brandId },
        orderBy: { order: "asc" },
      }),
      db.leadSource.findMany({
        where: { brandId },
        orderBy: { name: "asc" },
      }),
      db.user.findMany({
        where: {
          OR: [
            { Role: { name: { in: ["super_admin", "admin"] } } },
            { UserBrandAccess: { some: { brandId } } },
          ],
          status: "ACTIVE",
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          designation: true,
          avatarUrl: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({ stages, sources, owners });
  } catch (error) {
    console.error("Failed to fetch CRM options:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
