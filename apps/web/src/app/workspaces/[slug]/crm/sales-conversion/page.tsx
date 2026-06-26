import { requirePermission } from "@/lib/auth";
import { SalesConversionClient } from "./sales-conversion-client";

export const metadata = { title: "Sales Conversion | MergeX OS" };

export default async function SalesConversionPage() {
  await requirePermission("crm.opportunities.view");
  return <SalesConversionClient />;
}
