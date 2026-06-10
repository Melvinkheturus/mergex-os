"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { User, Building2, Users, Settings2, Sliders, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderInfo {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const HEADERS: Record<string, HeaderInfo> = {
  "my-profile": {
    title: "Profile Configuration",
    subtitle: "Manage your personal profile details, security settings, and preferences",
    icon: User,
  },
  "brand-settings": {
    title: "Brand Settings",
    subtitle: "Configure the identity and details of this brand workspace.",
    icon: Building2,
  },
  "crm-settings": {
    title: "CRM Operational Settings",
    subtitle: "Configure pipeline rules, SLAs, escalation triggers, and business hours",
    icon: Settings2,
  },
  "members": {
    title: "Members",
    subtitle: "Manage who has access to this brand workspace",
    icon: Users,
  },
  "audit-logs": {
    title: "Audit Logs",
    subtitle: "Chronological record of all actions in this workspace",
    icon: Sliders,
  },
  "notifications": {
    title: "Pulse Engine",
    subtitle: "Configure email delivery and notification channels",
    icon: Bell,
  },
  "workspace-preferences": {
    title: "Workspace Preferences",
    subtitle: "Manage general workspace options and defaults",
    icon: Building2,
  },
};

interface SettingsWorkspaceHeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function SettingsWorkspaceHeader({
  sidebarCollapsed,
  onToggleSidebar,
}: SettingsWorkspaceHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  let key = searchParams.get("tab") || "my-profile";
  if (pathname.includes("/notifications")) {
    key = "notifications";
  }

  const info = HEADERS[key] || HEADERS["my-profile"];
  const Icon = info.icon;

  return (
    <div className="px-6 py-5 border-b border-border/10 bg-transparent flex items-center gap-3.5 shrink-0 text-left">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 shrink-0">
        <Icon className="h-4 w-4 text-[#8B5CF6]" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground tracking-tight leading-none">{info.title}</h2>
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-none">
          {info.subtitle}
        </p>
      </div>
    </div>
  );
}
