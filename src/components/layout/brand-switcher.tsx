"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check, LayoutGrid, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

// ── Brand avatar color palette ─────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
];

function getBrandInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getBrandAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ── Component ─────────────────────────────────────────────────────────────
export function BrandSwitcher({ brands }: { brands: BrandOption[] }) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Active brand derived from URL slug - URL is the canonical source of truth
  const activeBrand = brands.find((b) => b.slug === slug) ?? null;
  const activeBrandIndex = brands.findIndex((b) => b.slug === slug);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = async (id: string) => {
    const brand = brands.find((b) => b.id === id);
    if (!brand) return;
    setOpen(false);
    // Persist active brand to DB
    try {
      await fetch("/api/user/active-brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: id }),
      });
    } catch (e) {
      console.error("[BrandSwitcher] Failed to persist active brand:", e);
    }
    // Force a full page reload to clear Next.js route cache and completely reload server state
    window.location.href = `/workspaces/${brand.slug}/dashboard`;
  };

  if (brands.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 h-8 px-2.5 rounded-md text-xs font-medium transition-all duration-150",
          "border border-border/50 hover:border-border",
          "bg-muted/40 hover:bg-muted text-foreground",
          open && "border-[#8B5CF6]/40 bg-[#8B5CF6]/5"
        )}
      >
        {activeBrand ? (
          <>
            {activeBrand.logoUrl ? (
              <img
                src={activeBrand.logoUrl}
                alt={activeBrand.name}
                className="w-4 h-4 rounded object-cover shrink-0"
              />
            ) : (
              <div
                className={cn(
                  "w-4 h-4 rounded shrink-0 flex items-center justify-center text-white text-[8px] font-bold",
                  getBrandAvatarColor(activeBrandIndex)
                )}
              >
                {getBrandInitials(activeBrand.name)}
              </div>
            )}
            <span className="max-w-[96px] truncate">{activeBrand.name}</span>
          </>
        ) : (
          <>
            <Building2 className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Select Brand</span>
          </>
        )}
        <ChevronDown
          className={cn(
            "w-3 h-3 text-muted-foreground transition-transform duration-150 shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-50 min-w-[200px] bg-card/95 backdrop-blur-md border border-white/60 dark:border-white/5 rounded-xl shadow-xl overflow-hidden">

          {/* Section header */}
          <div className="px-3 pt-2.5 pb-1">
            <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              Brand Workspaces
            </p>
          </div>

          {/* Individual brands */}
          {brands.map((brand, i) => (
            <button
              key={brand.id}
              onClick={() => select(brand.id)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-5 h-5 rounded object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-5 h-5 rounded shrink-0 flex items-center justify-center text-white text-[8px] font-bold",
                      getBrandAvatarColor(i)
                    )}
                  >
                    {getBrandInitials(brand.name)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground leading-none">{brand.name}</p>
                </div>
              </div>
              {activeBrand?.id === brand.id && <Check className="w-3 h-3 text-[#8B5CF6] shrink-0" />}
            </button>
          ))}

          <div className="border-t border-border/30 mx-3 my-1" />

          {/* Workspace actions */}
          <button
            onClick={() => { setOpen(false); router.push("/workspaces"); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            All Workspaces
          </button>

          <button
            onClick={() => { setOpen(false); window.location.href = "/workspaces?view=create"; }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            New Brand
          </button>

          <div className="h-1" />
        </div>
      )}
    </div>
  );
}
