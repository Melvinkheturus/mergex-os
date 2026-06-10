import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const brandSlug = searchParams.get("brandSlug");
  let brandId = searchParams.get("brandId");

  if (brandSlug) {
    const brand = await db.brand.findUnique({ where: { slug: brandSlug }, select: { id: true } });
    if (brand) brandId = brand.id;
  }
  if (!brandId) brandId = user.activeBrandId;
  if (!brandId) return NextResponse.json({ error: "Active brand workspace is required" }, { status: 400 });

  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    const access = await db.userBrandAccess.findFirst({ where: { userId: user.id, brandId } });
    if (!access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Fetch HOT leads (qualified + in conversion funnel) excluding archived/lost
    const leads = await db.lead.findMany({
      where: {
        brandId,
        classification: { in: ["HOT"] },
        winLossStatus: null, // active only
      },
      include: {
        User: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        LeadStage: { select: { id: true, name: true, label: true, color: true } },
        Meeting: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
          select: { id: true, title: true, scheduledAt: true, status: true },
        },
        Proposal: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, title: true, value: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const mapped = leads.map((l) => ({
      ...l,
      owner: l.User || null,
      stage: l.LeadStage || null,
      latestMeeting: l.Meeting[0] || null,
      latestProposal: l.Proposal[0] || null,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("Opportunities fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
