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

// GET /api/crm/leads/[id]/proposals
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
    const proposals = await db.proposal.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Failed to fetch proposals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/crm/leads/[id]/proposals
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
    const { proposalNumber, title, value, status, sentAt, notes } = body;

    if (!proposalNumber || !title || value === undefined) {
      return NextResponse.json(
        { error: "proposalNumber, title, and value are required" },
        { status: 400 }
      );
    }

    const proposal = await db.proposal.create({
      data: {
        leadId: id,
        proposalNumber,
        title,
        value: parseFloat(value),
        status: status || "DRAFT",
        sentAt: sentAt ? new Date(sentAt) : null,
        notes: notes || null,
      },
    });

    // Log Proposal created activity
    await db.activity.create({
      data: {
        leadId: id,
        userId: result.user.id,
        type: "PROPOSAL",
        content: `Proposal created: ${proposal.proposalNumber} - ${proposal.title} (Value: ₹${Number(proposal.value).toLocaleString("en-IN")})`,
      },
    });

    // Update parent lead's lastActivityAt
    await db.lead.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Failed to create proposal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
