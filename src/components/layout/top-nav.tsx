"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Search, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { useCommandCenter } from "@/components/command/command-provider";
import { cn } from "@/lib/utils";

function formatBreadcrumb(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return "Dashboard";
  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TopNav() {
  const pathname = usePathname();
  const pageTitle = formatBreadcrumb(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggle } = useCommandCenter();

  // Detect mac for correct shortcut hint
  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  return (
    <header className="h-14 flex items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-4 lg:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden text-muted-foreground"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-60">
          <MobileSidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <h1 className="text-sm font-semibold truncate hidden sm:block">
        {pageTitle}
      </h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Command Center Trigger ─────────────────────────────────────── */}
      <button
        onClick={toggle}
        className={cn(
          "hidden md:flex items-center gap-2.5 h-8 px-3 rounded-lg",
          "bg-muted/60 hover:bg-muted border border-border/60 hover:border-border",
          "text-muted-foreground hover:text-foreground",
          "text-xs transition-all duration-150 group",
          "min-w-[200px] max-w-xs w-full"
        )}
        aria-label="Open Command Center"
      >
        <Zap className="h-3 w-3 text-primary/70 group-hover:text-primary transition-colors shrink-0" />
        <span className="flex-1 text-left text-[11px]">Search or jump to…</span>
        <kbd className="flex items-center gap-0.5 text-[10px] font-mono opacity-60 bg-background border border-border rounded px-1 py-0.5 shrink-0">
          {isMac ? "⌘" : "Ctrl"}K
        </kbd>
      </button>

      {/* Mobile Command Center trigger (icon only) */}
      <button
        onClick={toggle}
        className="flex md:hidden items-center justify-center h-8 w-8 rounded-lg bg-muted/60 border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open Command Center"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Live Notification Dropdown */}
      <NotificationDropdown />

      {/* User button */}
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-7 w-7",
          },
        }}
      />
    </header>
  );
}
