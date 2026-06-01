import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function verifyLeadAccess(leadId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      owner: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
      stage: {
        select: { id: true, name: true, label: true, color: true },
      },
      source: {
        select: { id: true, name: true },
      },
    },
  });

  if (!lead) return { error: "Lead not found", status: 404 };

  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    const access = await db.userBrandAccess.findFirst({
      where: { userId: user.id, brandId: lead.brandId },
    });
    if (!access) {
      return { error: "Forbidden: No access to this workspace", status: 403 };
    }
  }

  return { lead, user };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  const { lead, user } = result;
  if (!lead || !user) {
    return NextResponse.json({ error: result.error || "Not Found" }, { status: result.status || 404 });
  }
  return NextResponse.json(lead);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  const { lead, user } = result;
  if (!lead || !user) {
    return NextResponse.json({ error: result.error || "Not Found" }, { status: result.status || 404 });
  }

  try {
    const body = await req.json();
    const {
      companyName,
      contactPerson,
      designation,
      email,
      phone,
      website,
      industry,
      location,
      sourceId,
      stageId,
      ownerId,
      icpScore,
      temperature,
      expectedValue,
      priority,
      services,
      leadCategory,
      nextAction,
      nextActionDate,
      lastContactAt,
      nextFollowUpAt,
      // Legacy inline Business Review fields
      currentSituation,
      painPoints,
      opportunityNotes,
      // BANT (kept on Lead)
      bantBudget,
      bantAuthority,
      bantNeed,
      bantTimeline,
      // Win/Loss
      winLossStatus,
      winLossReason,
      winLossNotes,
      // Relationship Intelligence
      decisionMaker,
      influencer,
      champion,
      financeContact,
    } = body;

    // Calculate BANT score if any slider changes
    let finalBantScore: number | undefined = undefined;
    if (
      bantBudget !== undefined ||
      bantAuthority !== undefined ||
      bantNeed !== undefined ||
      bantTimeline !== undefined
    ) {
      const b = bantBudget !== undefined ? bantBudget : lead.bantBudget;
      const a = bantAuthority !== undefined ? bantAuthority : lead.bantAuthority;
      const n = bantNeed !== undefined ? bantNeed : lead.bantNeed;
      const t = bantTimeline !== undefined ? bantTimeline : lead.bantTimeline;
      finalBantScore = Math.round((b + a + n + t) / 4);
    }

    // Detect auditable changes
    const auditEntries: { action: string; oldValue: string | null; newValue: string | null }[] = [];
    if (stageId !== undefined && stageId !== lead.stageId) {
      auditEntries.push({
        action: "STAGE_CHANGED",
        oldValue: lead.stage?.label ?? lead.stageId ?? null,
        newValue: stageId ?? null,
      });
    }
    if (ownerId !== undefined && ownerId !== lead.ownerId) {
      auditEntries.push({
        action: "OWNER_CHANGED",
        oldValue: lead.ownerId ?? null,
        newValue: ownerId ?? null,
      });
    }
    if (winLossStatus !== undefined && winLossStatus !== lead.winLossStatus) {
      auditEntries.push({
        action: "STATUS_CHANGED",
        oldValue: lead.winLossStatus ?? null,
        newValue: winLossStatus ?? null,
      });
    }

    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        companyName: companyName !== undefined ? companyName : lead.companyName,
        contactPerson: contactPerson !== undefined ? contactPerson : lead.contactPerson,
        designation: designation !== undefined ? (designation || null) : lead.designation,
        email: email !== undefined ? (email || null) : lead.email,
        phone: phone !== undefined ? (phone || null) : lead.phone,
        website: website !== undefined ? (website || null) : lead.website,
        industry: industry !== undefined ? (industry || null) : lead.industry,
        location: location !== undefined ? (location || null) : lead.location,
        sourceId: sourceId !== undefined ? (sourceId || null) : lead.sourceId,
        stageId: stageId !== undefined ? (stageId || null) : lead.stageId,
        ownerId: ownerId !== undefined ? (ownerId || null) : lead.ownerId,
        icpScore: icpScore !== undefined ? icpScore : lead.icpScore,
        temperature: temperature !== undefined ? temperature : lead.temperature,
        expectedValue:
          expectedValue !== undefined
            ? expectedValue
              ? parseFloat(expectedValue)
              : null
            : lead.expectedValue,
        priority: priority !== undefined ? priority : lead.priority,
        services: services !== undefined ? services : lead.services,
        leadCategory: leadCategory !== undefined ? (leadCategory || null) : lead.leadCategory,
        nextAction: nextAction !== undefined ? (nextAction || null) : lead.nextAction,
        nextActionDate:
          nextActionDate !== undefined
            ? nextActionDate
              ? new Date(nextActionDate)
              : null
            : lead.nextActionDate,
        lastContactAt:
          lastContactAt !== undefined
            ? lastContactAt
              ? new Date(lastContactAt)
              : null
            : lead.lastContactAt,
        nextFollowUpAt:
          nextFollowUpAt !== undefined
            ? nextFollowUpAt
              ? new Date(nextFollowUpAt)
              : null
            : lead.nextFollowUpAt,
        // Legacy inline
        currentSituation: currentSituation !== undefined ? currentSituation : lead.currentSituation,
        painPoints: painPoints !== undefined ? painPoints : lead.painPoints,
        opportunityNotes: opportunityNotes !== undefined ? opportunityNotes : lead.opportunityNotes,
        // BANT
        bantBudget: bantBudget !== undefined ? bantBudget : lead.bantBudget,
        bantAuthority: bantAuthority !== undefined ? bantAuthority : lead.bantAuthority,
        bantNeed: bantNeed !== undefined ? bantNeed : lead.bantNeed,
        bantTimeline: bantTimeline !== undefined ? bantTimeline : lead.bantTimeline,
        bantScore: finalBantScore !== undefined ? finalBantScore : lead.bantScore,
        // Win/Loss
        winLossStatus: winLossStatus !== undefined ? winLossStatus : lead.winLossStatus,
        winLossReason: winLossReason !== undefined ? winLossReason : lead.winLossReason,
        winLossNotes: winLossNotes !== undefined ? winLossNotes : lead.winLossNotes,
        // Relationship Intelligence
        decisionMaker: decisionMaker !== undefined ? (decisionMaker || null) : lead.decisionMaker,
        influencer: influencer !== undefined ? (influencer || null) : lead.influencer,
        champion: champion !== undefined ? (champion || null) : lead.champion,
        financeContact: financeContact !== undefined ? (financeContact || null) : lead.financeContact,
        // Always bump lastActivityAt
        lastActivityAt: new Date(),
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        stage: {
          select: { id: true, name: true, label: true, color: true },
        },
        source: {
          select: { id: true, name: true },
        },
      },
    });

    // Write audit log entries for tracked changes
    if (auditEntries.length > 0) {
      const now = new Date();
      await db.auditLog.createMany({
        data: auditEntries.map((entry) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          leadId: id,
          brandId: lead.brandId,
          action: entry.action,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          changedBy: user.id,
          changedAt: now,
        })),
      });
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  const { lead, user } = result;
  if (!lead || !user) {
    return NextResponse.json({ error: result.error || "Not Found" }, { status: result.status || 404 });
  }

  try {
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
