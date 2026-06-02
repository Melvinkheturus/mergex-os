import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ── Input validation ─────────────────────────────────────────────────────────

const setupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  employeeId: z
    .string()
    .min(2, "Employee ID is required")
    .regex(/^[A-Z0-9-]+$/, "Employee ID must be uppercase letters, numbers, or hyphens"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().optional(),
});

// ── Recovery code generator ──────────────────────────────────────────────────

function generateRecoveryCode(): string {
  const segment = () =>
    crypto.randomBytes(2).toString("hex").toUpperCase();
  return `MX-${segment()}-${segment()}-${segment()}`;
}

// ── POST /api/setup ──────────────────────────────────────────────────────────

/**
 * One-time platform initialization endpoint.
 * Creates the Super Admin, generates recovery codes, and marks the platform initialized.
 * Returns 404 if platform is already initialized (hides endpoint existence).
 */
export async function POST(req: Request) {
  // ── 1. Guard — return 404 if already initialized ──────────────────────────
  const settings = await db.platformSettings.findUnique({
    where: { id: "singleton" },
    select: { initialized: true },
  });
  if (settings?.initialized) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ── 2. Parse + validate body ──────────────────────────────────────────────
  let body: z.infer<typeof setupSchema>;
  try {
    body = setupSchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, lastName, employeeId, email, password } = body;

  // ── 3. Validate employee ID uniqueness ────────────────────────────────────
  const existingById = await db.user.findUnique({ where: { employeeId } });
  if (existingById) {
    return NextResponse.json(
      { error: "Employee ID already in use" },
      { status: 400 }
    );
  }

  // ── 4. Seed base roles (idempotent — safe to call even if roles exist) ────
  const superAdminRoleId = crypto.randomUUID();
  const adminRoleId = crypto.randomUUID();

  await db.role.upsert({
    where: { name: "super_admin" },
    create: { id: superAdminRoleId, name: "super_admin", label: "Super Admin", isSystem: true },
    update: {},
  });
  await db.role.upsert({
    where: { name: "admin" },
    create: { id: adminRoleId, name: "admin", label: "Admin", isSystem: true },
    update: {},
  });

  const superAdminRole = await db.role.findUniqueOrThrow({
    where: { name: "super_admin" },
    select: { id: true },
  });

  // ── 5. Create Clerk user via Admin API ────────────────────────────────────
  const client = await clerkClient();
  let clerkUser: Awaited<ReturnType<typeof client.users.createUser>>;
  try {
    clerkUser = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName,
      skipPasswordChecks: false,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to create Clerk user";
    console.error("[setup] Clerk user creation failed:", err);
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  // ── 6. Create DB user ─────────────────────────────────────────────────────
  let newUser: { id: string };
  try {
    newUser = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        clerkId: clerkUser.id,
        email,
        firstName,
        lastName,
        employeeId,
        roleId: superAdminRole.id,
        isActive: true,
        onboardingState: "PLATFORM_SETUP",
        updatedAt: new Date(),
      },
      select: { id: true },
    });
  } catch (err) {
    // Rollback Clerk user on DB failure
    try {
      await client.users.deleteUser(clerkUser.id);
    } catch {
      console.error("[setup] Failed to rollback Clerk user after DB error");
    }
    console.error("[setup] DB user creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create user record. Clerk account has been rolled back." },
      { status: 500 }
    );
  }

  // ── 7. Set Clerk publicMetadata for zero-DB-hit proxy routing ─────────────
  await client.users.updateUserMetadata(clerkUser.id, {
    publicMetadata: {
      onboardingState: "PLATFORM_SETUP",
      role: "super_admin",
    },
  });

  // ── 8. Generate 5 recovery codes ──────────────────────────────────────────
  const plainCodes = Array.from({ length: 5 }, generateRecoveryCode);
  await db.recoveryCode.createMany({
    data: plainCodes.map((code) => ({
      id: crypto.randomUUID(),
      userId: newUser.id,
      codeHash: bcrypt.hashSync(code, 12),
    })),
  });

  // ── 9. Mark platform initialized ──────────────────────────────────────────
  await db.platformSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      initialized: true,
      initializedAt: new Date(),
      initialAdminId: newUser.id,
    },
    update: {
      initialized: true,
      initializedAt: new Date(),
      initialAdminId: newUser.id,
    },
  });

  console.log(`[setup] Platform initialized. Super admin: ${email} (${employeeId})`);

  // ── 10. Return — plain codes shown once, never stored again ───────────────
  return NextResponse.json({
    success: true,
    employeeId,
    recoveryCodes: plainCodes,
  });
}
