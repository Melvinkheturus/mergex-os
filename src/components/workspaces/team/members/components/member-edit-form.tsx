import React, { useRef, useEffect } from "react";
import { Mail, Settings, ChevronDown, ChevronRight, X, Check, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Teammate, DbRole, Brand } from "../../types";

const AVAILABLE_MODULES = [
  { id: "CRM", label: "CRM (Leads, Pipelines)" },
  { id: "Clients", label: "Clients Manager" },
  { id: "Documents", label: "Documents & Proposals" },
  { id: "Knowledge", label: "Knowledge Base" },
];

interface MemberEditFormProps {
  editTarget: Teammate;
  canEditAccess: boolean;
  dbRoles: DbRole[];
  brands: Brand[];
  memberEmployeeId: string;
  setMemberEmployeeId: (v: string) => void;
  memberDesignation: string;
  setMemberDesignation: (v: string) => void;
  memberRoleId: string;
  setMemberRoleId: (v: string) => void;
  memberBrandIds: string[];
  setMemberBrandIds: React.Dispatch<React.SetStateAction<string[]>>;
  memberModuleAccess: string[];
  setMemberModuleAccess: (v: string[]) => void;
  memberBrandModuleAccess: Record<string, string[]>;
  setMemberBrandModuleAccess: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  openBrandAccordions: Record<string, boolean>;
  setOpenBrandAccordions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  modalBrandDropOpen: boolean;
  setModalBrandDropOpen: React.Dispatch<React.SetStateAction<boolean>>;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function MemberEditForm({
  editTarget,
  canEditAccess,
  dbRoles,
  brands,
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
  saving,
  onCancel,
  onSave,
}: MemberEditFormProps) {
  const modalBrandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalBrandRef.current && !modalBrandRef.current.contains(e.target as Node)) {
        setModalBrandDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setModalBrandDropOpen]);

  const name = editTarget.firstName ? `${editTarget.firstName} ${editTarget.lastName ?? ""}`.trim() : editTarget.email;

  return (
    <div className="md:col-span-7 glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-[#8B5CF6]" />
          Access Settings
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Configure role, designation, brand access, and active module permissions for {name}.
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

      {/* Brand-Wise Module Access Accordions */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase text-muted-foreground block">
          Brand-Wise Module Access
        </Label>

        {memberBrandIds.length === 0 ? (
          <div className="text-center p-4 border border-dashed border-neutral-200 dark:border-white/6 rounded-xl bg-neutral-50/10 dark:bg-white/0.5">
            <span className="text-xs text-muted-foreground font-medium">
              Assign brand access above to configure brand-wise modules
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {brands
              .filter((b) => memberBrandIds.includes(b.id))
              .map((b) => {
                const isOpen = openBrandAccordions[b.id] ?? false;
                const activeModules = memberBrandModuleAccess[b.id] ?? [];

                return (
                  <div
                    key={b.id}
                    className="border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] overflow-hidden shadow-xs"
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => {
                        setOpenBrandAccordions((prev) => ({
                          ...prev,
                          [b.id]: !isOpen,
                        }));
                      }}
                      className="flex items-center justify-between p-3 select-none cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-white/1 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                          {b.name}
                        </span>
                        <span className="text-[9px] text-[#8B5CF6] font-bold">
                          ({activeModules.length} active)
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Configure Modules
                      </span>
                    </div>

                    {/* Accordion Content */}
                    {isOpen && (
                      <div className="p-3 border-t border-neutral-100 dark:border-white/5 bg-neutral-50/10 dark:bg-black/10">
                        <div className="grid grid-cols-2 gap-2">
                          {AVAILABLE_MODULES.map((mod) => {
                            const selected = activeModules.includes(mod.id);
                            return (
                              <button
                                key={mod.id}
                                type="button"
                                onClick={() => {
                                  if (!canEditAccess) return;
                                  setMemberBrandModuleAccess((prev) => {
                                    const current = prev[b.id] ?? [];
                                    const updated = current.includes(mod.id)
                                      ? current.filter((m) => m !== mod.id)
                                      : [...current, mod.id];
                                    return {
                                      ...prev,
                                      [b.id]: updated,
                                    };
                                  });
                                }}
                                disabled={!canEditAccess}
                                className={cn(
                                  "flex items-center gap-2 p-2.5 border rounded-lg transition-all text-left text-[11px] font-bold",
                                  canEditAccess ? "cursor-pointer" : "cursor-not-allowed opacity-75",
                                  selected
                                    ? "bg-[#8B5CF6]/5 border-[#8B5CF6]/30 text-[#8B5CF6]"
                                    : "bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6 text-foreground hover:border-neutral-300 dark:hover:border-white/12"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0",
                                    selected
                                      ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                                      : "border-neutral-300 dark:border-white/20"
                                  )}
                                >
                                  {selected && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                                </div>
                                <span className="truncate">{mod.label}</span>
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

      {/* Save / Cancel Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-white/5 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-8.5 px-4 rounded-xl text-xs font-semibold text-neutral-500 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        {canEditAccess && (
          <button
            type="button"
            onClick={onSave}
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
  );
}
