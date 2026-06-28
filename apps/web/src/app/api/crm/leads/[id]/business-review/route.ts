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

  const review = await db.businessReview.findUnique({ where: { leadId: id } });
  return NextResponse.json(review ?? null);
}

export async function PUT(
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
    const {
      businessModel,
      targetMarket,
      currentChannels,
      currentChallenges,
      currentStrengths,
      currentWeaknesses,
      painPoints,
      opportunities,
      recommendedServices,
      reviewNotes,
    } = body;

    const review = await db.businessReview.upsert({
      where: { leadId: id },
      create: {
        id: `br-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        leadId: id,
        brandId: result.lead.brandId,
        businessModel: businessModel ?? null,
        targetMarket: targetMarket ?? null,
        currentChannels: currentChannels ?? null,
        currentChallenges: currentChallenges ?? null,
        currentStrengths: currentStrengths ?? null,
        currentWeaknesses: currentWeaknesses ?? null,
        painPoints: painPoints ?? [],
        opportunities: opportunities ?? [],
        recommendedServices: recommendedServices ?? [],
        reviewNotes: reviewNotes ?? null,
        reviewedBy: result.user.id,
      },
      update: {
        businessModel: businessModel ?? null,
        targetMarket: targetMarket ?? null,
        currentChannels: currentChannels ?? null,
        currentChallenges: currentChallenges ?? null,
        currentStrengths: currentStrengths ?? null,
        currentWeaknesses: currentWeaknesses ?? null,
        painPoints: painPoints ?? [],
        opportunities: opportunities ?? [],
        recommendedServices: recommendedServices ?? [],
        reviewNotes: reviewNotes ?? null,
        reviewedBy: result.user.id,
        updatedAt: new Date(),
      },
    });

    // Bump lead's lastActivityAt
    await db.lead.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("BusinessReview upsert error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
