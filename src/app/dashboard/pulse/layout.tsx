"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Inbox, Clock, AlertTriangle, Activity, Zap } from "lucide-react";

const PULSE_TABS = [
  {
    label: "Inbox",
    href: "/dashboard/pulse/inbox",
    icon: Inbox,
    description: "All notifications",
  },
  {
    label: "Reminders",
    href: "/dashboard/pulse/reminders",
    icon: Clock,
    description: "Upcoming & overdue",
  },
  {
    label: "Alerts",
    href: "/dashboard/pulse/alerts",
    icon: AlertTriangle,
    description: "Critical & high priority",
  },
  {
    label: "Activity Feed",
    href: "/dashboard/pulse/activity",
    icon: Activity,
    description: "Team activity stream",
  },
];

export default function PulseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Module header */}
      <div className="shrink-0 border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">Pulse Engine</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Operational alerts, reminders & activity
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1">
          {PULSE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
