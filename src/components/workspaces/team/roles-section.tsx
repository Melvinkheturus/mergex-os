"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Loader2,
  X,
  Plus,
  Save,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DbRole } from "./types";
import { PERMISSIONS, PermissionKey } from "@/lib/auth/permissions";

// Define local representation of modules and permissions mapping
interface PermissionDef {
  id: PermissionKey;
  label: string;
  description: string;
}

interface ModuleDef {
  id: string;
  label: string;
  description: string;
  permissions: PermissionDef[];
}

const MODULE_DEFINITIONS: ModuleDef[] = [
  {
    id: "CRM",
    label: "CRM Portal",
    description: "Leads pipeline, client meetings scheduling, and proposal generation.",
    permissions: [
      { id: "crm.leads.view", label: "View Leads", description: "View list and details of leads" },
      { id: "crm.leads.create", label: "Create Lead", description: "Add new leads into the pipeline" },
      { id: "crm.leads.edit", label: "Edit Lead", description: "Modify lead contact/status info" },
      { id: "crm.leads.delete", label: "Delete Lead", description: "Permanently delete lead files" },
      { id: "crm.leads.assign", label: "Assign Lead", description: "Assign leads to team members" },
      { id: "crm.leads.export", label: "Export Leads", description: "Download leads list as CSV" },
      { id: "crm.meetings.view", label: "View Meetings", description: "View upcoming/past schedule" },
      { id: "crm.meetings.create", label: "Schedule Meeting", description: "Add client meeting events" },
      { id: "crm.meetings.complete", label: "Resolve Meetings", description: "Mark meeting status completed" },
      { id: "crm.proposals.view", label: "View Proposals", description: "View sent and draft proposals" },
      { id: "crm.proposals.create", label: "Create Proposals", description: "Draft and generate new proposals" },
      { id: "crm.proposals.edit", label: "Edit Proposals", description: "Edit existing proposals" },
    ],
  },
  {
    id: "Clients",
    label: "Clients Database",
    description: "Organization listings, contact histories, and account summaries.",
    permissions: [
      { id: "clients.view", label: "View Clients", description: "View client profile directories" },
      { id: "clients.create", label: "Create Client", description: "Register new client firms/contacts" },
      { id: "clients.edit", label: "Edit Client", description: "Update client profile information" },
    ],
  },
  {
    id: "Documents",
    label: "Document Library",
    description: "Storage, organization, and distribution of file repositories.",
    permissions: [
      { id: "documents.view", label: "View Documents", description: "Read and download cataloged files" },
      { id: "documents.upload", label: "Upload Documents", description: "Upload raw files to storage" },
    ],
  },
  {
    id: "Projects",
    label: "Projects Tracking",
    description: "View delivery status, timelines, and execution summaries.",
    permissions: [
      { id: "projects.view", label: "View Projects", description: "Read project boards and timelines" },
    ],
  },
  {
    id: "Finance",
    label: "Finance Ledger",
    description: "Access transaction logs, invoice receipts, and cashflow stats.",
    permissions: [
      { id: "finance.view", label: "View Finance", description: "View reports and overall billing" },
    ],
  },
  {
    id: "Knowledge",
    label: "Knowledge Base",
    description: "Help document drafting, process publishing, and wiki entries.",
    permissions: [
      { id: "knowledge.view", label: "View Wiki", description: "Read knowledge base articles" },
      { id: "knowledge.create", label: "Create Article", description: "Draft standard operating manuals" },
      { id: "knowledge.edit", label: "Edit Articles", description: "Modify help pages details" },
      { id: "knowledge.publish", label: "Publish Wiki", description: "Approve draft pages to live wiki" },
    ],
  },
  {
    id: "Users",
    label: "Users & Security",
    description: "Internal teammate directories, system invites, and audit logs.",
    permissions: [
      { id: "users.view", label: "View Teammates", description: "List internal directory members" },
      { id: "users.invite", label: "Invite Users", description: "Send organization activation emails" },
      { id: "users.manage", label: "Control Accounts", description: "Suspend/restore/archive employees" },
      { id: "roles.manage", label: "Manage Roles", description: "Update roles mapping permissions" },
    ],
  },
  {
    id: "Settings",
    label: "System Settings",
    description: "Global site configs, integrations, and workspace parameters.",
    permissions: [
      { id: "settings.view", label: "View Settings", description: "Access platform dashboard settings" },
      { id: "settings.manage", label: "Modify Settings", description: "Change global variables and keys" },
    ],
  },
];

