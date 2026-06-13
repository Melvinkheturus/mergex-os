import React from "react";
import { Info, X, Loader2, Save } from "lucide-react";
import { DbRole } from "../../types";

interface RoleDetailsCardProps {
  editTarget: DbRole;
  saving: boolean;
  checkedPermissionsSize: number;
  hasUnsavedChanges: boolean;
  onReset: () => void;
  onSave: () => void;
  onDelete: (role: DbRole) => void;
}

export function RoleDetailsCard({
  editTarget,
  saving,
  checkedPermissionsSize,
  hasUnsavedChanges,
  onReset,
  onSave,
  onDelete,
}: RoleDetailsCardProps) {
  return (
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
              {checkedPermissionsSize} permission{checkedPermissionsSize !== 1 ? "s" : ""} selected.
            </p>
          </div>
        </div>

        {/* Save / Reset buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-white/5 justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={saving || !hasUnsavedChanges}
            className="h-8 px-4 rounded-xl text-xs font-semibold text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !hasUnsavedChanges}
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
              Irreversible operations.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onDelete(editTarget)}
              className="w-full h-8 px-3 rounded-lg text-left text-xs font-semibold text-red-500 hover:text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              Delete Custom Role
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
