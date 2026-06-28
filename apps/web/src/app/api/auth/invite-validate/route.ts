import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ valid: false });
  }

  try {
    const invite = await db.userInvite.findUnique({
      where: { token },
      select: {
        email: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!invite) return NextResponse.json({ valid: false });
    if (invite.status !== "PENDING") return NextResponse.json({ valid: false });
    if (invite.email.toLowerCase() !== email.toLowerCase()) return NextResponse.json({ valid: false });
    if (invite.expiresAt < new Date()) {
      // Mark as expired
      await db.userInvite.update({ where: { token }, data: { status: "EXPIRED" } });
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[invite-validate]", err);
    return NextResponse.json({ valid: false });
  }
}
