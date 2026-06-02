import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { seedBrandDefaults } from "@/lib/crm/seed-defaults";
import crypto from "crypto";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brands = await db.brand.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, color, description, logoUrl } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const existing = await db.brand.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A brand workspace with this name already exists." },
        { status: 400 }
      );
    }

    const brand = await db.brand.create({
      data: {
        id: crypto.randomUUID(),
        name,
        slug,
        color: color ?? "violet",
        description: description ?? null,
        logoUrl: typeof logoUrl === "string" ? logoUrl : null,
        updatedAt: new Date(),
      },
    });

    // Auto-seed default CRM stages & sources
    await seedBrandDefaults(brand.id);

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Failed to create brand:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete brand:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
