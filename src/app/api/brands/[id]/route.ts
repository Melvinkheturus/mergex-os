import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ── GET /api/brands/[id] ────────────────────────────────────────────────────
export async function GET(_req: Request, context: RouteContext) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const brand = await db.brand.findUnique({ where: { id } });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (error) {
    console.error("[brand-get] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── PATCH /api/brands/[id] ──────────────────────────────────────────────────
export async function PATCH(req: Request, context: RouteContext) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller is admin or super_admin
  const dbUser = await db.user.findUnique({
    where: { clerkId },
    include: { Role: true },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const canEdit =
    dbUser.Role.name === "super_admin" || dbUser.Role.name === "admin";
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const { name, description, logoUrl, color } = body as {
      name?: string;
      description?: string | null;
      logoUrl?: string | null;
      color?: string;
    };

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    // Check brand exists
    const existing = await db.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Build a new slug only if name changed
    const newSlug =
      name && name.trim() !== existing.name
        ? name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : existing.slug;

    const updated = await db.brand.update({
      where: { id },
      data: {
        ...(name     !== undefined && { name: name.trim(), slug: newSlug }),
        ...(description !== undefined && { description: description ?? null }),
        ...(logoUrl  !== undefined && { logoUrl: logoUrl ?? null }),
        ...(color    !== undefined && { color }),
      },
    });

    return NextResponse.json({ ok: true, brand: updated });
  } catch (error) {
    console.error("[brand-patch] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE /api/brands/[id] ─────────────────────────────────────────────────
export async function DELETE(_req: Request, context: RouteContext) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await db.user.findUnique({
    where: { clerkId },
    include: { Role: true },
  });
  if (!dbUser || dbUser.Role.name !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    await db.brand.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[brand-delete] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
