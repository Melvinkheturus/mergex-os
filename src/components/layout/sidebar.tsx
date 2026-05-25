"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Building2,
  Handshake,
  UserCircle,
  BookOpen,
  CheckSquare,
  Settings,
  ChevronLeft,
  TrendingUp,
  LayoutDashboard,
  Kanban,
  Video,
  FileText,
  Rocket,
  Brain,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      { title: "Dashboard",  href: "/dashboard",          icon: LayoutDashboard },
      { title: "Analytics",  href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Sales Engine",
    items: [
      { title: "Pipeline",      href: "/dashboard/pipeline",      icon: Kanban   },
      { title: "Meetings",      href: "/dashboard/meetings",      icon: Video    },
      { title: "Proposals",     href: "/dashboard/proposals",     icon: FileText },
      { title: "Client Launch", href: "/dashboard/client-launch", icon: Rocket   },
    ],
  },
  {
    label: "CRM",
    items: [
      { title: "Leads",     href: "/dashboard/crm/leads",     icon: TrendingUp },
      { title: "Contacts",  href: "/dashboard/crm/contacts",  icon: UserCircle },
      { title: "Companies", href: "/dashboard/crm/companies", icon: Building2  },
      { title: "Deals",     href: "/dashboard/crm/deals",     icon: Handshake  },
    ],
  },
  {
    label: "Enablement",
    items: [
      { title: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen },
      { title: "Team",           href: "/dashboard/team",       icon: Users },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Pipeline Intelligence", href: "/dashboard/insights/pipeline-intelligence", icon: Brain },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Tasks",         href: "/dashboard/operations/tasks", icon: CheckSquare },
      { title: "Pulse Engine",  href: "/dashboard/pulse",            icon: Zap,          badge: "New" },
    ],
  },
];

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 px-4 border-b border-border",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 relative rounded-md overflow-hidden shrink-0">
              <Image src="/logo/mergex-logo.png" alt="MergeX Logo" fill className="object-cover" />
            </div>
            <span className="font-semibold text-sm tracking-tight truncate">
              MergeX Sales OS
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 relative rounded-md overflow-hidden flex items-center justify-center">
            <Image src="/logo/mergex-logo.png" alt="MergeX Logo" fill className="object-cover" />
          </div>
        )}

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground",
            collapsed && "hidden"
          )}
          onClick={() => onCollapse(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="h-4 text-[10px] px-1.5 ml-auto"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={12}>
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return link;
              })}
            </ul>
            <Separator className="mt-3 opacity-50" />
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-2 py-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "flex items-center justify-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                  pathname.startsWith("/dashboard/settings") && "bg-primary/10 text-primary"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              Settings
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              pathname.startsWith("/dashboard/settings") && "bg-primary/10 text-primary"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </Link>
        )}

        {/* Expand button when collapsed */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-2 h-8 w-8 mx-auto flex text-muted-foreground hover:text-foreground"
            onClick={() => onCollapse(false)}
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        )}
      </div>
    </aside>
  );
}
