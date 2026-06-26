import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT /api/crm/proposals/[proposalId]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, value, status, sentAt, notes } = body;

    const updated = await db.proposal.update({
      where: { id: proposalId },
      data: {
        ...(title && { title }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(status && { status }),
        ...(sentAt !== undefined && { sentAt: sentAt ? new Date(sentAt) : null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update proposal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/crm/proposals/[proposalId]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await db.proposal.delete({ where: { id: proposalId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete proposal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
