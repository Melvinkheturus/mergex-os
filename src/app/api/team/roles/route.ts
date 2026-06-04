import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/team/roles
 * Returns all roles available for invitation.
 * Super admin role is excluded from selection (cannot be assigned via invite).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roles = await db.role.findMany({
    where: { name: { not: "super_admin" } },
    orderBy: { label: "asc" },
    select: { id: true, name: true, label: true, description: true },
  });

  return NextResponse.json(roles);
}
