"use client";

import { Search, FolderKanban, Plus, Pencil } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";



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
  onGoToSettings?: () => void;
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
  onGoToSettings,
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
                <div
                  key={brand.id}
                  onClick={() => !isLoading && handleSelectBrand(brand)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!isLoading) handleSelectBrand(brand);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "group relative flex flex-col text-left p-3 rounded-[20px]",
                    "bg-white dark:bg-[#0E0E12]/80 text-neutral-900 dark:text-white border border-neutral-200/90 dark:border-white/6 cursor-pointer transition-all duration-300 shadow-md shadow-neutral-100 dark:shadow-none w-full max-w-[240px] ml-0 mr-auto overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                    "hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-[1.03] hover:-translate-y-1",
                    isActive
                      ? "ring-2 ring-purple-500/80 border-transparent"
                      : "hover:border-neutral-300 dark:hover:border-white/10"
                  )}
                  style={{
                    transitionDelay: mounted ? `${i * 30}ms` : "0ms",
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(12px)",
                  }}
                >
                  {/* 1. Brand Image Container - Very Less Padding (inherits p-3 from card) */}
                  <div className="relative w-full aspect-square rounded-[14px] overflow-hidden bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-white/5 flex items-center justify-center transition-all duration-300 z-10">
                    {/* Ambient Light Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-neutral-100/30 dark:from-neutral-900/50 dark:to-neutral-900/10 pointer-events-none" />
                    
                    {/* Loading Overlay inside the Image Container */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-[#0E0E12]/75 backdrop-blur-[1px] z-30">
                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Edit Icon Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onGoToSettings) {
                          onGoToSettings();
                        }
                      }}
                      className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/95 dark:bg-neutral-800/95 shadow-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 border border-neutral-200/50 dark:border-white/10 hover:scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      title="Edit Brand"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        fill
                        sizes="240px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-4xl font-extrabold tracking-wider text-neutral-800 dark:text-neutral-200 font-sans select-none">
                        {initials}
                      </span>
                    )}
                  </div>

                  {/* 2. Text Content Area */}
                  <div className="w-full pt-4 px-2 pb-2 flex flex-col flex-grow z-10">
                    {/* Brand Name */}
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white font-sans tracking-tight leading-tight text-center w-full uppercase">
                      {brand.name.toUpperCase()}
                    </h3>

                    {/* Brand Description - Only if provided */}
                    {brand.description && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2 line-clamp-2 text-center w-full">
                        {brand.description}
                      </p>
                    )}

                    {/* 3. Created & Last Use Footer */}
                    <div className="w-full mt-auto pt-4 flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-sans font-semibold">Created</span>
                        <span className="text-neutral-500 dark:text-neutral-400">{new Date(brand.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>

                      {isActive ? (
                        <div className="flex flex-col items-end">
                           <span className="text-[8px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-sans font-bold flex items-center gap-1 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            Last Used
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-sans font-semibold">Status</span>
                          <span className="text-neutral-500 dark:text-neutral-400">Ready</span>
                        </div>
                      )}
                    </div>
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
