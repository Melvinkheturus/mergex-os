import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

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

// GET /api/crm/leads/[id]/meetings
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
    const meetings = await db.meeting.findMany({
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
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/crm/leads/[id]/meetings
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
    const { title, scheduledAt, duration, mode, meetingUrl, summary, outcome, status } = body;

    if (!title || !scheduledAt || !mode) {
      return NextResponse.json(
        { error: "title, scheduledAt, and mode are required" },
        { status: 400 }
      );
    }

    const meeting = await db.meeting.create({
      data: {
        leadId: id,
        organizerId: result.user.id,
        title,
        scheduledAt: new Date(scheduledAt),
        duration: duration ?? 30,
        mode,
        meetingUrl: meetingUrl || null,
        summary: summary || null,
        outcome: outcome || null,
        status: status || "SCHEDULED",
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

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error("Failed to create meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
