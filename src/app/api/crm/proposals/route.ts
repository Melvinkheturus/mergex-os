import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId") || user.activeBrandId;

  if (!brandId) {
    return NextResponse.json(
      { error: "Active brand workspace is required" },
      { status: 400 }
    );
  }

  // Verify access
  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    const access = await db.userBrandAccess.findFirst({
      where: { userId: user.id, brandId },
    });
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const statusFilter = searchParams.get("status"); // DRAFT | SENT | NEGOTIATION | APPROVED | REJECTED

    const proposals = await db.proposal.findMany({
      where: {
        Lead: { brandId },
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        Lead: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Failed to fetch proposals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
