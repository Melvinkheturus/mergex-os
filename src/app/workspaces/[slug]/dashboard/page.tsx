import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata = { title: "Dashboard | MergeX Sales OS" };

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Resolve current brand from slug (already validated in layout guard)
  const brand = await db.brand.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  const brands = await db.brand.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true },
  });

  const teammates = await db.user.findMany({
    include: { Role: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardClient
      brandName={brand?.name ?? slug}
      user={user ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      } : null}
      teammates={teammates.map((t) => ({
        id: t.id,
        email: t.email,
        firstName: t.firstName,
        lastName: t.lastName,
        designation: t.designation,
        role: { label: t.Role.label },
      }))}
      brands={brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
      }))}
    />
  );
}
