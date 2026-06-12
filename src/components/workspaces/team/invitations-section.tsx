"use client";

import { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  Mail,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brand, DbRole, PendingInvite } from "./types";

interface InvitationsSectionProps {
  brands: Brand[];
}

export function InvitationsSection({ brands }: { brands: Brand[] }) {
  const [dbRoles, setDbRoles]       = useState<DbRole[]>([]);
  const [pending, setPending]       = useState<PendingInvite[]>([]);
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Form fields
  const [email, setEmail]           = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [roleId, setRoleId]         = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const [brandDropOpen, setBrandDropOpen]   = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load roles + pending invites
  useEffect(() => {
    Promise.all([
      fetch("/api/team/roles").then((r) => r.json()),
      fetch("/api/team/invite").then((r) => r.json()),
    ])
      .then(([roles, invites]) => {
        setDbRoles(Array.isArray(roles) ? roles : []);
        setPending(Array.isArray(invites) ? invites : []);
        if (roles.length > 0) setRoleId(roles[0].id);
      })
      .catch(() => toast.error("Failed to load roles / invitations."))
      .finally(() => setLoading(false));
  }, []);

  // Auto-fill brands by default on role selection
  useEffect(() => {
    if (!roleId || dbRoles.length === 0) return;
    const selectedRoleObj = dbRoles.find((r) => r.id === roleId);
    if (!selectedRoleObj) return;

    const roleName = selectedRoleObj.name;
    if (roleName === "admin") {
      setSelectedBrands(brands.map((b) => b.id));
    } else {
      if (brands.length > 0) setSelectedBrands([brands[0].id]);
    }
  }, [roleId, dbRoles, brands]);

  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSendInvite = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("A valid email address is required.");
      return;
    }
    if (!employeeId.trim()) {
      toast.error("Employee ID is required.");
      return;
    }
    if (!roleId) {
      toast.error("Please select a role.");
      return;
    }
    if (selectedBrands.length === 0) {
      toast.error("Select at least one brand workspace.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          employeeId: employeeId.trim(),
          roleId,
          brandIds: selectedBrands,
          moduleAccess: [],
          permissionAccess: [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to send invitation.");
        return;
      }

      toast.success("Invitation sent!", {
        description: `An email has been dispatched to ${email.trim()} with their activation link.`,
      });

      // Reset form
      setEmail("");
      setEmployeeId("");
      setSelectedBrands([]);
      if (dbRoles.length > 0) setRoleId(dbRoles[0].id);

      // Refresh pending list
      const updated = await fetch("/api/team/invite").then((r) => r.json());
      setPending(Array.isArray(updated) ? updated : []);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleRevokeInvite = async (id: string, inviteEmail: string) => {
    try {
      const res = await fetch(`/api/team/invite?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to revoke invitation.");
        return;
      }
      setPending((prev) => prev.filter((p) => p.id !== id));
      toast.success("Invitation revoked", {
        description: `Pending invite for ${inviteEmail} has been cancelled.`,
      });
    } catch {
      toast.error("Network error — please try again.");
    }
  };

  const handleResendInvite = async (id: string, inviteEmail: string) => {
    setResendingId(id);
    try {
      const res = await fetch("/api/team/invite/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to resend invitation.");
        return;
      }
      toast.success("Invitation resent!", {
        description: `A new email has been dispatched to ${inviteEmail}.`,
      });
      const updated = await fetch("/api/team/invite").then((r) => r.json());
      setPending(Array.isArray(updated) ? updated : []);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setResendingId(null);
    }
  };

  const selectedBrandNames = brands
    .filter((b) => selectedBrands.includes(b.id))
    .map((b) => b.name)
    .join(", ");

  return (
    <div className="space-y-5">
      {/* Send Invite Form */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-4.5 h-4.5 text-[#8B5CF6]" />
            Send Invitation
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Invite a new teammate. They&apos;ll receive an email with an activation link via Resend.
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4 pt-1 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@mergex.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6"
              />
            </div>

            {/* Employee ID */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Employee ID</Label>
              <Input
                placeholder="e.g. MX-007"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                className="h-9 text-xs bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6 font-mono tracking-widest"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]/40 transition-all cursor-pointer shadow-none">
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

            {/* Brand Access */}
            <div ref={brandRef} className="space-y-1.5 relative">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Brand Access</Label>
              <button
                type="button"
                onClick={() => setBrandDropOpen((o) => !o)}
                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground flex items-center justify-between gap-2 hover:border-neutral-300 dark:hover:border-white/12 transition-all cursor-pointer text-left"
              >
                <span className={cn("truncate", !selectedBrandNames && "text-muted-foreground")}>
                  {selectedBrandNames || "Select brands…"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>
              {brandDropOpen && (
                <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/8 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                  <div className="max-h-48 overflow-y-auto">
                    {brands.map((b) => {
                      const selected = selectedBrands.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => toggleBrand(b.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
                        >
                          <span>{b.name}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={handleSendInvite}
            disabled={sending || loading}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer h-9 px-5 rounded-lg disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending…</span>
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Send Invite</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Pending Invitations List */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Mail className="w-4.5 h-4.5 text-[#8B5CF6]" />
            Pending Invitations
            {pending.length > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                {pending.length}
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting account activation. Links expire after 7 days.
          </p>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm"
              >
                <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-1/3 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                  </div>
                </div>
                <Skeleton className="h-7 w-20 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground font-medium">
            No pending invitations. Send one above.
          </div>
        ) : (
          <div className="space-y-2">
            {pending.map((inv) => {
              const initials = inv.email[0].toUpperCase();
              const expiresDate = new Date(inv.expiresAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-xs font-extrabold text-amber-500 shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <p className="text-xs font-bold text-foreground truncate leading-none">{inv.email}</p>
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-muted-foreground/60">
                        <span>Expires {expiresDate}</span>
                        {inv.brands.length > 0 && (
                          <>
                            <span>·</span>
                            <span>Brands: {inv.brands.map((b) => b.name).join(", ")}</span>
                          </>
                        )}
                      </div>
                      {inv.moduleAccess && inv.moduleAccess.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {inv.moduleAccess.map((m) => (
                            <Badge
                              key={m}
                              variant="secondary"
                              className="text-[9px] font-medium bg-[#8B5CF6]/5 text-[#8B5CF6]/80 border border-[#8B5CF6]/10 px-1 py-0 rounded"
                            >
                              {m}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-wider border-amber-500/20 text-amber-600 bg-amber-500/5 font-semibold"
                    >
                      Pending
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={resendingId === inv.id}
                      onClick={() => handleResendInvite(inv.id, inv.email)}
                      className="h-7 text-[10px] font-bold text-neutral-500 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/5 cursor-pointer disabled:opacity-50"
                    >
                      {resendingId === inv.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 inline" />
                      ) : null}
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvite(inv.id, inv.email)}
                      className="h-7 text-[10px] font-bold text-neutral-500 hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
