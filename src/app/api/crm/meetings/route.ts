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
    const filter = searchParams.get("filter") || "all"; // "upcoming" | "past" | "all"

    const now = new Date();
    const dateFilter =
      filter === "upcoming"
        ? { scheduledAt: { gte: now } }
        : filter === "past"
        ? { scheduledAt: { lt: now } }
        : {};

    const meetings = await db.meeting.findMany({
      where: {
        lead: { brandId },
        ...dateFilter,
      },
      include: {
        lead: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          },
        },
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
