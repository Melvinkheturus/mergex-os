import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SettingsClientLayout } from "./settings-client-layout";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const dbUser = user ? await db.user.findUnique({
    where: { id: user.id },
    include: { Role: true }
  }) : null;

  return (
    <SettingsClientLayout roleName={dbUser?.Role.name}>
      {children}
    </SettingsClientLayout>
  );
}
