import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// ─── Access guard ─────────────────────────────────────────────────────────────
async function verifyLeadAccess(leadId: string) {
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

// ─── GET /api/crm/leads/[id]/tasks ───────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  if (!result.lead) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const tasks = await db.task.findMany({
      where: { leadId: id },
      include: {
        Assignee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ─── POST /api/crm/leads/[id]/tasks ──────────────────────────────────────────
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  if (!result.lead || !result.user) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const body = await req.json();
    const { name, priority, dueDate, assigneeId } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        leadId: id,
        name: name.trim(),
        priority: priority ?? "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
      },
      include: {
        Assignee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // Log activity for timeline
    await db.activity.create({
      data: {
        leadId: id,
        userId: result.user.id,
        type: "TASK",
        content: `Task created: ${task.name}`,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
