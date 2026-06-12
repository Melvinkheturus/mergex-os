"use client";

import { MoreVertical } from "lucide-react";
import { NumberCounter } from "@/components/ui/number-counter";
import { cn } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { KpiType, parseKpiValue } from "./dashboard-types";

interface KpiCardProps {
  slotIndex: number;
  kpiKey: KpiType;
  kpiData: {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    desc: string;
  };
  sparklineData: number[];
  onSelectKpi: (slotIndex: number, kpiKey: KpiType) => void;
  kpiPool: Record<KpiType, { label: string; value: string; trend: string; trendUp: boolean; desc: string }>;
}

export function KpiCard({
  slotIndex,
  kpiKey,
  kpiData,
  sparklineData,
  onSelectKpi,
  kpiPool
}: KpiCardProps) {
  const parsed = parseKpiValue(kpiData.value);

  return (
    <div className="relative group/kpi border border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-[#111114]/70 backdrop-blur-md rounded-2xl p-5 transition-all flex flex-col justify-between h-[135px] text-left hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
      <div className="flex justify-between items-center w-full">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          {kpiData.label}
        </span>
        
        {/* dedicated trigger on top right of card for customization */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="h-5 w-5 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground/35 hover:text-foreground cursor-pointer focus:outline-hidden shrink-0 transition-colors"
              aria-label="Customize KPI slot"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-[#111114] border border-border/20 rounded-xl p-1 shadow-md">
            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
              Change KPI Metric
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/10 my-1" />
            {(Object.keys(kpiPool) as KpiType[]).map((poolKey) => (
              <DropdownMenuItem 
                key={poolKey}
                onClick={() => onSelectKpi(slotIndex, poolKey)}
                className="text-xs flex justify-between items-center px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
              >
                <span>{kpiPool[poolKey].label}</span>
                <span className="text-[10px] font-mono text-muted-foreground/50">{kpiPool[poolKey].value}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex items-end justify-between w-full mt-2">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h3 className="text-3xl font-extrabold tracking-tight text-foreground font-mono leading-none group-hover/kpi:text-[#8B5CF6] transition-colors duration-300">
            <NumberCounter
              key={`${kpiKey}-${kpiData.value}`}
              value={parsed.value}
              prefix={parsed.prefix}
              suffix={parsed.suffix}
              decimals={parsed.decimals}
              duration={1.5}
              easing="easeOut"
            />
          </h3>
          
          <div className="flex items-center gap-1.5 text-[10px] mt-2 shrink-0">
            <span className={cn(
              "font-bold flex items-center px-1.5 py-0.5 rounded-md text-[9px] shrink-0 border",
              kpiData.trendUp 
                ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/5 dark:border-emerald-500/10" 
                : "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/5 dark:border-amber-500/10"
            )}>
              {kpiData.trendUp ? "↗" : "↘"} {kpiData.trend}
            </span>
            <span className="text-muted-foreground/60 truncate max-w-[80px] font-semibold" title={kpiData.desc}>
              {kpiData.desc}
            </span>
          </div>
        </div>

        {/* Sparkline chart */}
        <div className="h-11 w-20 shrink-0 opacity-80 group-hover/kpi:opacity-100 transition-opacity duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={sparklineData.map((v, i) => ({ id: i, value: v }))}
              margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
            >
              <Area
                type="monotone"
                dataKey="value"
                stroke={kpiData.trendUp ? "#10B981" : "#EF4444"}
                strokeWidth={1.5}
                fillOpacity={0.15}
                fill={kpiData.trendUp ? "url(#emeraldAreaSpark)" : "url(#roseAreaSpark)"}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
