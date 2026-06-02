import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { WorkspaceLayoutShell } from "@/components/layout/workspace-layout-shell";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function WorkspaceSlugLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  // ── 1. Auth guard ──────────────────────────────────────────────────────────
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // ── 2. Brand existence + status check ─────────────────────────────────────
  const brand = await db.brand.findUnique({
    where: { slug },
    select: { id: true, status: true, name: true },
  });

  if (!brand || brand.status !== "active") {
    redirect("/workspaces");
  }

  // ── 3. Brand access check (skip for super_admin / admin) ──────────────────
  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";

  if (!isAdmin) {
    const access = await db.userBrandAccess.findUnique({
      where: { userId_brandId: { userId: user.id, brandId: brand.id } },
    });
    if (!access) {
      redirect("/workspaces");
    }
  }

  // ── 4. Sync active brand ID in database ───────────────────────────────────
  if (user.activeBrandId !== brand.id) {
    await db.user.update({
      where: { id: user.id },
      data: { activeBrandId: brand.id },
    });
  }

  return <WorkspaceLayoutShell>{children}</WorkspaceLayoutShell>;
}
