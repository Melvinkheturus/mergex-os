"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useParams } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Search, Menu, Sparkles, Megaphone } from "lucide-react";
import { ReleaseAnnouncementModal } from "@/components/layout/release-announcement-modal";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { useCommandCenter } from "@/components/command/command-provider";
import { BrandSwitcher, type BrandOption } from "@/components/layout/brand-switcher";
import { cn } from "@/lib/utils";

function formatBreadcrumb(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last || last === "dashboard") return "Dashboard";

  // If the last segment is a UUID, resolve a human-readable title based on the previous segment
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(last);
  if (isUuid) {
    const prev = segments[segments.length - 2];
    if (prev === "leads") return "Lead Profile";
    if (prev === "proposals") return "Proposal Detail";
    if (prev === "meetings") return "Meeting Detail";
    return "Detail View";
  }

  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TopNav() {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string;
  const pageTitle = formatBreadcrumb(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const { toggle } = useCommandCenter();
  const [latestRelease, setLatestRelease] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasUnseenUpdate, setHasUnseenUpdate] = useState(false);

  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  useEffect(() => {
    const fallbackRelease = {
      id: "initial-setup",
      version: "1.0.0",
      title: "MergeX OS Platform Online",
      description: "Initial platform deployment. Track sales pipelines, manage brands, and store proposals securely.",
      type: "major",
      popupTitle: "🚀 MergeX OS Command Center Online",
      popupDescription: "Welcome to the all-in-one operations system. Explore your brand workspaces, lead lifecycles, and proposal vaults.",
      releaseDate: new Date().toISOString(),
      items: [
        {
          id: "init-item-1",
          type: "feature",
          category: "Platform",
          description: "SSO auth, multi-brand workspace switcher, and dashboard modules."
        },
        {
          id: "init-item-2",
          type: "feature",
          category: "CRM",
          description: "CRM Sales Conversion pipeline and automated qualification logs."
        }
      ]
    };

    fetch("/api/releases/latest")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.release) {
          setLatestRelease(data.release);
          const lastSeenId = localStorage.getItem("lastSeenChangelogId");
          if (lastSeenId !== data.release.id) {
            setHasUnseenUpdate(true);
            if (data.release.popupEnabled) {
              setModalOpen(true);
            }
          }
        } else {
          setLatestRelease(fallbackRelease);
        }
      })
      .catch(() => {
        setLatestRelease(fallbackRelease);
      });
  }, []);

  const handleDismissRelease = () => {
    if (latestRelease) {
      localStorage.setItem("lastSeenChangelogId", latestRelease.id);
      setHasUnseenUpdate(false);
    }
    setModalOpen(false);
  };

  const handleWhatsNewClick = () => {
    if (latestRelease) {
      localStorage.setItem("lastSeenChangelogId", latestRelease.id);
      setHasUnseenUpdate(false);
    }
  };

  // Load brands for switcher
  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.ok ? r.json() : [])
      .then((data: unknown) => {
        if (Array.isArray(data)) setBrands(data as BrandOption[]);
      })
      .catch(() => {/* Brands not critical for topnav to fail */});
  }, []);

  return (
    <div className="pt-3.5 px-6 lg:px-8 sticky top-0 z-30 bg-transparent shrink-0">
      <header className="h-12 flex items-center justify-between bg-transparent px-1">
      
      {/* ── Left Group: Mobile menu + Page title + Brand Switcher ── */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden text-muted-foreground hover:bg-muted/50"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60">
            <MobileSidebar onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="text-xs font-semibold uppercase tracking-wider text-foreground hidden sm:block">
          {pageTitle}
        </h1>

        {/* Separator */}
        {brands.length > 0 && <div className="h-4 w-px bg-border/40 hidden sm:block" />}

        {/* Brand Switcher */}
        <BrandSwitcher brands={brands} />
      </div>

      {/* ── Right Group: Search + Notifications + Theme + Profile ── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Global Search Bar */}
        <button
          onClick={toggle}
          className={cn(
            "hidden sm:flex items-center gap-2.5 h-8 px-3 rounded-md cursor-pointer",
            "bg-muted/40 hover:bg-muted/70 border border-border/20 hover:border-border/40",
            "text-muted-foreground hover:text-foreground",
            "text-xs transition-all duration-150 group",
            "w-[200px]"
          )}
          aria-label="Open Command Center"
        >
          <Search className="h-3 w-3 text-[#8B5CF6]/75 group-hover:text-[#8B5CF6] transition-colors shrink-0" />
          <span className="flex-1 text-left text-[11px]">Search…</span>
          <kbd className="flex items-center gap-0.5 text-[9px] font-mono opacity-60 bg-background/50 border border-border/30 rounded px-1 shrink-0">
            {isMac ? "⌘" : "Ctrl"}K
          </kbd>
        </button>

        {/* What's New Button */}
        {hasUnseenUpdate && (
          <Link
            href="/changelog"
            onClick={handleWhatsNewClick}
            className={cn(
              "relative flex items-center justify-center h-8 px-2.5 gap-1.5 rounded-md cursor-pointer text-xs transition-all shrink-0",
              "bg-[#8B5CF6]/5 hover:bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40",
              "text-[#8B5CF6] font-bold"
            )}
            aria-label="What's New Updates"
          >
            <Megaphone className="h-3.5 w-3.5" />
            <span className="hidden md:inline">What&apos;s New</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          </Link>
        )}

        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Changer */}
        <AnimatedThemeToggler />

        {/* Profile */}
        <ProfileMenu />

      </div>
    </header>

    <ReleaseAnnouncementModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      release={latestRelease}
      onDismiss={handleDismissRelease}
    />
  </div>
  );
}

