import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// ── Types ────────────────────────────────────────────────────────────────────
export interface SearchResult {
  id: string;
  entityType: string;
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
}

export interface SearchGroup {
  type: string;
  label: string;
  results: SearchResult[];
}

// ── Static navigation items ──────────────────────────────────────────────────
const NAV_ITEMS: SearchResult[] = [
  { id: "nav-dashboard",    entityType: "nav", title: "Dashboard",             href: "/dashboard" },
  { id: "nav-pipeline",     entityType: "nav", title: "Pipeline",              subtitle: "Lead kanban board",      href: "/dashboard/pipeline" },
  { id: "nav-leads",        entityType: "nav", title: "All Leads",             subtitle: "CRM lead list",          href: "/dashboard/crm/leads" },
  { id: "nav-contacts",     entityType: "nav", title: "Contacts",              subtitle: "CRM contacts",           href: "/dashboard/crm/contacts" },
  { id: "nav-companies",    entityType: "nav", title: "Companies",             subtitle: "CRM companies",          href: "/dashboard/crm/companies" },
  { id: "nav-meetings",     entityType: "nav", title: "Meetings",              subtitle: "Meeting manager",        href: "/dashboard/meetings" },
  { id: "nav-proposals",    entityType: "nav", title: "Proposals",             subtitle: "Proposal handoff",       href: "/dashboard/proposals" },
  { id: "nav-tasks",        entityType: "nav", title: "Tasks",                 subtitle: "Operations tasks",       href: "/dashboard/operations/tasks" },
  { id: "nav-pulse",        entityType: "nav", title: "Pulse Engine",          subtitle: "Notifications & alerts", href: "/dashboard/pulse" },
  { id: "nav-intelligence", entityType: "nav", title: "Pipeline Intelligence", subtitle: "AI insights",            href: "/dashboard/insights/pipeline-intelligence" },
  { id: "nav-settings",     entityType: "nav", title: "Settings",              href: "/dashboard/settings" },
];

// ── Quick actions ────────────────────────────────────────────────────────────
const ACTION_ITEMS: SearchResult[] = [
  { id: "action-new-lead",     entityType: "action", title: "Create New Lead",     subtitle: "Add a lead to the pipeline",    href: "/dashboard/pipeline/new" },
  { id: "action-new-meeting",  entityType: "action", title: "Schedule Meeting",    subtitle: "Book a discovery or follow-up", href: "/dashboard/meetings/new" },
  { id: "action-new-proposal", entityType: "action", title: "Create Proposal",     subtitle: "Start a proposal handoff",      href: "/dashboard/proposals/new" },
  { id: "action-pulse",        entityType: "action", title: "Open Pulse Inbox",    subtitle: "View all notifications",        href: "/dashboard/pulse/inbox" },
  { id: "action-settings",     entityType: "action", title: "Notification Settings", subtitle: "Configure Pulse preferences", href: "/dashboard/settings/notifications" },
];

