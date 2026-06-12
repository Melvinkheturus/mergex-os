"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Archive,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  User,
  Mail,
  X,
  Activity,
  Building2,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/r-alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Teammate, UserStatus, Brand, DbRole } from "./types";

interface MembersSectionProps {
  teammates: Teammate[];
  brands: Brand[];
  currentUserRole?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const AVAILABLE_MODULES = [
  { id: "CRM", label: "CRM (Leads, Pipelines)" },
  { id: "Clients", label: "Clients Manager" },
  { id: "Documents", label: "Documents & Proposals" },
  { id: "Knowledge", label: "Knowledge Base" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(t: { firstName: string | null; lastName: string | null; email: string }) {
  return ((t.firstName?.[0] ?? "") + (t.lastName?.[0] ?? t.email[0])).toUpperCase();
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "ACTIVE") return null;
  if (status === "SUSPENDED") {
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
        Suspended
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
      Archived
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MembersSection({ teammates: initialTeammates, brands, currentUserRole }: MembersSectionProps) {
  const [members, setMembers] = useState<Teammate[]>(initialTeammates);
  const [dbRoles, setDbRoles] = useState<DbRole[]>([]);
  const [currentUserRoleState, setCurrentUserRoleState] = useState<string | null>(currentUserRole ?? null);
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("ACTIVE");
  
  // Suspend states
  const [suspendTarget, setSuspendTarget] = useState<Teammate | null>(null);
  const [suspending, setSuspending] = useState(false);
  const [suspendCounts, setSuspendCounts] = useState<{ leads: number; tasks: number; clients: number } | null>(null);
  const [suspendCountsLoading, setSuspendCountsLoading] = useState(false);
  
  // Restore / Archive loading states
  const [restoring, setRestoring] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);

  // Edit Access View Target
  const [editTarget, setEditTarget] = useState<Teammate | null>(null);
  const [saving, setSaving] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Edit Form Fields
  const [memberEmployeeId, setMemberEmployeeId] = useState("");
  const [memberDesignation, setMemberDesignation] = useState("");
  const [memberRoleId, setMemberRoleId] = useState("");
  const [memberBrandIds, setMemberBrandIds] = useState<string[]>([]);
  const [memberModuleAccess, setMemberModuleAccess] = useState<string[]>([]);

  const [modalBrandDropOpen, setModalBrandDropOpen] = useState(false);
  const modalBrandRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = currentUserRoleState === "super_admin";
  const canEditAccess = isSuperAdmin || currentUserRoleState === "admin";

  useEffect(() => {
    // Close dropdown on click outside
    const handler = (e: MouseEvent) => {
      if (modalBrandRef.current && !modalBrandRef.current.contains(e.target as Node)) {
        setModalBrandDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load members, roles, and profile
  useEffect(() => {
    Promise.all([
      fetch("/api/team/members?status=all").then((r) => r.json()),
      fetch("/api/team/roles").then((r) => r.json()),
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([membersData, rolesData, profileData]) => {
        if (Array.isArray(membersData)) setMembers(membersData);
        if (Array.isArray(rolesData)) setDbRoles(rolesData);
        if (profileData?.ok && profileData?.user?.Role?.name) {
          setCurrentUserRoleState(profileData.user.Role.name);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch audit logs dynamically when selected user changes
  useEffect(() => {
    if (!editTarget) {
      setAuditLogs([]);
      return;
    }
    setAuditLoading(true);
    fetch(`/api/team/members/audit?id=${editTarget.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAuditLogs(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setAuditLoading(false));
  }, [editTarget]);

  const handleRowClick = (t: Teammate) => {
    setEditTarget(t);
    setMemberEmployeeId(t.employeeId ?? "");
    setMemberDesignation(t.designation ?? "");
    setMemberRoleId(t.role.id ?? "");
    setMemberBrandIds(t.brandAccess?.map((b) => b.id) ?? []);
    setMemberModuleAccess(t.moduleAccess ?? []);
  };

  const handleSaveChanges = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/team/members?id=${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: memberEmployeeId,
          designation: memberDesignation,
          roleId: memberRoleId,
          brandIds: memberBrandIds,
          moduleAccess: memberModuleAccess,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save changes.");
        return;
      }

      const selectedRoleObj = dbRoles.find((r) => r.id === memberRoleId);
      const selectedBrandsObj = brands.filter((b) => memberBrandIds.includes(b.id));

      setMembers((prev) =>
        prev.map((m) =>
          m.id === editTarget.id
            ? {
                ...m,
                employeeId: memberEmployeeId,
                designation: memberDesignation,
                role: selectedRoleObj
                  ? { id: selectedRoleObj.id, name: selectedRoleObj.name, label: selectedRoleObj.label }
                  : m.role,
                brandAccess: selectedBrandsObj.map((b) => ({
                  id: b.id,
                  name: b.name,
                  slug: b.slug,
                })),
                moduleAccess: memberModuleAccess,
              }
            : m
        )
      );

      toast.success("Access permissions updated", {
        description: `Changes for ${editTarget.email} have been saved.`,
      });
      setEditTarget(null);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClickSuspend = async (target: Teammate) => {
    setSuspendTarget(target);
    setSuspendCounts(null);
    setSuspendCountsLoading(true);
    try {
      const res = await fetch(`/api/team/members?id=${target.id}&checkOnly=true`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setSuspendCounts(data.counts ?? { leads: 0, tasks: 0, clients: 0 });
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to check account records.");
        setSuspendTarget(null);
      }
    } catch {
      toast.error("Network error checking user records.");
      setSuspendTarget(null);
    } finally {
      setSuspendCountsLoading(false);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    setSuspending(true);
    try {
      const res = await fetch(`/api/team/members?id=${suspendTarget.id}&force=true`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to suspend account.");
        return;
      }
      setMembers((prev) =>
        prev.map((m) =>
          m.id === suspendTarget.id ? { ...m, status: "SUSPENDED" as UserStatus } : m
        )
      );
      toast.success("Account suspended", {
        description: `${suspendTarget.email} has been locked. Records remain intact.`,
      });
      setSuspendTarget(null);
      setSuspendCounts(null);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSuspending(false);
    }
  };

  const handleRestore = async (target: Teammate) => {
    setRestoring(target.id);
    try {
      const res = await fetch("/api/team/members/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: target.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to restore account.");
        return;
      }
      setMembers((prev) =>
        prev.map((m) =>
          m.id === target.id ? { ...m, status: "ACTIVE" as UserStatus, suspendedAt: null } : m
        )
      );
      toast.success("Account restored", {
        description: `${target.email} can now log in again.`,
      });
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setRestoring(null);
    }
  };

  const handleArchive = async (target: Teammate) => {
    setArchiving(target.id);
    try {
      const res = await fetch("/api/team/members/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: target.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to archive account.");
        return;
      }
      setMembers((prev) =>
        prev.map((m) =>
          m.id === target.id ? { ...m, status: "ARCHIVED" as UserStatus } : m
        )
      );
      toast.success("Account archived", {
        description: `${target.email} has been permanently archived.`,
      });
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setArchiving(null);
    }
  };

  const filteredMembers =
    statusFilter === "all" ? members : members.filter((m) => m.status === statusFilter);

  const counts = {
    all: members.length,
    ACTIVE: members.filter((m) => m.status === "ACTIVE").length,
    SUSPENDED: members.filter((m) => m.status === "SUSPENDED").length,
    ARCHIVED: members.filter((m) => m.status === "ARCHIVED").length,
  };

  const filterTabs: { key: "all" | UserStatus; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "ACTIVE", label: `Active (${counts.ACTIVE})` },
    { key: "SUSPENDED", label: `Suspended (${counts.SUSPENDED})` },
    { key: "ARCHIVED", label: `Archived (${counts.ARCHIVED})` },
  ];

  const hasRecords =
    suspendCounts && (suspendCounts.leads + suspendCounts.tasks + suspendCounts.clients) > 0;

  const filteredAudits = auditLogs.filter((a) =>
    ["ROLE_CHANGED", "ACCOUNT_DEACTIVATED", "ACCOUNT_RESTORED", "ACCOUNT_ARCHIVED", "ACCESS_UPDATED"].includes(a.action)
  );

  return (
    <>
      <AlertDialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendTarget(null);
            setSuspendCounts(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-sm font-bold text-foreground">
                  Suspend Account
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
                  <span className="font-bold text-foreground">
                    {suspendTarget
                      ? suspendTarget.firstName
                        ? `${suspendTarget.firstName} ${suspendTarget.lastName ?? ""}`.trim()
                        : suspendTarget.email
                      : ""}
                  </span>
                  {suspendTarget && <span className="font-mono text-[10px]"> ({suspendTarget.email})</span>}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-2">
            {suspendCountsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : suspendCounts && (suspendCounts.leads + suspendCounts.tasks + suspendCounts.clients) > 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  This member currently owns:
                </p>
                <ul className="space-y-1.5">
                  {suspendCounts.leads > 0 && (
                    <li className="flex items-center gap-2 text-xs text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-bold">{suspendCounts.leads}</span> Lead
                      {suspendCounts.leads !== 1 ? "s" : ""}
                    </li>
                  )}
                  {suspendCounts.clients > 0 && (
                    <li className="flex items-center gap-2 text-xs text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-bold">{suspendCounts.clients}</span> Client
                      {suspendCounts.clients !== 1 ? "s" : ""}
                    </li>
                  )}
                  {suspendCounts.tasks > 0 && (
                    <li className="flex items-center gap-2 text-xs text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-bold">{suspendCounts.tasks}</span> Task
                      {suspendCounts.tasks !== 1 ? "s" : ""}
                    </li>
                  )}
                </ul>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  These records will remain assigned after suspension. You can manually reassign them from the
                  CRM.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                This member has no active record ownership. Their account will be locked immediately and they
                will not be able to log in.
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSuspendTarget(null);
                setSuspendCounts(null);
              }}
              disabled={suspending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmSuspend();
              }}
              disabled={suspending || suspendCountsLoading}
              className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer font-bold"
            >
              {suspending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Suspending…
                </>
              ) : hasRecords ? (
                "Suspend Anyway →"
              ) : (
                "Suspend Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!editTarget ? (
        <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-[#8B5CF6]" />
                Team Members
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {counts.ACTIVE} active · {counts.SUSPENDED > 0 ? `${counts.SUSPENDED} suspended · ` : ""}
                {members.length} total
              </p>
            </div>
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 rounded-lg p-1">
              {filterTabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
                    statusFilter === key
                      ? "bg-white dark:bg-white/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredMembers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No members in this category.</p>
            )}
            {filteredMembers.map((t) => {
              const initials = getInitials(t);
              const name = t.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : t.email;
              const isSuspended = t.status === "SUSPENDED";
              const isArchived = t.status === "ARCHIVED";
              return (
                <div
                  key={t.id}
                  onClick={() => handleRowClick(t)}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border rounded-xl shadow-sm transition-all hover:border-neutral-300 dark:hover:border-white/12 cursor-pointer",
                    isSuspended
                      ? "border-amber-500/20 bg-amber-500/3 dark:bg-amber-500/5"
                      : isArchived
                      ? "border-red-500/15 bg-red-500/3 dark:bg-red-500/5 opacity-70"
                      : "border-neutral-200 dark:border-white/5 bg-white dark:bg-[#0A0A0E]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={name}
                        className={cn(
                          "h-8 w-8 rounded-lg object-cover border border-neutral-200 dark:border-white/6 shrink-0",
                          (isSuspended || isArchived) && "grayscale opacity-60"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg border flex items-center justify-center text-xs font-extrabold shrink-0",
                          isSuspended
                            ? "bg-amber-500/5 border-amber-500/20 text-amber-600"
                            : isArchived
                            ? "bg-red-500/5 border-red-500/20 text-red-400"
                            : "bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6]"
                        )}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={cn(
                            "text-xs font-bold truncate leading-none",
                            (isSuspended || isArchived) && "text-muted-foreground"
                          )}
                        >
                          {name}
                        </p>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-1">{t.email}</p>
                      {t.designation && (
                        <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{t.designation}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap justify-end">
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-wider border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold"
                    >
                      {t.role.label}
                    </Badge>

                    {/* Active user — show Suspend */}
                    {t.status === "ACTIVE" && t.role.name !== "super_admin" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickSuspend(t);
                        }}
                        className="h-7 px-3 text-[10px] font-bold text-neutral-500 hover:text-amber-600 hover:bg-amber-500/8 rounded-lg transition-colors cursor-pointer"
                      >
                        Suspend
                      </button>
                    )}

                    {/* Suspended user — show Restore + Archive (super_admin only) */}
                    {t.status === "SUSPENDED" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(t);
                          }}
                          disabled={restoring === t.id}
                          className="h-7 px-3 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/8 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          {restoring === t.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          Restore
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(t);
                            }}
                            disabled={archiving === t.id}
                            className="h-7 px-3 text-[10px] font-bold text-red-400 hover:bg-red-500/8 rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {archiving === t.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Archive className="w-3 h-3" />
                            )}
                            Archive
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Edit view (Inline, replaces list in same container space) */
        <div className="space-y-4.5 text-left animate-fade-in">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => setEditTarget(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#8B5CF6] hover:text-[#7C3AED] transition-all cursor-pointer bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/5 shadow-xs rounded-lg px-3 py-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Team Members
            </button>
            <Badge variant="outline" className={cn(
              "text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5",
              editTarget.status === "ACTIVE"
                ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/5"
                : editTarget.status === "SUSPENDED"
                ? "border-amber-500/20 text-amber-600 bg-amber-500/5"
                : "border-red-500/20 text-red-500 bg-red-500/5"
            )}>
              {editTarget.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5.5">
            {/* Left Card: Access Settings */}
            <div className="md:col-span-7 glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-[#8B5CF6]" />
                  Access Settings
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure role, designation, brand access, and active module permissions for {editTarget.firstName ? `${editTarget.firstName} ${editTarget.lastName ?? ""}`.trim() : editTarget.email}.
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    type="email"
                    value={editTarget.email}
                    disabled
                    className="h-9 pl-9 text-xs bg-neutral-50 dark:bg-white/1 border-neutral-200 dark:border-white/6 opacity-75 cursor-not-allowed text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Employee ID */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Employee ID</Label>
                  <Input
                    placeholder="e.g. MX-007"
                    value={memberEmployeeId}
                    onChange={(e) => setMemberEmployeeId(e.target.value.toUpperCase())}
                    disabled={!canEditAccess}
                    className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6 font-mono tracking-widest"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Designation</Label>
                  <Input
                    placeholder="e.g. Lead Developer"
                    value={memberDesignation}
                    onChange={(e) => setMemberDesignation(e.target.value)}
                    disabled={!canEditAccess}
                    className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">System Role</Label>
                <Select
                  value={memberRoleId}
                  onValueChange={setMemberRoleId}
                  disabled={!canEditAccess || editTarget.role.name === "super_admin"}
                >
                  <SelectTrigger className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground focus:outline-none transition-all cursor-pointer shadow-none">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbRoles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Access Switcher */}
              <div ref={modalBrandRef} className="space-y-1.5 relative">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Brand Access</Label>
                <div
                  onClick={() => {
                    if (canEditAccess) {
                      setModalBrandDropOpen((o) => !o);
                    }
                  }}
                  className={cn(
                    "w-full min-h-9 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground flex items-center justify-between gap-2 transition-all text-left focus-within:ring-1 focus-within:ring-[#8B5CF6]/50 focus-within:border-[#8B5CF6]/50",
                    canEditAccess ? "cursor-pointer hover:border-neutral-300 dark:hover:border-white/12" : "cursor-not-allowed opacity-75"
                  )}
                >
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {brands.filter(b => memberBrandIds.includes(b.id)).length > 0 ? (
                      brands
                        .filter((b) => memberBrandIds.includes(b.id))
                        .map((b) => (
                          <Badge
                            key={b.id}
                            variant="secondary"
                            className="flex items-center gap-1 text-[10px] font-bold bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border-none px-2 h-5.5 py-0 rounded-md shrink-0 transition-colors"
                          >
                            {b.name}
                            {canEditAccess && (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMemberBrandIds((prev) => prev.filter((id) => id !== b.id));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation();
                                    setMemberBrandIds((prev) => prev.filter((id) => id !== b.id));
                                  }
                                }}
                                className="hover:bg-[#8B5CF6]/30 rounded-full p-0.5 transition-colors cursor-pointer inline-flex items-center justify-center"
                              >
                                <X className="w-2.5 h-2.5 stroke-[2.5px]" />
                              </span>
                            )}
                          </Badge>
                        ))
                    ) : (
                      <span className="text-muted-foreground text-xs font-medium">No brand access assigned</span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                </div>
                {modalBrandDropOpen && (
                  <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/8 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="max-h-48 overflow-y-auto">
                      {brands.map((b) => {
                        const selected = memberBrandIds.includes(b.id);
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              setMemberBrandIds((prev) =>
                                prev.includes(b.id)
                                  ? prev.filter((id) => id !== b.id)
                                  : [...prev, b.id]
                              );
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-left",
                              selected && "bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/8"
                            )}
                          >
                            <span className={cn(selected && "text-[#8B5CF6]")}>{b.name}</span>
                            {selected && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Module Access Checklist */}
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground block">Module Access</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_MODULES.map((mod) => {
                    const selected = memberModuleAccess.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          if (!canEditAccess) return;
                          setMemberModuleAccess((prev) =>
                            prev.includes(mod.id)
                              ? prev.filter((m) => m !== mod.id)
                              : [...prev, mod.id]
                          );
                        }}
                        disabled={!canEditAccess}
                        className={cn(
                          "flex items-center gap-2 p-2 border rounded-xl transition-all text-left text-xs font-semibold",
                          canEditAccess ? "cursor-pointer" : "cursor-not-allowed opacity-75",
                          selected
                            ? "bg-[#8B5CF6]/5 border-[#8B5CF6]/30 text-[#8B5CF6]"
                            : "bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6 text-foreground hover:border-neutral-300 dark:hover:border-white/12"
                        )}
                      >
                        <div className={cn("w-3.5 h-3.5 rounded flex items-center justify-center border", selected ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "border-neutral-300 dark:border-white/20")}>
                          {selected && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                        </div>
                        <span>{mod.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save / Cancel Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-white/5 justify-end">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  disabled={saving}
                  className="h-8.5 px-4 rounded-xl text-xs font-semibold text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                {canEditAccess && (
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="h-8.5 px-4 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#8B5CF6]/15 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Actions & History */}
            <div className="md:col-span-5 space-y-5 flex flex-col">
              {/* Member Actions Card */}
              <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <User className="w-4.5 h-4.5 text-[#8B5CF6]" />
                    Member Actions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perform administrative operations on this teammate's account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Suspend/Restore */}
                  {editTarget.role.name !== "super_admin" && editTarget.id !== initialTeammates.find(x => x.role.name === "super_admin")?.id && (
                    editTarget.status === "ACTIVE" ? (
                      <button
                        onClick={() => {
                          handleClickSuspend(editTarget);
                        }}
                        className="w-full h-8 px-3 rounded-lg text-left text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Suspend Account
                      </button>
                    ) : editTarget.status === "SUSPENDED" ? (
                      <button
                        onClick={() => {
                          handleRestore(editTarget);
                          setEditTarget(null);
                        }}
                        className="w-full h-8 px-3 rounded-lg text-left text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Restore Account
                      </button>
                    ) : null
                  )}

                  {/* Archive */}
                  {isSuperAdmin && editTarget.role.name !== "super_admin" && editTarget.status === "SUSPENDED" && (
                    <button
                      onClick={() => {
                        handleArchive(editTarget);
                        setEditTarget(null);
                      }}
                      className="w-full h-8 px-3 rounded-lg text-left text-xs font-semibold text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive Account
                    </button>
                  )}

                  {/* Transfer Ownership */}
                  {isSuperAdmin && editTarget.role.name !== "super_admin" && (
                    <button
                      onClick={() => {
                        toast.info("Transfer Ownership", {
                          description: "To transfer platform ownership, please contact Support or execute the DB migrations directly. All teammate records (Leads, Clients) will remain preserved.",
                        });
                      }}
                      className="w-full h-8 px-3 rounded-lg text-left text-xs font-semibold text-neutral-600 hover:text-neutral-700 dark:text-neutral-400 bg-neutral-100 hover:bg-neutral-200/50 dark:bg-white/5 dark:hover:bg-white/8 border border-neutral-200/50 dark:border-white/5 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Transfer Ownership
                    </button>
                  )}
                </div>
              </div>

              {/* Access History Card */}
              <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4 flex-grow flex flex-col">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-[#8B5CF6]" />
                    Access History
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Audit log of permissions, roles, and administrative events for this user.
                  </p>
                </div>

                <div className="flex-grow bg-neutral-50/50 dark:bg-white/1 border border-neutral-100 dark:border-white/5 rounded-xl p-3 min-h-[180px]">
                  {auditLoading ? (
                    <div className="flex items-center justify-center h-full py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredAudits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/60 space-y-1">
                      <Activity className="w-6 h-6 stroke-[1.25px] opacity-40" />
                      <p className="text-[10px] font-semibold">No logs recorded</p>
                    </div>
                  ) : (
                    <div className="relative border-l border-neutral-200 dark:border-white/5 pl-3.5 space-y-3.5 py-1 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                      {filteredAudits.map((audit) => {
                        const date = new Date(audit.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        });
                        
                        let title = "";
                        let detail = "";
                        let dotColor = "bg-[#8B5CF6]";

                        switch (audit.action) {
                          case "ROLE_CHANGED":
                            title = "Role Changed";
                            const metaRole = audit.metadata as any;
                            detail = `${metaRole?.oldRole ?? "Unknown"} → ${metaRole?.newRole ?? "Unknown"}`;
                            dotColor = "bg-purple-500";
                            break;
                          case "ACCESS_UPDATED":
                            title = "Access Updated";
                            const metaAccess = audit.metadata as any;
                            const detailsList = [];
                            if (metaAccess?.newBrands && metaAccess.newBrands.length > 0) {
                              detailsList.push(`Brands: ${metaAccess.newBrands.join(", ")}`);
                            }
                            if (metaAccess?.newModules && metaAccess.newModules.length > 0) {
                              detailsList.push(`Modules: ${metaAccess.newModules.join(", ")}`);
                            }
                            if (metaAccess?.newDesignation) {
                              detailsList.push(`Designation: ${metaAccess.newDesignation}`);
                            }
                            detail = detailsList.join(" | ") || "Settings saved";
                            dotColor = "bg-blue-500";
                            break;
                          case "ACCOUNT_DEACTIVATED":
                            title = "Account Suspended";
                            dotColor = "bg-amber-500";
                            break;
                          case "ACCOUNT_RESTORED":
                            title = "Account Restored";
                            dotColor = "bg-emerald-500";
                            break;
                          case "ACCOUNT_ARCHIVED":
                            title = "Account Archived";
                            dotColor = "bg-red-500";
                            break;
                        }

                        return (
                          <div key={audit.id} className="relative space-y-0.5">
                            <div className={cn("absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full border border-white dark:border-[#07070B] shadow-sm", dotColor)} />
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-foreground leading-none">{title}</span>
                              <span className="text-[9px] text-muted-foreground/60 leading-none">{date}</span>
                            </div>
                            {detail && <p className="text-[9.5px] text-muted-foreground leading-normal mt-0.5">{detail}</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
