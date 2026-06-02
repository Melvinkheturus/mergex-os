import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function verifyAccess(leadId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { error: "Lead not found", status: 404 };

  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    const access = await db.userBrandAccess.findFirst({
      where: { userId: user.id, brandId: lead.brandId },
    });
    if (!access) return { error: "Forbidden", status: 403 };
  }
  return { lead, user };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyAccess(id);
  if (!result.lead || !result.user) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const notes = await db.note.findMany({
    where: { leadId: id, isActive: true },
    include: {
      User: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyAccess(id);
  if (!result.lead || !result.user) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const body = await req.json();
    const { title, content, visibility } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const note = await db.note.create({
      data: {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        leadId: id,
        brandId: result.lead.brandId,
        title: title?.trim() || null,
        content: content.trim(),
        visibility: visibility ?? "TEAM",
        createdBy: result.user.id,
      },
      include: {
        User: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // Bump lead activity
    await db.lead.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Note create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
