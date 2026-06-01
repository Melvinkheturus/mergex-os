"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

interface CreateBrandViewProps {
  onBack: () => void;
  onCreated: (brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    color: string;
    description: string | null;
    createdAt: string;
  }) => void;
}

export function CreateBrandView({ onBack, onCreated }: CreateBrandViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flow State
  const [viewState, setViewState] = useState<"form" | "success">("form");
  const [createdBrand, setCreatedBrand] = useState<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    color: string;
    description: string | null;
    createdAt: string;
  } | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Logo Upload State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Saving State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Load draft on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("draft_create_brand_workspace");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            if (parsed.name) setName(parsed.name);
            if (parsed.description) setDescription(parsed.description);
            if (parsed.logoUrl) {
              setLogoUrl(parsed.logoUrl);
              setLogoPreview(parsed.logoUrl);
            }
          }, 0);
        } catch (e) {
          console.error("Failed to load workspace draft:", e);
        }
      }
      setTimeout(() => {
        setIsDraftLoaded(true);
      }, 0);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    if (!isDraftLoaded) return;
    if (typeof window !== "undefined") {
      const draft = { name, description, logoUrl };
      localStorage.setItem("draft_create_brand_workspace", JSON.stringify(draft));
    }
  }, [name, description, logoUrl, isDraftLoaded]);

  // ── Logo Upload Handler ───────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadError("Invalid type. Accepted: JPG, PNG, SVG, WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File too large. Max 2 MB.");
      return;
    }

    setUploadError(null);
    setLogoUrl(null);

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const form = new FormData();
      form.append("file", file);
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

  // ── Brand Creation Handler ────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!name.trim()) return;
    if (isUploading) {
      setError("Please wait for the logo to finish uploading.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const brandSlug = slugify(name);
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: brandSlug,
          color: "violet",
          description: description.trim() || null,
          logoUrl: logoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create brand workspace.");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("draft_create_brand_workspace");
      }

      const brand = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        color: data.color ?? "violet",
        description: data.description ?? null,
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
      };

      setCreatedBrand(brand);
      setViewState("success");
    } catch {
      setError("Network error - please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render Form View ──────────────────────────────────────────────────────
  if (viewState === "form") {
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div className="bg-card border border-border/80 rounded-md shadow-xs overflow-hidden text-left">
          {/* Card Header inside the card */}
          <div className="flex items-center gap-3.5 p-6 border-b border-border/40 bg-muted/5">
            <div className="h-10 w-10 rounded-md border border-border bg-card flex items-center justify-center text-foreground/80 shrink-0 shadow-2xs">
              <ImageIcon className="h-5 w-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">Create Brand Workspace</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create a new brand workspace for managing leads, clients, documents, and operations.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Brand Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Brand Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. MergeX Academy"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) handleCreate();
                }}
                className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-purple-500/30 rounded-md border-border/80"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground">The display name of the workspace.</p>
            </div>

            {/* Brand Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Brand Description
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Online learning and training division"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-md bg-white dark:bg-[#050507] border border-border/80 text-sm text-foreground placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all resize-none font-sans"
              />
              <p className="text-[10px] text-muted-foreground">Optional short description for internal reference.</p>
            </div>

            {/* Brand Logo Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Brand Logo
              </Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "h-28 border border-dashed rounded-md flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200",
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
                  <div className="relative w-full h-full flex items-center justify-center p-3">
                    <Image
                      src={logoPreview}
                      alt="Logo Preview"
                      width={80}
                      height={80}
                      className="max-h-20 object-contain rounded"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLogo();
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all border border-border/60"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span className="text-[11px] text-white font-medium">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-md bg-neutral-100 dark:bg-white/4 flex items-center justify-center border border-border/80 text-neutral-500">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Upload Logo</p>
                    <p className="text-[10px] text-muted-foreground">Drag & drop or click to browse</p>
                  </>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Optional. If no logo is uploaded, the workspace initials will be used automatically. (e.g. MergeX → M, OVRN Studios → OS, MergeX Academy → MA)
              </p>

              {uploadError && (
                <p className="text-xs text-rose-500 font-medium bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-md flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {uploadError}
                </p>
              )}
            </div>

            {/* Form Error */}
            {error && (
              <p className="text-xs text-rose-500 font-medium bg-rose-500/5 border border-rose-500/20 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 p-6 border-t border-border/40 bg-muted/5">
            <Button
              variant="ghost"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("draft_create_brand_workspace");
                }
                onBack();
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || isUploading || !name.trim()}
              className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold px-5 h-9 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto shadow-sm"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating…
                </span>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Success View ───────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto py-10 animate-fade-in text-center">
      <div className="bg-card dark:bg-[#0E0E12] border border-neutral-200 dark:border-white/5 rounded-2xl p-8 shadow-lg space-y-6">
        
        {/* Success Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xs">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        {/* Titles */}
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-foreground">
            Workspace Created Successfully
          </h1>
          <p className="text-xs text-muted-foreground">
            What would you like to do next?
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5 pt-2">
          {createdBrand && (
            <>
              <Button
                onClick={() => router.push(`/workspaces/${createdBrand.slug}/dashboard`)}
                className="w-full h-10 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm"
              >
                Open Workspace
              </Button>

              <Button
                onClick={() => router.push(`/workspaces/${createdBrand.slug}/team`)}
                variant="outline"
                className="w-full h-10 border-neutral-200 dark:border-white/6 hover:bg-neutral-50 dark:hover:bg-white/2 text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Invite Team Members
              </Button>

              <Button
                onClick={() => onCreated(createdBrand)}
                variant="ghost"
                className="w-full h-10 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg cursor-pointer transition-all"
              >
                Back to Workspaces
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
