import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const brandSlug = searchParams.get("brandSlug");
  let brandId = searchParams.get("brandId");

  if (brandSlug) {
    const brand = await db.brand.findUnique({
      where: { slug: brandSlug },
      select: { id: true },
    });
    if (brand) {
      brandId = brand.id;
    }
  }

  if (!brandId) {
    brandId = user.activeBrandId;
  }

  if (!brandId) {
    return NextResponse.json({ error: "Active brand workspace is required" }, { status: 400 });
  }

  // Verify access if user is not super_admin or admin
  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    const access = await db.userBrandAccess.findFirst({
      where: { userId: user.id, brandId },
    });
    if (!access) {
      return NextResponse.json({ error: "Forbidden: No access to this workspace" }, { status: 403 });
    }
  }

  try {
    const search = searchParams.get("search") || "";
    const stageId = searchParams.get("stageId");
    const ownerId = searchParams.get("ownerId");
    const sourceId = searchParams.get("sourceId");

    const where: any = { brandId };

    if (stageId && stageId !== "all") {
      where.stageId = stageId;
    }
    if (ownerId && ownerId !== "all") {
      where.ownerId = ownerId;
    }
    if (sourceId && sourceId !== "all") {
      where.sourceId = sourceId;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await db.lead.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        LeadStage: {
          select: {
            id: true,
            name: true,
            label: true,
            color: true,
          },
        },
        LeadSource: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      initialNotes,
      brandId: customBrandId,
      brandSlug: customBrandSlug,
    } = body;

    const { searchParams } = new URL(req.url);
    const queryBrandSlug = searchParams.get("brandSlug");
    const queryBrandId = searchParams.get("brandId");

    let brandId = customBrandId || queryBrandId;

    if (!brandId) {
      const slugToResolve = customBrandSlug || queryBrandSlug;
      if (slugToResolve) {
        const brand = await db.brand.findUnique({
          where: { slug: slugToResolve },
          select: { id: true },
        });
        if (brand) {
          brandId = brand.id;
        }
      }
    }

    if (!brandId) {
      brandId = user.activeBrandId;
    }

    if (!brandId) {
      return NextResponse.json({ error: "Active brand workspace is required" }, { status: 400 });
    }

    // Verify access if user is not super_admin or admin
    const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
    if (!isAdmin) {
      const access = await db.userBrandAccess.findFirst({
        where: { userId: user.id, brandId },
      });
      if (!access) {
        return NextResponse.json({ error: "Forbidden: No access to this workspace" }, { status: 403 });
      }
    }

    if (!companyName || !contactPerson) {
      return NextResponse.json({ error: "Company name and contact person are required" }, { status: 400 });
    }

    // Find default stage if stageId is not provided
    let finalStageId = stageId;
    if (!finalStageId) {
      const defaultStage = await db.leadStage.findFirst({
        where: { brandId, name: "LEAD_INTAKE" },
      });
      finalStageId = defaultStage?.id || null;
    }

    const lead = await db.lead.create({
      data: {
        brandId,
        companyName,
        contactPerson,
        designation: designation || null,
        email: email || null,
        phone: phone || null,
        website: website || null,
        industry: industry || null,
        location: location || null,
        sourceId: sourceId || null,
        stageId: finalStageId,
        ownerId: ownerId || user.id,
        icpScore: typeof icpScore === "number" ? icpScore : 0,
        temperature: temperature || "COLD",
        expectedValue: expectedValue ? parseFloat(expectedValue) : null,
        priority: priority || "MEDIUM",
        services: Array.isArray(services) ? services : [],
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        LeadStage: {
          select: {
            id: true,
            name: true,
            label: true,
            color: true,
          },
        },
        LeadSource: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (initialNotes && typeof initialNotes === "string" && initialNotes.trim()) {
      await db.note.create({
        data: {
          id: crypto.randomUUID(),
          leadId: lead.id,
          brandId,
          content: initialNotes.trim(),
          createdBy: user.id,
          visibility: "TEAM",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
