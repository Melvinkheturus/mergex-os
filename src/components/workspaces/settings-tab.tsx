"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Building2, Globe, ChevronDown, Trash2, Pencil, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImageCropperModal } from "@/components/ui/image-cropper";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  color: string;
  description: string | null;
  createdAt: string;
}

const COLOR_HEX: Record<string, string> = {
  violet:  "#8B5CF6",
  indigo:  "#6366F1",
  rose:    "#F43F5E",
  amber:   "#F59E0B",
  emerald: "#10B981",
  sky:     "#0EA5E9",
};

function getBrandInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface SettingsTabProps {
  brandList: Brand[];
  onBrandUpdated: (updatedBrand: Brand) => void;
  deletingBrandId: string | null;
  handleArchiveBrand: (id: string, name: string) => void;
  defaultTimezone: string;
  setDefaultTimezone: (val: string) => void;
  defaultCurrency: string;
  setDefaultCurrency: (val: string) => void;
  onNewBrand: () => void;
}

export function SettingsTabComponent({
  brandList,
  onBrandUpdated,
  deletingBrandId,
  handleArchiveBrand,
  defaultTimezone,
  setDefaultTimezone,
  defaultCurrency,
  setDefaultCurrency,
  onNewBrand,
}: SettingsTabProps) {
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          Platform Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Control platform-wide configuration: brand divisions, regional defaults, security and integrations.
        </p>
      </div>

      {/* 3.1 Brand Management Card */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-[#8B5CF6]" />
              Brand Management
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create or archive brand divisions. Changes will immediately reflect on the main workspaces switcher list.
            </p>
          </div>
          <Button
            onClick={onNewBrand}
            className="px-4 h-9 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            + Add Brand
          </Button>
        </div>

        {/* List of brands */}
        <div className="space-y-2 mt-4 max-h-[360px] overflow-y-auto pr-1">
          {brandList.map((b) => (
            <div 
              key={b.id} 
              className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm hover:border-neutral-300 dark:hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-7.5 h-7.5 rounded-lg overflow-hidden flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0 relative border border-neutral-200/40"
                  style={{ backgroundColor: b.logoUrl ? "transparent" : (COLOR_HEX[b.color] ?? COLOR_HEX.violet) }}
                >
                  {b.logoUrl ? (
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getBrandInitials(b.name)
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-none">{b.name}</p>
                </div>
              </div>
              
              {confirmArchiveId === b.id ? (
                <div className="flex items-center gap-1.5 animate-fade-in">
                  <button
                    onClick={() => {
                      handleArchiveBrand(b.id, b.name);
                      setConfirmArchiveId(null);
                    }}
                    disabled={deletingBrandId === b.id}
                    className="px-2.5 py-1 text-[9px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-md transition-colors disabled:opacity-50 shrink-0"
                  >
                    {deletingBrandId === b.id ? "Archiving…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmArchiveId(null)}
                    disabled={deletingBrandId === b.id}
                    className="px-2 py-1 text-[9px] font-bold text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors disabled:opacity-50 shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingBrand(b)}
                    className="h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 hover:text-foreground flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-white/10"
                    title="Edit Brand Workspace"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmArchiveId(b.id)}
                    disabled={deletingBrandId === b.id}
                    className="h-8 w-8 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Archive Brand Division"
                  >
                    {deletingBrandId === b.id ? (
                      <span className="h-3.5 w-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3.2 Regional Defaults Card */}
      <div className="glass-frost-card rounded-[20px] shadow-sm border border-neutral-200 dark:border-white/5 p-5.5 bg-neutral-50/20 dark:bg-white/1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-[#8B5CF6]" />
            Regional Defaults
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Set regional timezone and default currency definitions for brand analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-neutral-500">Default Timezone</label>
            <div className="relative">
              <select 
                value={defaultTimezone}
                onChange={(e) => {
                  setDefaultTimezone(e.target.value);
                  toast.success(`Default timezone updated to ${e.target.value}`);
                }}
                className="w-full h-9 px-3 pr-8 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all font-sans cursor-pointer appearance-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-neutral-500">Default Currency</label>
            <div className="relative">
              <select 
                value={defaultCurrency}
                onChange={(e) => {
                  setDefaultCurrency(e.target.value);
                  toast.success(`Default currency updated to ${e.target.value}`);
                }}
                className="w-full h-9 px-3 pr-8 rounded-lg bg-white dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/6 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all font-sans cursor-pointer appearance-none"
              >
                <option value="INR">₹ INR - Rupee</option>
                <option value="USD">$ USD - Dollar</option>
                <option value="EUR">€ EUR - Euro</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {editingBrand && (
        <EditBrandModal
          brand={editingBrand}
          isOpen={true}
          onClose={() => setEditingBrand(null)}
          onUpdated={onBrandUpdated}
        />
      )}
    </div>
  );
}

interface EditBrandModalProps {
  brand: Brand;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedBrand: Brand) => void;
}

export function EditBrandModal({ brand, isOpen, onClose, onUpdated }: EditBrandModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(brand.name);
  const [description, setDescription] = useState(brand.description ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(brand.logoUrl);
  const [logoUrl, setLogoUrl] = useState<string | null>(brand.logoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Invalid type. Accepted: JPG, PNG, SVG, WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File too large. Max 10 MB.");
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const uploadCroppedLogo = useCallback(async (croppedFile: File) => {
    setUploadError(null);
    setLogoUrl(null);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(croppedFile);

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const form = new FormData();
      form.append("file", croppedFile);
      setUploadProgress(50);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      setUploadProgress(90);
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        setLogoPreview(null);
        return;
      }

      setLogoUrl(data.url);
      setUploadProgress(100);
    } catch {
      setUploadError("Upload failed. Please try again.");
      setLogoPreview(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 600);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (isUploading) {
      setError("Please wait for the logo to finish uploading.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/brands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: brand.id,
          name: name.trim(),
          description: description.trim() || null,
          logoUrl: logoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update brand.");
        return;
      }

      onUpdated({
        ...brand,
        name: data.name,
        slug: data.slug,
        description: data.description,
        logoUrl: data.logoUrl,
      });
      toast.success("Brand updated successfully");
      onClose();
    } catch {
      setError("Network error - please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card dark:bg-[#0A0A0E] border border-neutral-200 dark:border-white/5 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-white/5">
          <h2 className="text-sm font-bold text-foreground">Edit Brand Workspace</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Brand Logo */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">Brand Logo</Label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-28 h-28 border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                logoPreview
                  ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/3"
                  : "border-border/80 hover:border-[#8B5CF6]/50 hover:bg-neutral-50 dark:hover:bg-white/2"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                accept="image/jpeg,image/png,image/svg+xml,image/webp"
                className="hidden"
              />

              {logoPreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <Image
                    src={logoPreview}
                    alt="Logo Preview"
                    width={80}
                    height={80}
                    className="max-h-24 max-w-24 object-contain rounded"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLogo();
                    }}
                    className="absolute top-1 right-1 p-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all border border-border/60"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center flex-col gap-1">
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      <span className="text-[9px] text-white font-medium">{uploadProgress}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center">
                  <ImageIcon className="w-4.5 h-4.5 text-neutral-400 mb-1" />
                  <span className="text-[10px] font-bold text-foreground leading-tight">Upload Logo</span>
                  <span className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Drag & drop</span>
                </div>
              )}
            </div>
            <ImageCropperModal
              isOpen={cropperOpen}
              onClose={() => {
                setCropperOpen(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              imageSrc={cropperSrc}
              cropShape="square"
              title="Crop Brand Logo"
              onCropComplete={uploadCroppedLogo}
            />
            {uploadError && (
              <p className="text-xs text-rose-500 font-medium bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-md flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {uploadError}
              </p>
            )}
          </div>

          {/* Brand Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Brand Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MergeX Academy"
              className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-purple-500/30 rounded-md border-border/80"
            />
          </div>

          {/* Brand Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Brand Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Online learning and training division"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-md bg-white dark:bg-[#050507] border border-border/80 text-sm text-foreground placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all resize-none font-sans"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-white/5 bg-neutral-50/20 dark:bg-white/1">
          <Button variant="ghost" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground h-9 px-4">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || isUploading || !name.trim()}
            className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold px-5 h-9 rounded-md transition-all shadow-sm"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

