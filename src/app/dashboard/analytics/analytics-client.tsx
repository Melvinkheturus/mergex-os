"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Handshake,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Thermometer,
  Snowflake,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

// ─── Mock data (replace with real Prisma queries) ────────────────────────────

const revenueData = [
  { month: "Jan", pipeline: 0, won: 0 },
  { month: "Feb", pipeline: 0, won: 0 },
  { month: "Mar", pipeline: 0, won: 0 },
  { month: "Apr", pipeline: 0, won: 0 },
  { month: "May", pipeline: 120000, won: 45000 },
];

const pipelineStageData = [
  { stage: "Generated", count: 0, label: "Lead Generated" },
  { stage: "Enriched", count: 0, label: "Lead Enriched" },
  { stage: "ICP Qual.", count: 0, label: "ICP Qualified" },
  { stage: "Temp. Set", count: 0, label: "Temperature Assigned" },
  { stage: "Warm", count: 0, label: "Warm Nurture" },
  { stage: "Cold", count: 0, label: "Cold Nurture" },
  { stage: "Meeting", count: 0, label: "Meeting Prepared" },
  { stage: "Discovery", count: 0, label: "Discovery Completed" },
  { stage: "Gate", count: 0, label: "Qualification Gate" },
  { stage: "Proposal", count: 0, label: "Proposal Handoff" },
  { stage: "Won", count: 0, label: "Won" },
];

const temperatureData = [
  { name: "Hot", value: 0, color: "#EF4444" },
  { name: "Warm", value: 0, color: "#F59E0B" },
  { name: "Cold", value: 0, color: "#3B82F6" },
  { name: "Unset", value: 1, color: "#E5E7EB" },
];

const conversionData = [
  { stage: "Generated", leads: 0 },
  { stage: "Qualified", leads: 0 },
  { stage: "Meeting", leads: 0 },
  { stage: "Proposal", leads: 0 },
  { stage: "Won", leads: 0 },
];

// ─── KPI cards ───────────────────────────────────────────────────────────────

const kpis: Array<{
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: any;
  description: string;
}> = [
  {
    title: "Total Pipeline Value",
    value: "₹0",
    change: 0,
    trend: "neutral",
    icon: DollarSign,
    description: "Active deal value",
  },
  {
    title: "Leads in Pipeline",
    value: "0",
    change: 0,
    trend: "neutral" as const,
    icon: TrendingUp,
    description: "Across all stages",
  },
  {
    title: "Win Rate",
    value: "0%",
    change: 0,
    trend: "neutral" as const,
    icon: Target,
    description: "Won / Total closed",
  },
  {
    title: "Avg. ICP Score",
    value: "—",
    change: 0,
    trend: "neutral" as const,
    icon: Users,
    description: "Lead quality index",
  },
  {
    title: "Deals Won",
    value: "0",
    change: 0,
    trend: "neutral" as const,
    icon: Handshake,
    description: "This month",
  },
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
}: (typeof kpis)[number]) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />}
          {trend === "down" && <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
          <span
            className={`text-xs font-medium ${
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {change > 0 ? `+${change}%` : change === 0 ? "—" : `${change}%`}
          </span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-md p-3 text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.name}:</span>
            <span className="font-medium text-foreground">
              {typeof p.value === "number" && p.name.toLowerCase().includes("pipeline") || p.name.toLowerCase().includes("won")
                ? `₹${p.value.toLocaleString()}`
                : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Revenue, pipeline health, and sales performance insights
          </p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-3 h-6">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-3 h-6">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-3 h-6">90D</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-3 h-6">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Area Chart – 2/3 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Revenue Overview</CardTitle>
                <CardDescription className="text-xs mt-0.5">Pipeline vs. Won revenue by month</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gradPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradWon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="pipeline" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradPipeline)" name="Pipeline" />
                <Area type="monotone" dataKey="won" stroke="#10B981" strokeWidth={2} fill="url(#gradWon)" name="Won" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Temperature Donut – 1/3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Lead Temperature</CardTitle>
            <CardDescription className="text-xs">Distribution across hot / warm / cold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={temperatureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {temperatureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: "Hot", icon: Flame, color: "text-red-500", count: 0 },
                { label: "Warm", icon: Thermometer, color: "text-amber-500", count: 0 },
                { label: "Cold", icon: Snowflake, color: "text-blue-500", count: 0 },
              ].map(({ label, icon: Icon, color, count }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-lg font-bold">{count}</span>
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pipeline Stage Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pipeline Stage Distribution</CardTitle>
            <CardDescription className="text-xs">Leads at each of the 11 stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineStageData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={56} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Conversion Funnel</CardTitle>
            <CardDescription className="text-xs">Leads dropping off at each stage gate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={conversionData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="leads" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Empty state note */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center gap-3 py-5">
          <TrendingDown className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Charts show live data from your pipeline. Add leads via the Pipeline board to start seeing real analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
