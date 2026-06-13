import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { DbRole } from "../../types";
import { PermissionKey } from "@/lib/auth/permissions";

export interface PermissionDef {
  id: PermissionKey;
  label: string;
  description: string;
}

export interface ModuleDef {
  id: string;
  label: string;
  description: string;
  permissions: PermissionDef[];
}

export function useRoleActions() {
  const [roles, setRoles] = useState<DbRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<DbRole | null>(null);
  const [loading, setLoading] = useState(true);
  // `mounted` tracks hydration without triggering a re-render
  const mountedRef = useRef(false);
  const mounted = mountedRef.current;

  // Custom role form state
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Permission selection state for active role
  const [checkedPermissions, setCheckedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Declare loadRoles before the effect that calls it
  const loadRoles = useCallback(async (selectId?: string) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadRoles();
  }, [loadRoles]);

  const activeRole = roles.find((r) => r.id === selectedRoleId);

  useEffect(() => {
    if (activeRole) {
      const initialPerms = new Set<string>(
        activeRole.RolePermission?.map((rp: { permissionId: string }) => rp.permissionId) ?? []
      );
      // These setStates are synchronous but intentional: we want a clean
      // permission slate each time the active role changes.
      setCheckedPermissions(initialPerms);
      setActiveStep(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await loadRoles();
    } catch {
      toast.error("Network error — please try again.");
    }
  };

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
      mod.permissions.forEach((p) => updated.delete(p.id));
    } else {
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

  return {
    roles,
    selectedRoleId,
    setSelectedRoleId,
    editTarget,
    setEditTarget,
    loading,
    mounted,
    newRoleTitle,
    setNewRoleTitle,
    newRoleDesc,
    setNewRoleDesc,
    creating,
    checkedPermissions,
    setCheckedPermissions,
    saving,
    activeStep,
    setActiveStep,
    openAccordions,
    setOpenAccordions,
    expandedModules,
    setExpandedModules,
    activeRole,
    handleCreateRole,
    handleDeleteRole,
    toggleModule,
    togglePermission,
    toggleExpandModule,
    handleSaveChanges,
    handleResetChanges,
    hasUnsavedChanges,
    getModuleState,
  };
}
