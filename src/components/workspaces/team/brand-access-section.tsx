"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, ChevronDown, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Teammate, Brand } from "./types";

interface BrandAccessSectionProps {
  teammates: Teammate[];
  brands: Brand[];
}

// Helper to get initials
function getInitials(t: { firstName: string | null; lastName: string | null; email: string }) {
  return ((t.firstName?.[0] ?? "") + (t.lastName?.[0] ?? t.email[0])).toUpperCase();
}

// ── Brand Access Dropdown per member ─────────────────────────────────────────
export function BrandAccessDropdown({
  member,
  brands,
  onSaved,
}: {
  member: Teammate;
  brands: Brand[];
  onSaved: (memberId: string, newBrandIds: string[]) => void;
}) {
  const isSuperAdmin = member.role.name === "super_admin";
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(
    member.brandAccess?.map((b) => b.id) ?? []
  );
  const [saving, setSaving] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keep internal state in sync with prop updates
  useEffect(() => {
    setSelected(member.brandAccess?.map((b) => b.id) ?? []);
  }, [member.brandAccess]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/team/members?id=${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandIds: selected }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to update brand access.");
        return;
      }
      onSaved(member.id, selected);
      toast.success("Brand access updated.");
      setOpen(false);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isSuperAdmin) {
    return (
      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">
        All Brands
      </span>
    );
  }

  const selectedNames = brands
    .filter((b) => selected.includes(b.id))
    .map((b) => b.name);

  return (
    <div ref={dropRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-1.5 h-8 px-3 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/8 text-[10px] font-semibold text-foreground hover:border-[#8B5CF6]/40 transition-colors cursor-pointer max-w-[180px] w-full text-left"
      >
        <span className={cn("truncate mr-1", selectedNames.length === 0 && "text-muted-foreground")}>
          {selectedNames.length === 0
            ? "No access"
            : selectedNames.length === brands.length
            ? "All brands"
            : selectedNames.join(", ")}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-40 top-full mt-1 right-0 min-w-[180px] bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="max-h-48 overflow-y-auto">
            {brands.map((b) => {
              const checked = selected.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggle(b.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      checked
                        ? "bg-[#8B5CF6] border-[#8B5CF6]"
                        : "border-neutral-300 dark:border-white/20 bg-transparent"
                    )}
                  >
                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <span className="truncate">{b.name}</span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-neutral-200 dark:border-white/8 px-3 py-2 flex justify-end">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-7 text-[10px] font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer px-3.5 rounded-lg"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Brand Access Component ──────────────────────────────────────────────
export function BrandAccessSection({ teammates, brands }: BrandAccessSectionProps) {
  const [members, setMembers] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team/members")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data as Teammate[]);
        else setMembers(teammates); // fallback to prop
      })
      .catch(() => {
        setMembers(teammates);
        toast.error("Failed to load brand access data.");
      })
      .finally(() => setLoading(false));
  }, [teammates]);

  const handleBrandAccessSaved = (memberId: string, newBrandIds: string[]) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              brandAccess: brands.filter((b) => newBrandIds.includes(b.id)),
            }
          : m
      )
    );
  };

  return (
    <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-4.5 h-4.5 text-[#8B5CF6]" />
          Brand Access
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Manage which brand workspaces each team member can access.
        </p>
      </div>

      {loading && members.length === 0 ? (
        <div className="space-y-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E]"
            >
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-2.5 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-7 w-32 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((t) => {
            const name = t.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : t.email;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={name}
                      className="h-8 w-8 rounded-lg object-cover border border-neutral-200 dark:border-white/6 shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-xs font-extrabold text-[#8B5CF6] shrink-0">
                      {getInitials(t)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate leading-none">{name}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate mt-1">{t.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="outline"
                    className="text-[9px] uppercase tracking-wider border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold hidden sm:flex"
                  >
                    {t.role.label}
                  </Badge>
                  <BrandAccessDropdown
                    member={t}
                    brands={brands}
                    onSaved={handleBrandAccessSaved}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50 italic pt-1">
        Super Admins have access to all brand workspaces. Changes take effect immediately.
      </p>
    </div>
  );
}
