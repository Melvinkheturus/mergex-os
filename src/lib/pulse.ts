import { db } from "@/lib/db";
import { NotificationType, NotificationPriority } from "@prisma/client";
import {
  sendMomOverdueEmail,
  sendLeadAssignedEmail,
  sendMeetingReminderEmail,
  sendProposalStatusEmail,
  sendQualificationBlockedEmail,
  sendFollowUpOverdueEmail,
} from "@/lib/resend";

export interface EmitOptions {
  userId: string;
  organizationId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  sendEmail?: boolean;
  recipientEmail?: string;
}

/**
 * Core Pulse Engine emitter.
 * Writes an in-app notification to the DB and optionally dispatches an email.
 */
export async function emit(opts: EmitOptions) {
  const {
    userId,
    organizationId,
    type,
    priority = NotificationPriority.MEDIUM,
    title,
    message,
    link,
    entityType,
    entityId,
    metadata,
    sendEmail = false,
    recipientEmail,
  } = opts;

  // 1. Persist in-app notification
  const notification = await db.notification.create({
    data: {
      type,
      priority,
      title,
      message,
      link,
      entityType,
      entityId,
      metadata: metadata ? (metadata as import("@prisma/client").Prisma.InputJsonValue) : undefined,
      organizationId,
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
    case "MOM_OVERDUE":
    case "MOM_ESCALATION":
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

    case "MEETING_REMINDER":
      return sendMeetingReminderEmail(
        to,
        (meta.meetingTitle as string) ?? ctx.title,
        new Date((meta.scheduledAt as string) ?? Date.now()),
        ctx.entityId ?? ""
      );

    case "PROPOSAL_STATUS":
      return sendProposalStatusEmail(
        to,
        (meta.proposalTitle as string) ?? ctx.title,
        (meta.status as string) ?? "",
        ctx.entityId ?? ""
      );

    case "QUALIFICATION_BLOCKED":
      return sendQualificationBlockedEmail(
        to,
        (meta.leadName as string) ?? ctx.title,
        (meta.blockReason as string) ?? ctx.message,
        ctx.entityId ?? ""
      );

    case "FOLLOW_UP_DUE":
      return sendFollowUpOverdueEmail(
        to,
        (meta.leadName as string) ?? ctx.title,
        ctx.entityId ?? ""
      );

    default:
      // No email for this type
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
