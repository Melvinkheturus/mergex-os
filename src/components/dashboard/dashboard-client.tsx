"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { NumberCounter } from "@/components/ui/number-counter";
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

// Helper to parse metric values like "124", "68.2%", "$48K", "3", "₹48K"
const parseKpiValue = (valStr: string) => {
  let prefix = "";
  let suffix = "";
  let cleanStr = valStr.trim();

  if (cleanStr.startsWith("$")) {
    prefix = "$";
    cleanStr = cleanStr.substring(1);
  } else if (cleanStr.startsWith("₹")) {
    prefix = "₹";
    cleanStr = cleanStr.substring(1);
  }

  if (cleanStr.endsWith("K")) {
    suffix = "K";
    cleanStr = cleanStr.slice(0, -1);
  } else if (cleanStr.endsWith("%")) {
    suffix = "%";
    cleanStr = cleanStr.slice(0, -1);
  }

  const parsed = parseFloat(cleanStr);
  const decimals = cleanStr.includes(".") ? cleanStr.split(".")[1].length : 0;

  return {
    value: isNaN(parsed) ? 0 : parsed,
    prefix,
    suffix,
    decimals,
    original: valStr
  };
};

interface Teammate {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  designation?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  role: {
    label: string;
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  status: string;
  createdAt: string;
}

interface Proposal {
  id: string;
  title: string;
  proposalNumber: string;
  status: string;
  value: number;
  createdAt: string;
}

interface Meeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  mode: string;
  meetingUrl: string | null;
  status: string;
  lead: {
    id: string;
    companyName: string;
    contactPerson: string;
  } | null;
  organizer: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  expectedValue: number | null;
  winLossStatus: string | null;
  nextActionDate: string | null;
  createdAt: string;
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
  stage: {
    id: string;
    name: string;
    label: string;
    color: string | null;
  } | null;
  source: {
    id: string;
    name: string;
  } | null;
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
  brandName: string;
  leads: Lead[];
  meetings: Meeting[];
  proposals: Proposal[];
  clients: Client[];
}

