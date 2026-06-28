import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/crm/leads/[id]/convert
// Converts a WON lead into a Client record
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (lead.winLossStatus !== "WON") {
      return NextResponse.json(
        { error: "Lead must be marked as WON before conversion" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { engagementManagerId } = body;

    // Create client record from lead data
    const client = await db.client.create({
      data: {
        brandId: lead.brandId,
        companyName: lead.companyName,
        contactPerson: lead.contactPerson,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        engagementManagerId: engagementManagerId || null,
        onboardingStatus: "PENDING",
        status: "active",
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Failed to convert lead to client:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
