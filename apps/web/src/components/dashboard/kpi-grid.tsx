"use client";

import { KpiCard } from "./kpi-card";
import { KpiType } from "./dashboard-types";

interface KpiGridProps {
  kpis: KpiType[];
  dynamicKpiPool: Record<KpiType, { label: string; value: string; trend: string; trendUp: boolean; desc: string }>;
  getKpiSparklineData: (kpiKey: KpiType) => number[];
  onSelectKpi: (slotIndex: number, kpiKey: KpiType) => void;
}

export function KpiGrid({
  kpis,
  dynamicKpiPool,
  getKpiSparklineData,
  onSelectKpi
}: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Sparkline Gradient Definitions */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <linearGradient id="emeraldAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="roseAreaSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>

      {kpis.map((kpiKey, slotIndex) => (
        <KpiCard
          key={slotIndex}
          slotIndex={slotIndex}
          kpiKey={kpiKey}
          kpiData={dynamicKpiPool[kpiKey]}
          sparklineData={getKpiSparklineData(kpiKey)}
          onSelectKpi={onSelectKpi}
          kpiPool={dynamicKpiPool}
        />
      ))}
    </div>
  );
}
