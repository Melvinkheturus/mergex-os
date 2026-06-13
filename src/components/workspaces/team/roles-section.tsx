"use client";

import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
            onDelete={handleDeleteRole}
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
              onDelete={handleDeleteRole}
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
    </div>
  );
}
