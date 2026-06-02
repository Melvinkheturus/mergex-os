import { Resend } from "resend";

// Singleton Resend client — key from env, never hardcoded
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "MergeX OS <noreply@info.mergex.in>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://os.mergex.in";

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
    subject: `⚠️ MOM Submission Overdue - ${leadName}`,
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
    subject: `🎯 New Lead Assigned - ${leadName} @ ${company}`,
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
    subject: `📅 Meeting Reminder - ${meetingTitle}`,
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
    subject: `📄 Proposal Update - ${proposalTitle}`,
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
    subject: `🚪 Qualification Blocked - ${leadName}`,
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
    subject: `⏰ Follow-up Overdue - ${leadName}`,
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

// ── Team Invitation ──────────────────────────────────────────────────────────

/**
 * Sent when Super Admin invites a new team member.
 * Contains their Employee ID, role, and a one-click activation link.
 */
export async function sendTeamInviteEmail({
  to,
  employeeId,
  roleLabel,
  brandNames,
  invitedByName,
  activationUrl,
}: {
  to: string;
  employeeId: string;
  roleLabel: string;
  brandNames: string[];
  invitedByName: string;
  activationUrl: string;
}) {
  const brandsText =
    brandNames.length > 0
      ? brandNames.join(", ")
      : "the platform";

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `You've been invited to MergeX OS`,
    html: buildEmailHtml({
      title: "You're invited to MergeX OS",
      preheader: `${invitedByName} has invited you to join MergeX OS as ${roleLabel}.`,
      body: `
        <strong style="color:#fafafa;">${invitedByName}</strong> has invited you to join the MergeX OS platform.<br/><br/>

        <table cellpadding="0" cellspacing="0" border="0" style="background:#1c1c1f;border-radius:10px;padding:16px 20px;width:100%;margin:12px 0;">
          <tr>
            <td style="color:#a1a1aa;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:4px;">Your Employee ID</td>
          </tr>
          <tr>
            <td style="color:#fafafa;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:0.15em;">${employeeId}</td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:8px 0;">
          <tr>
            <td style="color:#71717a;font-size:13px;padding:3px 0;">Role:</td>
            <td style="color:#fafafa;font-size:13px;font-weight:600;padding:3px 0 3px 12px;">${roleLabel}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:13px;padding:3px 0;">Brand Access:</td>
            <td style="color:#fafafa;font-size:13px;font-weight:600;padding:3px 0 3px 12px;">${brandsText}</td>
          </tr>
        </table>

        <p style="color:#71717a;font-size:13px;margin:16px 0 0;">Click the button below to activate your account and create your password. This link expires in <strong style="color:#a1a1aa;">7 days</strong>.</p>
      `,
      ctaLabel: "Activate Account →",
      ctaUrl: activationUrl,
      priorityColor: "#8b5cf6",
    }),
  });
}

// ── Recovery Code Alert ──────────────────────────────────────────────────────

/**
 * Sent to the Super Admin when new recovery codes are generated.
 * This is a security alert — codes themselves are never sent in email.
 */
export async function sendRecoveryCodeAlertEmail({
  to,
  employeeId,
  regeneratedAt,
}: {
  to: string;
  employeeId: string;
  regeneratedAt: Date;
}) {
  const timeStr = regeneratedAt.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `🔑 Recovery Codes Regenerated — Action Required`,
    html: buildEmailHtml({
      title: "Recovery Codes Regenerated",
      preheader: `New recovery codes were generated for your MergeX OS account (${employeeId}).`,
      body: `
        New recovery codes have been generated for your Super Admin account.<br/><br/>

        <table cellpadding="0" cellspacing="0" border="0" style="background:#1c1c1f;border-radius:10px;padding:16px 20px;width:100%;margin:12px 0;">
          <tr>
            <td style="color:#a1a1aa;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;padding-bottom:4px;">Account</td>
          </tr>
          <tr>
            <td style="color:#fafafa;font-size:16px;font-weight:700;font-family:monospace;">${employeeId}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:12px;padding-top:8px;">Generated at: ${timeStr}</td>
          </tr>
        </table>

        <p style="color:#ef4444;font-size:13px;font-weight:600;">
          ⚠️ Your previous recovery codes are now <strong>permanently invalidated</strong>.
        </p>
        <p style="color:#71717a;font-size:13px;">
          The new codes were displayed once during generation and are not stored in plain text anywhere.
          If you did not initiate this action, your account may be compromised — contact your system administrator immediately.
        </p>
      `,
      ctaLabel: "Review Security Settings",
      ctaUrl: `${APP_URL}/settings/security`,
      priorityColor: "#ef4444",
    }),
  });
}
