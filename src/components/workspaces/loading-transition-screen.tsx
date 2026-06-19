"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Command, Globe, LayoutGrid, Lock, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CAROUSEL_STAGES = [
  { label: "VERIFYING SESSION", icon: Lock },
  { label: "LOADING PROTOCOLS", icon: CheckCircle2 },
  { label: "CONNECTING ENGINE", icon: Command },
  { label: "SYNCING PIPELINES", icon: Globe },
  { label: "FETCHING CONFIG", icon: LayoutGrid },
  { label: "TUNING PERFORMANCE", icon: Sparkles },
  { label: "LAUNCHING WORKSPACE", icon: Rocket },
];

export function LoadingTransitionScreen({ 
  brand 
}: { 
  brand?: { name: string; logoUrl?: string | null } 
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const params = useParams();
  const slug = params?.slug as string;

  // Fallback to slug if brand is not explicitly passed
  const displayName = brand?.name || (slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Workspace");
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const logoUrl = brand?.logoUrl;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= CAROUSEL_STAGES.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#09090c] z-9999 flex flex-col items-center justify-center overflow-hidden animate-fade-in">
      <div className="text-center mb-8 flex flex-col items-center gap-2">
        {logoUrl ? (
          <div className="w-12 h-12 relative overflow-hidden rounded-lg border border-neutral-200 dark:border-white/10 shadow-sm">
            <img src={logoUrl} alt={displayName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
        )}
        <span className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mt-2">
          Initializing secure gateway
        </span>
      </div>

      <div className="relative h-[280px] w-full max-w-[320px] overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white dark:from-[#09090c] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white dark:from-[#09090c] to-transparent z-10 pointer-events-none" />

        <div 
          className="flex flex-col gap-3 w-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ 
            transform: `translateY(${-activeIndex * 56}px)`,
            paddingTop: '118px',
            paddingBottom: '118px'
          }}
        >
          {CAROUSEL_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === activeIndex;
            return (
              <div
                key={stage.label}
                className={cn(
                  "h-11 px-5 rounded-full flex items-center justify-center gap-3 border transition-all duration-300 font-sans tracking-wide text-xs font-bold w-[280px] mx-auto shrink-0 select-none",
                  isActive
                    ? "bg-linear-to-t from-[#8B5CF6]/15 via-white/40 to-white dark:from-purple-950/20 dark:via-transparent dark:to-zinc-900 border-[#8B5CF6]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(139,92,246,0.15)] text-[#8B5CF6] dark:text-[#a78bfa] scale-100 opacity-100"
                    : "bg-[#8B5CF6]/5 text-[#8B5CF6]/60 border-[#8B5CF6]/20 scale-95 opacity-40"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#8B5CF6] dark:text-[#a78bfa] animate-pulse" : "text-[#8B5CF6]/70")} />
                <span className="whitespace-nowrap">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
