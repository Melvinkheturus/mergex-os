"use client";

import { useState } from "react";
import { ChevronLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { DbRole } from "./types";

// Hooks & Components
import { useRoleActions } from "./roles/hooks/use-role-actions";
import { CreateRoleCard } from "./roles/components/create-role-card";
import { RolesRegistryList } from "./roles/components/roles-registry-list";
import { RoleDetailsCard } from "./roles/components/role-details-card";
import { PermissionsWizard } from "./roles/components/permissions-wizard";

export function RolesSection() {
  const {
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
    saving,
    activeStep,
    setActiveStep,
    openAccordions,
    setOpenAccordions,
    activeRole,
    handleCreateRole,
    handleDeleteRole,
    toggleModule,
    toggleSubpage,
    togglePermission,
    handleSaveChanges,
    handleResetChanges,
    hasUnsavedChanges,
    getModuleState,
  } = useRoleActions();

  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<DbRole | null>(null);
  const [deletingRole, setDeletingRole] = useState(false);

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      {!editTarget ? (
        <>
          {/* Create Custom Role Card */}
          <CreateRoleCard
            newRoleTitle={newRoleTitle}
            setNewRoleTitle={setNewRoleTitle}
            newRoleDesc={newRoleDesc}
            setNewRoleDesc={setNewRoleDesc}
            creating={creating}
            onCreate={handleCreateRole}
          />

          {/* Roles Registry List Card */}
          <RolesRegistryList
            loading={loading}
            roles={roles}
            onSelect={(r) => {
              setEditTarget(r);
              setSelectedRoleId(r.id);
            }}
            onDelete={(r) => setDeleteConfirmTarget(r)}
          />
        </>
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
            {/* Left Column: Role Details & Actions */}
            <RoleDetailsCard
              editTarget={editTarget}
              saving={saving}
              checkedPermissionsSize={checkedPermissions.size}
              hasUnsavedChanges={hasUnsavedChanges()}
              onReset={handleResetChanges}
              onSave={handleSaveChanges}
              onDelete={(r) => setDeleteConfirmTarget(r)}
            />

            {/* Right Column: Step-by-step Permissions Form */}
            <PermissionsWizard
              editTarget={editTarget}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              checkedPermissions={checkedPermissions}
              saving={saving}
              openAccordions={openAccordions}
              setOpenAccordions={setOpenAccordions}
              togglePermission={togglePermission}
              toggleModule={toggleModule}
              toggleSubpage={toggleSubpage}
              getModuleState={getModuleState}
              hasUnsavedChanges={hasUnsavedChanges()}
              onSave={handleSaveChanges}
            />
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteConfirmTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-sm font-bold text-foreground">
                  Delete Custom Role
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground leading-normal">
                  Are you sure you want to delete the custom role <span className="font-bold text-foreground">&ldquo;{deleteConfirmTarget?.label}&rdquo;</span>?
                  This action is permanent and cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Any permissions assigned to this custom template will be deleted. Ensure no active team members or pending invites are assigned to this role before proceeding.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteConfirmTarget(null)}
              disabled={deletingRole}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (!deleteConfirmTarget) return;
                setDeletingRole(true);
                try {
                  await handleDeleteRole(deleteConfirmTarget);
                } finally {
                  setDeletingRole(false);
                  setDeleteConfirmTarget(null);
                }
              }}
              disabled={deletingRole}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer font-bold"
            >
              {deletingRole ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Deleting…
                </>
              ) : (
                "Delete Role"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
