"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Lock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MODULE_DEFINITIONS } from "../../roles/components/module-definitions";
import { DbRole } from "../../types";

interface PermissionOverridesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: DbRole | undefined;
  overrides: string[];
  onChange: (overrides: string[]) => void;
  canEditAccess: boolean;
}

export function PermissionOverridesModal({
  open,
  onOpenChange,
  selectedRole,
  overrides,
  onChange,
  canEditAccess,
}: PermissionOverridesModalProps) {
  // Helpers to check status
  const getPermissionState = (permId: string) => {
    if (overrides.includes("+" + permId)) return "allow";
    if (overrides.includes("-" + permId)) return "deny";
    // Fallback support for legacy non-prefixed overrides (treated as allow)
    if (overrides.includes(permId)) return "allow";
    return "inherit";
  };

  const isRolePermissionAllowed = (permId: string) => {
    // If it's a super admin, they have all permissions baseline
    if (selectedRole?.name === "super_admin") return true;
    return selectedRole?.RolePermission?.some((rp) => rp.permissionId === permId) ?? false;
  };

  const handleStateChange = (permId: string, newState: "allow" | "deny" | "inherit") => {
    if (!canEditAccess) return;

    let updated = overrides.filter(
      (o) => o !== permId && o !== "+" + permId && o !== "-" + permId
    );

    if (newState === "allow") {
      updated.push("+" + permId);
    } else if (newState === "deny") {
      updated.push("-" + permId);
    }

    onChange(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/5 rounded-2xl">
        <DialogHeader className="p-5 border-b border-neutral-100 dark:border-white/5 shrink-0 flex flex-col gap-1.5">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#8B5CF6]" />
            Configure Permission Overrides
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground max-w-2xl leading-normal">
            Custom overrides take precedence over the role baseline. Use them to grant extra permissions or restrict specific capabilities for this teammate.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-5 overflow-y-auto">
          <div className="space-y-6">
            {MODULE_DEFINITIONS.map((mod) => {
              return (
                <div
                  key={mod.id}
                  className="border border-neutral-100 dark:border-white/5 rounded-xl overflow-hidden bg-neutral-50/20 dark:bg-white/0.5"
                >
                  {/* Module Header */}
                  <div className="bg-neutral-50 dark:bg-white/1 px-4 py-2.5 border-b border-neutral-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground tracking-wide uppercase">
                      {mod.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {mod.permissions.length} actions
                    </span>
                  </div>

                  {/* Permissions List */}
                  <div className="divide-y divide-neutral-100 dark:divide-white/3">
                    {mod.permissions.map((perm) => {
                      const state = getPermissionState(perm.id);
                      const isAllowedByRole = isRolePermissionAllowed(perm.id);

                      // Calculate effective permission state
                      const isEffectiveAllowed =
                        state === "allow"
                          ? true
                          : state === "deny"
                          ? false
                          : isAllowedByRole;

                      return (
                        <div
                          key={perm.id}
                          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/30 dark:hover:bg-white/0.5 transition-colors"
                        >
                          {/* Left: Metadata */}
                          <div className="space-y-1 min-w-0 max-w-md">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">
                                {perm.label}
                              </span>
                              
                              {/* Effective Status Badge */}
                              {isEffectiveAllowed ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-green-500/10 dark:bg-green-500/5 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md border border-green-500/10">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Allowed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-neutral-100 dark:bg-white/5 text-muted-foreground px-2 py-0.5 rounded-md border border-neutral-200 dark:border-white/5">
                                  <Lock className="w-2.5 h-2.5" />
                                  Blocked
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-normal">
                              {perm.description}
                            </p>
                          </div>

                          {/* Right: Segmented Button Control */}
                          <div className="flex items-center shrink-0">
                            <div className="inline-flex rounded-lg bg-neutral-100 dark:bg-white/5 p-1 border border-neutral-200 dark:border-white/5">
                              {/* Option: Inherit */}
                              <button
                                type="button"
                                disabled={!canEditAccess}
                                onClick={() => handleStateChange(perm.id, "inherit")}
                                className={`h-7 px-3 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                  state === "inherit"
                                    ? "bg-white dark:bg-white/10 text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                Inherit ({isAllowedByRole ? "Allow" : "Deny"})
                              </button>

                              {/* Option: Allow */}
                              <button
                                type="button"
                                disabled={!canEditAccess}
                                onClick={() => handleStateChange(perm.id, "allow")}
                                className={`h-7 px-3 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                  state === "allow"
                                    ? "bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                Grant (+)
                              </button>

                              {/* Option: Deny */}
                              <button
                                type="button"
                                disabled={!canEditAccess}
                                onClick={() => handleStateChange(perm.id, "deny")}
                                className={`h-7 px-3 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                  state === "deny"
                                    ? "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                Restrict (-)
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/1 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Configured {overrides.length} override{overrides.length === 1 ? "" : "s"} for this user.</span>
          </div>
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold px-4 h-8 rounded-lg cursor-pointer"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
