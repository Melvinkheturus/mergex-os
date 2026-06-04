"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Globe,
  Mail,
  ShieldCheck,
  Building2,
  ChevronDown,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  designation?: string | null;
  role: {
    name: string;
    label: string;
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface DbRole {
  id: string;
  name: string;
  label: string;
  description?: string | null;
}

interface PendingInvite {
  id: string;
  email: string;
  roleId: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  brands: { id: string; name: string; slug: string }[];
}

type TeamTabSection = "members" | "invitations" | "roles" | "brand-access";

interface TeamTabProps {
  teammates: Teammate[];
  brands: Brand[];
}

// ── Helper ────────────────────────────────────────────────────────────────────
function getInitials(t: { firstName: string | null; lastName: string | null; email: string }) {
  return ((t.firstName?.[0] ?? "") + (t.lastName?.[0] ?? t.email[0])).toUpperCase();
}

// ── Main component ────────────────────────────────────────────────────────────
export function TeamTab({ teammates, brands }: TeamTabProps) {
  const [activeSection, setActiveSection] = useState<TeamTabSection>("members");

  const tabs: { id: TeamTabSection; label: string; icon: React.ElementType }[] = [
    { id: "members",      label: "Members",      icon: Users },
    { id: "invitations",  label: "Invitations",  icon: Mail },
    { id: "roles",        label: "Roles",        icon: ShieldCheck },
    { id: "brand-access", label: "Brand Access", icon: Building2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          Team &amp; Access
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage team members, invitations, roles and brand access from one central place.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-neutral-200 dark:border-white/5 pb-0 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all relative cursor-pointer shrink-0 border-b-2",
              activeSection === id
                ? "text-[#8B5CF6] border-[#8B5CF6]"
                : "text-muted-foreground hover:text-foreground border-transparent"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === "members"      && <MembersSection      teammates={teammates} />}
      {activeSection === "invitations"  && <InvitationsSection  brands={brands} />}
      {activeSection === "roles"        && <RolesSection />}
      {activeSection === "brand-access" && <BrandAccessSection  teammates={teammates} brands={brands} />}
    </div>
  );
}

// ── 1. Members ────────────────────────────────────────────────────────────────
function MembersSection({ teammates }: { teammates: Teammate[] }) {
  const handleSuspend = (name: string) => {
    toast.success("Teammate suspended", {
      description: `${name} has been suspended from MergeX OS.`,
    });
  };

  return (
    <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-[#8B5CF6]" />
          Active Members
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {teammates.length} authorized member{teammates.length !== 1 ? "s" : ""} in this organization.
        </p>
      </div>

      <div className="space-y-2">
        {teammates.map((t) => {
          const initials = getInitials(t);
          const name = t.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : t.email;
          return (
            <div
              key={t.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm"
            >
              <div className="flex items-center gap-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={name}
                    className="h-8 w-8 rounded-lg object-cover border border-neutral-200 dark:border-white/6 shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-xs font-extrabold text-[#8B5CF6] shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate leading-none">{name}</p>
                  <p className="text-[10px] text-muted-foreground/60 truncate mt-1">{t.email}</p>
                  {t.designation && (
                    <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{t.designation}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold">
                  {t.role.label}
                </Badge>
                {t.role.name !== "super_admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuspend(name)}
                    className="h-7 text-[10px] font-bold text-neutral-500 hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 2. Invitations ────────────────────────────────────────────────────────────
function InvitationsSection({ brands }: { brands: Brand[] }) {
  const [dbRoles, setDbRoles]       = useState<DbRole[]>([]);
  const [pending, setPending]       = useState<PendingInvite[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);

  // Form fields
  const [email, setEmail]           = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [roleId, setRoleId]         = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandDropOpen, setBrandDropOpen]   = useState(false);

  // Load roles + pending invites
  useEffect(() => {
    Promise.all([
      fetch("/api/team/roles").then((r) => r.json()),
      fetch("/api/team/invite").then((r) => r.json()),
    ])
      .then(([roles, invites]) => {
        setDbRoles(Array.isArray(roles) ? roles : []);
        setPending(Array.isArray(invites) ? invites : []);
        if (roles.length > 0) setRoleId(roles[0].id);
      })
      .catch(() => toast.error("Failed to load roles / invitations."))
      .finally(() => setLoading(false));
  }, []);

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSendInvite = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("A valid email address is required.");
      return;
    }
    if (!employeeId.trim()) {
      toast.error("Employee ID is required.");
      return;
    }
    if (!roleId) {
      toast.error("Please select a role.");
      return;
    }
    if (selectedBrands.length === 0) {
      toast.error("Select at least one brand workspace.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          employeeId: employeeId.trim(),
          roleId,
          brandIds: selectedBrands,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to send invitation.");
        return;
      }

      toast.success("Invitation sent!", {
        description: `An email has been dispatched to ${email.trim()} with their activation link.`,
      });

      // Reset form
      setEmail("");
      setEmployeeId("");
      setSelectedBrands([]);
      if (dbRoles.length > 0) setRoleId(dbRoles[0].id);

      // Refresh pending list
      const updated = await fetch("/api/team/invite").then((r) => r.json());
      setPending(Array.isArray(updated) ? updated : []);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleRevokeInvite = async (id: string, inviteEmail: string) => {
    try {
      const res = await fetch(`/api/team/invite?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to revoke invitation.");
        return;
      }
      setPending((prev) => prev.filter((p) => p.id !== id));
      toast.success("Invitation revoked", { description: `Pending invite for ${inviteEmail} has been cancelled.` });
    } catch {
      toast.error("Network error — please try again.");
    }
  };

  const selectedBrandNames = brands
    .filter((b) => selectedBrands.includes(b.id))
    .map((b) => b.name)
    .join(", ");

  return (
    <div className="space-y-5">
      {/* Send Invite Form */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-4.5 h-4.5 text-[#8B5CF6]" />
            Send Invitation
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Invite a new teammate. They&apos;ll receive an email with an activation link via Resend.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4 pt-1 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@mergex.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
              />
            </div>

            {/* Employee ID */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Employee ID</Label>
              <Input
                placeholder="e.g. MX-007"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6 font-mono tracking-widest"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Role</Label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground focus:outline-none focus:border-[#8B5CF6]/50 transition-all cursor-pointer appearance-none"
              >
                {dbRoles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Brand Access */}
            <div className="space-y-1.5 relative">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Brand Access</Label>
              <button
                type="button"
                onClick={() => setBrandDropOpen((o) => !o)}
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground flex items-center justify-between gap-2 hover:border-neutral-300 dark:hover:border-white/12 transition-all cursor-pointer"
              >
                <span className={cn("truncate", !selectedBrandNames && "text-muted-foreground")}>
                  {selectedBrandNames || "Select brands…"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>
              {brandDropOpen && (
                <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/8 rounded-xl shadow-xl overflow-hidden">
                  {brands.map((b) => {
                    const selected = selectedBrands.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBrand(b.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <span>{b.name}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={handleSendInvite}
            disabled={sending || loading}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer h-9 px-5 rounded-lg disabled:opacity-50"
          >
            {sending ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Sending…</span></>
            ) : (
              <><UserPlus className="h-3.5 w-3.5" /><span>Send Invite</span></>
            )}
          </Button>
        </div>
      </div>

      {/* Pending Invitations List */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Mail className="w-4.5 h-4.5 text-[#8B5CF6]" />
            Pending Invitations
            {pending.length > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                {pending.length}
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting account activation. Links expire after 7 days.
          </p>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm">
                <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-1/3 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                  </div>
                </div>
                <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No pending invitations. Send one above.
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((inv) => {
              const initials = inv.email[0].toUpperCase();
              const expiresDate = new Date(inv.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              return (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-xs font-extrabold text-amber-500 shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate leading-none">{inv.email}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Expires {expiresDate}
                        {inv.brands.length > 0 && ` · ${inv.brands.map((b) => b.name).join(", ")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-amber-500/20 text-amber-600 bg-amber-500/5 font-semibold">
                      Pending
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvite(inv.id, inv.email)}
                      className="h-7 text-[10px] font-bold text-neutral-500 hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. Roles ──────────────────────────────────────────────────────────────────
function RolesSection() {
  const [roles, setRoles]             = useState<DbRole[]>([]);
  const [loading, setLoading]         = useState(true);
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc]   = useState("");

  useEffect(() => {
    fetch("/api/team/roles")
      .then((r) => r.json())
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load roles."))
      .finally(() => setLoading(false));
  }, []);

  const handleAddRole = () => {
    if (!newRoleTitle.trim() || !newRoleDesc.trim()) return;
    if (roles.some((r) => r.label.toLowerCase() === newRoleTitle.toLowerCase().trim())) {
      toast.error("A role with this name already exists.");
      return;
    }
    // Optimistic local add (real persistence would need a POST /api/team/roles endpoint)
    const fakeRole: DbRole = {
      id: `custom-${Date.now()}`,
      name: newRoleTitle.trim().toLowerCase().replace(/\s+/g, "_"),
      label: newRoleTitle.trim(),
      description: newRoleDesc.trim(),
    };
    setRoles((prev) => [...prev, fakeRole]);
    toast.success("Custom role created", { description: `"${newRoleTitle.trim()}" is now available.` });
    setNewRoleTitle("");
    setNewRoleDesc("");
  };

  const systemRoles = ["super_admin", "admin", "cx_executive", "viewer"];

  const handleDeleteRole = (role: DbRole) => {
    setRoles((prev) => prev.filter((r) => r.id !== role.id));
    toast.success("Custom role deleted", { description: `"${role.label}" removed from permissions matrix.` });
  };

  return (
    <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-[#8B5CF6]" />
          Roles &amp; Permissions
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Administrative role matrices defining operations limits.
        </p>
      </div>

      {/* Create custom role */}
      <div className="p-4 border border-neutral-200 dark:border-white/5 rounded-xl bg-[#8B5CF6]/1 dark:bg-white/1 space-y-3">
        <h4 className="text-xs font-bold text-foreground">Create Custom Role</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Role Title</Label>
            <Input
              placeholder="Role Title (e.g. Sales Architect)…"
              value={newRoleTitle}
              onChange={(e) => setNewRoleTitle(e.target.value)}
              className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Capabilities</Label>
            <Input
              placeholder="Short description of capabilities…"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddRole}
            disabled={!newRoleTitle.trim() || !newRoleDesc.trim()}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold cursor-pointer h-8 px-4 rounded-lg"
          >
            + Create Role
          </Button>
        </div>
      </div>

      {/* Roles list */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3.5 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map((r) => (
            <div key={r.id} className="p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{r.label}</span>
                  {systemRoles.includes(r.name) && (
                    <Badge variant="outline" className="text-[8px] uppercase tracking-wider border-[#8B5CF6]/20 text-[#8B5CF6] bg-[#8B5CF6]/5 font-semibold">
                      System
                    </Badge>
                  )}
                </div>
                {!systemRoles.includes(r.name) && (
                  <button
                    onClick={() => handleDeleteRole(r)}
                    className="text-red-500 hover:text-red-600 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
              {r.description && (
                <p className="text-muted-foreground/80 mt-1.5 leading-relaxed">{r.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 4. Brand Access ───────────────────────────────────────────────────────────
function BrandAccessSection({ teammates, brands }: { teammates: Teammate[]; brands: Brand[] }) {
  return (
    <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-4.5 h-4.5 text-[#8B5CF6]" />
          Brand Access
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Overview of which team members have access to which brand workspaces.
        </p>
      </div>

      {/* Table header */}
      <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-white/5">
        <div className="grid bg-neutral-50 dark:bg-white/2 px-4 py-2.5 border-b border-neutral-200 dark:border-white/5"
          style={{ gridTemplateColumns: `1fr 140px ${brands.map(() => "80px").join(" ")}` }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Member</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Role</span>
          {brands.map((b) => (
            <span key={b.id} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 text-center truncate">
              {b.name}
            </span>
          ))}
        </div>

        {teammates.map((t, i) => {
          const name = t.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : t.email;
          const isSuperAdmin = t.role.name === "super_admin";
          return (
            <div
              key={t.id}
              className={cn(
                "grid items-center px-4 py-3 border-b border-neutral-200 dark:border-white/5 last:border-0",
                i % 2 === 0 ? "bg-white dark:bg-[#0A0A0E]" : "bg-neutral-50/50 dark:bg-white/1"
              )}
              style={{ gridTemplateColumns: `1fr 140px ${brands.map(() => "80px").join(" ")}` }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={name}
                    className="h-6 w-6 rounded-md object-cover border border-neutral-200 dark:border-white/6 shrink-0"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-md bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-[9px] font-extrabold text-[#8B5CF6] shrink-0">
                    {getInitials(t)}
                  </div>
                )}
                <span className="text-xs font-semibold text-foreground truncate">{name}</span>
              </div>
              <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold w-fit">
                {t.role.label}
              </Badge>
              {brands.map((b) => (
                <div key={b.id} className="flex justify-center">
                  {isSuperAdmin ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 dark:bg-white/10 block" />
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/50 italic">
        Super Admins have access to all brand workspaces. Per-member brand access is managed during invitation.
      </p>
    </div>
  );
}
