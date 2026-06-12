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

  // ── user.created ──────────────────────────────────────────────────────────
  if (type === "user.created") {
    try {
      // If platform is not yet initialized, the Setup Wizard owns super-admin creation.
      // Ignore this webhook event — the setup API handles user + DB record creation.
      const settings = await db.platformSettings.findUnique({
        where: { id: "singleton" },
        select: { initialized: true },
      });
      if (!settings?.initialized) {
        console.log("[clerk-webhook] Platform not yet initialized — setup wizard owns user creation, skipping.");
        return NextResponse.json({ ok: true });
      }

      // Platform IS initialized — require a pending invite for every signup.
      const invite = await db.userInvite.findFirst({
        where: { email: primaryEmail, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });

      if (!invite) {
        console.warn(`[clerk-webhook] No pending invite found for ${primaryEmail} — ignoring signup.`);
        return NextResponse.json({ ok: true });
      }

      const roleId = invite.roleId ?? (await db.role.findFirst({ where: { name: "viewer" } }))?.id ?? null;
      const brandId = invite.brandId;

      if (!roleId) {
        console.error("[clerk-webhook] Role assignment failed — no roleId on invite and no viewer role found.");
        return NextResponse.json({ error: "Role assignment failed" }, { status: 500 });
      }

      // Mark invite as accepted
      await db.userInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });

      // Create user in DB
      const newUser = await db.user.create({
        data: {
          id: crypto.randomUUID(),
          clerkId: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          avatarUrl: data.image_url,
          roleId,
          status: "ACTIVE",
          onboardingState: "PROFILE_SETUP",
          updatedAt: new Date(),
        },
      });

      // If invited to specific brands, grant brand access (supports multiple brands)
      const inviteBrands = await db.userInviteBrand.findMany({
        where: { inviteId: invite.id },
      });

      if (inviteBrands.length > 0) {
        await db.userBrandAccess.createMany({
          data: inviteBrands.map((ib) => ({
            id: crypto.randomUUID(),
            userId: newUser.id,
            brandId: ib.brandId,
          })),
        });
      } else if (brandId) {
        await db.userBrandAccess.create({
          data: { id: crypto.randomUUID(), userId: newUser.id, brandId },
        });
      }

      // Set Clerk publicMetadata for zero-DB-hit proxy routing
      const client = await clerkClient();
      await client.users.updateUserMetadata(data.id, {
        publicMetadata: {
          onboardingState: "PROFILE_SETUP",
          role: "user",
        },
      });

      await writeAuditLog({
        email: primaryEmail,
        action: "LOGIN_SUCCESS",
        metadata: { event: "user.created", clerkId: data.id, onboardingState: "PROFILE_SETUP" },
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
      data: { status: "SUSPENDED", updatedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
