import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SettingsPage } from "./settings-client";

export const metadata = { title: "Settings | MergeX Sales OS" };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const dbUser = user ? await db.user.findUnique({
    where: { id: user.id },
    include: { role: true }
  }) : null;

  const brands = await db.brand.findMany({
    orderBy: { createdAt: "desc" }
  });

  const teammates = await db.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" }
  });

  // Sort active brand matching the route slug to the first position
  const activeBrandIndex = brands.findIndex(b => b.slug === slug);
  const sortedBrands = [...brands];
  if (activeBrandIndex > 0) {
    const [active] = sortedBrands.splice(activeBrandIndex, 1);
    sortedBrands.unshift(active);
  }

  return (
    <SettingsPage 
      user={dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        username: dbUser.username,
        designation: dbUser.designation,
        avatarUrl: dbUser.avatarUrl,
        role: {
          name: dbUser.role.name,
          label: dbUser.role.label
        }
      } : null}
      brands={sortedBrands.map(b => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description ?? null,
        logoUrl: b.logoUrl ?? null
      }))}
      teammates={teammates.map(t => ({
        id: t.id,
        email: t.email,
        firstName: t.firstName,
        lastName: t.lastName,
        designation: t.designation,
        role: {
          name: t.role.name,
          label: t.role.label
        }
      }))}
    />
  );
}
