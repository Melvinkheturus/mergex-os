"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageCropperModal } from "@/components/ui/image-cropper";
import { Camera, Save } from "lucide-react";
import { LoaderIcon } from "./profile-section";
import { Brand } from "../types";

export function BrandSettingsSection({ brands }: { brands: Brand[] }) {
  const [brandName,  setBrandName]  = useState(brands[0]?.name  ?? "");
  const [brandDesc,  setBrandDesc]  = useState(brands[0]?.description ?? "");
  const [logoUrl,    setLogoUrl]    = useState<string>(brands[0]?.logoUrl ?? "");
  const [uploading,  setUploading]  = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
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

  const uploadCroppedLogo = async (croppedFile: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", croppedFile);

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Upload failed."); return; }
      setLogoUrl(data.url);
      toast.success("Brand logo uploaded. Save to apply.");
    } catch {
      toast.error("Upload failed - please try again.");
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
      toast.error("Network error - please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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
              <ImageCropperModal
                isOpen={cropperOpen}
                onClose={() => {
                  setCropperOpen(false);
                  if (logoInputRef.current) logoInputRef.current.value = "";
                }}
                imageSrc={cropperSrc}
                cropShape="square"
                title="Crop Brand Logo"
                onCropComplete={uploadCroppedLogo}
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
