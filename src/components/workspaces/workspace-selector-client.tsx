"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Users,
  Building2,
  LayoutGrid,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

// ── Modular tab components ────────────────────────────────────────────────
import { WorkspacesTab } from "./workspaces-tab";
import { TeamTab } from "./team-tab";
import { SettingsTabComponent } from "./settings-tab";
import { CreateBrandView } from "./create-brand-view";

// ── Shared types ──────────────────────────────────────────────────────────
interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  color: string;
  description: string | null;
  createdAt: string;
}

interface WorkspaceUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  activeBrandId: string | null;
}

interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  role: {
    name: string;
    label: string;
  };
}

interface Props {
  brands: Brand[];
  user: WorkspaceUser;
  userRole: string;
  teammates: Teammate[];
}

// ── Sidebar nav definition ────────────────────────────────────────────────
type ActiveTab = "workspaces" | "team" | "settings";

const SIDEBAR_TABS = [
  { id: "workspaces" as ActiveTab, label: "Brand Workspaces",  icon: LayoutGrid, adminOnly: false },
  { id: "team"       as ActiveTab, label: "Team & Access",     icon: Users,      adminOnly: true  },
  { id: "settings"   as ActiveTab, label: "Platform Settings", icon: Building2,  adminOnly: true  },
];

