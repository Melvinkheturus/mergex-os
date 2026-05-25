import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/auth";

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
      // Check for a pending invite
      const invite = await db.userInvite.findFirst({
        where: { email: primaryEmail, status: "PENDING" },
        orderBy: { createdAt: "desc" },
      });

      if (!invite) {
        // No invite — user signed up without an invite (shouldn't happen with invite-only)
        console.warn(`[clerk-webhook] No invite found for ${primaryEmail}`);
        return NextResponse.json({ ok: true });
      }

      // Find the default viewer role if no role pre-assigned
      let roleId: string | null = invite.roleId ?? null;
      if (!roleId) {
        const viewerRole = await db.role.findFirst({ where: { name: "viewer" } });
        roleId = viewerRole?.id ?? null;
      }

      if (!roleId) {
        console.error("[clerk-webhook] No default role found");
        return NextResponse.json({ error: "No role configured" }, { status: 500 });
      }

      // Create user in DB
      if (!invite.organizationId) {
        console.error("[clerk-webhook] Invite has no organizationId");
        return NextResponse.json({ error: "Invite missing organization" }, { status: 500 });
      }

      await db.user.create({
        data: {
          clerkId: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          avatarUrl: data.image_url,
          organizationId: invite.organizationId,
          roleId,
          isActive: true,
        },
      });

      // Mark invite as accepted
      await db.userInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });

      await writeAuditLog({
        email: primaryEmail,
        action: "LOGIN_SUCCESS",
        method: "EMAIL_OTP",
        metadata: { event: "user.created", clerkId: data.id },
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

  // ── user.deleted ──────────────────────────────────────
  if (type === "user.deleted") {
    await db.user.updateMany({
      where: { clerkId: data.id },
      data: { isActive: false },
    });
  }

  return NextResponse.json({ ok: true });
}
