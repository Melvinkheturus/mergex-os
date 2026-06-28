import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkspaceSlugPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/workspaces/${slug}/dashboard`);
}
