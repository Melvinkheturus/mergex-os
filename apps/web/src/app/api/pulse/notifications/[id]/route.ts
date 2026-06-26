import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/pulse/notifications/[id]
// PATCH /api/pulse/notifications/[id]  - mark read/unread
// DELETE /api/pulse/notifications/[id] - dismiss
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const notification = await db.notification.findFirst({
    where: { id, userId: user.id },
  });
  if (!notification) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ notification });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json() as { isRead: boolean };

  const notification = await db.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: body.isRead },
  });

  return NextResponse.json({ success: notification.count > 0 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.notification.deleteMany({ where: { id, userId: user.id } });

  return NextResponse.json({ success: true });
}
