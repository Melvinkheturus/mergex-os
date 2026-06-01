"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, ChevronDown, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

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

interface Props {
  brands: Brand[];
}

function getBrandInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function WorkspacesSettingsClient({ brands }: Props) {
  const router = useRouter();
  const [brandList, setBrandList] = useState<Brand[]>(brands);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [defaultTimezone, setDefaultTimezone] = useState("Asia/Kolkata");
  const [defaultCurrency, setDefaultCurrency] = useState("INR");

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create brand workspace.");
        return;
      }
      
      const newBrand: Brand = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        color: data.color ?? "violet",
        description: data.description ?? null,
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
      };

      setBrandList((prev) => [newBrand, ...prev]);
      setNewBrandName("");
      toast.success("Workspace brand division created successfully.");
    } catch (err) {
      toast.error("Network error - please try again.");
    } finally {
      setSavingBrand(false);
    }
  };

  const handleArchiveBrand = async (id: string, name: string) => {
    setDeletingBrandId(id);
    try {
      const res = await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to archive brand division.");
        return;
      }
      setBrandList((prev) => prev.filter((b) => b.id !== id));
      toast.success(`Workspace brand archived`, {
        description: `"${name}" has been removed from selection.`,
      });
    } catch (err) {
      toast.error("Network error - please try again.");
    } finally {
      setDeletingBrandId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col font-sans antialiased overflow-x-hidden selection:bg-purple-500/30 selection:text-white">
      
      {/* Subtle top horizontal ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-linear-to-r from-transparent via-[#8B5CF6]/30 to-transparent pointer-events-none" />

      {/* ── TOP NAVIGATION BAR ────────────────────────────────────── */}
      <header className="relative z-50 w-full border-b border-neutral-200 dark:border-white/5 bg-white/80 dark:bg-[#050507]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/workspaces")}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-200 dark:border-white/6 hover:border-neutral-300 dark:hover:border-white/12 bg-neutral-50 dark:bg-[#0E0E12] text-neutral-600 dark:text-neutral-300 hover:text-foreground dark:hover:text-white transition-all duration-150 shadow-sm cursor-pointer shrink-0"
              title="Back to Workspaces"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-foreground dark:text-white tracking-widest uppercase font-sans">
                SALES OS
              </span>
              <span className="text-[10px] text-muted-foreground/60">/</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Workspace Settings
              </span>
            </div>
          </div>

          {/* Right: Actions Menu */}
          <div className="flex items-center gap-3">
            <AnimatedThemeToggler />
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE HUB CONTENT ─────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans text-left">
            Workspace Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1 text-left">
            Manage operational brand divisions and regional defaults for Sales OS.
          </p>
        </div>

        {/* 1. Brand Management Card */}
        <div className="glass-frost-card rounded-[24px] border border-neutral-200 dark:border-white/5 p-6 bg-neutral-50/20 dark:bg-white/1 space-y-5 text-left shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-[#8B5CF6]" />
              Brand Management
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create or archive brand divisions. Changes will immediately reflect on the main workspace selection page.
            </p>
          </div>

          {/* Create Brand Form */}
          <div className="flex gap-2.5 pt-1">
            <input
              type="text"
              placeholder="Brand division name (e.g. OVRN Studios)..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newBrandName.trim()) {
                  handleCreateBrand();
                }
              }}
              className="flex-1 h-10 px-3 rounded-lg bg-neutral-50 dark:bg-[#0E0E12]/80 border border-neutral-200 dark:border-white/6 text-xs text-foreground dark:text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all font-sans"
            />
            <button
              onClick={handleCreateBrand}
              disabled={savingBrand || !newBrandName.trim()}
              className="px-4 h-10 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {savingBrand ? "Adding…" : "+ Add Brand"}
            </button>
          </div>

          {/* List of brands */}
          <div className="space-y-2 mt-4 text-left max-h-[360px] overflow-y-auto pr-1">
            {brandList.map((b) => (
              <div 
                key={b.id} 
                className="flex items-center justify-between p-3.5 border border-neutral-200 dark:border-white/5 rounded-xl bg-white dark:bg-[#0A0A0E] shadow-sm hover:border-neutral-300 dark:hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase shrink-0"
                    style={{ backgroundColor: COLOR_HEX[b.color] ?? COLOR_HEX.violet }}
                  >
                    {getBrandInitials(b.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-none">{b.name}</p>
                    <code className="text-[10px] text-muted-foreground font-mono mt-1.5 block">/{b.slug}</code>
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

        {/* 2. Brand Defaults Card */}
        <div className="glass-frost-card rounded-[24px] border border-neutral-200 dark:border-white/5 p-6 bg-neutral-50/20 dark:bg-white/1 space-y-5 text-left shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-[#8B5CF6]" />
              Regional Defaults
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Set regional timezone and default currency definitions for brand analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-500">Default Timezone</label>
              <div className="relative">
                <select 
                  value={defaultTimezone}
                  onChange={(e) => {
                    setDefaultTimezone(e.target.value);
                    toast.success(`Default timezone updated to ${e.target.value}`);
                  }}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-neutral-50 dark:bg-[#0E0E12]/80 border border-neutral-200 dark:border-white/6 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all font-sans cursor-pointer appearance-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-500">Default Currency</label>
              <div className="relative">
                <select 
                  value={defaultCurrency}
                  onChange={(e) => {
                    setDefaultCurrency(e.target.value);
                    toast.success(`Default currency updated to ${e.target.value}`);
                  }}
                  className="w-full h-10 px-3 pr-8 rounded-lg bg-neutral-50 dark:bg-[#0E0E12]/80 border border-neutral-200 dark:border-white/6 text-xs text-foreground dark:text-white focus:outline-none focus:border-[#8B5CF6]/50 transition-all font-sans cursor-pointer appearance-none"
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

      </main>
    </div>
  );
}
