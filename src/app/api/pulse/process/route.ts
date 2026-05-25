import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { emit } from "@/lib/pulse";
import { NotificationPriority } from "@prisma/client";
import { subDays, subHours } from "date-fns";

// GET /api/pulse/process
// Cron-compatible endpoint — scans the DB for overdue events and emits notifications.
// Call this via: Vercel Cron, an external cron job, or manually.
export async function GET(request: Request) {
  // Allow both internal (Vercel cron secret) and authenticated calls
  const cronSecret = request.headers.get("x-cron-secret");
  const isAuthorizedCron = cronSecret === process.env.CRON_SECRET;

  if (!isAuthorizedCron) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = {
    momOverdue: 0,
    followUpOverdue: 0,
    meetingReminders: 0,
    staleLeads: 0,
    errors: [] as string[],
  };

  // ── 1. MOM Overdue: Meetings completed 2+ hours ago without a MOM ─────────
  try {
    const twoHoursAgo = subHours(new Date(), 2);
    const completedWithoutMom = await db.meeting.findMany({
      where: {
        status: "COMPLETED",
        completedAt: { lte: twoHoursAgo },
        mom: null,
      },
      include: {
        host: { select: { id: true, email: true, organizationId: true } },
        lead: { select: { firstName: true, lastName: true, company: true } },
      },
    });

    for (const meeting of completedWithoutMom) {
      const leadName = meeting.lead
        ? `${meeting.lead.firstName} ${meeting.lead.lastName}`
        : meeting.title;

      // Check we haven't already sent this notification recently (last 2h)
      const recentNotif = await db.notification.findFirst({
        where: {
          userId: meeting.host.id,
          entityId: meeting.id,
          type: "MOM_OVERDUE",
          createdAt: { gte: subHours(new Date(), 2) },
        },
      });

      if (!recentNotif) {
        await emit({
          userId: meeting.host.id,
          organizationId: meeting.host.organizationId,
          type: "MOM_OVERDUE",
          priority: NotificationPriority.CRITICAL,
          title: `MOM overdue — ${leadName}`,
          message: `Your Minutes of Meeting for the ${meeting.title} call is overdue by 2+ hours.`,
          link: `/dashboard/meetings/${meeting.id}`,
          entityType: "Meeting",
          entityId: meeting.id,
          metadata: {
            meetingId: meeting.id,
            leadName,
            meetingTitle: meeting.title,
          },
          sendEmail: true,
          recipientEmail: meeting.host.email,
        });
        results.momOverdue++;
      }
    }
  } catch (e) {
    results.errors.push(`momOverdue: ${String(e)}`);
  }

  // ── 2. Follow-up Overdue: FollowUps past dueDate and still PENDING ────────
  try {
    const now = new Date();
    const overdueFollowUps = await db.followUp.findMany({
      where: {
        status: "PENDING",
        dueDate: { lte: now },
      },
      include: {
        owner: { select: { id: true, email: true, organizationId: true } },
        lead: { select: { firstName: true, lastName: true, company: true, id: true } },
      },
      take: 50,
    });

    for (const fu of overdueFollowUps) {
      const leadName = `${fu.lead.firstName} ${fu.lead.lastName}`;

      const recentNotif = await db.notification.findFirst({
        where: {
          userId: fu.owner.id,
          entityId: fu.id,
          type: "FOLLOW_UP_DUE",
          createdAt: { gte: subHours(new Date(), 24) },
        },
      });

      if (!recentNotif) {
        await emit({
          userId: fu.owner.id,
          organizationId: fu.owner.organizationId,
          type: "FOLLOW_UP_DUE",
          priority: NotificationPriority.HIGH,
          title: `Follow-up overdue — ${leadName}`,
          message: `Your ${fu.channel.toLowerCase()} follow-up for ${leadName} is overdue.`,
          link: `/dashboard/crm/leads/${fu.lead.id}`,
          entityType: "FollowUp",
          entityId: fu.id,
          metadata: { leadName, company: fu.lead.company, channel: fu.channel },
          sendEmail: true,
          recipientEmail: fu.owner.email,
        });
        results.followUpOverdue++;
      }

      // Mark follow-up as OVERDUE in DB
      await db.followUp.update({
        where: { id: fu.id },
        data: { status: "OVERDUE" },
      });
    }
  } catch (e) {
    results.errors.push(`followUpOverdue: ${String(e)}`);
  }

  // ── 3. Meeting Reminders: Meetings scheduled in the next 24h / 1h ─────────
  try {
    const oneHour = new Date(Date.now() + 60 * 60 * 1000);
    const twoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const upcomingMeetings = await db.meeting.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gte: new Date(), lte: twoHours },
      },
      include: {
        host: { select: { id: true, email: true, organizationId: true } },
        lead: { select: { firstName: true, lastName: true, company: true } },
      },
    });

    for (const m of upcomingMeetings) {
      const leadName = m.lead
        ? `${m.lead.firstName} ${m.lead.lastName}`
        : m.title;
      const isOneHourOut = m.scheduledAt <= twoHours && m.scheduledAt >= oneHour;

      const recentNotif = await db.notification.findFirst({
        where: {
          userId: m.host.id,
          entityId: m.id,
          type: "MEETING_REMINDER",
          createdAt: { gte: subHours(new Date(), 2) },
        },
      });

      if (!recentNotif) {
        const minutesOut = Math.round((m.scheduledAt.getTime() - Date.now()) / 60000);
        await emit({
          userId: m.host.id,
          organizationId: m.host.organizationId,
          type: "MEETING_REMINDER",
          priority: isOneHourOut ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
          title: `Meeting in ${minutesOut} min — ${leadName}`,
          message: `Your ${m.type.toLowerCase().replace("_", " ")} with ${leadName} starts soon.`,
          link: `/dashboard/meetings/${m.id}`,
          entityType: "Meeting",
          entityId: m.id,
          metadata: {
            meetingTitle: m.title,
            scheduledAt: m.scheduledAt.toISOString(),
            leadName,
          },
          sendEmail: false,
        });
        results.meetingReminders++;
      }
    }
  } catch (e) {
    results.errors.push(`meetingReminders: ${String(e)}`);
  }

  // ── 4. Stale Leads: No activity in 14+ days → reclassify WARM → COLD ─────
  try {
    const fourteenDaysAgo = subDays(new Date(), 14);
    const staleLeads = await db.lead.findMany({
      where: {
        temperature: "WARM",
        updatedAt: { lte: fourteenDaysAgo },
        pipelineStage: {
          notIn: ["WON", "LOST"],
        },
      },
      include: {
        owner: { select: { id: true, email: true, organizationId: true } },
      },
      take: 30,
    });

    for (const lead of staleLeads) {
      // Reclassify
      await db.lead.update({ where: { id: lead.id }, data: { temperature: "COLD" } });

      const recentNotif = await db.notification.findFirst({
        where: {
          userId: lead.owner.id,
          entityId: lead.id,
          type: "LEAD_INACTIVITY",
          createdAt: { gte: subDays(new Date(), 7) },
        },
      });

      if (!recentNotif) {
        await emit({
          userId: lead.owner.id,
          organizationId: lead.owner.organizationId,
          type: "LEAD_INACTIVITY",
          priority: NotificationPriority.MEDIUM,
          title: `Lead gone cold — ${lead.firstName} ${lead.lastName}`,
          message: `${lead.firstName} ${lead.lastName} from ${lead.company ?? "—"} has been inactive for 14+ days and reclassified as Cold.`,
          link: `/dashboard/crm/leads/${lead.id}`,
          entityType: "Lead",
          entityId: lead.id,
          metadata: { company: lead.company },
        });
        results.staleLeads++;
      }
    }
  } catch (e) {
    results.errors.push(`staleLeads: ${String(e)}`);
  }

  return NextResponse.json({
    processed: results,
    processedAt: new Date().toISOString(),
  });
}
