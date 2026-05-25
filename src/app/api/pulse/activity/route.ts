import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ActivityType } from "@prisma/client";

const TYPE_LABELS: Partial<Record<ActivityType, string>> = {
  NOTE: "Added a note",
  CALL: "Logged a call",
  EMAIL: "Sent an email",
  MEETING: "Held a meeting",
  TASK: "Completed a task",
  STAGE_CHANGE: "Changed pipeline stage",
  DEAL_WON: "Won a deal",
  DEAL_LOST: "Lost a deal",
  FOLLOW_UP: "Completed a follow-up",
  SCORE_CHANGED: "Updated ICP score",
};

// GET /api/pulse/activity?limit=30&page=1
export async function GET(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30"), 100);
  const page = Math.max(parseInt(url.searchParams.get("page") ?? "1"), 1);
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    db.activity.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        lead: { select: { firstName: true, lastName: true, company: true } },
      },
    }),
    db.activity.count({ where: { organizationId: user.organizationId } }),
  ]);

  // Enrich with human-readable labels
  const enriched = activities.map((a) => ({
    ...a,
    typeLabel: TYPE_LABELS[a.type] ?? a.type.replace(/_/g, " ").toLowerCase(),
  }));

  return NextResponse.json({
    activities: enriched,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}
