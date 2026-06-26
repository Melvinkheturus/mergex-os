import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Verify lead access helper
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

// GET /api/crm/leads/[id]/activities
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  if (!result.lead || !result.user) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const activities = await db.activity.findMany({
      where: { leadId: id },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            designation: true,
          },
        },
      },
      orderBy: { performedAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/crm/leads/[id]/activities
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
    const { type, content, performedAt } = body;

    if (!type || !content) {
      return NextResponse.json({ error: "type and content are required" }, { status: 400 });
    }

    const activity = await db.activity.create({
      data: {
        leadId: id,
        userId: result.user.id,
        type,
        content,
        performedAt: performedAt ? new Date(performedAt) : new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            designation: true,
          },
        },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
