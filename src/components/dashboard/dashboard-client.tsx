"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Plus, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  Activity,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { AnalyticsWidget } from "@/components/dashboard/analytics-widgets";

interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  role: {
    label: string;
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  teammates: Teammate[];
  brands: Brand[];
}

// Pool of 8 customizable KPIs
const KPI_POOL = {
  "active-leads": { label: "Active Leads", value: "124", trend: "↑ 12%", trendUp: true, desc: "vs last week" },
  "meetings-week": { label: "Meetings This Week", value: "8", trend: "+4", trendUp: true, desc: "vs last week" },
  "proposal-conversion": { label: "Proposal Conversion", value: "68.2%", trend: "↑ 2.4%", trendUp: true, desc: "vs last month" },
  "active-clients": { label: "Active Clients", value: "16", trend: "↑ 1", trendUp: true, desc: "this month" },
  "payments-collected": { label: "Payments Collected", value: "$48K", trend: "↑ 14%", trendUp: true, desc: "vs last month" },
  "unpaid-invoices": { label: "Unpaid Invoices", value: "$12K", trend: "↓ 5%", trendUp: false, desc: "outstanding balance" },
  "overdue-actions": { label: "Overdue Actions", value: "3", trend: "Urgent", trendUp: false, desc: "high priority items" },
  "completed-tasks": { label: "Completed Tasks", value: "56", trend: "+8", trendUp: true, desc: "this week" },
};

type KpiType = keyof typeof KPI_POOL;

// Pool of exactly 8 core customizable widgets (reduced for MVP focus)
const WIDGET_POOL = {
  // CRM
  "pipeline-funnel": { label: "Pipeline Funnel", category: "CRM" },
  "lead-sources": { label: "Lead Sources", category: "CRM" },
  "proposal-win-rate": { label: "Proposal Win Rate", category: "CRM" },
  // Clients
  "client-health": { label: "Client Health", category: "Clients" },
  "projects-by-status": { label: "Projects by Status", category: "Clients" },
  // Team
  "cx-workload": { label: "CX Workload", category: "Team" },
  // Documents
  "pending-agreements": { label: "Pending Agreements", category: "Documents" },
  "invoice-status": { label: "Invoice Status", category: "Documents" },
};

type WidgetType = keyof typeof WIDGET_POOL;

