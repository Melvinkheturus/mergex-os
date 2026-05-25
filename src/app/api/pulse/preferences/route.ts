import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/pulse/preferences
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Find or create default preferences
  const prefs = await db.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      organizationId: user.organizationId,
    },
    update: {},
  });

  return NextResponse.json({ preferences: prefs });
}

// PUT /api/pulse/preferences
export async function PUT(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();

  const updated = await db.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      organizationId: user.organizationId,
      ...body,
    },
    update: body,
  });

  return NextResponse.json({ preferences: updated });
}
