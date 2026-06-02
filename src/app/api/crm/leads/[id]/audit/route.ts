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

  const logs = await db.auditLog.findMany({
    where: { leadId: id },
    include: {
      User: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
    orderBy: { changedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}

// POST: manually write an audit log entry (e.g. from meeting/proposal creation)
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
    const { action, oldValue, newValue } = body;

    const VALID_ACTIONS = [
      "STAGE_CHANGED",
      "OWNER_CHANGED",
      "PROPOSAL_CREATED",
      "MEETING_SCHEDULED",
      "STATUS_CHANGED",
    ];

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    const log = await db.auditLog.create({
      data: {
        id: `al-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        leadId: id,
        brandId: result.lead.brandId,
        action,
        oldValue: oldValue ?? null,
        newValue: newValue ?? null,
        changedBy: result.user.id,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("AuditLog create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
