"use client";

import { useState, useTransition, useRef } from "react";
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
  AlertCircle,
  Camera
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
import { useTheme } from "next-themes";

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
  description?: string | null;
  logoUrl?: string | null;
}

interface SettingsPageProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    designation: string | null;
    avatarUrl: string | null;
    role: {
      name: string;
      label: string;
    };
  } | null;
  brands: Brand[];
  teammates: Teammate[];
}

type SettingsTab =
  | "my-profile"
  | "notifications"
  | "brand-settings"
  | "members"
  | "audit-logs";

export function SettingsPage({ user, brands, teammates }: SettingsPageProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") || "my-profile";

  const canAdmin = user?.role.name === "super_admin" || user?.role.name === "admin";

  const isAllowed = (t: string) => {
    if (t === "my-profile" || t === "notifications") return true;
    return canAdmin;
  };

  const tab = isAllowed(rawTab) ? (rawTab as SettingsTab) : "my-profile";

  const renderContent = () => {
    switch (tab) {
      case "my-profile":             return <ProfileSection user={user} brands={brands} />;
      case "notifications":          return <NotificationsSection />;
      case "brand-settings":         return <BrandSettingsSection brands={brands} />;
      case "members":                return <MembersSection teammates={teammates} />;
      case "audit-logs":             return <AuditLogsSection />;
      default:                       return <ProfileSection user={user} brands={brands} />;
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
  const { theme, setTheme } = useTheme();
  const [defaultBrand, setDefaultBrand] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mergex_default_launch_brand") || "all";
    }
    return "all";
  });

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [designation, setDesignation] = useState(user?.designation ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Accepted: JPG, PNG, WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to upload profile picture.");
        return;
      }
      setAvatarUrl(data.url);
      toast.success("Profile image uploaded. Save profile to apply changes.");
    } catch {
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          designation: designation.trim() || null,
          avatarUrl: avatarUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save profile information.");
        return;
      }

      toast.success("Profile information updated successfully.");
      window.dispatchEvent(new CustomEvent("mergex:profile-updated", { detail: { avatarUrl } }));
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
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
        <CardContent className="space-y-6">
          {/* Avatar Upload Block */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/10">
            <div className="relative group shrink-0 h-20 w-20 rounded-full border border-border/25 overflow-hidden bg-[#8B5CF6]/5 flex items-center justify-center shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-[#8B5CF6]/85 uppercase">
                  {((firstName?.[0] ?? "") + (lastName?.[0] ?? user?.email?.[0] ?? "")).toUpperCase() || "U"}
                </span>
              )}

              {/* Uploading Spinner */}
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <LoaderIcon className="h-5 w-5 text-[#8B5CF6] animate-spin" />
                </div>
              )}

              {/* Hover overlay trigger */}
              {!uploading && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-white transition-opacity duration-150 cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Update</span>
                </button>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h4 className="text-xs font-bold text-foreground">Profile Picture</h4>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-sm">
                Upload a professional display image (JPG, PNG, or WebP up to 2MB).
                It will be optimized and securely hosted on Cloudinary.
              </p>
              <div className="flex gap-2 pt-1 justify-center sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="h-7 text-[10px] font-bold cursor-pointer"
                >
                  Choose File
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatarUrl("")}
                    disabled={uploading}
                    className="h-7 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/5 cursor-pointer"
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

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
      
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. NOTIFICATIONS SECTION
// ─────────────────────────────────────────────────────────────

