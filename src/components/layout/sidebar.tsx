"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { navGroups } from "@/config/navigation";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
}

const SUB_ITEMS: Record<string, { title: string; href: string }[]> = {
  CRM: [
    { title: "Leads", href: "/dashboard/crm/leads" },
    { title: "Meetings", href: "/dashboard/crm/meetings" },
    { title: "Proposals", href: "/dashboard/crm/proposals" },
    { title: "Pipeline", href: "/dashboard/crm/pipeline" },
  ],
  Clients: [
    { title: "Projects", href: "/dashboard/clients/projects" },
    { title: "Reports", href: "/dashboard/clients/reports" },
    { title: "Financials", href: "/dashboard/clients/financials" },
    { title: "Timeline", href: "/dashboard/clients/timeline" },
  ],
  Documents: [
    { title: "Templates", href: "/dashboard/documents/templates" },
    { title: "Active Proposals", href: "/dashboard/documents/proposals" },
    { title: "Signed Contracts", href: "/dashboard/documents/contracts" },
  ],
  Knowledge: [
    { title: "Sales Manual", href: "/dashboard/knowledge/manual" },
    { title: "Product Docs", href: "/dashboard/knowledge/docs" },
    { title: "Process Wiki", href: "/dashboard/knowledge/wiki" },
  ],
};

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string;
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const getDynamicHref = (href: string) => {
    return href.replace(/^\/dashboard/, `/workspaces/${slug}`);
  };


  useEffect(() => {
    const activeAccordions: Record<string, boolean> = {};
    if (pathname.startsWith(`/workspaces/${slug}/crm`)) activeAccordions["CRM"] = true;
    if (pathname.startsWith(`/workspaces/${slug}/clients`)) activeAccordions["Clients"] = true;
    if (pathname.startsWith(`/workspaces/${slug}/documents`)) activeAccordions["Documents"] = true;
    if (pathname.startsWith(`/workspaces/${slug}/knowledge`)) activeAccordions["Knowledge"] = true;
    setOpenAccordions((prev) => ({ ...prev, ...activeAccordions }));
  }, [pathname, slug]);

  const toggleAccordion = (title: string, e: React.MouseEvent) => {
    if (SUB_ITEMS[title]) {
      e.preventDefault();
      setOpenAccordions((prev) => ({ ...prev, [title]: !prev[title] }));
    }
  };

  return (
    <div
      className={cn(
        "relative h-screen transition-all duration-200 ease-in-out shrink-0 hidden lg:block",
        collapsed ? "w-[60px]" : "w-[210px]"
      )}
    >
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-transparent border-r border-transparent transition-all duration-200 ease-in-out",
          collapsed ? "w-[60px]" : "w-[210px]"
        )}
      >
        {/* ── Logo ── */}
        <div className="flex items-center px-3.5 border-b border-transparent pt-[16px] h-[64px]">
          {collapsed ? (
            /* Collapsed: logo visible by default; hover reveals expand icon */
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCollapse(false)}
                  aria-label="Expand sidebar"
                  className="group/logo relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors mx-auto"
                >
                  {/* Logo — fades out on hover */}
                  <img
                    src="/logo/mergex-logo.png"
                    alt="MergeX Logo"
                    className="w-6 h-6 object-contain absolute transition-opacity duration-150 group-hover/logo:opacity-0"
                  />
                  {/* Expand icon — fades in on hover */}
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
            /* Open: logo + name link, collapse button at right */
            <div className="flex items-center justify-between w-full">
              <Link href="/workspaces" className="flex items-center gap-2.5 min-w-0 group/logolink">
                <img
                  src="/logo/mergex-logo.png"
                  alt="MergeX Logo"
                  className="w-6 h-6 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-semibold text-[11px] uppercase tracking-wider text-foreground truncate block">
                    MERGEX SALES OS
                  </span>
                </div>
              </Link>
              <button
                onClick={() => onCollapse(true)}
                aria-label="Collapse sidebar"
                className="h-6 w-6 ml-2 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={1.6} />
              </button>
            </div>
          )}
        </div>

        {/* ── Primary Navigation ── */}
        <nav className="flex-1 overflow-y-auto pt-6 pb-3 px-3 space-y-0.5">
          {navGroups.flatMap((group) =>
            group.items.map((item) => {
              const Icon = item.icon;
              const dynamicHref = getDynamicHref(item.href);
              const isActive =
                item.href === "/dashboard"
                  ? pathname === dynamicHref || pathname === `${dynamicHref}/dashboard`
                  : pathname.startsWith(dynamicHref);
              const isFrozen = !!item.isComingSoon;
              const subItems = SUB_ITEMS[item.title];
              const isAccordionOpen = !!openAccordions[item.title];

              const linkEl = (
                <Link
                  key={item.title}
                  href={dynamicHref}
                  onClick={(e) =>
                    !collapsed && subItems && toggleAccordion(item.title, e)
                  }
                  className={cn(
                    "flex items-center gap-3 px-2 py-[7px] rounded-md transition-colors duration-100",
                    collapsed ? "justify-center" : "",
                    isActive
                      ? "text-[#8B5CF6] dark:text-[#A78BFA] bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 font-bold"
                      : isFrozen
                      ? "text-neutral-400/30 dark:text-neutral-600/30 pointer-events-none"
                      : "text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-neutral-50 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "shrink-0 transition-colors",
                      collapsed ? "h-[18px] w-[18px]" : "h-[16px] w-[16px]",
                      isActive
                        ? "text-[#8B5CF6] dark:text-[#A78BFA]"
                        : isFrozen
                        ? "text-neutral-400/30 dark:text-neutral-600/30"
                        : "text-neutral-500 dark:text-neutral-400"
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {!collapsed && (
                    <>
                      <span
                        className={cn(
                          "flex-1 text-[13px] truncate",
                          isActive ? "font-bold text-[#8B5CF6] dark:text-[#A78BFA]" : "font-semibold text-neutral-800 dark:text-neutral-200"
                        )}
                      >
                        {item.title}
                      </span>
                      {subItems && (
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 shrink-0 text-neutral-500/40 dark:text-neutral-400/40 transition-transform duration-200",
                            isAccordionOpen && "rotate-180"
                          )}
                        />
                      )}
                    </>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      sideOffset={12}
                      /* Tooltip: font-medium — small text needs a little weight to read clearly */
                      className="text-[10px] font-medium"
                    >
                      {item.title}
                      {isFrozen && " (Coming Soon)"}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={item.title}>
                  {linkEl}
                  {subItems && isAccordionOpen && (
                    <ul className="ml-[30px] mt-0.5 mb-1 space-y-0.5 border-l border-border/20 pl-3">
                      {subItems.map((sub) => {
                        const subHref = getDynamicHref(sub.href);
                        const isSubActive = pathname === subHref;
                        return (
                          <li key={sub.title}>
                            <Link
                              href={subHref}
                              onClick={(e) => {
                                e.preventDefault();
                                toast.info(`${sub.title} details are under Phase 1 construction.`);
                              }}
                              className={cn(
                                "flex items-center gap-1.5 py-1.5 text-[12px] transition-colors",
                                isSubActive
                                  ? "text-[#8B5CF6] dark:text-[#A78BFA] font-bold"
                                  : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-50 font-semibold"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-[3px] h-[3px] rounded-full shrink-0",
                                  isSubActive ? "bg-[#8B5CF6] dark:bg-[#A78BFA]" : "bg-neutral-400 dark:bg-neutral-600"
                                )}
                              />
                              {sub.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* ── Settings (Bottom) ── */}
        <div className="border-t border-transparent p-3 space-y-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/workspaces/${slug}/settings`}
                  className={cn(
                    "flex items-center justify-center h-9 w-9 mx-auto rounded-md transition-colors",
                    pathname.startsWith(`/workspaces/${slug}/settings`)
                      ? "bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 text-[#8B5CF6] dark:text-[#A78BFA] shadow-xs"
                      : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-50 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <Settings
                    className={cn(
                      "h-[16px] w-[16px] shrink-0",
                      pathname.startsWith(`/workspaces/${slug}/settings`)
                        ? "text-[#8B5CF6] dark:text-[#A78BFA]"
                        : "text-neutral-500 dark:text-neutral-400"
                    )}
                    strokeWidth={pathname.startsWith(`/workspaces/${slug}/settings`) ? 2 : 1.5}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-[10px] font-medium">
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href={`/workspaces/${slug}/settings`}
              className={cn(
                "flex items-center gap-3 px-2 py-[7px] rounded-md text-[13px] transition-colors",
                pathname.startsWith(`/workspaces/${slug}/settings`)
                  ? "text-[#8B5CF6] dark:text-[#A78BFA] bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 font-bold"
                  : "text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-neutral-50 hover:bg-black/5 dark:hover:bg-white/5 font-semibold"
              )}
            >
              <Settings
                className={cn(
                  "h-[16px] w-[16px] shrink-0",
                  pathname.startsWith(`/workspaces/${slug}/settings`)
                    ? "text-[#8B5CF6] dark:text-[#A78BFA]"
                    : "text-neutral-500 dark:text-neutral-400"
                )}
                strokeWidth={pathname.startsWith(`/workspaces/${slug}/settings`) ? 2 : 1.5}
              />
              <span>Settings</span>
            </Link>
          )}

          {/* Expand is now handled by the logo hover in the collapsed header */}
        </div>
      </aside>
    </div>
  );
}
