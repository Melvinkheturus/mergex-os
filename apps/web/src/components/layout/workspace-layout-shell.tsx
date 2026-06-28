"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { CommandProvider } from "@/components/command/command-provider";

// Full-height routes - no padding, full overflow control
const FULLSCREEN_ROUTE_SUFFIXES = ["/pipeline"];

export function WorkspaceLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isSettings = pathname.includes("/settings");
  const isFullscreen =
    FULLSCREEN_ROUTE_SUFFIXES.some((s) => pathname.endsWith(s)) || isSettings;

  return (
    <CommandProvider>
      <div className="flex h-screen overflow-hidden dashboard-bg">
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
        {isSettings ? (
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <main className="grow overflow-hidden flex flex-col">{children}</main>
          </div>
        ) : (
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col p-0">
            <div className="grow flex flex-col overflow-hidden">
              {/* TopNav */}
              <TopNav />

              {isFullscreen ? (
                // Full-height layout for pipeline, etc.
                <main className="grow overflow-hidden flex flex-col">{children}</main>
              ) : (
                // Scrollable content area with smooth fade from TopNav
                <div className="grow overflow-y-auto relative">
                  {/* Fade overlay */}
                  <div
                    className="sticky top-0 left-0 right-0 z-20 pointer-events-none h-12"
                    style={{
                      background:
                        "linear-gradient(to bottom, var(--background) 0%, transparent 100%)",
                    }}
                  />
                  <main className="p-6 lg:p-8 -mt-12 relative z-10">{children}</main>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CommandProvider>
  );
}
