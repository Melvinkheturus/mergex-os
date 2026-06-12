"use client";

import { useState } from "react";
import { Building2, Globe, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  deletingBrandId,
  handleArchiveBrand,
  defaultTimezone,
  setDefaultTimezone,
  defaultCurrency,
  setDefaultCurrency,
  onNewBrand,
}: SettingsTabProps) {
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

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
    </div>
  );
}
