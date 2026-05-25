"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { CommandProvider } from "@/components/command/command-provider";

// Full-height routes — no padding, full overflow control
const FULLSCREEN_ROUTES = ["/dashboard/pipeline"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ROUTES.some(r => pathname.startsWith(r));
  const isSettings = pathname.startsWith("/dashboard/settings");

  return (
    <CommandProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        {!isSettings && (
          <div className="hidden lg:flex">
            <Sidebar
              collapsed={sidebarCollapsed}
              onCollapse={setSidebarCollapsed}
            />
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopNav />
          {isFullscreen ? (
            // Full-height layout for pipeline, etc.
            <main className="flex-1 overflow-hidden flex flex-col">
              {children}
            </main>
          ) : (
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          )}
        </div>
      </div>
    </CommandProvider>
  );
}