export function WorkspaceSelectorClient({ brands, user, userRole, teammates }: Props) {
  const canCreateBrand = userRole === "super_admin" || userRole === "admin";
  const router = useRouter();
  const { signOut } = useClerk();

  // ── UI state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]              = useState<ActiveTab>("workspaces");
  const [workspacesView, setWorkspacesView]    = useState<"list" | "create">("list");
  const [mounted, setMounted]                  = useState(false);
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(user.activeBrandId);
  const [loadingBrandId, setLoadingBrandId]    = useState<string | null>(null);
  const [searchQuery, setSearchQuery]          = useState("");

  // ── Brand list (synced from props) ────────────────────────────────────
  const [brandList, setBrandList] = useState<Brand[]>(brands);
  useEffect(() => { setBrandList(brands); }, [brands]);

  // ── Hydration ─────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  // ── Workspace settings state ──────────────────────────────────────────
  const [newBrandName, setNewBrandName]     = useState("");
  const [savingBrand, setSavingBrand]       = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [defaultTimezone, setDefaultTimezone] = useState("Asia/Kolkata");
  const [defaultCurrency, setDefaultCurrency] = useState("INR");

  // ── Team / invite state ───────────────────────────────────────────────
  const [inviteEmail, setInviteEmail]       = useState("");
  const [inviteRole, setInviteRole]         = useState("cx_executive");
  const [sendingInvite, setSendingInvite]   = useState(false);
  const [userTab, setUserTab]               = useState<"active" | "invited">("active");
  const [pendingInvitesList, setPendingInvitesList] = useState([
    { id: "p1", email: "marketing@mergex.in", role: "Admin",        invitedAt: "2h ago"    },
    { id: "p2", email: "support@mergex.in",   role: "CX Executive", invitedAt: "1 day ago" },
  ]);

  // ── Roles state ───────────────────────────────────────────────────────
  const [rolesList, setRolesList] = useState([
    { role: "Super Admin",  perm: "Full access to platform, branding, billing, and logs." },
    { role: "Admin",        perm: "Manage brand divisions, users and pipeline rules. Cannot view system logs." },
    { role: "CX Executive", perm: "Create leads, update client workspaces, upload document templates." },
    { role: "Viewer",       perm: "Read-only access to KPI strip and dashboard analytics widgets." },
  ]);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc,  setNewRoleDesc]  = useState("");

  // ── Derived ───────────────────────────────────────────────────────────
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : user.email;

  const filteredBrands = brandList.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelectBrand = async (brand: Brand) => {
    setLoadingBrandId(brand.id);
    setActiveBrandIdState(brand.id);
    // Persist active brand to DB
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeBrandId: brand.id }),
      });
    } catch (e) {
      console.error("[handleSelectBrand] Failed to persist activeBrandId:", e);
    }
    setTimeout(() => router.push(`/workspaces/${brand.slug}/dashboard`), 250);
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    try {
      const res  = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to create brand workspace."); return; }
      const newBrand: Brand = {
        id: data.id, name: data.name, slug: data.slug,
        logoUrl: data.logoUrl ?? null, color: data.color ?? "violet",
        description: data.description ?? null,
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
      };
      setBrandList((prev) => [newBrand, ...prev]);
      setNewBrandName("");
      toast.success("Workspace brand division created successfully.");
    } catch {
      toast.error("Network error - please try again.");
    } finally {
      setSavingBrand(false);
    }
  };

  const handleArchiveBrand = async (id: string, name: string) => {
    setDeletingBrandId(id);
    try {
      const res = await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); toast.error(data.error ?? "Failed to archive brand division."); return; }
      setBrandList((prev) => prev.filter((b) => b.id !== id));
      toast.success("Workspace brand division archived", { description: `"${name}" has been removed from workspaces.` });
      if (activeBrandId === id) {
        setActiveBrandIdState(null);
        // Clear active brand in DB
        fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activeBrandId: null }),
        }).catch(console.error);
      }
    } catch {
      toast.error("Network error - please try again.");
    } finally {
      setDeletingBrandId(null);
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    setSendingInvite(true);
    setTimeout(() => {
      const roleLabel = rolesList.find(
        (r) => r.role.toLowerCase().replace(/\s/g, "_") === inviteRole
      )?.role ?? "CX Executive";
      setPendingInvitesList((prev) => [
        { id: Date.now().toString(), email: inviteEmail.trim(), role: roleLabel, invitedAt: "Just now" },
        ...prev,
      ]);
      setInviteEmail("");
      setSendingInvite(false);
      toast.success("Email invitation sent successfully.", { description: `Invitation sent to ${inviteEmail}.` });
    }, 1000);
  };

  const handleDeactivate = (name: string) => {
    toast.success("Teammate account deactivated", { description: `${name} has been suspended from accessing Sales OS.` });
  };

  const handleCancelInvite = (id: string, email: string) => {
    setPendingInvitesList((prev) => prev.filter((p) => p.id !== id));
    toast.error("Invitation cancelled", { description: `Pending invite for ${email} has been revoked.` });
  };

  const handleAddCustomRole = () => {
    if (!newRoleTitle.trim() || !newRoleDesc.trim()) return;
    if (rolesList.some((r) => r.role.toLowerCase() === newRoleTitle.toLowerCase().trim())) {
      toast.error("Role already exists", { description: `A role named "${newRoleTitle.trim()}" is already configured.` });
      return;
    }
    setRolesList((prev) => [...prev, { role: newRoleTitle.trim(), perm: newRoleDesc.trim() }]);
    toast.success("Custom role created", { description: `"${newRoleTitle.trim()}" is now available for member invitations.` });
    setNewRoleTitle(""); setNewRoleDesc("");
  };

  const handleRemoveCustomRole = (title: string) => {
    setRolesList((prev) => prev.filter((r) => r.role !== title));
    toast.success("Custom role deleted", { description: `"${title}" has been removed from permissions matrix.` });
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="relative h-screen bg-background text-foreground flex flex-col font-sans antialiased overflow-hidden selection:bg-purple-500/30 selection:text-white">

      {/* Subtle ambient top line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-linear-to-r from-transparent via-[#8B5CF6]/30 to-transparent pointer-events-none" />

      {/* ── TOP NAVIGATION BAR ──────────────────────────────────────── */}
      <header className="relative z-50 w-full border-b border-neutral-200 dark:border-white/5 bg-white/80 dark:bg-[#050507]/80 backdrop-blur-md shrink-0">
        <div className="w-full px-8 h-14 flex items-center justify-between">

          {/* Brand identity */}
          <div className="flex items-center gap-3">
            <img src="/logo/mergex-logo.png" alt="MergeX" className="w-7 h-7 object-contain shrink-0" />
            <span className="text-[11px] font-black text-foreground dark:text-white tracking-widest uppercase font-sans">
              SALES OS
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <AnimatedThemeToggler />
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-white/6 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-xs font-bold text-purple-400 uppercase border border-purple-500/35 shrink-0 select-none">
                {user.firstName?.[0] ?? "U"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── SIDEBAR + CONTENT LAYOUT ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 w-full flex flex-col md:flex-row overflow-hidden">

        {/* ── LEFT SIDEBAR (never scrolls) ──────────────────────────── */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-neutral-200 dark:border-white/5 px-6 py-8 gap-6 overflow-y-auto">

          <div className="flex flex-col gap-5">
            <div>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono select-none px-2 block mb-2">
                Operations Centre
              </span>
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar">
                {SIDEBAR_TABS.filter((t) => !t.adminOnly || canCreateBrand).map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setWorkspacesView("list"); }}
                      className={cn(
                        "relative group flex items-center gap-3 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer text-left shrink-0",
                        isSelected
                          ? "bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#A78BFA] font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-white/2"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#8B5CF6] shadow-sm shadow-[#8B5CF6]/40 hidden md:block" />
                      )}
                      <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isSelected ? "text-[#8B5CF6] dark:text-[#A78BFA]" : "text-neutral-500 group-hover:text-foreground")} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar footer - pushed to bottom */}
          <div className="hidden md:flex flex-col gap-3.5 pt-6 mt-auto border-t border-neutral-200 dark:border-white/5">
            <div className="flex items-center gap-3 px-1.5">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-white/6 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-xs font-bold text-purple-400 uppercase border border-purple-500/35 shrink-0 select-none">
                  {user.firstName?.[0] ?? "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate leading-none">{displayName}</p>
                <p className="text-[9px] text-muted-foreground truncate leading-none mt-1">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:text-white bg-rose-500/3 hover:bg-rose-500 border border-rose-500/15 hover:border-transparent rounded-lg transition-all cursor-pointer text-center"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ── RIGHT CONTENT PANEL (only this scrolls) ──────────────── */}
        <div className="flex-1 min-w-0 overflow-y-auto px-8 py-10">
          <div className="space-y-6 max-w-5xl">

            {activeTab === "workspaces" && workspacesView === "create" && (
              <CreateBrandView
                onBack={() => setWorkspacesView("list")}
                onCreated={(brand) => {
                  setBrandList((prev) => [brand, ...prev]);
                  setWorkspacesView("list");
                }}
              />
            )}

            {activeTab === "workspaces" && workspacesView === "list" && (
              <WorkspacesTab
                filteredBrands={filteredBrands}
                activeBrandId={activeBrandId}
                loadingBrandId={loadingBrandId}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                canCreateBrand={canCreateBrand}
                mounted={mounted}
                handleSelectBrand={handleSelectBrand}
                onNewBrand={() => setWorkspacesView("create")}
              />
            )}

            {activeTab === "team" && (
              <TeamTab
                teammates={teammates}
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                inviteRole={inviteRole}
                setInviteRole={setInviteRole}
                sendingInvite={sendingInvite}
                handleSendInvite={handleSendInvite}
                userTab={userTab}
                setUserTab={setUserTab}
                pendingInvitesList={pendingInvitesList}
                handleCancelInvite={handleCancelInvite}
                handleDeactivate={handleDeactivate}
                rolesList={rolesList}
                newRoleTitle={newRoleTitle}
                setNewRoleTitle={setNewRoleTitle}
                newRoleDesc={newRoleDesc}
                setNewRoleDesc={setNewRoleDesc}
                handleAddCustomRole={handleAddCustomRole}
                handleRemoveCustomRole={handleRemoveCustomRole}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTabComponent
                brandList={brandList}
                newBrandName={newBrandName}
                setNewBrandName={setNewBrandName}
                savingBrand={savingBrand}
                deletingBrandId={deletingBrandId}
                handleCreateBrand={handleCreateBrand}
                handleArchiveBrand={handleArchiveBrand}
                defaultTimezone={defaultTimezone}
                setDefaultTimezone={setDefaultTimezone}
                defaultCurrency={defaultCurrency}
                setDefaultCurrency={setDefaultCurrency}
              />
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
