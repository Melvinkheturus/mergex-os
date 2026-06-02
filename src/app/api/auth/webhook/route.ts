import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/auth";
import crypto from "crypto";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    primary_email_address_id: string;
  };
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Verify webhook signature
  const headerPayload = await headers();
  const svixId        = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("[clerk-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address ?? data.email_addresses[0]?.email_address ?? "";

  // ── user.created ──────────────────────────────────────
  if (type === "user.created") {
    try {
      // Find the super_admin role
      const superAdminRole = await db.role.findUnique({ where: { name: "super_admin" } });
      if (!superAdminRole) {
        console.error("[clerk-webhook] super_admin role not found in database.");
        return NextResponse.json({ error: "System role misconfigured" }, { status: 500 });
      }

      const superAdminCount = await db.user.count({
        where: { Role: { name: "super_admin" } },
      });

      let roleId: string | null = null;
      let brandId: string | null = null;
      let onboardingState: "PLATFORM_SETUP" | "PROFILE_SETUP" = "PROFILE_SETUP";

      if (superAdminCount === 0) {
        // First user → super_admin + platform setup onboarding
        roleId = superAdminRole.id;
        onboardingState = "PLATFORM_SETUP";
        console.log(`[clerk-webhook] First user ${primaryEmail} → super_admin + PLATFORM_SETUP`);
      } else {
        // Subsequent signups: require a pending invite
        const invite = await db.userInvite.findFirst({
          where: { email: primaryEmail, status: "PENDING" },
          orderBy: { createdAt: "desc" },
        });

        if (!invite) {
          console.warn(`[clerk-webhook] No pending invite found for ${primaryEmail}`);
          return NextResponse.json({ ok: true });
        }

        roleId = invite.roleId;
        brandId = invite.brandId;

        // If no roleId pre-assigned on invite, assign the default viewer role
        if (!roleId) {
          const viewerRole = await db.role.findFirst({ where: { name: "viewer" } });
          roleId = viewerRole?.id ?? null;
        }

        // Mark invite as accepted
        await db.userInvite.update({
          where: { id: invite.id },
          data: { status: "ACCEPTED", acceptedAt: new Date() },
        });

        onboardingState = "PROFILE_SETUP";
      }

      if (!roleId) {
        console.error("[clerk-webhook] Role assignment failed");
        return NextResponse.json({ error: "Role assignment failed" }, { status: 500 });
      }

      // Create user in DB with onboardingState
      const newUser = await db.user.create({
        data: {
          id: crypto.randomUUID(),
          clerkId: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          avatarUrl: data.image_url,
          roleId,
          isActive: true,
          onboardingState,
          updatedAt: new Date(),
        },
      });

      // If invited to a specific brand, grant brand access via UserBrandAccess
      if (brandId) {
        await db.userBrandAccess.create({
          data: { id: crypto.randomUUID(), userId: newUser.id, brandId },
        });
      }

      // Set Clerk publicMetadata for zero-DB-hit middleware routing
      const client = await clerkClient();
      await client.users.updateUserMetadata(data.id, {
        publicMetadata: {
          onboardingState,
          role: onboardingState === "PLATFORM_SETUP" ? "super_admin" : "user",
        },
      });

      await writeAuditLog({
        email: primaryEmail,
        action: "LOGIN_SUCCESS",
        metadata: { event: "user.created", clerkId: data.id, onboardingState },
      });
    } catch (err) {
      console.error("[clerk-webhook] user.created error", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  // ── user.updated ──────────────────────────────────────
  if (type === "user.updated") {
    await db.user.updateMany({
      where: { clerkId: data.id },
      data: {
        firstName: data.first_name,
        lastName: data.last_name,
        avatarUrl: data.image_url,
        email: primaryEmail,
      },
    });
  }

  if (type === "user.deleted") {
    await db.user.updateMany({
      where: { clerkId: data.id },
      data: { isActive: false },
    });
  }

  return NextResponse.json({ ok: true });
}
