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
  profile: {
    title: "Profile Configuration",
    subtitle: "Manage your personal profile details, security settings, and preferences",
    icon: User,
  },
  workspace: {
    title: "Workspace Settings",
    subtitle: "Configure brand divisions, defaults, and regional properties",
    icon: Building2,
  },
  team: {
    title: "Team & Access",
    subtitle: "Invite colleagues, manage user accounts, and review permissions",
    icon: Users,
  },
  config: {
    title: "Operational Config",
    subtitle: "Set custom CRM qualification stages and client lifecycle statuses",
    icon: Settings2,
  },
  system: {
    title: "System Preferences",
    subtitle: "Configure platform upload sizes, audit rules, and view logs",
    icon: Sliders,
  },
  notifications: {
    title: "Pulse Engine",
    subtitle: "Configure email delivery and notification channels",
    icon: Bell,
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
  
  let key = searchParams.get("tab") || "profile";
  if (pathname.includes("/notifications")) {
    key = "notifications";
  }

  const info = HEADERS[key] || HEADERS.profile;
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
