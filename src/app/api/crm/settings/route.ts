import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Brand slug is required" }, { status: 400 });
  }

  try {
    const brand = await db.brand.findUnique({
      where: { slug },
      select: { crmSettings: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const settings = brand.crmSettings ? JSON.parse(brand.crmSettings) : null;
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to fetch CRM settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Restrict settings changes to super_admin only
  if (user.role.name !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Brand slug is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const settingsStr = JSON.stringify(body);

    await db.brand.update({
      where: { slug },
      data: { crmSettings: settingsStr },
    });

    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    console.error("Failed to save CRM settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
