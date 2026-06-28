import { LeadDetailsClient } from "./lead-details-client";

export const metadata = { title: "Lead Profile | MergeX OS" };

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <LeadDetailsClient leadId={id} />;
}
