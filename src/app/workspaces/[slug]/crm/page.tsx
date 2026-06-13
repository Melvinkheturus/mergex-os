import { redirect } from "next/navigation";
import { getCurrentUser, hasPermission } from "@/lib/auth";

interface CRMPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CRMPage({ params }: CRMPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  if (hasPermission(user, "crm.leads.view")) {
    redirect(`/workspaces/${slug}/crm/leads`);
  } else if (hasPermission(user, "crm.opportunities.view")) {
    redirect(`/workspaces/${slug}/crm/sales-conversion`);
  } else {
    redirect("/unauthorized");
  }
}
