import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WorkspaceSelectorClient } from "@/components/workspaces/workspace-selector-client";

export const metadata = {
  title: "Workspaces | MergeX OS",
};

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const view = typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : undefined;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // ── Show the workspace hub for explicit selection ──────────────────────────
  const brands = await db.brand.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
  });

  const teammates = await db.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      designation: true,
      status: true,
      Role: { select: { name: true, label: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <WorkspaceSelectorClient
      defaultView={view}
      user={{
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        activeBrandId: user.activeBrandId,
      }}
      userRole={user.role.name}
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl ?? null,
        color: b.color ?? "violet",
        description: b.description ?? null,
        createdAt: b.createdAt.toISOString(),
      }))}
      teammates={teammates.map((t) => ({
        id: t.id,
        email: t.email,
        firstName: t.firstName,
        lastName: t.lastName,
        avatarUrl: t.avatarUrl,
        designation: t.designation,
        status: t.status,
        role: {
          name: t.Role.name,
          label: t.Role.label,
        },
      }))}
    />
  );
}
