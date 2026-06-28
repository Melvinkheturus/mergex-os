import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT /api/crm/meetings/[meetingId]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, scheduledAt, duration, mode, meetingUrl, summary, outcome, status } = body;

    const updated = await db.meeting.update({
      where: { id: meetingId },
      data: {
        ...(title && { title }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(duration !== undefined && { duration }),
        ...(mode && { mode }),
        ...(meetingUrl !== undefined && { meetingUrl: meetingUrl || null }),
        ...(summary !== undefined && { summary: summary || null }),
        ...(outcome !== undefined && { outcome: outcome || null }),
        ...(status && { status }),
      },
      include: {
        User: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/crm/meetings/[meetingId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await db.meeting.delete({ where: { id: meetingId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
