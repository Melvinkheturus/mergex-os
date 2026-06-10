import { OpportunityDetailClient } from "./opportunity-detail-client";

export const metadata = { title: "Opportunity Workspace | MergeX OS" };

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OpportunityDetailClient opportunityId={id} />;
}
