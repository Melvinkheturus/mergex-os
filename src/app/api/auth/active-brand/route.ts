import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/auth/active-brand?clerkId=<clerkId>
 * Returns the active brand slug for a given Clerk user.
 * Called by middleware (Edge Runtime) to resolve post-login redirect destination.
 * This route runs in Node.js runtime so Prisma works correctly.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clerkId = searchParams.get("clerkId");

  if (!clerkId) {
    return NextResponse.json({ brandSlug: null }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { activeBrandId: true },
    });

    if (user?.activeBrandId) {
      const brand = await db.brand.findUnique({
        where: { id: user.activeBrandId },
        select: { slug: true, status: true },
      });

      if (brand?.status === "active") {
        return NextResponse.json({ brandSlug: brand.slug });
      }
    }
  } catch {
    // DB error - return no brand slug
  }

  return NextResponse.json({ brandSlug: null });
}
