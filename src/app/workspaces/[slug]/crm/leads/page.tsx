import { requirePermission } from "@/lib/auth";
import { LeadsPage } from "./leads-client";

export const metadata = { title: "Leads | MergeX OS" };

export default async function Page() {
  await requirePermission("crm.leads.view");
  return <LeadsPage />;
}
