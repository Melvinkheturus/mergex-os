"use client";

import { Building2, Globe, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  newBrandName: string;
  setNewBrandName: (val: string) => void;
  savingBrand: boolean;
  deletingBrandId: string | null;
  handleCreateBrand: () => void;
  handleArchiveBrand: (id: string, name: string) => void;
  defaultTimezone: string;
  setDefaultTimezone: (val: string) => void;
  defaultCurrency: string;
  setDefaultCurrency: (val: string) => void;
}

export function SettingsTabComponent({
  brandList,
  newBrandName,
  setNewBrandName,
  savingBrand,
  deletingBrandId,
  handleCreateBrand,
  handleArchiveBrand,
  defaultTimezone,
  setDefaultTimezone,
  defaultCurrency,
  setDefaultCurrency,
}: SettingsTabProps) {
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
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-[#8B5CF6]" />
            Brand Management
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create or archive brand divisions. Changes will immediately reflect on the main workspaces switcher list.
          </p>
        </div>

        {/* Create Brand Form */}
        <div className="flex gap-2.5 pt-1">
          <Input
            type="text"
            placeholder="Brand division name (e.g. OVRN Studios)..."
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newBrandName.trim()) {
                handleCreateBrand();
              }
            }}
            className="flex-1 h-9 bg-white dark:bg-[#0A0A0E] border-neutral-200 dark:border-white/6 text-xs placeholder-neutral-500 font-sans"
          />
          <Button
            onClick={handleCreateBrand}
            disabled={savingBrand || !newBrandName.trim()}
            className="px-4 h-9 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {savingBrand ? "Adding…" : "+ Add Brand"}
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
                  className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0"
                  style={{ backgroundColor: COLOR_HEX[b.color] ?? COLOR_HEX.violet }}
                >
                  {getBrandInitials(b.name)}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-none">{b.name}</p>
                  <code className="text-[9px] text-muted-foreground font-mono mt-1.5 block">/{b.slug}</code>
                </div>
              </div>
              
              <button
                onClick={() => handleArchiveBrand(b.id, b.name)}
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
