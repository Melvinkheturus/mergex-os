import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/team/members/audit?id=<userId>
 * Retrieves all login/access audit records for a specific user.
 */
export async function GET(request: NextRequest) {
  const caller = await getCurrentUser();
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isSuperAdmin = caller.role.name === "super_admin";
  const canManage = isSuperAdmin || caller.permissions.includes("users.invite");
  if (!canManage) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const targetId = request.nextUrl.searchParams.get("id");
  if (!targetId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const audits = await db.loginAudit.findMany({
    where: { userId: targetId },
    orderBy: { createdAt: "desc" },
    take: 50, // limit to recent 50 history entries
  });

  return NextResponse.json(audits);
}