// Pool of 8 customizable KPIs
const KPI_POOL = {
  "active-leads": { label: "Active Leads", value: "0", trend: "0%", trendUp: false, desc: "vs last week" },
  "meetings-week": { label: "Meetings This Week", value: "0", trend: "0", trendUp: false, desc: "vs last week" },
  "proposal-conversion": { label: "Proposal Conversion", value: "0.0%", trend: "0%", trendUp: false, desc: "vs last month" },
  "active-clients": { label: "Active Clients", value: "0", trend: "0", trendUp: false, desc: "this month" },
  "payments-collected": { label: "Payments Collected", value: "₹0K", trend: "0%", trendUp: false, desc: "vs last month" },
  "unpaid-invoices": { label: "Unpaid Invoices", value: "₹0K", trend: "0%", trendUp: false, desc: "outstanding balance" },
  "overdue-actions": { label: "Overdue Actions", value: "0", trend: "None", trendUp: false, desc: "high priority items" },
  "completed-tasks": { label: "Completed Tasks", value: "0", trend: "0", trendUp: false, desc: "this week" },
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

export function DashboardClient({ 
  user, 
  teammates, 
  brands, 
  brandName,
  leads = [],
  meetings = [],
  proposals = [],
  clients = []
}: DashboardClientProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [greeting, setGreeting] = useState("Welcome back");

  // Dynamic calculations for KPIs
  const activeLeadsCount = leads.filter(l => !l.winLossStatus || l.winLossStatus === "OPEN").length;
  
  // Calculate meetings this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const meetingsThisWeek = meetings.filter(m => {
    const d = new Date(m.scheduledAt);
    return d >= startOfWeek && d < endOfWeek;
  }).length;

  const wonLeadsCount = leads.filter(l => l.winLossStatus === "WON").length;
  const lostLeadsCount = leads.filter(l => l.winLossStatus === "LOST").length;
  const totalClosedLeads = wonLeadsCount + lostLeadsCount;
  const conversionRate = totalClosedLeads > 0 ? ((wonLeadsCount / totalClosedLeads) * 100).toFixed(1) : "0.0";
  const activeClientsCount = clients.filter(c => c.status === "active").length;

  const wonLeadsValue = leads
    .filter(l => l.winLossStatus === "WON")
    .reduce((sum, l) => sum + (Number(l.expectedValue) || 0), 0);
  const unpaidExpectedValue = leads
    .filter(l => !l.winLossStatus || l.winLossStatus === "OPEN")
    .reduce((sum, l) => sum + (Number(l.expectedValue) || 0), 0);
  const overdueActionsCount = leads.filter(l => l.nextActionDate && new Date(l.nextActionDate) < new Date()).length;

  const dynamicKpiPool: Record<KpiType, { label: string; value: string; trend: string; trendUp: boolean; desc: string }> = {
    "active-leads": { 
      label: "Active Leads", 
      value: String(activeLeadsCount), 
      trend: `${leads.length > 0 ? Math.round((activeLeadsCount / leads.length) * 100) : 0}%`, 
      trendUp: true, 
      desc: "of total leads" 
    },
    "meetings-week": { 
      label: "Meetings This Week", 
      value: String(meetingsThisWeek), 
      trend: String(meetings.length), 
      trendUp: true, 
      desc: "total meetings" 
    },
    "proposal-conversion": { 
      label: "Proposal Conversion", 
      value: `${conversionRate}%`, 
      trend: `${wonLeadsCount} won`, 
      trendUp: wonLeadsCount > 0, 
      desc: `out of ${totalClosedLeads} closed` 
    },
    "active-clients": { 
      label: "Active Clients", 
      value: String(activeClientsCount), 
      trend: String(clients.length), 
      trendUp: true, 
      desc: "total onboarded" 
    },
    "payments-collected": { 
      label: "Payments Collected", 
      value: `₹${(wonLeadsValue / 1000).toFixed(0)}K`, 
      trend: `${wonLeadsCount} won deals`, 
      trendUp: wonLeadsValue > 0, 
      desc: "estimated value" 
    },
    "unpaid-invoices": { 
      label: "Unpaid Invoices", 
      value: `₹${(unpaidExpectedValue / 1000).toFixed(0)}K`, 
      trend: "pipeline", 
      trendUp: false, 
      desc: "active expected value" 
    },
    "overdue-actions": { 
      label: "Overdue Actions", 
      value: String(overdueActionsCount), 
      trend: "overdue", 
      trendUp: false, 
      desc: "requires attention" 
    },
    "completed-tasks": { 
      label: "Completed Tasks", 
      value: String(wonLeadsCount), 
      trend: "won", 
      trendUp: true, 
      desc: "converted leads" 
    },
  };

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

  // Interactive local Action Center list (starts empty for clean onboarding state)
  const [actions, setActions] = useState<{ id: string; text: string; urgency: string; done: boolean }[]>([]);

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

  // Update KPI slot - swaps automatically if already selected to prevent duplicates
  const handleSelectKpi = (slotIndex: number, kpiKey: KpiType) => {
    const updated = [...kpis];
    const existingIndex = updated.indexOf(kpiKey);
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      const temp = updated[slotIndex];
      updated[slotIndex] = kpiKey;
      updated[existingIndex] = temp;
      setKpis(updated);
      localStorage.setItem("mergex_dashboard_kpis", JSON.stringify(updated));
      toast.success(`Swapped KPI Cards: Slot #${slotIndex + 1} is now ${dynamicKpiPool[kpiKey].label}, Slot #${existingIndex + 1} is ${dynamicKpiPool[temp].label}`);
    } else {
      updated[slotIndex] = kpiKey;
      setKpis(updated);
      localStorage.setItem("mergex_dashboard_kpis", JSON.stringify(updated));
      toast.success(`KPI Card #${slotIndex + 1} updated to ${dynamicKpiPool[kpiKey].label}`);
    }
  };

  // Update Widget slot - swaps automatically if already selected to prevent duplicates
  const handleSelectWidget = (slotIndex: number, widgetKey: WidgetType) => {
    const updated = [...widgets];
    const existingIndex = updated.indexOf(widgetKey);
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      const temp = updated[slotIndex];
      updated[slotIndex] = widgetKey;
      updated[existingIndex] = temp;
      setWidgets(updated);
      localStorage.setItem("mergex_dashboard_widgets", JSON.stringify(updated));
      toast.success(`Swapped Panels: Slot #${slotIndex + 1} is now ${WIDGET_POOL[widgetKey].label}, Slot #${existingIndex + 1} is ${WIDGET_POOL[temp].label}`);
    } else {
      updated[slotIndex] = widgetKey;
      setWidgets(updated);
      localStorage.setItem("mergex_dashboard_widgets", JSON.stringify(updated));
      toast.success(`Panel #${slotIndex + 1} updated to ${WIDGET_POOL[widgetKey].label}`);
    }
  };

  // Action Center completed toggle
  const handleActionClick = (id: string, text: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
    toast.success(`Completed Action item`, {
      description: text,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    });
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-8">
      
      {/* ── 1. Page Header (Welcome + Quick Actions) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="text-left space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}, <span className="font-normal">{user?.firstName ?? "Teammate"}</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Here's your operational overview for <span className="font-semibold text-foreground/85">{brandName}</span> today.
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
              <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/crm/leads/new`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
                <Briefcase className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>New Lead</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/clients`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
                <Users className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>New Client</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/10 my-1" />
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                Utilities
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/documents`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
                <FileText className="h-3.5 w-3.5 text-[#8B5CF6]" />
                <span>Upload Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/workspaces/${slug}/crm/meetings`)} className="text-xs flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md">
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
          const kpi = dynamicKpiPool[kpiKey];
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
                    {(Object.keys(dynamicKpiPool) as KpiType[]).map((poolKey) => (
                      <DropdownMenuItem 
                        key={poolKey}
                        onClick={() => handleSelectKpi(slotIndex, poolKey)}
                        className="text-xs flex justify-between items-center px-2 py-1.5 cursor-pointer hover:bg-muted/50 rounded-md"
                      >
                        <span>{dynamicKpiPool[poolKey].label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/50">{dynamicKpiPool[poolKey].value}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <h3 className="text-3xl font-bold tracking-tight text-foreground font-mono leading-none mt-1">
                  {(() => {
                    const parsed = parseKpiValue(kpi.value);
                    return (
                      <NumberCounter
                        key={`${kpiKey}-${kpi.value}`}
                        value={parsed.value}
                        prefix={parsed.prefix}
                        suffix={parsed.suffix}
                        decimals={parsed.decimals}
                        duration={1.5}
                        easing="easeOut"
                      />
                    );
                  })()}
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
                    
                    {/* Helper to render widget items with active state indicators */}
                    {(["CRM", "Clients", "Team", "Documents"] as const).map((category, catIdx) => (
                      <div key={category}>
                        {catIdx > 0 && <DropdownMenuSeparator className="bg-border/10 my-1" />}
                        <DropdownMenuLabel className="text-[9px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                          {category === "CRM" ? "CRM Analytics" : category === "Clients" ? "Client Analytics" : category === "Team" ? "Team Analytics" : "Document Analytics"}
                        </DropdownMenuLabel>
                        {(Object.keys(WIDGET_POOL) as WidgetType[])
                          .filter(k => WIDGET_POOL[k].category === category)
                          .map(k => {
                            const isCurrentSlot = widgets[slotIndex] === k;
                            const isUsedElsewhere = !isCurrentSlot && widgets.includes(k);
                            return (
                              <DropdownMenuItem
                                key={k}
                                onClick={() => handleSelectWidget(slotIndex, k)}
                                className={cn(
                                  "text-xs px-2 py-1.5 cursor-pointer rounded-md flex items-center justify-between gap-2",
                                  isCurrentSlot
                                    ? "bg-[#8B5CF6]/5 text-[#8B5CF6] font-semibold"
                                    : isUsedElsewhere
                                    ? "text-muted-foreground/60 hover:bg-muted/50"
                                    : "hover:bg-muted/50"
                                )}
                              >
                                <span>{WIDGET_POOL[k].label}</span>
                                {isCurrentSlot && (
                                  <CheckCircle2 className="h-3 w-3 text-[#8B5CF6] shrink-0" />
                                )}
                                {isUsedElsewhere && (
                                  <span className="text-[8px] bg-muted/60 px-1 py-0.5 rounded font-medium shrink-0">↔ Swap</span>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center overflow-hidden p-6 pt-0">
                <AnalyticsWidget 
                  type={widgetKey} 
                  teammates={teammates} 
                  brands={brands} 
                  leads={leads}
                  meetings={meetings}
                  proposals={proposals}
                  clients={clients}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── 4. Bottom Row (Operational Feed + Upcoming Actions) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Operational Feed (2/3 width) */}
        <Card className="lg:col-span-2 flex flex-col min-h-[220px]">
          <CardHeader className="pb-3 p-6 shrink-0">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#8B5CF6]" />
              Operational Activity Feed
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/60">
              Real-time events happening across divisions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 grow flex items-center justify-center">
            {/* Empty state for Activity Feed */}
            <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
              <Activity className="h-8 w-8 text-muted-foreground/30 mb-2 animate-pulse" />
              <p className="font-semibold text-foreground">No recent activity</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5 max-w-[280px]">
                As sales workflows scale, real-time trigger notifications and pipeline transitions will stream here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Upcoming Action Center (1/3 width) */}
        <Card className="flex flex-col min-h-[220px]">
          <CardHeader className="pb-3 p-6 shrink-0">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B5CF6]" />
              Action Center
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/60">
              Immediate tasks requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 grow flex items-center justify-center">
            {actions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/30 mb-2" />
                <p className="font-semibold text-foreground">All caught up!</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5 max-w-[200px]">
                  No urgent action items or approval requests require your attention today.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-3">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
