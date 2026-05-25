import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";

  try {
    const body = await req.json() as { employeeId?: string; password?: string };
    const { employeeId, password } = body;

    if (!employeeId || !password) {
      return NextResponse.json({ success: false, error: "Employee ID and password are required." }, { status: 400 });
    }

    // Find user by employee ID
    const user = await db.user.findUnique({
      where: { employeeId },
      select: {
        id: true,
        email: true,
        isActive: true,
        employeeCredential: {
          select: {
            passwordHash: true,
            failedAttempts: true,
            lockedUntil: true,
          },
        },
      },
    });

    // Always take the same time to prevent timing attacks
    if (!user || !user.employeeCredential) {
      await bcrypt.compare(password, "$2a$10$invalidhashpadding000000000000000000000000000000000000");
      return NextResponse.json({ success: false, error: "Invalid employee ID or password." }, { status: 401 });
    }

    // Check if account is deactivated
    if (!user.isActive) {
      await writeAuditLog({ email: user.email, action: "LOGIN_FAILED", method: "EMPLOYEE_ID", ipAddress: ip, userAgent: ua });
      return NextResponse.json({ success: false, error: "Your account has been deactivated. Contact your admin." }, { status: 403 });
    }

    const creds = user.employeeCredential;

    // Check lockout
    if (creds.lockedUntil && creds.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((creds.lockedUntil.getTime() - Date.now()) / 60000);
      await writeAuditLog({ userId: user.id, email: user.email, action: "LOGIN_LOCKED", method: "EMPLOYEE_ID", ipAddress: ip, userAgent: ua });
      return NextResponse.json(
        { success: false, error: `Account is locked. Try again in ${minutesLeft} minute(s).` },
        { status: 429 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, creds.passwordHash);

    if (!isValid) {
      const newFailedAttempts = creds.failedAttempts + 1;
      const shouldLock = newFailedAttempts >= 5;

      await db.employeeCredential.update({
        where: { userId: user.id },
        data: {
          failedAttempts: newFailedAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null, // lock 15 min
        },
      });

      await writeAuditLog({
        userId: user.id,
        email: user.email,
        action: shouldLock ? "LOGIN_LOCKED" : "LOGIN_FAILED",
        method: "EMPLOYEE_ID",
        ipAddress: ip,
        userAgent: ua,
        metadata: { failedAttempts: newFailedAttempts },
      });

      const msg = shouldLock
        ? "Too many failed attempts. Account locked for 15 minutes."
        : `Invalid employee ID or password. ${5 - newFailedAttempts} attempt(s) remaining.`;

      return NextResponse.json({ success: false, error: msg }, { status: 401 });
    }

    // Success — reset failed attempts
    await db.employeeCredential.update({
      where: { userId: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    await writeAuditLog({
      userId: user.id,
      email: user.email,
      action: "LOGIN_OTP_SENT",
      method: "EMPLOYEE_ID",
      ipAddress: ip,
      userAgent: ua,
    });

    // Return the email so the client can start Clerk OTP flow
    return NextResponse.json({ success: true, email: user.email });
  } catch (err) {
    console.error("[employee-verify]", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
