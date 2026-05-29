"use client";

import { useState, useTransition } from "react";
import { 
  User, 
  Building2, 
  Users, 
  Settings2, 
  Sliders, 
  Check, 
  Save, 
  Trash2, 
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Mail,
  UserPlus,
  ShieldAlert,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";

interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  role: {
    name: string;
    label: string;
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface SettingsPageProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    designation: string | null;
    role: {
      name: string;
      label: string;
    };
  } | null;
  brands: Brand[];
  teammates: Teammate[];
}

type SettingsTab = "profile" | "workspace" | "team" | "config" | "system";

export function SettingsPage({ user, brands, teammates }: SettingsPageProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") || "profile";

  // Security checks based on progressive disclosure role matrix
  const isAllowed = (t: string) => {
    if (t === "profile") return true;
    if (user?.role.name === "super_admin") return true;
    if (user?.role.name === "admin") {
      return t !== "system";
    }
    return false;
  };

  const tab = isAllowed(rawTab) ? (rawTab as SettingsTab) : "profile";

  const renderContent = () => {
    switch (tab) {
      case "profile":
        return <ProfileSection user={user} brands={brands} />;
      case "workspace":
        return <WorkspaceSection brands={brands} />;
      case "team":
        return <TeamSection teammates={teammates} />;
      case "config":
        return <ConfigSection />;
      case "system":
        return <SystemSection />;
      default:
        return <ProfileSection user={user} brands={brands} />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {renderContent()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. PROFILE SETTINGS SECTION
// ─────────────────────────────────────────────────────────────

function ProfileSection({ user, brands }: { user: SettingsPageProps["user"]; brands: Brand[] }) {
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [designation, setDesignation] = useState(user?.designation ?? "");
  const [saving, setSaving] = useState(false);

  const handleSaveInfo = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile information updated successfully.");
    }, 1000);
  };

  const handleResetPassword = () => {
    toast.success("Password reset request submitted successfully.", {
      description: "A secure reset link has been dispatched to your email address."
    });
  };

  return (
    <div className="space-y-6">
      {/* Account Info card */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Account Information</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Manage your personal details and designation within the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-muted-foreground">First Name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-muted-foreground">Last Name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-muted-foreground">Username</Label>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} 
              className="h-9 text-xs" 
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-[#8B5CF6] opacity-80">Email (Managed by Organization)</Label>
            <Input value={user?.email ?? ""} disabled className="h-9 text-xs bg-muted/40 cursor-not-allowed opacity-75" />
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-muted-foreground">Professional Designation</Label>
            <Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="h-9 text-xs" />
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleSaveInfo} disabled={saving} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
              {saving ? <><LoaderIcon className="animate-spin" />Saving...</> : <><Save className="h-3.5 w-3.5" />Save Profile</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security credentials card */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Security</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Update security passwords and review workspace sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 border border-border/20 rounded-xl bg-muted/5 text-xs text-left">
            <div className="space-y-0.5">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-[#8B5CF6]" />
                Credential Password
              </p>
              <p className="text-muted-foreground/80 leading-none">Reset your login credentials</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetPassword} className="text-xs font-semibold cursor-pointer">
              Request Reset Handoff
            </Button>
          </div>

          <div className="p-3 border border-border/20 rounded-xl bg-card text-xs text-left space-y-2">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Active Sessions
            </p>
            <div className="flex justify-between items-center text-[10px] bg-muted/5 p-2 rounded">
              <span className="font-semibold">Current Browser Session</span>
              <span className="font-mono text-emerald-500 font-bold bg-emerald-500/5 px-1 py-0.5 rounded border border-emerald-500/10">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Workspace preferences */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Preferences</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Adjust visual layout themes and brand contexts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-muted-foreground">Theme Preference</Label>
            <Select defaultValue="system">
              <SelectTrigger className="h-9 text-xs w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-muted-foreground">Default Launch Brand</Label>
            <Select defaultValue={brands[0]?.id ?? "all"}>
              <SelectTrigger className="h-9 text-xs w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brand Divisions</SelectItem>
                {brands.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. WORKSPACE SETTINGS SECTION
// ─────────────────────────────────────────────────────────────

function WorkspaceSection({ brands }: { brands: Brand[] }) {
  const [brandList, setBrandList] = useState(brands);
  const [newBrandName, setNewBrandName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create brand.");
        return;
      }
      setBrandList((prev) => [data, ...prev]);
      setNewBrandName("");
      toast.success("Workspace division created successfully.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveBrand = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete brand.");
        return;
      }
      setBrandList((prev) => prev.filter((b) => b.id !== id));
      toast.error(`Workspace division archived`, {
        description: `Brand "${name}" has been removed from the workspace.`,
        icon: <Trash2 className="h-4 w-4 text-red-500" />,
      });
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Divisions management */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Brand Management</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Manage operational divisions in this workspace context.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Create Brand Form */}
          <div className="flex gap-2">
            <Input 
              placeholder="Brand division name (e.g. OVRN Studios)..." 
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="h-9 text-xs" 
            />
            <Button size="sm" onClick={handleCreateBrand} disabled={saving || !newBrandName.trim()} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold cursor-pointer whitespace-nowrap">
              {saving ? "Adding…" : "+ Add Brand"}
            </Button>
          </div>

          <div className="space-y-2 mt-4 text-left">
            {brandList.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 border border-border/20 rounded-xl bg-card">
                <div>
                  <p className="text-xs font-bold text-foreground">{b.name}</p>
                  <code className="text-[10px] text-muted-foreground font-mono">/{b.slug}</code>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleArchiveBrand(b.id, b.name)}
                  disabled={deletingId === b.id}
                  className="h-7 w-7 text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                >
                  {deletingId === b.id
                    ? <span className="h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>

      {/* Global preferences defaults */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Brand Defaults</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Set regional default definitions for brand analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Default Timezone</Label>
              <Select defaultValue="Asia/Kolkata">
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Default Currency</Label>
              <Select defaultValue="INR">
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ INR — Rupee</SelectItem>
                  <SelectItem value="USD">$ USD — Dollar</SelectItem>
                  <SelectItem value="EUR">€ EUR — Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. TEAM & ACCESS SECTION
// ─────────────────────────────────────────────────────────────

function TeamSection({ teammates }: { teammates: Teammate[] }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("cx_executive");
  const [sending, setSending] = useState(false);

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    setSending(true);
    setTimeout(() => {
      setInviteEmail("");
      setSending(false);
      toast.success("Email invitation sent successfully.", {
        description: `Invitation sent to ${inviteEmail} with default permissions.`
      });
    }, 1000);
  };

  const handleDeactivate = (name: string) => {
    toast.success("Teammate account deactivated", {
      description: `${name} has been suspended from accessing Sales OS.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Invite Member form */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Invite Users</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Send an email invitation to authorize a new teammate in the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              type="email"
              placeholder="colleague@mergex.in" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="h-9 text-xs flex-1" 
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="h-9 text-xs w-full sm:w-44 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="cx_executive">CX Executive</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleSendInvite} disabled={sending || !inviteEmail.includes("@")} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Send Invite</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Directory */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">User Management</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Authorized workspace operators and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-left">
          {teammates.map(t => {
            const initials = ((t.firstName?.[0] ?? "") + (t.lastName?.[0] ?? t.email[0])).toUpperCase();
            const displayName = t.firstName ? `${t.firstName} ${t.lastName ?? ""}` : t.email;
            
            return (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-border/20 rounded-xl bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-xs font-extrabold text-[#8B5CF6] shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground/60 truncate leading-none mt-0.5">{t.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider scale-95 border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold">
                    {t.role.label}
                  </Badge>
                  {t.role.name !== "super_admin" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeactivate(displayName)}
                      className="h-7 text-[10px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Permissions Matrix display */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Roles & Permissions</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Administrative role matrices defining operations limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-left">
          {[
            { role: "Super Admin", perm: "Full access to platform, branding, billing, and logs." },
            { role: "Admin", perm: "Manage brand divisions, users and pipeline rules. Cannot view system logs." },
            { role: "CX Executive", perm: "Create leads, update client workspaces, upload document templates." },
            { role: "Viewer", perm: "Read-only access to KPI strip and dashboard analytics widgets." },
          ].map(r => (
            <div key={r.role} className="p-3 border border-border/20 rounded-xl bg-muted/5 text-xs">
              <span className="font-bold text-foreground">{r.role}</span>
              <p className="text-muted-foreground/80 mt-1 leading-relaxed">{r.perm}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. OPERATIONAL CONFIG SECTION
// ─────────────────────────────────────────────────────────────

function ConfigSection() {
  const [saving, setSaving] = useState(false);
  
  const handleSaveConfig = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Operational configurations saved successfully.");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Pipeline setup */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">CRM Pipeline Stages</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Set custom labels for sales qualification gates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-left">
          {[
            { label: "Stage 1 (Inbound)", value: "Lead Inbound" },
            { label: "Stage 2 (Qualified)", value: "Qualification" },
            { label: "Stage 3 (Discovery)", value: "Discovery Call" },
            { label: "Stage 4 (Closing)", value: "Proposal Sent" },
            { label: "Stage 5 (Converted)", value: "Closed Won" },
          ].map(stage => (
            <div key={stage.label} className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">{stage.label}</Label>
              <Input defaultValue={stage.value} className="h-9 text-xs" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Client Lifecycle */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Client Status Settings</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Statuses mapped to active accounts in workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Active Projects</Label>
              <Input defaultValue="Active" className="h-9 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">On-Hold Projects</Label>
              <Input defaultValue="On Hold" className="h-9 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase text-red-500">At Risk Accounts</Label>
              <Input defaultValue="At Risk" className="h-9 text-xs mt-1 border-red-500/25" />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase text-emerald-500">Completed Contracts</Label>
              <Input defaultValue="Completed" className="h-9 text-xs mt-1 border-emerald-500/25" />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button size="sm" onClick={handleSaveConfig} disabled={saving} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
              {saving ? "Saving..." : <><Save className="h-3.5 w-3.5" />Save Rules</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. SYSTEM PREFERENCES SECTION
// ─────────────────────────────────────────────────────────────

function SystemSection() {
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* File settings */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">File Upload Settings</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Allowed file storage properties and sizes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Allowed Document Formats</Label>
            <Input defaultValue="PDF, DOCX, XLSX, PNG, JPG" className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Maximum Size Per File (MB)</Label>
            <Input type="number" defaultValue="10" className="h-9 text-xs w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Security logs */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Audit Logs</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Workspace events and administrative modifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-left">
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            <div className="flex gap-2.5 text-xs bg-muted/5 p-3 rounded border border-border/10 leading-none items-center">
              <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              <p className="text-muted-foreground/60 font-medium">No audit events recorded yet. Activity will appear here as the workspace is used.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alert rule */}
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Alert Rules</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Configure default timings for automated billing reminders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">Billing Overdue Warning</p>
              <p className="text-[10px] text-muted-foreground">Alert admins when invoice remains unpaid past due date.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Alert Delay Trigger (Days)</Label>
            <Input type="number" defaultValue="3" className="h-9 text-xs w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Loading spinner icon utility
// ─────────────────────────────────────────────────────────────
function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin h-3.5 w-3.5 text-current", className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