export function DashboardClient({ user, teammates, brands }: DashboardClientProps) {
  const [greeting, setGreeting] = useState("Welcome back");

  // Layout states for customized KPI slots (4 slots)
  const [kpis, setKpis] = useState<KpiType[]>([
    "active-leads",
    "meetings-week",
    "proposal-conversion",
    "active-clients"
  ]);

  // Layout states for customized Analytics panel slots (4 slots)
  const [widgets, setWidgets] = useState<WidgetType[]>([
    "pipeline-funnel",
    "lead-sources",
    "client-health",
    "cx-workload"
  ]);

  // Interactive local Action Center list
  const [actions, setActions] = useState([
    { id: "action-1", text: "Follow up with Menswear Brand proposal signature", urgency: "High", done: false },
    { id: "action-2", text: "Schedule review meeting with OVRN Studios", urgency: "Medium", done: false },
    { id: "action-3", text: "Invite new team members to default brand", urgency: "Low", done: false },
  ]);

  // Load customizations on mount
  useEffect(() => {
    // Dynamic greeting
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Load localStorage settings
    const savedKpis = localStorage.getItem("mergex_dashboard_kpis");
    if (savedKpis) {
      try {
        const parsed = JSON.parse(savedKpis) as KpiType[];
        if (parsed.length === 4) setKpis(parsed);
      } catch (e) {}
    }

    const savedWidgets = localStorage.getItem("mergex_dashboard_widgets");
    if (savedWidgets) {
      try {
        const parsed = JSON.parse(savedWidgets) as WidgetType[];
        if (parsed.length === 4) setWidgets(parsed);
      } catch (e) {}
    }
  }, []);

  // Update KPI slot
  const handleSelectKpi = (slotIndex: number, kpiKey: KpiType) => {
    const updated = [...kpis];
    updated[slotIndex] = kpiKey;
    setKpis(updated);
    localStorage.setItem("mergex_dashboard_kpis", JSON.stringify(updated));
    toast.success(`KPI Card #${slotIndex + 1} updated to ${KPI_POOL[kpiKey].label}`);
  };

  // Update Widget slot
  const handleSelectWidget = (slotIndex: number, widgetKey: WidgetType) => {
    const updated = [...widgets];
    updated[slotIndex] = widgetKey;
    setWidgets(updated);
    localStorage.setItem("mergex_dashboard_widgets", JSON.stringify(updated));
    toast.success(`Panel #${slotIndex + 1} updated to ${WIDGET_POOL[widgetKey].label}`);
  };

  // Action Center completed toggle
  const handleActionClick = (id: string, text: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
    toast.success(`Completed Action item`, {
      description: text,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    });
  };
  const handleNewAction = () => {
    toast.info("Feature Coming Soon", {
      description: "Quick creations are currently being wired to the CRM workflow builder."
    });
  };

  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  useEffect(() => {
    setActiveBrandId(localStorage.getItem("mergex_active_brand"));

    const handleBrandChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveBrandId(customEvent.detail.brandId);
    };

    window.addEventListener("mergex:brand-changed", handleBrandChange);
    return () => {
      window.removeEventListener("mergex:brand-changed", handleBrandChange);
    };
  }, []);

  const activeBrandName = brands.find((b) => b.id === activeBrandId)?.name ?? "All Brands";

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-8">
      
      {/* ── 1. Page Header (Welcome + Quick Actions) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="text-left space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, {user?.firstName ?? "Teammate"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Here's your operational overview for <span className="font-semibold text-foreground/85">{activeBrandName}</span> today.
          </p>
        </div>

        {/* Global Quick Action Dropdown */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 text-xs font-semibold bg-[#4C1D95] hover:bg-[#3B0764] text-white flex items-center gap-1.5 transition-all cursor-pointer rounded-md shadow-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Create</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#111114] border border-border/20 rounded-xl shadow-lg p-1">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                Sales Workflows
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleNewAction} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
                <Briefcase className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>New Lead</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewAction} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
                <Users className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>New Client</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/10 my-1" />
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                Utilities
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleNewAction} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
                <FileText className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>Upload Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNewAction} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
                <Calendar className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>Schedule Meeting</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* ── 2. KPI Strip (Floating, borderless cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpiKey, slotIndex) => {
          const kpi = KPI_POOL[kpiKey];
          return (
            <div key={slotIndex} className="relative group/kpi glass-frost-card rounded-[20px] p-6 transition-all flex flex-col justify-between h-[120px] text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
              <div className="flex justify-between items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  {kpi.label}
                </span>
                
                {/* dedicated trigger on top right of card for customization */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="h-5 w-5 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground/35 hover:text-foreground cursor-pointer focus:outline-none shrink-0 transition-colors"
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
                    {(Object.keys(KPI_POOL) as KpiType[]).map((poolKey) => (
                      <DropdownMenuItem 
                        key={poolKey}
                        onClick={() => handleSelectKpi(slotIndex, poolKey)}
                        className="text-xs flex justify-between items-center px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                      >
                        <span>{KPI_POOL[poolKey].label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/50">{KPI_POOL[poolKey].value}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold tracking-tight text-foreground font-mono leading-none mt-1">
                  {kpi.value}
                </h3>
                <p className="text-[10px] text-muted-foreground/50 mt-1.5 flex items-center gap-1.5">
                  <span className={kpi.trendUp ? "text-emerald-500 font-bold" : "text-muted-foreground/70 font-semibold"}>
                    {kpi.trend}
                  </span>
                  <span>{kpi.desc}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Analytics Grid (Normalized panel heights to prevent layout shift) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.map((widgetKey, slotIndex) => {
          const activeWidget = WIDGET_POOL[widgetKey];
          return (
            <Card key={slotIndex} className="flex flex-col h-[375px]">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 shrink-0 p-6">
                <div className="space-y-1 text-left">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {widgetKey.startsWith("pipeline") || widgetKey.startsWith("lead") || widgetKey.startsWith("proposal") ? (
                      <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                    ) : widgetKey.startsWith("client") || widgetKey.startsWith("projects") ? (
                      <Users className="w-4 h-4 text-[#8B5CF6]" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#8B5CF6]" />
                    )}
                    <span>{activeWidget.label}</span>
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground/50 tracking-wider uppercase font-semibold">
                    Category: {activeWidget.category}
                  </CardDescription>
                </div>

                {/* Dropdown panel switcher */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-muted-foreground hover:text-[#8B5CF6] hover:bg-muted/40 cursor-pointer rounded-md">
                      <span>Change Widget</span>
                      <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 bg-white dark:bg-[#111114] border border-border/20 rounded-xl p-1 shadow-md max-h-80 overflow-y-auto">
                    
                    {/* CRM Section */}
                    <DropdownMenuLabel className="text-[9px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                      CRM Analytics
                    </DropdownMenuLabel>
                    {(Object.keys(WIDGET_POOL) as WidgetType[])
                       .filter(k => WIDGET_POOL[k].category === "CRM")
                       .map(k => (
                        <DropdownMenuItem 
                          key={k} 
                          onClick={() => handleSelectWidget(slotIndex, k)}
                          className="text-xs px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                        >
                          {WIDGET_POOL[k].label}
                        </DropdownMenuItem>
                      ))}
                    
                    <DropdownMenuSeparator className="bg-border/10 my-1" />
                    
                    {/* Client Section */}
                    <DropdownMenuLabel className="text-[9px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                      Client Analytics
                    </DropdownMenuLabel>
                    {(Object.keys(WIDGET_POOL) as WidgetType[])
                       .filter(k => WIDGET_POOL[k].category === "Clients")
                       .map(k => (
                        <DropdownMenuItem 
                          key={k} 
                          onClick={() => handleSelectWidget(slotIndex, k)}
                          className="text-xs px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                        >
                          {WIDGET_POOL[k].label}
                        </DropdownMenuItem>
                      ))}
                    
                    <DropdownMenuSeparator className="bg-border/10 my-1" />
                    
                    {/* Team Section */}
                    <DropdownMenuLabel className="text-[9px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                      Team Analytics
                    </DropdownMenuLabel>
                    {(Object.keys(WIDGET_POOL) as WidgetType[])
                       .filter(k => WIDGET_POOL[k].category === "Team")
                       .map(k => (
                        <DropdownMenuItem 
                          key={k} 
                          onClick={() => handleSelectWidget(slotIndex, k)}
                          className="text-xs px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                        >
                          {WIDGET_POOL[k].label}
                        </DropdownMenuItem>
                      ))}

                    <DropdownMenuSeparator className="bg-border/10 my-1" />
                    
                    {/* Documents Section */}
                    <DropdownMenuLabel className="text-[9px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                      Document Analytics
                    </DropdownMenuLabel>
                    {(Object.keys(WIDGET_POOL) as WidgetType[])
                       .filter(k => WIDGET_POOL[k].category === "Documents")
                       .map(k => (
                        <DropdownMenuItem 
                          key={k} 
                          onClick={() => handleSelectWidget(slotIndex, k)}
                          className="text-xs px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                        >
                          {WIDGET_POOL[k].label}
                        </DropdownMenuItem>
                      ))}

                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center overflow-hidden p-6 pt-0">
                <AnalyticsWidget type={widgetKey} teammates={teammates} brands={brands} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── 4. Bottom Row (Operational Feed + Upcoming Actions) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Operational Feed (2/3 width) */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 p-6">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#8B5CF6]" />
              Operational Activity Feed
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/60">
              Real-time events happening across divisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            {/* Timeline feed: operationally meaningful events only */}
            <div className="space-y-5">
              <div className="flex gap-3 text-xs leading-none">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="font-semibold text-foreground">
                    Proposal approved by {activeBrandName}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    3 hours ago · Active workflow
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-xs leading-none">
                <div className="h-7 w-7 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="font-semibold text-foreground">
                    Client OVRN Studios moved to onboarding stage
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    5 hours ago · Engagement coordinator
                  </p>
                </div>
              </div>

              <div className="flex gap-3 text-xs leading-none">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-1 text-left">
                  <p className="font-semibold text-foreground">
                    Invoice #1204 paid by OVRN Studios ($5,000)
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    1 day ago · Billing system
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Upcoming Action Center (1/3 width) */}
        <Card>
          <CardHeader className="pb-3 p-6">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B5CF6]" />
              Action Center
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/60">
              Immediate tasks requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            {actions.map((act) => (
              <div 
                key={act.id} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border border-border/10 text-xs transition-all",
                  act.done ? "opacity-45 bg-muted/20 border-muted" : "bg-muted/30 hover:bg-muted/50 cursor-pointer"
                )}
                onClick={() => !act.done && handleActionClick(act.id, act.text)}
              >
                <div className="mt-0.5 shrink-0">
                  {act.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-4 w-4 rounded border border-muted-foreground/30 hover:border-[#8B5CF6] transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn("font-semibold text-foreground leading-tight truncate", act.done && "line-through")}>
                    {act.text}
                  </p>
                  <span className={cn(
                    "text-[8px] uppercase tracking-wide font-extrabold px-1 rounded-sm mt-1 inline-block",
                    act.urgency === "High" ? "bg-red-500/10 text-red-500" :
                    act.urgency === "Medium" ? "bg-amber-500/10 text-amber-500" :
                    "bg-blue-500/10 text-blue-500"
                  )}>
                    {act.urgency} Priority
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
