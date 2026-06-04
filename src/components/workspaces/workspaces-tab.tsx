"use client";

import { Search, FolderKanban, Plus, Users } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

// ── Brand color palette - each brand gets a unique accent ─────────────────
const BRAND_COLORS = [
  { bg: "from-violet-500/10 to-purple-600/10", border: "border-violet-500/30", avatar: "bg-linear-to-br from-violet-500 to-purple-600", text: "text-violet-400" },
  { bg: "from-indigo-500/10 to-blue-600/10",   border: "border-indigo-500/30", avatar: "bg-linear-to-br from-indigo-500 to-blue-600", text: "text-indigo-400" },
  { bg: "from-rose-500/10 to-pink-600/10",     border: "border-rose-500/30",   avatar: "bg-linear-to-br from-rose-500 to-pink-600",   text: "text-rose-400" },
  { bg: "from-amber-500/10 to-orange-600/10",  border: "border-amber-500/30",  avatar: "bg-linear-to-br from-amber-500 to-orange-600",  text: "text-amber-400" },
  { bg: "from-emerald-500/10 to-teal-600/10",  border: "border-emerald-500/30",avatar: "bg-linear-to-br from-emerald-500 to-teal-600",text: "text-emerald-400" },
  { bg: "from-sky-500/10 to-cyan-600/10",      border: "border-sky-500/30",    avatar: "bg-linear-to-br from-sky-500 to-cyan-600",    text: "text-sky-400" },
];

const COLOR_HEX: Record<string, string> = {
  violet:  "#8B5CF6",
  indigo:  "#6366F1",
  rose:    "#F43F5E",
  amber:   "#F59E0B",
  emerald: "#10B981",
  sky:     "#0EA5E9",
};

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  color: string;
  description: string | null;
  createdAt: string;
}



function getBrandInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getBrandColor(index: number) {
  return BRAND_COLORS[index % BRAND_COLORS.length];
}

interface WorkspacesTabProps {
  filteredBrands: Brand[];
  activeBrandId: string | null;
  loadingBrandId: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  canCreateBrand: boolean;
  mounted: boolean;
  handleSelectBrand: (brand: Brand) => void;
  onNewBrand: () => void;
}

export function WorkspacesTab({
  filteredBrands,
  activeBrandId,
  loadingBrandId,
  searchQuery,
  setSearchQuery,
  canCreateBrand,
  mounted,
  handleSelectBrand,
  onNewBrand,
}: WorkspacesTabProps) {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
          Brand Workspaces
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Select a brand workspace to access its lead pipeline, clients and documents.
        </p>
      </div>

      {/* Search Bar & New Brand Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-neutral-50 dark:bg-[#0E0E12]/80 border border-neutral-200 dark:border-white/6 text-xs text-foreground dark:text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
          />
        </div>
        {canCreateBrand && (
          <LiquidMetalButton
            label="New Brand"
            onClick={onNewBrand}
            width={130}
            height={36}
            icon={<Plus className="w-3.5 h-3.5" />}
          />
        )}
      </div>

      {/* Grid block */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
          {searchQuery ? "Search Results" : "All Workspace Environments"}
        </h3>
        
        {filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-neutral-200 dark:border-white/5 bg-[#0E0E12]/20">
            <FolderKanban className="w-8 h-8 text-neutral-600 mb-3" />
            <p className="text-xs font-semibold text-neutral-400">No workspaces found</p>
            <p className="text-[10px] text-neutral-600 mt-1">Try searching for a different brand name or slug.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrands.map((brand, i) => {
              const initials = getBrandInitials(brand.name);
              const isActive = brand.id === activeBrandId;
              const isLoading = brand.id === loadingBrandId;

              return (
                <button
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand)}
                  disabled={isLoading}
                  className={cn(
                    "group relative flex flex-col justify-between text-left p-5.5 rounded-xl",
                    "bg-card text-card-foreground dark:bg-[#0E0E12] border cursor-pointer min-h-[110px] transition-colors duration-200",
                    "hover:border-neutral-300 dark:hover:border-white/10",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50",
                    isActive
                      ? "border-purple-500/60"
                      : "border-neutral-200 dark:border-white/5"
                  )}
                  style={{
                    transitionDelay: mounted ? `${i * 30}ms` : "0ms",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/60 backdrop-blur-[1px] z-50">
                      <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Card Header: Avatar & Name */}
                  <div className="w-full flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      {/* Brand Logo or Initials */}
                      <div
                        className="w-8.5 h-8.5 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0 relative"
                        style={{ backgroundColor: brand.logoUrl ? "transparent" : (COLOR_HEX[brand.color] ?? COLOR_HEX.violet) }}
                      >
                        {brand.logoUrl ? (
                          <Image
                            src={brand.logoUrl}
                            alt={brand.name}
                            fill
                            sizes="34px"
                            className="object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground leading-tight">
                          {brand.name}
                        </h3>
                        {brand.description ? (
                          <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug line-clamp-1 max-w-[150px]">
                            {brand.description}
                          </p>
                        ) : (
                          <p className="text-[9px] text-neutral-500 font-mono mt-0.5 leading-none">
                            {brand.slug}
                          </p>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <span className="text-[8px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25 select-none leading-none">
                        Last Used
                      </span>
                    )}
                  </div>

                  {/* Brand creation date */}
                  <div className="w-full mt-4 flex items-center justify-between text-[9px] text-neutral-500 font-mono relative z-10">
                    <span>Created</span>
                    <span>{new Date(brand.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>

                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
