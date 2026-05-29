"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  User, 
  Building2, 
  Users, 
  Settings2, 
  Sliders, 
  ArrowLeft,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
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

type SettingsTab = "profile" | "workspace" | "team" | "config" | "system" | "notifications";

interface NavItem {
  id: SettingsTab;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV: NavItem[] = [
  { id: "profile",       label: "Profile Settings",     href: "/dashboard/settings?tab=profile",     icon: User },
  { id: "workspace",     label: "Workspace Settings",   href: "/dashboard/settings?tab=workspace",   icon: Building2 },
  { id: "team",          label: "Team & Access",        href: "/dashboard/settings?tab=team",        icon: Users },
  { id: "config",        label: "Operational Config",   href: "/dashboard/settings?tab=config",      icon: Settings2 },
  { id: "system",        label: "System Preferences",   href: "/dashboard/settings?tab=system",      icon: Sliders },
  { id: "notifications", label: "Notification Settings", href: "/dashboard/settings/notifications", icon: Bell },
];

interface SettingsSidebarProps {
  roleName?: string;
  collapsed?: boolean;
  onCollapse?: (val: boolean) => void;
}

export function SettingsSidebar({ roleName, collapsed = false, onCollapse }: SettingsSidebarProps) {
  const { signOut } = useClerk();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  // Filter allowed options based on the user's role
  const allowedNav = NAV.filter((item) => {
    if (item.id === "profile" || item.id === "notifications") return true;
    if (roleName === "super_admin") return true;
    if (roleName === "admin") {
      return item.id !== "system"; // Admin cannot view platform-wide system settings
    }
    return false; // Other roles can only view/edit personal Profile & notifications
  });

  return (
    <TooltipProvider>
      {/* Desktop View: Left vertical sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-full bg-transparent shrink-0 transition-all duration-300 ease-in-out border-r border-transparent",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Desktop Header */}
        <div className={cn(
          "h-16 flex items-center border-b border-transparent px-4 gap-2.5",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCollapse?.(false)}
                  aria-label="Expand sidebar"
                  className="group/logo relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors mx-auto"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground absolute transition-opacity duration-150 group-hover/logo:opacity-0" />
                  <PanelLeftOpen
                    className="h-4 w-4 text-muted-foreground absolute opacity-0 transition-opacity duration-150 group-hover/logo:opacity-100"
                    strokeWidth={1.6}
                  />
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
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div className="min-w-0">
                  <h2 className="font-bold text-base tracking-tight text-foreground truncate">Settings</h2>
                </div>
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

        {/* Desktop Navigation */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">
            Settings Categories
          </div>
        )}
        <nav className={cn(
          "flex-1 overflow-y-auto py-1 space-y-0.5",
          collapsed ? "px-2" : "px-2.5"
        )}>
          {allowedNav.map(({ id, label, href, icon: Icon }) => {
            const isActive = id === "notifications" 
              ? pathname === href 
              : (pathname === "/dashboard/settings" && activeTab === id);

            const link = (
              <Link
                href={href}
                className={cn(
                  "relative group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-[#8B5CF6]/5 text-[#8B5CF6] font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                  collapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/40" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-[#8B5CF6]" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && <span className="flex-1 truncate">{label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>
                    {link}
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="text-[10px] font-semibold">
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {/* Desktop Logout Button */}
        <div className="border-t border-border/10 p-3 mt-auto">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut()}
                  className="flex items-center justify-center h-9 w-9 mx-auto rounded-md text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer transition-colors"
                >
                  <LogOut className="h-[16px] w-[16px] shrink-0" strokeWidth={1.6} />
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

      {/* Mobile View: Horizontal scrolling tabs list at the top */}
      <div className="lg:hidden w-full border-b border-border/30 bg-card/60 backdrop-blur-sm p-3 shrink-0 overflow-x-auto sticky top-0 z-20 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="h-4 w-px bg-border/40 shrink-0" />
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {allowedNav.map(({ id, label, href }) => {
            const isActive = id === "notifications"
              ? pathname === href
              : (pathname === "/dashboard/settings" && activeTab === id);

            return (
              <Link
                key={id}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all shrink-0 border",
                  isActive
                    ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6] font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