// ── GET /api/search?q=query&limit=5 ─────────────────────────────────────────
export async function GET(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, organizationId: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const perEntity = Math.min(parseInt(url.searchParams.get("limit") ?? "5"), 10);

  // ── Empty query: return nav + actions only ───────────────────────────────
  if (!q) {
    return NextResponse.json({
      query: "",
      groups: [
        { type: "action", label: "Quick Actions", results: ACTION_ITEMS },
        { type: "nav",    label: "Navigation",    results: NAV_ITEMS },
      ] satisfies SearchGroup[],
    });
  }

  const orgId = user.organizationId;
  const contains = q;
  const mode = "insensitive" as const;

  // ── Run all entity searches in parallel ──────────────────────────────────
  const [leads, contacts, companies, meetings, proposals, tasks, users] =
    await Promise.all([
      // Leads
      db.lead.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { firstName: { contains, mode } },
            { lastName:  { contains, mode } },
            { company:   { contains, mode } },
            { email:     { contains, mode } },
            { industry:  { contains, mode } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, company: true, pipelineStage: true, temperature: true },
        take: perEntity,
      }),

      // Contacts
      db.contact.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { firstName: { contains, mode } },
            { lastName:  { contains, mode } },
            { email:     { contains, mode } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true },
        take: perEntity,
      }),

      // Companies
      db.company.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name:     { contains, mode } },
            { domain:   { contains, mode } },
            { industry: { contains, mode } },
          ],
        },
        select: { id: true, name: true, domain: true, industry: true },
        take: perEntity,
      }),

      // Meetings
      db.meeting.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title: { contains, mode } },
            { lead: { company: { contains, mode } } },
            { lead: { firstName: { contains, mode } } },
          ],
        },
        select: { id: true, title: true, type: true, status: true, scheduledAt: true, lead: { select: { company: true } } },
        take: perEntity,
      }),

      // Proposals
      db.proposal.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title:  { contains, mode } },
            { lead:   { company: { contains, mode } } },
            { lead:   { firstName: { contains, mode } } },
          ],
        },
        select: { id: true, title: true, status: true, value: true, currency: true, lead: { select: { company: true } } },
        take: perEntity,
      }),

      // Tasks
      db.task.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title:       { contains, mode } },
            { description: { contains, mode } },
          ],
        },
        select: { id: true, title: true, status: true, priority: true },
        take: perEntity,
      }),

      // Team members
      db.user.findMany({
        where: {
          organizationId: orgId,
          isActive: true,
          OR: [
            { firstName: { contains, mode } },
            { lastName:  { contains, mode } },
            { email:     { contains, mode } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, email: true, role: { select: { label: true } } },
        take: perEntity,
      }),
    ]);

  // ── Filter static items ──────────────────────────────────────────────────
  const lq = q.toLowerCase();
  const navResults = NAV_ITEMS.filter(
    (n) =>
      n.title.toLowerCase().includes(lq) ||
      (n.subtitle?.toLowerCase().includes(lq) ?? false)
  );
  const actionResults = ACTION_ITEMS.filter(
    (a) =>
      a.title.toLowerCase().includes(lq) ||
      (a.subtitle?.toLowerCase().includes(lq) ?? false)
  );

  // ── Map to SearchResult ──────────────────────────────────────────────────
  const groups: SearchGroup[] = [];

  if (leads.length) {
    groups.push({
      type: "lead",
      label: "Leads",
      results: leads.map((l) => ({
        id:         l.id,
        entityType: "lead",
        title:      `${l.firstName} ${l.lastName}`,
        subtitle:   l.company ?? undefined,
        meta:       l.temperature ?? l.pipelineStage.replace(/_/g, " "),
        href:       `/dashboard/pipeline`,
      })),
    });
  }

  if (contacts.length) {
    groups.push({
      type: "contact",
      label: "Contacts",
      results: contacts.map((c) => ({
        id:         c.id,
        entityType: "contact",
        title:      `${c.firstName} ${c.lastName}`,
        subtitle:   c.jobTitle ?? c.email,
        href:       `/dashboard/crm/contacts`,
      })),
    });
  }

  if (companies.length) {
    groups.push({
      type: "company",
      label: "Companies",
      results: companies.map((c) => ({
        id:         c.id,
        entityType: "company",
        title:      c.name,
        subtitle:   c.industry ?? c.domain ?? undefined,
        href:       `/dashboard/crm/companies`,
      })),
    });
  }

  if (meetings.length) {
    groups.push({
      type: "meeting",
      label: "Meetings",
      results: meetings.map((m) => ({
        id:         m.id,
        entityType: "meeting",
        title:      m.title,
        subtitle:   m.lead?.company ?? m.type,
        meta:       m.status,
        href:       `/dashboard/meetings/${m.id}`,
      })),
    });
  }

  if (proposals.length) {
    groups.push({
      type: "proposal",
      label: "Proposals",
      results: proposals.map((p) => ({
        id:         p.id,
        entityType: "proposal",
        title:      p.title,
        subtitle:   p.lead?.company ?? undefined,
        meta:       p.status,
        href:       `/dashboard/proposals/${p.id}`,
      })),
    });
  }

  if (tasks.length) {
    groups.push({
      type: "task",
      label: "Tasks",
      results: tasks.map((t) => ({
        id:         t.id,
        entityType: "task",
        title:      t.title,
        meta:       t.status,
        href:       `/dashboard/operations/tasks`,
      })),
    });
  }

  if (users.length) {
    groups.push({
      type: "user",
      label: "Team",
      results: users.map((u) => ({
        id:         u.id,
        entityType: "user",
        title:      `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
        subtitle:   u.role.label,
        href:       `/dashboard/settings/team`,
      })),
    });
  }

  if (navResults.length) {
    groups.push({ type: "nav", label: "Navigation", results: navResults });
  }

  if (actionResults.length) {
    groups.push({ type: "action", label: "Quick Actions", results: actionResults });
  }

  return NextResponse.json({ query: q, groups });
}
