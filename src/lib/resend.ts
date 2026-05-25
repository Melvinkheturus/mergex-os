import { Resend } from "resend";

// Singleton Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Pulse Engine <pulse@mergex.in>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Shared email layout ──────────────────────────────────────────────────────
function buildEmailHtml({
  title,
  preheader,
  body,
  ctaLabel,
  ctaUrl,
  priorityColor = "#8b5cf6",
}: {
  title: string;
  preheader: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  priorityColor?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f11;font-family:'Inter',sans-serif;">
  <!-- Preheader (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f0f11;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#18181b;border-radius:16px;overflow:hidden;border:1px solid #27272a;">
          <!-- Header bar -->
          <tr>
            <td style="background:${priorityColor};height:4px;"></td>
          </tr>
          <!-- Logo row -->
          <tr>
            <td style="padding:28px 32px 0;">
              <span style="font-size:13px;font-weight:700;letter-spacing:0.15em;color:#a1a1aa;text-transform:uppercase;">MergeX Sales OS · Pulse Engine</span>
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding:16px 32px 0;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#fafafa;line-height:1.3;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:16px 32px 0;font-size:15px;color:#a1a1aa;line-height:1.7;">
              ${body}
            </td>
          </tr>
          <!-- CTA -->
          ${ctaLabel && ctaUrl ? `
          <tr>
            <td style="padding:28px 32px 0;">
              <a href="${ctaUrl}" style="display:inline-block;background:${priorityColor};color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;padding:12px 24px;">
                ${ctaLabel}
              </a>
            </td>
          </tr>` : ""}
          <!-- Footer -->
          <tr>
            <td style="padding:28px 32px 32px;border-top:1px solid #27272a;margin-top:28px;">
              <p style="margin:0;font-size:12px;color:#52525b;">
                This is an automated alert from MergeX Sales OS.<br/>
                <a href="${APP_URL}/dashboard/settings/notifications" style="color:#71717a;text-decoration:underline;">Manage notification preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Email senders ────────────────────────────────────────────────────────────

export async function sendMomOverdueEmail(to: string, leadName: string, meetingId: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ MOM Submission Overdue — ${leadName}`,
    html: buildEmailHtml({
      title: "MOM Submission Overdue",
      preheader: `Your Minutes of Meeting for ${leadName} is overdue.`,
      body: `Your MOM for the <strong style="color:#fafafa;">${leadName}</strong> discovery meeting is overdue.<br/><br/>
             Submit your Minutes of Meeting now to maintain operational accountability and keep the pipeline moving.`,
      ctaLabel: "Submit MOM Now",
      ctaUrl: `${APP_URL}/dashboard/meetings/${meetingId}`,
      priorityColor: "#ef4444",
    }),
  });
}

export async function sendLeadAssignedEmail(
  to: string,
  leadName: string,
  company: string,
  source: string,
  leadId: string
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `🎯 New Lead Assigned — ${leadName} @ ${company}`,
    html: buildEmailHtml({
      title: `Lead Assigned: ${leadName}`,
      preheader: `${leadName} from ${company} has been assigned to you.`,
      body: `A new lead has been assigned to you.<br/><br/>
             <strong style="color:#fafafa;">${leadName}</strong> from <strong style="color:#fafafa;">${company}</strong><br/>
             <span style="color:#71717a;">Source: ${source}</span><br/><br/>
             Review their profile and set your next action to keep the pipeline moving.`,
      ctaLabel: "Open Lead",
      ctaUrl: `${APP_URL}/dashboard/crm/leads/${leadId}`,
      priorityColor: "#8b5cf6",
    }),
  });
}

export async function sendMeetingReminderEmail(
  to: string,
  meetingTitle: string,
  scheduledAt: Date,
  meetingId: string
) {
  const timeStr = scheduledAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `📅 Meeting Reminder — ${meetingTitle}`,
    html: buildEmailHtml({
      title: "Meeting Reminder",
      preheader: `Your meeting "${meetingTitle}" is coming up.`,
      body: `Your scheduled meeting is coming up soon.<br/><br/>
             <strong style="color:#fafafa;">${meetingTitle}</strong><br/>
             <span style="color:#71717a;">Scheduled: ${timeStr}</span><br/><br/>
             Prepare your agenda and review the lead brief before the call.`,
      ctaLabel: "View Meeting Brief",
      ctaUrl: `${APP_URL}/dashboard/meetings/${meetingId}`,
      priorityColor: "#f59e0b",
    }),
  });
}

export async function sendProposalStatusEmail(
  to: string,
  proposalTitle: string,
  status: string,
  proposalId: string
) {
  const statusLabels: Record<string, string> = {
    APPROVED: "✅ Approved",
    REJECTED: "❌ Rejected",
    SENT: "📤 Sent to Client",
    ACCEPTED: "🎉 Accepted by Client",
  };
  const statusLabel = statusLabels[status] ?? status;
  const priorityColor = status === "ACCEPTED" ? "#22c55e" : status === "REJECTED" ? "#ef4444" : "#8b5cf6";

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `📄 Proposal Update — ${proposalTitle}`,
    html: buildEmailHtml({
      title: `Proposal ${statusLabel}`,
      preheader: `Status update for proposal: ${proposalTitle}.`,
      body: `There has been a status update on your proposal.<br/><br/>
             <strong style="color:#fafafa;">${proposalTitle}</strong><br/>
             <span style="color:#71717a;">New Status: ${statusLabel}</span>`,
      ctaLabel: "View Proposal",
      ctaUrl: `${APP_URL}/dashboard/proposals/${proposalId}`,
      priorityColor,
    }),
  });
}

export async function sendQualificationBlockedEmail(
  to: string,
  leadName: string,
  blockReason: string,
  leadId: string
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `🚪 Qualification Blocked — ${leadName}`,
    html: buildEmailHtml({
      title: "Qualification Gate Blocked",
      preheader: `Action required before ${leadName} can advance.`,
      body: `A qualification gate has blocked the pipeline for <strong style="color:#fafafa;">${leadName}</strong>.<br/><br/>
             <strong style="color:#ef4444;">Blocking reason:</strong> ${blockReason}<br/><br/>
             Complete the required action to allow this lead to advance.`,
      ctaLabel: "Complete Requirement",
      ctaUrl: `${APP_URL}/dashboard/crm/leads/${leadId}`,
      priorityColor: "#f97316",
    }),
  });
}

export async function sendFollowUpOverdueEmail(
  to: string,
  leadName: string,
  leadId: string
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⏰ Follow-up Overdue — ${leadName}`,
    html: buildEmailHtml({
      title: "Follow-up Overdue",
      preheader: `A follow-up for ${leadName} is past due.`,
      body: `A scheduled follow-up for <strong style="color:#fafafa;">${leadName}</strong> is now overdue.<br/><br/>
             Complete or reschedule this follow-up to maintain pipeline momentum.`,
      ctaLabel: "View Lead",
      ctaUrl: `${APP_URL}/dashboard/crm/leads/${leadId}`,
      priorityColor: "#f59e0b",
    }),
  });
}
