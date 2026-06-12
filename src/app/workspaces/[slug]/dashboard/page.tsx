import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = { title: "Dashboard | MergeX OS" };

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Resolve current brand from slug (already validated in layout guard)
  const brand = await db.brand.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!brand) redirect("/sign-in");

  const brands = await db.brand.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true },
  });

  const teammates = await db.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      designation: true,
      status: true,
      Role: { select: { label: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const leads = await db.lead.findMany({
    where: { brandId: brand.id },
    include: {
      LeadStage: {
        select: {
          id: true,
          name: true,
          label: true,
          color: true,
        },
      },
      LeadSource: {
        select: {
          id: true,
          name: true,
        },
      },
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const meetings = await db.meeting.findMany({
    where: { Lead: { brandId: brand.id } },
    include: {
      Lead: {
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
        },
      },
      User: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const proposals = await db.proposal.findMany({
    where: { Lead: { brandId: brand.id } },
    orderBy: { createdAt: "desc" },
  });

  const clients = await db.client.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
  });

  const serializedLeads = leads.map((l) => ({
    id: l.id,
    companyName: l.companyName,
    contactPerson: l.contactPerson,
    email: l.email,
    phone: l.phone,
    expectedValue: l.expectedValue ? Number(l.expectedValue) : null,
    winLossStatus: l.winLossStatus,
    nextActionDate: l.nextActionDate ? l.nextActionDate.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
    owner: l.User ? {
      id: l.User.id,
      firstName: l.User.firstName,
      lastName: l.User.lastName,
      email: l.User.email,
      avatarUrl: l.User.avatarUrl,
    } : null,
    stage: l.LeadStage ? {
      id: l.LeadStage.id,
      name: l.LeadStage.name,
      label: l.LeadStage.label,
      color: l.LeadStage.color,
    } : null,
    source: l.LeadSource ? {
      id: l.LeadSource.id,
      name: l.LeadSource.name,
    } : null,
  }));

  const serializedMeetings = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    scheduledAt: m.scheduledAt.toISOString(),
    duration: m.duration,
    mode: m.mode,
    meetingUrl: m.meetingUrl,
    status: m.status,
    lead: m.Lead ? {
      id: m.Lead.id,
      companyName: m.Lead.companyName,
      contactPerson: m.Lead.contactPerson,
    } : null,
    organizer: m.User ? {
      firstName: m.User.firstName,
      lastName: m.User.lastName,
      avatarUrl: m.User.avatarUrl,
    } : null,
  }));

  const serializedProposals = proposals.map((p) => ({
    id: p.id,
    title: p.title,
    proposalNumber: p.proposalNumber,
    status: p.status,
    value: p.value ? Number(p.value) : 0,
    createdAt: p.createdAt.toISOString(),
  }));

  const serializedClients = clients.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    contactPerson: c.contactPerson,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      brandName={brand?.name ?? slug}
      user={user ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      } : null}
      teammates={teammates.map((t) => ({
        id: t.id,
        email: t.email,
        firstName: t.firstName,
        lastName: t.lastName,
        designation: t.designation,
        status: t.status,
        role: { label: t.Role.label },
      }))}
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
      }))}
      leads={serializedLeads}
      meetings={serializedMeetings}
      proposals={serializedProposals}
      clients={serializedClients}
    />
  );
}
