import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/user/active-brand
 * Body: { brandId: string }
 *
 * Persists the user's last active brand so they land directly
 * on that brand's workspace on next login (skipping workspace hub).
 */
export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { brandId } = body as { brandId?: string };

  if (!brandId || typeof brandId !== "string") {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }

  // Verify the user actually has access to this brand
  const access = await db.userBrandAccess.findUnique({
    where: {
      userId_brandId: {
        userId: (await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } }))?.id ?? "",
        brandId,
      },
    },
  });

  if (!access) {
    return NextResponse.json({ error: "Brand access denied" }, { status: 403 });
  }

  await db.user.update({
    where: { clerkId: userId },
    data: { activeBrandId: brandId },
  });

  return NextResponse.json({ ok: true });
}
