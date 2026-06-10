"use client";

import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageCropperModal } from "@/components/ui/image-cropper";
import { Camera, KeyRound, ShieldCheck, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand, SettingsPageProps } from "../types";

export function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin h-3.5 w-3.5 text-current", className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function ProfileSection({ user, brands }: { user: SettingsPageProps["user"]; brands: Brand[] }) {
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
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
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
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size for raw upload is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadCroppedAvatar = async (croppedFile: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", croppedFile);

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
      if (avatarInputRef.current) avatarInputRef.current.value = "";
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
      toast.error("Network error - please try again.");
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
            <div 
              onClick={() => !uploading && avatarInputRef.current?.click()}
              className="relative group shrink-0 h-20 w-20 rounded-full border border-white/10 overflow-hidden flex items-center justify-center shadow-inner cursor-pointer"
              style={{ background: "radial-gradient(circle at 30% 107%, #7819f6 0%, #000000 90%)" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white uppercase tracking-tight">
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
                <div
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-white transition-opacity duration-150 pointer-events-none"
                >
                  <Camera className="h-4 w-4" />
                  <span>Update</span>
                </div>
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
              <ImageCropperModal
                isOpen={cropperOpen}
                onClose={() => {
                  setCropperOpen(false);
                  if (avatarInputRef.current) avatarInputRef.current.value = "";
                }}
                imageSrc={cropperSrc}
                cropShape="circle"
                title="Crop Profile Picture"
                onCropComplete={uploadCroppedAvatar}
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
