"use client";

import { useSearchParams } from "next/navigation";
import { SettingsPageProps, SettingsTab } from "./types";
import { ProfileSection } from "./components/profile-section";
import { NotificationsSection } from "./components/notifications-section";
import { BrandSettingsSection } from "./components/brand-settings-section";
import { CrmSettingsSection } from "./components/crm-settings-section/crm-settings-section";
import { MembersSection } from "./components/members-section";
import { AuditLogsSection } from "./components/audit-logs-section";

export function SettingsPage({ user, brands, teammates }: SettingsPageProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") || "my-profile";

  const canAdmin = user?.role.name === "super_admin" || user?.role.name === "admin";

  const isAllowed = (t: string) => {
    if (t === "my-profile" || t === "notifications") return true;
    return canAdmin;
  };

  const tab = isAllowed(rawTab) ? (rawTab as SettingsTab) : "my-profile";

  const renderContent = () => {
    switch (tab) {
      case "my-profile":             return <ProfileSection user={user} brands={brands} />;
      case "notifications":          return <NotificationsSection />;
      case "brand-settings":         return <BrandSettingsSection brands={brands} />;
      case "crm-settings":           return <CrmSettingsSection user={user} />;
      case "members":                return <MembersSection teammates={teammates} />;
      case "audit-logs":             return <AuditLogsSection />;
      default:                       return <ProfileSection user={user} brands={brands} />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {renderContent()}
    </div>
  );
}
