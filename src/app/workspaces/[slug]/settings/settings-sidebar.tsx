"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useParams } from "next/navigation";
import {
  User,
  Bell,
  Building2,
  Users,
  ShieldCheck,
  FileText,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

// ── Tab type ──────────────────────────────────────────────────────────────────
type SettingsTab =
  | "my-profile"
  | "notifications"
  | "brand-settings"
  | "crm-settings"
  | "workspace-preferences"
  | "members"
  | "audit-logs";

interface NavItem {
  id: SettingsTab;
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

// ── Section groups ────────────────────────────────────────────────────────────
interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Personal",
    items: [
      { id: "my-profile",    label: "My Profile",    href: "/dashboard/settings?tab=my-profile",    icon: User },
      { id: "notifications", label: "Notifications", href: "/dashboard/settings?tab=notifications",  icon: Bell },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "brand-settings", label: "Brand Settings", href: "/dashboard/settings?tab=brand-settings", icon: Building2, adminOnly: true },
      { id: "crm-settings", label: "CRM Settings", href: "/dashboard/settings?tab=crm-settings", icon: Settings2, adminOnly: true },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "members", label: "Members", href: "/dashboard/settings?tab=members", icon: Users, adminOnly: true },
    ],
  },
  {
    label: "Advanced",
    items: [
      { id: "audit-logs", label: "Audit Logs", href: "/dashboard/settings?tab=audit-logs", icon: FileText, adminOnly: true },
    ],
  },
];

interface SettingsSidebarProps {
  roleName?: string;
  collapsed?: boolean;
  onCollapse?: (val: boolean) => void;
}

export function SettingsSidebar({ roleName, collapsed = false, onCollapse }: SettingsSidebarProps) {
  const { signOut } = useClerk();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const params      = useParams();
  const slug        = params?.slug as string;
  const activeTab   = (searchParams.get("tab") || "my-profile") as SettingsTab;

  const canAdmin = roleName === "super_admin" || roleName === "admin";

  const getDynamicHref = (href: string) => {
    return href.replace(/^\/dashboard/, `/workspaces/${slug}`);
  };

  const isActive = (item: NavItem) =>
    pathname === `/workspaces/${slug}/settings` && activeTab === item.id;

  // Filter items by role
  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || canAdmin),
  })).filter((group) => group.items.length > 0);

  return (
    <TooltipProvider>
      {/* ── Desktop: left vertical sidebar ───────────────────────────────── */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full bg-transparent shrink-0 transition-all duration-300 ease-in-out border-r border-transparent",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-transparent px-4 gap-2.5",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCollapse?.(false)}
                  aria-label="Expand sidebar"
                  className="group/logo relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors mx-auto"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground absolute transition-opacity duration-150 group-hover/logo:opacity-0" />
                  <PanelLeftOpen className="h-4 w-4 text-muted-foreground absolute opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100" strokeWidth={1.6} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[10px] font-medium">
                Expand sidebar
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0"
                >
                  <Link href={`/workspaces/${slug}/dashboard`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h2 className="font-bold text-base tracking-tight text-foreground truncate">Settings</h2>
              </div>
              <button
                onClick={() => onCollapse?.(true)}
                aria-label="Collapse sidebar"
                className="h-6 w-6 ml-2 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={1.6} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation groups */}
        <nav className={cn("flex-1 overflow-y-auto py-3 space-y-4", collapsed ? "px-2" : "px-2.5")}>
          {filteredGroups.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              {!collapsed && (
                <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 select-none">
                  {group.label}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map(({ id, label, href, icon: Icon }) => {
                  const active = isActive({ id, label, href, icon: Icon });

                  const link = (
                    <Link
                      href={getDynamicHref(href)}
                      className={cn(
                        "relative group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold transition-all duration-150",
                        active
                          ? "bg-[#8B5CF6]/5 text-[#8B5CF6] font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/40" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-[#8B5CF6]" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && <span className="flex-1 truncate">{label}</span>}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={id}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12} className="text-[10px] font-semibold">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return <div key={id}>{link}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer logout */}
        <div className="border-t border-border/10 p-3 mt-auto">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center h-9 w-9 mx-auto rounded-md text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.6} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[10px] font-semibold text-red-500 bg-red-500/5 border border-red-500/10">
                Log Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors text-left"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.6} />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile: horizontal scrolling tabs ────────────────────────────── */}
      <div className="lg:hidden w-full border-b border-border/30 bg-card/60 backdrop-blur-sm p-3 shrink-0 overflow-x-auto sticky top-0 z-20 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0">
          <Link href={`/workspaces/${slug}/dashboard`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="h-4 w-px bg-border/40 shrink-0" />
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {filteredGroups.flatMap((group) =>
            group.items.map(({ id, label, href }) => {
              const active = pathname === `/workspaces/${slug}/settings` && activeTab === id;
              return (
                <Link
                  key={id}
                  href={getDynamicHref(href)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all shrink-0 border",
                    active
                      ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6] font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {label}
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </TooltipProvider>
  );
}
