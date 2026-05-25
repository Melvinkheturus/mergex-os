import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import MeetingsClient from "./meetings-client";

export const metadata: Metadata = {
  title: "Discovery Meetings",
  description: "Schedule and manage discovery meetings. Pre-meeting briefs, structured frameworks, and auto-generated MOM.",
};

export default async function MeetingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, organizationId: true },
  });
  if (!user) redirect("/sign-in");

  const meetings = await db.meeting.findMany({
    where: { organizationId: user.organizationId },
    include: {
      host: { select: { firstName: true, lastName: true, avatarUrl: true } },
      lead: { select: { firstName: true, lastName: true, company: true, pipelineStage: true, temperature: true } },
      mom: { select: { id: true, summary: true } },
      _count: { select: { notes: true } },
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });

  return <MeetingsClient meetings={meetings} />;
}