// ── Native Profile Dropdown Menu ──
interface DbProfile {
  avatarUrl: string | null;
  designation: string | null;
  Role: {
    name: string;
    label: string;
  } | null;
}

function ProfileMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const slug = params?.slug as string;
  const [dbProfile, setDbProfile] = useState<DbProfile | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.user) {
          setDbProfile(data.user);
          // Background sync Clerk avatarUrl to DB if it's a Clerk URL and has changed
          const dbAvatar = data.user.avatarUrl;
          const isClerkAvatar = !dbAvatar || dbAvatar.startsWith("https://img.clerk.com");
          if (isClerkAvatar && user?.imageUrl && dbAvatar !== user.imageUrl) {
            fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ avatarUrl: user.imageUrl }),
            }).catch(console.error);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchProfile();

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener("mergex:profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("mergex:profile-updated", handleProfileUpdate);
    };
  }, [user]);

  if (!user) return null;

  const userInitials = (user.firstName || user.lastName)
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || "U";

  const userRoleOrDesignation = (() => {
    if (dbProfile?.designation) return dbProfile.designation;
    if (dbProfile?.Role?.label) return dbProfile.Role.label;
    
    // Fallback to metadata
    const metaRole = user.publicMetadata?.role as string;
    if (metaRole === "super_admin") return "Super Admin";
    if (metaRole === "admin") return "Admin";
    if (metaRole === "cx_executive") return "CX Executive";
    return "Member";
  })();

  const isClerkAvatar = !dbProfile?.avatarUrl || dbProfile.avatarUrl.startsWith("https://img.clerk.com");
  const avatarSrc = isClerkAvatar ? (user.imageUrl || dbProfile?.avatarUrl) : dbProfile.avatarUrl;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-7 w-7 rounded-full overflow-hidden border border-border/20 hover:border-border/60 transition-all flex items-center justify-center cursor-pointer focus:outline-none"
        aria-label="User profile options"
      >
        {avatarSrc ? (
          <img src={avatarSrc} className="h-full w-full object-cover" alt="User Avatar" />
        ) : (
          <div 
            className="h-full w-full flex items-center justify-center text-[10px] font-black text-white uppercase"
            style={{ background: "radial-gradient(circle at 30% 107%, #7819f6 0%, #000000 90%)" }}
          >
            {userInitials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-9 right-0 z-50 min-w-[200px] bg-card/90 backdrop-blur-md border border-white/60 dark:border-white/5 rounded-xl shadow-lg overflow-hidden py-1.5">
          
          {/* Account profile overview card inside dropdown */}
          <div className="px-3.5 py-2.5 border-b border-[#E5E7EB] dark:border-[#26262C]/60 flex items-center gap-2.5">
            {avatarSrc ? (
              <img src={avatarSrc} className="h-7 w-7 rounded-full border border-border/20 object-cover" alt="User Avatar" />
            ) : (
              <div 
                className="h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-black text-white uppercase border border-white/10"
                style={{ background: "radial-gradient(circle at 30% 107%, #7819f6 0%, #000000 90%)" }}
              >
                {userInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate leading-none">
                {user.firstName ? `${user.firstName} ${user.lastName ?? ""}` : "Teammate"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-1 leading-none">
                {userRoleOrDesignation}
              </p>
            </div>
          </div>

          {/* Popover Action Links */}
          <div className="py-1">
            <Link
              href={slug ? `/workspaces/${slug}/settings` : "/workspaces"}
              className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              My Profile
            </Link>
            
            <Link
              href={`/workspaces/${slug}/settings`}
              className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Preferences
            </Link>

            <Link
              href={`/workspaces/${slug}/settings`}
              className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
          </div>

          <div className="border-t border-[#E5E7EB] dark:border-[#26262C]/60 my-1 mx-2" />

          {/* Sign-out button */}
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full flex items-center px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-muted/50 transition-colors text-left cursor-pointer"
          >
            Logout
          </button>

        </div>
      )}
    </div>
  );
}
