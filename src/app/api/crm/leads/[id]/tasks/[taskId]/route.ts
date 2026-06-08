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

// ─── PATCH /api/crm/leads/[id]/tasks/[taskId] ────────────────────────────────
// Used for toggling complete, updating name/priority/dueDate/assignee
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params;
  const result = await verifyLeadAccess(id);
  if (!result.lead || !result.user) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const body = await req.json();
    const { isComplete, name, priority, dueDate, assigneeId } = body;

    const existing = await db.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.leadId !== id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updated = await db.task.update({
      where: { id: taskId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(isComplete !== undefined && {
          isComplete,
          completedAt: isComplete ? new Date() : null,
        }),
        updatedAt: new Date(),
      },
      include: {
        Assignee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // Log task completed event to timeline
    if (isComplete === true && !existing.isComplete) {
      await db.activity.create({
        data: {
          leadId: id,
          userId: result.user.id,
          type: "TASK",
          content: `Task completed: ${updated.name}`,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ─── DELETE /api/crm/leads/[id]/tasks/[taskId] ───────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params;
  const result = await verifyLeadAccess(id);
  if (!result.lead) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const existing = await db.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.leadId !== id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await db.task.delete({ where: { id: taskId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
