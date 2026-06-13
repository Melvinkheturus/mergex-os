import React from "react";
import { ChevronLeft, ChevronRight, Check, Loader2, Info, ShieldCheck, Save, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModuleDef } from "../hooks/use-role-actions";
import { DbRole } from "../../types";
import { MODULE_DEFINITIONS, STEPS } from "./module-definitions";
import { PermissionKey } from "@/lib/auth/permissions";

interface PermissionsWizardProps {
  editTarget: DbRole;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  checkedPermissions: Set<string>;
  saving: boolean;
  openAccordions: Record<string, boolean>;
  setOpenAccordions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  togglePermission: (id: PermissionKey) => void;
  toggleModule: (mod: ModuleDef) => void;
  getModuleState: (mod: ModuleDef) => "checked" | "unchecked" | "indeterminate";
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

export function PermissionsWizard({
  editTarget,
  activeStep,
  setActiveStep,
  checkedPermissions,
  saving,
  openAccordions,
  setOpenAccordions,
  togglePermission,
  toggleModule,
  getModuleState,
  hasUnsavedChanges,
  onSave,
}: PermissionsWizardProps) {
  return (
    <div className="md:col-span-8 flex flex-col gap-4">
      {/* Stepper Progress bar */}
      <div className="grid grid-cols-4 gap-2 border border-neutral-200 dark:border-white/5 bg-neutral-50/20 dark:bg-white/1 rounded-2xl p-3 shadow-sm">
        {STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={cn(
                "flex flex-col items-center sm:items-start text-center sm:text-left p-2.5 rounded-xl border transition-all cursor-pointer relative",
                isActive
                  ? "bg-white dark:bg-[#0A0A0E] border-[#8B5CF6]/35 shadow-xs"
                  : isCompleted
                  ? "bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/5 opacity-80"
                  : "bg-transparent border-transparent opacity-60 hover:opacity-80"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all shrink-0",
                    isActive
                      ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                      : isCompleted
                      ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]"
                      : "border-neutral-300 dark:border-white/20 text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : step.id}
                </span>
                <span className="text-[10px] font-bold text-foreground hidden sm:inline truncate max-w-[100px]">
                  {step.name}
                </span>
              </div>
              <span className="text-[8px] text-muted-foreground mt-1 hidden md:inline truncate max-w-[120px]">
                {step.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step content card */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 flex-1 flex flex-col justify-between min-h-[400px]">
        <div className="space-y-4">
          {/* Step 1: Enterprise Scope */}
          {activeStep === 1 && (() => {
            const orgModule = MODULE_DEFINITIONS.find((m) => m.id === "Organization");
            return (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Enterprise Scope</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Top-level administrative permissions governing workspace directories, team access, and org-wide settings.
                  </p>
                </div>

                {editTarget.isSystem && (
                  <div className="flex items-start gap-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Note:</strong> Modifying system baseline roles propagates clearances instantly to all bound users organization-wide.
                    </span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  {orgModule?.permissions.map((p) => {
                    const checked = checkedPermissions.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={cn(
                          "flex items-start gap-2.5 p-3.5 border rounded-xl transition-all cursor-pointer text-left h-full shadow-xs hover:-translate-y-px",
                          checked
                            ? "bg-white dark:bg-[#0A0A0E] border-[#8B5CF6]/35 bg-linear-to-t from-[#8B5CF6]/5 via-white/5 to-white"
                            : "bg-transparent border-neutral-200/50 dark:border-white/3 hover:border-neutral-300 dark:hover:border-white/8"
                        )}
                      >
                        <span
                          className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 mt-0.5",
                            checked
                              ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                              : "border-neutral-300 dark:border-white/20"
                          )}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-foreground block leading-tight">
                            {p.label}
                          </span>
                          <span className="text-[9.5px] text-muted-foreground/75 leading-tight block mt-1.5">
                            {p.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Step 2: Workspace Scope */}
          {activeStep === 2 && (() => {
            const adminModules = MODULE_DEFINITIONS.filter((m) => m.id === "Users" || m.id === "Settings");
            return (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Workspace Scope</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure administrative options for local workspace settings, user access, and role permissions.
                  </p>
                </div>

                <div className="space-y-4.5 pt-1">
                  {adminModules.map((mod) => (
                    <div key={mod.id} className="space-y-2">
                      <h5 className="text-[10px] font-bold text-[#8B5CF6] tracking-wider uppercase">{mod.label}</h5>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {mod.permissions.map((p) => {
                          const checked = checkedPermissions.has(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => togglePermission(p.id)}
                              className={cn(
                                "flex items-start gap-2.5 p-3.5 border rounded-xl transition-all cursor-pointer text-left h-full shadow-xs hover:-translate-y-px",
                                checked
                                  ? "bg-white dark:bg-[#0A0A0E] border-[#8B5CF6]/35 bg-linear-to-t from-[#8B5CF6]/5 via-white/5 to-white"
                                  : "bg-transparent border-neutral-200/50 dark:border-white/3 hover:border-neutral-300 dark:hover:border-white/8"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 mt-0.5",
                                  checked
                                    ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                                    : "border-neutral-300 dark:border-white/20"
                                )}
                              >
                                {checked && <Check className="w-3 h-3 stroke-[2.5]" />}
                              </span>
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-foreground block leading-tight">
                                  {p.label}
                                </span>
                                <span className="text-[9.5px] text-muted-foreground/75 leading-tight block mt-1.5">
                                  {p.description}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Step 3: Feature Toggles */}
          {activeStep === 3 && (() => {
            const functionalModules = MODULE_DEFINITIONS.filter(
              (m) => m.id !== "Organization" && m.id !== "Users" && m.id !== "Settings"
            );
            return (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Feature Toggles</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Activate or deactivate operational feature modules. Toggling off a module removes all related capabilities.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                  {functionalModules.map((mod) => {
                    const state = getModuleState(mod);
                    const isEnabled = state === "checked" || state === "indeterminate";

                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => toggleModule(mod)}
                        className={cn(
                          "flex items-start gap-3 p-4 border rounded-xl transition-all cursor-pointer text-left h-full shadow-xs hover:-translate-y-px",
                          isEnabled
                            ? "bg-white dark:bg-[#0A0A0E] border-[#8B5CF6]/35 bg-linear-to-t from-[#8B5CF6]/5 via-white/5 to-white"
                            : "bg-transparent border-neutral-200/50 dark:border-white/3 hover:border-neutral-300 dark:hover:border-white/8 opacity-80"
                        )}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                            isEnabled
                              ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]"
                              : "border-neutral-200 dark:border-white/5 text-muted-foreground"
                          )}
                        >
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11.5px] font-bold text-foreground leading-tight">
                              {mod.label}
                            </span>
                            <span
                              className={cn(
                                "w-7 h-4 rounded-full flex items-center p-0.5 transition-colors shrink-0",
                                isEnabled ? "bg-[#8B5CF6] justify-end" : "bg-neutral-200 dark:bg-white/10 justify-start"
                              )}
                            >
                              <span className="w-3 h-3 rounded-full bg-white shadow-sm" />
                            </span>
                          </div>
                          <p className="text-[9.5px] text-muted-foreground mt-1.5 leading-relaxed">
                            {mod.description}
                          </p>
                          {isEnabled && (
                            <span className="inline-flex text-[8px] font-bold uppercase tracking-wider text-[#8B5CF6] mt-2">
                              {mod.permissions.filter((p) => checkedPermissions.has(p.id)).length} of {mod.permissions.length} active
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Step 4: Granular Access */}
          {activeStep === 4 && (() => {
            const functionalModules = MODULE_DEFINITIONS.filter(
              (m) => m.id !== "Organization" && m.id !== "Users" && m.id !== "Settings"
            );
            const activeFunctionalModules = functionalModules.filter((mod) => {
              const state = getModuleState(mod);
              return state === "checked" || state === "indeterminate";
            });

            return (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Granular Access</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fine-tune specific read/write capabilities for each active feature module.
                  </p>
                </div>

                {activeFunctionalModules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-neutral-300 dark:border-white/10 rounded-2xl bg-neutral-50/10 dark:bg-white/0.5 space-y-3 mt-2">
                    <Info className="w-6 h-6 text-neutral-400" />
                    <div>
                      <h5 className="text-[11.5px] font-bold text-foreground">No active feature modules</h5>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Go back to Step 3 and enable at least one operational module (like CRM Portal or Document Library) to customize its capabilities.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="h-7 px-3 text-[10px] font-bold text-[#8B5CF6] border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 hover:bg-[#8B5CF6]/15 rounded-lg transition-all cursor-pointer"
                    >
                      Go back to Step 3
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 no-scrollbar pt-1">
                    {activeFunctionalModules.map((mod) => {
                      const isOpen = openAccordions[mod.id] ?? true;
                      return (
                        <div
                          key={mod.id}
                          className="border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] overflow-hidden shadow-xs"
                        >
                          {/* Accordion Header */}
                          <div
                            onClick={() => {
                              setOpenAccordions((prev) => ({
                                ...prev,
                                [mod.id]: !isOpen,
                              }));
                            }}
                            className="flex items-center justify-between p-3.5 select-none cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-white/1 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                              )}
                              <h5 className="text-[10px] font-bold text-[#8B5CF6] tracking-wider uppercase">
                                {mod.label}
                              </h5>
                              <span className="text-[9px] text-muted-foreground/60">
                                ({mod.permissions.filter((p) => checkedPermissions.has(p.id)).length} of {mod.permissions.length} active)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleModule(mod);
                              }}
                              className="text-[9px] font-bold text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                            >
                              Disable Module
                            </button>
                          </div>

                          {/* Accordion Content */}
                          {isOpen && (
                            <div className="p-4 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/10 dark:bg-black/10">
                              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {mod.permissions.map((p) => {
                                  const checked = checkedPermissions.has(p.id);
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => togglePermission(p.id)}
                                      className={cn(
                                        "flex items-start gap-2.5 p-2.5 border rounded-lg transition-all cursor-pointer text-left h-full shadow-xs hover:-translate-y-px",
                                        checked
                                          ? "bg-white dark:bg-[#0A0A0E] border-[#8B5CF6]/35"
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
                                        {checked && <Check className="w-2.5 h-2.5 stroke-3" />}
                                      </span>
                                      <div className="min-w-0">
                                        <span className="text-[10px] font-bold text-foreground block leading-tight">
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
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer Navigation buttons */}
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-white/5 pt-4 mt-6">
          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="inline-flex items-center gap-1.5 h-9 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl px-4 cursor-pointer disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-2">
            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
                className="inline-flex items-center gap-1.5 h-9 text-xs font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl px-5 cursor-pointer shadow-md shadow-[#8B5CF6]/15 transition-all"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSave}
                disabled={saving || !hasUnsavedChanges}
                className="inline-flex items-center gap-1.5 h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 cursor-pointer shadow-md shadow-emerald-600/15 disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save &amp; Complete</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
