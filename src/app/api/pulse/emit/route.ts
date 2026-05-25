import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { emit } from "@/lib/pulse";
import { NotificationPriority, NotificationType } from "@prisma/client";

// POST /api/pulse/emit
// Internal endpoint to create a notification + optionally send email
// Called from other modules when events occur
export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, email: true, organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json() as {
    targetUserId?: string;
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    link?: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    sendEmail?: boolean;
  };

  // Resolve the target user (defaults to current user if not specified)
  let targetUserId = user.id;
  let recipientEmail = user.email;

  if (body.targetUserId && body.targetUserId !== user.id) {
    const target = await db.user.findUnique({
      where: { id: body.targetUserId },
      select: { id: true, email: true, organizationId: true },
    });
    if (!target || target.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }
    targetUserId = target.id;
    recipientEmail = target.email;
  }

  const notification = await emit({
    userId: targetUserId,
    organizationId: user.organizationId,
    type: body.type,
    priority: body.priority ?? NotificationPriority.MEDIUM,
    title: body.title,
    message: body.message,
    link: body.link,
    entityType: body.entityType,
    entityId: body.entityId,
    metadata: body.metadata,
    sendEmail: body.sendEmail ?? false,
    recipientEmail,
  });

  return NextResponse.json({ notification });
}
