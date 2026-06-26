import { db } from "@/lib/db";
import { NotificationType, NotificationPriority } from "@prisma/client";
import crypto from "crypto";
import {
  sendMomOverdueEmail,
  sendLeadAssignedEmail,
  sendMeetingReminderEmail,
  sendProposalStatusEmail,
  sendQualificationBlockedEmail,
  sendFollowUpOverdueEmail,
} from "./resend";

export interface EmitOptions {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
  recipientEmail?: string;
  // Optional legacy fields mapped to email context
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Core Pulse Engine emitter.
 * Writes an in-app notification to the DB and optionally dispatches an email.
 */
export async function emit(opts: EmitOptions) {
  const {
    userId,
    type,
    priority = NotificationPriority.MEDIUM,
    title,
    message,
    link,
    sendEmail = false,
    recipientEmail,
    entityType,
    entityId,
    metadata,
  } = opts;

  // 1. Persist in-app notification
  const notification = await db.notification.create({
    data: {
      id: crypto.randomUUID(),
      type,
      priority,
      title,
      message,
      link,
      userId,
    },
  });

  // 2. Fire email if requested + recipient email provided
  if (sendEmail && recipientEmail && process.env.RESEND_API_KEY) {
    try {
      await dispatchEmail(type, recipientEmail, {
        title,
        message,
        entityId,
        entityType,
        metadata,
      });
    } catch (err) {
      // Email failure should never block the notification
      console.error("[pulse] email dispatch failed:", err);
    }
  }

  return notification;
}

// ── Email dispatcher (maps type → email function) ───────────────────────────
async function dispatchEmail(
  type: NotificationType,
  to: string,
  ctx: {
    title: string;
    message: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const meta = ctx.metadata ?? {};

  switch (type) {
    case "OVERDUE_ALERT":
      return sendMomOverdueEmail(
        to,
        (meta.leadName as string) ?? ctx.title,
        (meta.meetingId as string) ?? ctx.entityId ?? ""
      );

    case "LEAD_ASSIGNED":
      return sendLeadAssignedEmail(
        to,
        (meta.leadName as string) ?? ctx.title,
        (meta.company as string) ?? "",
        (meta.source as string) ?? "Unknown",
        ctx.entityId ?? ""
      );

    default:
      // No email for other types by default in Phase 0
      break;
  }
}

// ── Batch unread count (used by bell icon) ──────────────────────────────────
export async function getUnreadCount(userId: string): Promise<number> {
  return db.notification.count({
    where: { userId, isRead: false },
  });
}

// ── Mark all as read ─────────────────────────────────────────────────────────
export async function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
