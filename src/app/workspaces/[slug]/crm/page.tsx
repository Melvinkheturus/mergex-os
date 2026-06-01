import { redirect } from "next/navigation";

interface CRMPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CRMPage({ params }: CRMPageProps) {
  const { slug } = await params;
  redirect(`/workspaces/${slug}/crm/leads`);
}