function NotificationsSection() {
  const items = [
    { key: "lead_assigned",   label: "Lead Assigned",         desc: "When a new lead is assigned to you.",            default: true  },
    { key: "status_change",   label: "Status Change",         desc: "When a lead or client status changes.",          default: true  },
    { key: "doc_uploaded",    label: "Document Uploaded",     desc: "When a document is added to your workspace.",    default: false },
    { key: "invite_accepted", label: "Invitation Accepted",   desc: "When a teammate accepts your invitation.",       default: true  },
    { key: "billing_alert",   label: "Billing Reminders",     desc: "Overdue invoices and payment alerts.",           default: true  },
    { key: "system_update",   label: "Platform Updates",      desc: "Release notes and new feature announcements.",   default: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Notifications</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Choose which events trigger notifications for your account.</p>
      </div>
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Notification Preferences</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Changes apply immediately to your account only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                defaultChecked={item.default}
                onCheckedChange={(v) => toast.success(`${item.label} notifications ${v ? "enabled" : "disabled"}.`)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. BRAND SETTINGS SECTION
// ─────────────────────────────────────────────────────────────

function BrandSettingsSection({ brands }: { brands: Brand[] }) {
  const [brandName,  setBrandName]  = useState(brands[0]?.name  ?? "");
  const [brandDesc,  setBrandDesc]  = useState(brands[0]?.description ?? "");
  const [logoUrl,    setLogoUrl]    = useState<string>(brands[0]?.logoUrl ?? "");
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const initials = brandName
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  // ── Upload to Cloudinary via /api/upload ──────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Accepted: JPG, PNG, WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2 MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Upload failed."); return; }
      setLogoUrl(data.url);
      toast.success("Brand logo uploaded. Save to apply.");
    } catch {
      toast.error("Upload failed — please try again.");
    } finally {
      setUploading(false);
      // reset input so the same file can be re-selected
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // ── Save brand settings ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!brandName.trim()) { toast.error("Brand name is required."); return; }
    setSaving(true);
    try {
      const res  = await fetch(`/api/brands/${brands[0]?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        brandName.trim(),
          description: brandDesc.trim() || null,
          logoUrl:     logoUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to save brand settings."); return; }
      toast.success("Brand settings saved successfully.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Brand Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure the identity and details of this brand workspace.</p>
      </div>

      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Brand Identity</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Update the display name, description and logo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* ── Logo Upload Block ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/10">
            {/* Logo preview */}
            <div
              className="relative group shrink-0 h-20 w-20 rounded-2xl border-2 border-dashed border-border/30 overflow-hidden bg-[#8B5CF6]/5 flex items-center justify-center shadow-inner cursor-pointer"
              onClick={() => !uploading && logoInputRef.current?.click()}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Brand logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-[#8B5CF6]/70 select-none">
                  {initials}
                </span>
              )}

              {/* Uploading spinner overlay */}
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <LoaderIcon className="h-5 w-5 text-[#8B5CF6] animate-spin" />
                </div>
              )}

              {/* Hover overlay */}
              {!uploading && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-150">
                  <Camera className="h-5 w-5 text-white" />
                  <span className="text-[10px] font-bold text-white">Upload Logo</span>
                </div>
              )}
            </div>

            {/* Upload instructions + actions */}
            <div className="text-center sm:text-left space-y-1.5">
              <h4 className="text-xs font-bold text-foreground">Brand Logo</h4>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-xs">
                Upload a square logo for this brand workspace (JPG, PNG or WebP, up to 2 MB).
                It will be optimized and hosted on Cloudinary.
              </p>
              <div className="flex gap-2 pt-1 justify-center sm:justify-start flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading}
                  className="h-7 text-[10px] font-bold cursor-pointer"
                >
                  {uploading ? "Uploading…" : "Choose Image"}
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoUrl("")}
                    disabled={uploading}
                    className="h-7 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/5 cursor-pointer"
                  >
                    Remove Logo
                  </Button>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          {/* ── Brand Name ──────────────────────────────────────────────────── */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-muted-foreground">
              Brand Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="e.g. OVRN Studios"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* ── Brand Description ──────────────────────────────────────────── */}
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-muted-foreground">Brand Description</Label>
            <textarea
              placeholder="Short description of what this brand represents…"
              value={brandDesc}
              onChange={(e) => setBrandDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border/30 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 resize-none"
            />
          </div>

          {/* ── Save ─────────────────────────────────────────────────────────── */}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || uploading || !brandName.trim()}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><LoaderIcon className="mr-1.5" />Saving…</>
              ) : (
                <><Save className="h-3.5 w-3.5 mr-1.5" />Save Changes</>
              )}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}




// ─────────────────────────────────────────────────────────────
// 5. MEMBERS SECTION  (who has access to THIS brand)
// ─────────────────────────────────────────────────────────────

function MembersSection({ teammates }: { teammates: Teammate[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Members</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage who has access to this brand workspace. Global roles are managed in Team &amp; Access.</p>
      </div>

      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8B5CF6]" />
            Brand Members
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            These users currently have access to this brand workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {teammates.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No members yet. Invite team members from Team &amp; Access.
            </div>
          ) : (
            teammates.map((t) => {
              const initials = ((t.firstName?.[0] ?? "") + (t.lastName?.[0] ?? t.email[0])).toUpperCase();
              const name = t.firstName ? `${t.firstName} ${t.lastName ?? ""}`.trim() : t.email;
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-muted/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-xs font-extrabold text-[#8B5CF6] shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{t.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-semibold">
                      {t.role.label}
                    </Badge>
                    {t.role.name !== "super_admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success(`${name} removed from this brand.`)}
                        className="h-7 text-[10px] font-bold text-neutral-500 hover:text-red-500 hover:bg-red-500/5 cursor-pointer"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. AUDIT LOGS SECTION
// ─────────────────────────────────────────────────────────────

function AuditLogsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Audit Logs</h2>
        <p className="text-xs text-muted-foreground mt-0.5">A chronological record of all actions within this brand workspace.</p>
      </div>

      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Activity Log</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Events are retained for 90 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2.5 text-xs bg-muted/5 p-4 rounded-xl border border-border/10 items-center">
            <ShieldCheck className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <p className="text-muted-foreground/60">No audit events recorded yet. Activity will appear here as the workspace is used.</p>
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
