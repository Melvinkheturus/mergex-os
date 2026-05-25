import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const updateLeadSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  jobTitle: z.string().optional(),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
  sourceTag: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  decisionMaker: z.string().optional(),
  painPoints: z.string().optional(),
  notes: z.string().optional(),
  lostReason: z.string().optional(),
  temperature: z.enum(["HOT","WARM","COLD"]).optional(),
  pipelineStage: z.enum([
    "LEAD_GENERATED","LEAD_ENRICHED","ICP_QUALIFIED","TEMPERATURE_ASSIGNED",
    "WARM_NURTURE","COLD_NURTURE","MEETING_PREPARED","DISCOVERY_COMPLETED",
    "QUALIFICATION_GATE","PROPOSAL_HANDOFF","WON","LOST",
  ]).optional(),
  icpIndustry: z.number().min(0).max(20).optional(),
  icpRevenue: z.number().min(0).max(20).optional(),
  icpUrgency: z.number().min(0).max(20).optional(),
  icpDecisionAccess: z.number().min(0).max(20).optional(),
  icpBudget: z.number().min(0).max(20).optional(),
  qualBudgetConfirmed: z.boolean().optional(),
  qualDecisionMakerFound: z.boolean().optional(),
  qualTimelineConfirmed: z.boolean().optional(),
  qualDiscoveryDone: z.boolean().optional(),
  qualMomSubmitted: z.boolean().optional(),
  qualIcpValidated: z.boolean().optional(),
});

// ── GET /api/leads/[id] ───────────────────────
export async function GET(_: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { organizationId: true } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const lead = await db.lead.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        meetings: {
          orderBy: { scheduledAt: "desc" },
          take: 5,
          include: { mom: true },
        },
        followUps: {
          orderBy: { dueDate: "asc" },
          include: { template: true },
        },
        proposals: { orderBy: { createdAt: "desc" }, take: 3 },
        icpHistory: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(lead);
  } catch (err) {
    console.error("[lead:GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── PATCH /api/leads/[id] ─────────────────────
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true, organizationId: true } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await db.lead.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const body = await req.json() as unknown;
    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Re-compute ICP score if any dimension changed
    const newIcpIndustry      = data.icpIndustry      ?? existing.icpIndustry;
    const newIcpRevenue       = data.icpRevenue        ?? existing.icpRevenue;
    const newIcpUrgency       = data.icpUrgency        ?? existing.icpUrgency;
    const newIcpDecisionAccess = data.icpDecisionAccess ?? existing.icpDecisionAccess;
    const newIcpBudget        = data.icpBudget         ?? existing.icpBudget;

    const hasScoringChange = ["icpIndustry","icpRevenue","icpUrgency","icpDecisionAccess","icpBudget"]
      .some(k => data[k as keyof typeof data] !== undefined);

    const icpScore = newIcpIndustry + newIcpRevenue + newIcpUrgency + newIcpDecisionAccess + newIcpBudget;
    const temperature = icpScore >= 80 ? "HOT" as const : icpScore >= 50 ? "WARM" as const : "COLD" as const;

    const stageChanged = data.pipelineStage && data.pipelineStage !== existing.pipelineStage;

    const updated = await db.lead.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone,
        company: data.company,
        industry: data.industry,
        jobTitle: data.jobTitle,
        linkedIn: data.linkedIn,
        website: data.website,
        sourceTag: data.sourceTag,
        budget: data.budget,
        timeline: data.timeline,
        decisionMaker: data.decisionMaker,
        painPoints: data.painPoints,
        notes: data.notes,
        lostReason: data.lostReason,
        pipelineStage: data.pipelineStage,
        qualBudgetConfirmed: data.qualBudgetConfirmed,
        qualDecisionMakerFound: data.qualDecisionMakerFound,
        qualTimelineConfirmed: data.qualTimelineConfirmed,
        qualDiscoveryDone: data.qualDiscoveryDone,
        qualMomSubmitted: data.qualMomSubmitted,
        qualIcpValidated: data.qualIcpValidated,
        icpIndustry: data.icpIndustry,
        icpRevenue: data.icpRevenue,
        icpUrgency: data.icpUrgency,
        icpDecisionAccess: data.icpDecisionAccess,
        icpBudget: data.icpBudget,
        ...(hasScoringChange && { icpScore, temperature }),
        ...(stageChanged && { stageChangedAt: new Date() }),
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    // Log ICP score history if score changed
    if (hasScoringChange && icpScore !== existing.icpScore) {
      await db.leadScoreHistory.create({
        data: {
          leadId: id,
          score: icpScore,
          industry: newIcpIndustry,
          revenue: newIcpRevenue,
          urgency: newIcpUrgency,
          decision: newIcpDecisionAccess,
          budget: newIcpBudget,
          scoredBy: user.id,
        },
      });
    }

    // Log stage change activity
    if (stageChanged) {
      await db.activity.create({
        data: {
          type: "STAGE_CHANGE",
          title: `Stage: ${existing.pipelineStage} → ${data.pipelineStage}`,
          organizationId: user.organizationId,
          userId: user.id,
          leadId: id,
          metadata: { from: existing.pipelineStage, to: data.pipelineStage },
        },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[lead:PATCH]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── DELETE /api/leads/[id] ────────────────────
export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { organizationId: true, role: { select: { name: true } } },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!["super_admin","admin","manager"].includes(user.role.name)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    await db.lead.delete({ where: { id, organizationId: user.organizationId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead:DELETE]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
