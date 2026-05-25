import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const MAX_HISTORY = 20; // keep last 20 items per user

// GET /api/search/history — returns last 8 distinct clicked items
export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const items = await db.searchHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return NextResponse.json({ items });
}

// POST /api/search/history — save a clicked result
export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = (await request.json()) as {
    query: string;
    entityType: string;
    entityId?: string;
    title: string;
    href?: string;
  };

  // Deduplicate: remove identical href from history before re-inserting
  if (body.href) {
    await db.searchHistory.deleteMany({
      where: { userId: user.id, href: body.href },
    });
  }

  await db.searchHistory.create({
    data: {
      userId:     user.id,
      query:      body.query ?? "",
      entityType: body.entityType,
      entityId:   body.entityId,
      title:      body.title,
      href:       body.href,
    },
  });

  // Prune: keep only latest MAX_HISTORY rows
  const oldest = await db.searchHistory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: MAX_HISTORY,
    select: { id: true },
  });
  if (oldest.length) {
    await db.searchHistory.deleteMany({ where: { id: { in: oldest.map((o) => o.id) } } });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/search/history — clear all history
export async function DELETE() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.searchHistory.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
