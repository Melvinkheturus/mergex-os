import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkspacesSettingsClient } from "./settings-client";

export const metadata = {
  title: "Workspace Settings | MergeX OS",
};

export default async function WorkspacesSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const isAllowed = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAllowed) {
    redirect("/workspaces");
  }

  const brands = await db.brand.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <WorkspacesSettingsClient
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl ?? null,
        color: b.color ?? "violet",
        description: b.description ?? null,
        createdAt: b.createdAt.toISOString(),
      }))}
    />
  );
}
