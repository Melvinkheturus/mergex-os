"use client";

import { Users, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Teammate, Brand } from "./types";

// Hooks & Components
import { useMemberActions } from "./members/hooks/use-member-actions";
import { SuspendDialog } from "./members/components/suspend-dialog";
import { MemberCard } from "./members/components/member-card";
import { MemberEditForm } from "./members/components/member-edit-form";
import { AuditLogsList } from "./members/components/audit-logs-list";

interface MembersSectionProps {
  teammates: Teammate[];
  brands: Brand[];
  currentUserRole?: string;
}

export function MembersSection({ teammates: initialTeammates, brands, currentUserRole }: MembersSectionProps) {
  const {
    members,
    dbRoles,
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
  } = useMemberActions(initialTeammates, currentUserRole);

  const filterTabs: { key: "all" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "ACTIVE", label: `Active (${counts.ACTIVE})` },
    { key: "SUSPENDED", label: `Suspended (${counts.SUSPENDED})` },
    { key: "ARCHIVED", label: `Archived (${counts.ARCHIVED})` },
  ];

  return (
    <>
      <SuspendDialog
        suspendTarget={suspendTarget}
        onClose={() => {
          setSuspendTarget(null);
          setSuspendCounts(null);
        }}
        suspendCountsLoading={suspendCountsLoading}
        suspendCounts={suspendCounts}
        suspending={suspending}
        onConfirm={handleConfirmSuspend}
      />

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
            {filteredMembers.map((t) => (
              <MemberCard
                key={t.id}
                teammate={t}
                onClick={() => handleRowClick(t)}
                isSuperAdmin={isSuperAdmin}
                restoring={restoring}
                archiving={archiving}
                onSuspend={handleClickSuspend}
                onRestore={handleRestore}
                onArchive={handleArchive}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Edit view */
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
            {/* Left Card: Access Settings Form */}
            <MemberEditForm
              editTarget={editTarget}
              canEditAccess={canEditAccess}
              dbRoles={dbRoles}
              brands={brands}
              memberEmployeeId={memberEmployeeId}
              setMemberEmployeeId={setMemberEmployeeId}
              memberDesignation={memberDesignation}
              setMemberDesignation={setMemberDesignation}
              memberRoleId={memberRoleId}
              setMemberRoleId={setMemberRoleId}
              memberBrandIds={memberBrandIds}
              setMemberBrandIds={setMemberBrandIds}
              memberModuleAccess={memberModuleAccess}
              setMemberModuleAccess={setMemberModuleAccess}
              memberBrandModuleAccess={memberBrandModuleAccess}
              setMemberBrandModuleAccess={setMemberBrandModuleAccess}
              openBrandAccordions={openBrandAccordions}
              setOpenBrandAccordions={setOpenBrandAccordions}
              modalBrandDropOpen={modalBrandDropOpen}
              setModalBrandDropOpen={setModalBrandDropOpen}
              saving={saving}
              onCancel={() => setEditTarget(null)}
              onSave={() => handleSaveChanges(brands)}
            />

            {/* Right Column: Actions & History */}
            <div className="md:col-span-5 space-y-5 flex flex-col">
              {/* Member Actions Card */}
              <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-[#8B5CF6]" />
                    Member Actions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Perform administrative operations on this teammate's account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {/* Suspend/Restore */}
                  {editTarget.role.name !== "super_admin" && (
                    editTarget.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleClickSuspend(editTarget)}
                        className="w-full h-8 px-3 rounded-lg text-left text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
                      >
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
                      Archive Account
                    </button>
                  )}
                </div>
              </div>

              {/* Access History Audit Logs */}
              <AuditLogsList auditLoading={auditLoading} auditLogs={auditLogs} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
