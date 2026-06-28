import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/recovery-code/verify
 * Body: { email: string, code: string }
 *
 * Public endpoint. Verifies the recovery code for a super admin
 * and returns a Clerk password reset link.
 *
 * Rate limiting: Max 5 attempts per IP per 15 minutes (enforced via middleware or Upstash).
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, code } = body as { email?: string; code?: string };

  if (!email || !code) {
    return NextResponse.json({ error: "Email and recovery code are required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedCode = code.trim().toUpperCase();

  // Find the user
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      Role: { select: { name: true } },
      RecoveryCode: {
        where: { usedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // Always return the same error to prevent user enumeration
  const genericError = { error: "Invalid email or recovery code" };

  if (!user || user.Role.name !== "super_admin") {
    return NextResponse.json(genericError, { status: 401 });
  }

  const recoveryCode = user.RecoveryCode[0];
  if (!recoveryCode) {
    return NextResponse.json(genericError, { status: 401 });
  }

  const isValid = await bcrypt.compare(normalizedCode, recoveryCode.codeHash);
  if (!isValid) {
    return NextResponse.json(genericError, { status: 401 });
  }

  // Mark the code as used
  await db.recoveryCode.update({
    where: { id: recoveryCode.id },
    data: { usedAt: new Date() },
  });

  // Clerk does not support server-generated password reset links.
  // Instead, we confirm the recovery code was valid, and the client
  // will initiate the Clerk forgot-password flow (reset_password_email_code strategy).
  // We return the email so the client can pre-fill it.
  return NextResponse.json({
    ok: true,
    email: user.email,
    message: "Recovery code verified. Proceed to reset your password.",
  });
}
