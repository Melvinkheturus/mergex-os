import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { markAllRead } from "@/lib/pulse";
import { NotificationPriority, NotificationType } from "@prisma/client";

// GET /api/pulse/notifications
// Query: ?unreadOnly=true&priority=CRITICAL&type=MOM_OVERDUE&limit=20&page=1
export async function GET(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";
  const priority = url.searchParams.get("priority") as NotificationPriority | null;
  const type = url.searchParams.get("type") as NotificationType | null;
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30"), 100);
  const page = Math.max(parseInt(url.searchParams.get("page") ?? "1"), 1);
  const skip = (page - 1) * limit;

  const where = {
    userId: user.id,
    ...(unreadOnly && { isRead: false }),
    ...(priority && { priority }),
    ...(type && { type }),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    db.notification.count({ where }),
    db.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
}

// PATCH /api/pulse/notifications
// Body: { action: "markAllRead" }
export async function PATCH(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();

  if (body.action === "markAllRead") {
    await markAllRead(user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
