import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { LeadPipelineStage } from "@prisma/client";
import type { LeadTemperature } from "@prisma/client";

// ── Validation ────────────────────────────────
const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
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
  pipelineStage: z.nativeEnum(LeadPipelineStage).optional(),
});

// ── GET /api/leads — List leads with filters ──
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, organizationId: true, role: { select: { name: true } } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage") as LeadPipelineStage | null;
    const temperature = searchParams.get("temperature") as LeadTemperature | null;
    const ownerId = searchParams.get("ownerId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where = {
      organizationId: user.organizationId,
      ...(stage && { pipelineStage: stage }),
      ...(temperature && { temperature }),
      ...(ownerId && { ownerId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { activities: true, followUps: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[leads:GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── POST /api/leads — Create a lead ───────────
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, organizationId: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json() as unknown;
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const lead = await db.lead.create({
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
        pipelineStage: data.pipelineStage ?? "LEAD_GENERATED",
        icpScore: 0,
        organizationId: user.organizationId,
        ownerId: user.id,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        type: "STATUS_CHANGE",
        title: `Lead created: ${data.firstName} ${data.lastName}`,
        organizationId: user.organizationId,
        userId: user.id,
        leadId: lead.id,
        metadata: { stage: "LEAD_GENERATED" },
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error("[leads:POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