export function RolesSection() {
  const [roles, setRoles] = useState<DbRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<DbRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Mounted check (Next.js SSR safety)
  const [mounted, setMounted] = useState(false);

  // Custom role form state
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Permission selection state for active role
  const [checkedPermissions, setCheckedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Expanded state for modules advanced grid
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    loadRoles();
  }, []);

  const loadRoles = async (selectId?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/team/roles");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRoles(data);
        if (data.length > 0) {
          const nextSelect = selectId || data[0].id;
          setSelectedRoleId(nextSelect);
          const active = data.find((r) => r.id === nextSelect);
          if (active) {
            const initialPerms = new Set<string>(
              active.RolePermission?.map((rp: { permissionId: string }) => rp.permissionId) ?? []
            );
            setCheckedPermissions(initialPerms);
            // Go to inline edit view immediately if a custom role was just created
            if (selectId) {
              setEditTarget(active);
            }
          }
        }
      }
    } catch {
      toast.error("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find((r) => r.id === selectedRoleId);

  // Set checked permissions when changing selected role
  useEffect(() => {
    if (activeRole) {
      const initialPerms = new Set<string>(
        activeRole.RolePermission?.map((rp: { permissionId: string }) => rp.permissionId) ?? []
      );
      setCheckedPermissions(initialPerms);
    }
  }, [selectedRoleId, roles]);

  const handleCreateRole = async () => {
    if (!newRoleTitle.trim() || !newRoleDesc.trim()) return;
    if (roles.some((r) => r.label.toLowerCase() === newRoleTitle.toLowerCase().trim())) {
      toast.error("A role with this name already exists.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/team/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newRoleTitle.trim(),
          description: newRoleDesc.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create custom role.");
        return;
      }

      toast.success("Custom role created!", {
        description: `"${data.label}" has been registered successfully.`,
      });
      setNewRoleTitle("");
      setNewRoleDesc("");
      // Reload and automatically select/open the new role
      await loadRoles(data.id);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (role: DbRole) => {
    if (role.isSystem) {
      toast.error("Cannot delete system roles.");
      return;
    }

    try {
      const res = await fetch(`/api/team/roles?id=${role.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete role.");
        return;
      }

      toast.success("Role deleted", {
        description: `"${role.label}" removed from organizational registry.`,
      });
      setEditTarget(null);
      // Load and select the first remaining role
      await loadRoles();
    } catch {
      toast.error("Network error — please try again.");
    }
  };

  // ── Permission Toggle Logic ──────────────────────────────────────────────────
  const getModuleState = (mod: ModuleDef) => {
    const total = mod.permissions.length;
    const checkedCount = mod.permissions.filter((p) => checkedPermissions.has(p.id)).length;

    if (checkedCount === 0) return "unchecked";
    if (checkedCount === total) return "checked";
    return "indeterminate";
  };

  const toggleModule = (mod: ModuleDef) => {
    const state = getModuleState(mod);
    const updated = new Set(checkedPermissions);

    if (state === "checked") {
      // Uncheck all in this module
      mod.permissions.forEach((p) => updated.delete(p.id));
    } else {
      // Check all in this module
      mod.permissions.forEach((p) => updated.add(p.id));
    }
    setCheckedPermissions(updated);
  };

  const togglePermission = (id: PermissionKey) => {
    const updated = new Set(checkedPermissions);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setCheckedPermissions(updated);
  };

  const toggleExpandModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/team/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: selectedRoleId,
          permissions: Array.from(checkedPermissions),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save permissions.");
        return;
      }

      toast.success("Role permissions updated!", {
        description: `Propagated updates instantly to all assigned team members.`,
      });

      setEditTarget(null);

      // Reload roles list to sync internal state
      await loadRoles(selectedRoleId);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetChanges = () => {
    if (activeRole) {
      const initialPerms = new Set<string>(
        activeRole.RolePermission?.map((rp: { permissionId: string }) => rp.permissionId) ?? []
      );
      setCheckedPermissions(initialPerms);
      toast.info("Permissions reset to original state.");
    }
  };

  const hasUnsavedChanges = () => {
    if (!activeRole) return false;
    const dbPerms = new Set<string>(
      activeRole.RolePermission?.map((rp: { permissionId: string }) => rp.permissionId) ?? []
    );
    if (dbPerms.size !== checkedPermissions.size) return true;
    for (const p of Array.from(checkedPermissions)) {
      if (!dbPerms.has(p)) return true;
    }
    return false;
  };

  return (
    <div className="space-y-5">
      {!editTarget ? (
        <>
          {/* Create Custom Role Card (Separate top card like invitations tab) */}
          <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#8B5CF6]" />
                Create Custom Role
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Define a new security template with custom administrative access controls.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Role Title</Label>
                <Input
                  placeholder="e.g. Sales Director"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-400">Description</Label>
                <Input
                  placeholder="e.g. Lead pipelines & closing metrics"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                size="sm"
                onClick={handleCreateRole}
                disabled={creating || !newRoleTitle.trim() || !newRoleDesc.trim()}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold cursor-pointer h-9 px-5 rounded-lg disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Creating…</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Role</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Roles Registry List Card (Separate bottom card like invitations tab) */}
          <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#8B5CF6]" />
                Roles Registry
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Browse and configure organizational access clearances.
              </p>
            </div>

            {loading && roles.length === 0 ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E]"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm hover:border-neutral-300 dark:hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-foreground truncate leading-none">
                            {r.label}
                          </p>
                          {r.isSystem ? (
                            <Badge
                              variant="outline"
                              className="text-[7.5px] uppercase tracking-wider border-[#8B5CF6]/25 text-[#8B5CF6] bg-[#8B5CF6]/3 font-extrabold px-1.5 py-0 rounded"
                            >
                              System
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[7.5px] uppercase tracking-wider border-amber-500/25 text-amber-600 bg-amber-500/3 font-extrabold px-1.5 py-0 rounded"
                            >
                              Custom
                            </Badge>
                          )}
                        </div>
                        {r.description && (
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5 leading-relaxed">
                            {r.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setEditTarget(r);
                          setSelectedRoleId(r.id);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 h-8 text-[10px] font-bold border border-neutral-200 dark:border-white/8 text-foreground hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] hover:border-[#8B5CF6]/20 transition-all rounded-lg px-3.5 cursor-pointer bg-white dark:bg-black/20"
                      >
                        Select Permissions
                      </button>

                      {!r.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(r)}
                          className="inline-flex items-center justify-center h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-lg cursor-pointer border border-transparent hover:border-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
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
              Back to Roles Registry
            </button>
            <Badge variant="outline" className={cn(
              "text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5",
              editTarget.isSystem
                ? "border-[#8B5CF6]/20 text-[#8B5CF6] bg-[#8B5CF6]/5"
                : "border-amber-500/20 text-amber-600 bg-amber-500/5"
            )}>
              {editTarget.isSystem ? "System Baseline" : "Custom Template"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5.5">
            {/* Left Column: Permissions Matrix */}
            <div className="md:col-span-8 glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#8B5CF6]" />
                  Role Permissions
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure fine-grained module access and user capabilities for this role template.
                </p>
              </div>

              {editTarget.isSystem && (
                <div className="flex items-start gap-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Note:</strong> Modifying permissions for this system role template will immediately update security clearances for all users bound to this role across your organization divisions.
                  </span>
                </div>
              )}

              {/* Module Matrix List */}
              <div className="space-y-2.5">
                {MODULE_DEFINITIONS.map((mod) => {
                  const state = getModuleState(mod);
                  const isExpanded = expandedModules[mod.id] ?? false;

                  return (
                    <div
                      key={mod.id}
                      className={cn(
                        "border rounded-xl transition-all overflow-hidden shadow-xs",
                        state === "checked"
                          ? "border-neutral-200 dark:border-white/8 bg-neutral-50/20 dark:bg-white/1"
                          : state === "indeterminate"
                          ? "border-neutral-200 dark:border-white/8 bg-[#8B5CF6]/0.5 dark:bg-[#8B5CF6]/1"
                          : "border-neutral-100 dark:border-white/3 bg-transparent opacity-85"
                      )}
                    >
                      {/* Module Row */}
                      <div className="flex items-center justify-between p-3 select-none">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Toggle Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleModule(mod)}
                            className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0",
                              state === "checked"
                                ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                                : state === "indeterminate"
                                ? "bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#8B5CF6]"
                                : "border-neutral-300 dark:border-white/20 hover:border-neutral-400"
                            )}
                          >
                            {state === "checked" && <Check className="w-3 h-3 stroke-[3]" />}
                            {state === "indeterminate" && (
                              <span className="w-1.5 h-0.5 bg-[#8B5CF6] rounded" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground leading-tight flex items-center gap-1.5">
                              {mod.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground/75 leading-none mt-1 hidden sm:block truncate max-w-[400px]">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        {/* Expand Capabilities Option */}
                        <button
                          type="button"
                          onClick={() => toggleExpandModule(mod.id)}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-semibold px-2.5 py-1 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Advanced</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-neutral-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-neutral-400" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Advanced Controls */}
                      {isExpanded && (
                        <div className="border-t border-neutral-200 dark:border-white/5 bg-neutral-100/30 dark:bg-black/20 p-3.5">
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {mod.permissions.map((p) => {
                              const checked = checkedPermissions.has(p.id);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => togglePermission(p.id)}
                                  className={cn(
                                    "flex items-start gap-2.5 p-2.5 border rounded-lg transition-all cursor-pointer text-left h-full shadow-xs hover:translate-y-[-1px]",
                                    checked
                                      ? "bg-white dark:bg-[#0A0A0E] border-[#8B5CF6]/30"
                                      : "bg-transparent border-neutral-200/50 dark:border-white/3 hover:border-neutral-300 dark:hover:border-white/8"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0 mt-0.5",
                                      checked
                                        ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                                        : "border-neutral-300 dark:border-white/20"
                                    )}
                                  >
                                    {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-[10.5px] font-bold text-foreground block leading-tight">
                                      {p.label}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground/75 leading-tight block mt-0.5">
                                      {p.description}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Role Details & Actions */}
            <div className="md:col-span-4 space-y-5 flex flex-col">
              {/* Role Info Card */}
              <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-[#8B5CF6]" />
                    Role Details
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Metadata and access template summary for this role.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Title</span>
                    <p className="text-xs font-bold text-foreground">{editTarget.label}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Description</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {editTarget.description || "No description provided."}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 dark:border-white/5">
                    <p className="text-[10px] text-muted-foreground italic">
                      {checkedPermissions.size} permission{checkedPermissions.size !== 1 ? "s" : ""} selected.
                    </p>
                  </div>
                </div>

                {/* Save / Reset buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-white/5 justify-end">
                  <button
                    type="button"
                    onClick={handleResetChanges}
                    disabled={saving || !hasUnsavedChanges()}
                    className="h-8 px-4 rounded-xl text-xs font-semibold text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={saving || !hasUnsavedChanges()}
                    className="h-8 px-4 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#8B5CF6]/15 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Card (Danger Zone / Delete) */}
              {!editTarget.isSystem && (
                <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Danger Zone
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Irreversible administrative operations.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(editTarget)}
                      className="w-full h-8 px-3 rounded-lg text-left text-xs font-semibold text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      Delete Custom Role
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
