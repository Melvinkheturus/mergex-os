import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Teammate, DbRole, UserStatus } from "../../types";

export function useMemberActions(initialTeammates: Teammate[], currentUserRole?: string) {
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
  const [memberBrandModuleAccess, setMemberBrandModuleAccess] = useState<Record<string, string[]>>({});
  const [openBrandAccordions, setOpenBrandAccordions] = useState<Record<string, boolean>>({});
  const [modalBrandDropOpen, setModalBrandDropOpen] = useState(false);

  const isSuperAdmin = currentUserRoleState === "super_admin";
  const canEditAccess = isSuperAdmin || currentUserRoleState === "admin";

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
    setMemberBrandIds(t.brandAccess?.map((b: any) => b.id) ?? []);
    setMemberModuleAccess(t.moduleAccess ?? []);

    const bma: Record<string, string[]> = {};
    t.brandAccess?.forEach((b: any) => {
      bma[b.id] = b.moduleAccess ?? [];
    });
    setMemberBrandModuleAccess(bma);
    setOpenBrandAccordions({});
  };

  const handleSaveChanges = async (brandsList: any[]) => {
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
          brandModuleAccess: memberBrandModuleAccess,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save changes.");
        return;
      }

      const selectedRoleObj = dbRoles.find((r) => r.id === memberRoleId);
      const selectedBrandsObj = brandsList.filter((b) => memberBrandIds.includes(b.id));

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
                  moduleAccess: memberBrandModuleAccess[b.id] ?? [],
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

  const counts = {
    all: members.length,
    ACTIVE: members.filter((m) => m.status === "ACTIVE").length,
    SUSPENDED: members.filter((m) => m.status === "SUSPENDED").length,
    ARCHIVED: members.filter((m) => m.status === "ARCHIVED").length,
  };

  const filteredMembers =
    statusFilter === "all" ? members : members.filter((m) => m.status === statusFilter);

  return {
    members,
    dbRoles,
    currentUserRoleState,
    statusFilter,
    setStatusFilter,
    suspendTarget,
    setSuspendTarget,
    suspending,
    suspendCounts,
    setSuspendCounts,
    suspendCountsLoading,
    restoring,
    archiving,
    editTarget,
    setEditTarget,
    saving,
    auditLogs,
    auditLoading,
    memberEmployeeId,
    setMemberEmployeeId,
    memberDesignation,
    setMemberDesignation,
    memberRoleId,
    setMemberRoleId,
    memberBrandIds,
    setMemberBrandIds,
    memberModuleAccess,
    setMemberModuleAccess,
    memberBrandModuleAccess,
    setMemberBrandModuleAccess,
    openBrandAccordions,
    setOpenBrandAccordions,
    modalBrandDropOpen,
    setModalBrandDropOpen,
    isSuperAdmin,
    canEditAccess,
    handleRowClick,
    handleSaveChanges,
    handleClickSuspend,
    handleConfirmSuspend,
    handleRestore,
    handleArchive,
    counts,
    filteredMembers,
  };
}
