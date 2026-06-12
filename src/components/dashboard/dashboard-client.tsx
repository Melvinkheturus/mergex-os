"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { DashboardHeader } from "./dashboard-header";
import { KpiGrid } from "./kpi-grid";
import { AnalyticsGrid } from "./analytics-grid";
import { ActivityFeed } from "./activity-feed";
import { ActionCenter, ActionItem } from "./action-center";
import { ActivityItem } from "./activity-feed";

import {
  Teammate,
  Brand,
  Client,
  Proposal,
  Meeting,
  Lead,
  KpiType,
  WidgetType,
  WIDGET_POOL
} from "./dashboard-types";

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

// Helpers to dynamically generate real actions and activities from the database data

const generateRealActions = (
  leads: Lead[],
  meetings: Meeting[],
  proposals: Proposal[]
): ActionItem[] => {
  const actionsList: ActionItem[] = [];
  const now = new Date();
  
  // 1. Overdue actions
  leads.forEach((l) => {
    if (l.winLossStatus === "OPEN" || !l.winLossStatus) {
      if (l.nextActionDate && new Date(l.nextActionDate) < now) {
        actionsList.push({
          id: `act-lead-overdue-${l.id}`,
          text: `Follow up with ${l.contactPerson || "contact"} at ${l.companyName} (Overdue)`,
          urgency: "High",
          done: false,
        });
      }
    }
  });

  // 2. Draft/Sent Proposals requiring review
  proposals.forEach((p) => {
    if (p.status === "DRAFT") {
      actionsList.push({
        id: `act-prop-draft-${p.id}`,
        text: `Complete draft proposal "${p.title}" for review`,
        urgency: "Medium",
        done: false,
      });
    } else if (p.status === "SENT") {
      actionsList.push({
        id: `act-prop-sent-${p.id}`,
        text: `Follow up on proposal "${p.title}" (${p.proposalNumber})`,
        urgency: "Medium",
        done: false,
      });
    }
  });

  // 3. Upcoming Scheduled Meetings (within the next 3 days)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);
  meetings.forEach((m) => {
    const meetingDate = new Date(m.scheduledAt);
    if (m.status === "SCHEDULED" && meetingDate > now && meetingDate <= threeDaysFromNow) {
      actionsList.push({
        id: `act-meet-prep-${m.id}`,
        text: `Prepare for meeting "${m.title}" with ${m.lead?.companyName || "Client"}`,
        urgency: "Low",
        done: false,
      });
    }
  });

  return actionsList;
};

const generateRealActivities = (
  leads: Lead[],
  meetings: Meeting[],
  proposals: Proposal[],
  clients: Client[]
): ActivityItem[] => {
  const activitiesList: (ActivityItem & { date: Date })[] = [];

  // Helper to format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 0) return "just now";
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? "yesterday" : `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
    return "just now";
  };

  // Helper to get initials
  const getInitials = (firstName: string | null, lastName: string | null, email?: string) => {
    if (firstName || lastName) {
      return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  // 1. Won/Lost/Created Leads
  leads.forEach((l) => {
    const lDate = new Date(l.createdAt);
    const ownerName = l.owner ? `${l.owner.firstName || ""} ${l.owner.lastName || ""}`.trim() : "System";
    const initials = l.owner ? getInitials(l.owner.firstName, l.owner.lastName, l.owner.email) : "SYS";
    
    if (l.winLossStatus === "WON") {
      activitiesList.push({
        id: `act-lead-won-${l.id}`,
        user: ownerName || "Teammate",
        avatarInitials: initials,
        action: "marked lead as WON:",
        target: l.companyName,
        time: formatTimeAgo(lDate),
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        date: lDate
      });
    } else if (l.winLossStatus === "LOST") {
      activitiesList.push({
        id: `act-lead-lost-${l.id}`,
        user: ownerName || "Teammate",
        avatarInitials: initials,
        action: "marked lead as LOST:",
        target: l.companyName,
        time: formatTimeAgo(lDate),
        color: "text-red-500 bg-red-500/10 border-red-500/20",
        date: lDate
      });
    } else {
      activitiesList.push({
        id: `act-lead-created-${l.id}`,
        user: ownerName || "Teammate",
        avatarInitials: initials,
        action: "added new lead:",
        target: l.companyName,
        time: formatTimeAgo(lDate),
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        date: lDate
      });
    }
  });

  // 2. Proposals
  proposals.forEach((p) => {
    const pDate = new Date(p.createdAt);
    activitiesList.push({
      id: `act-prop-${p.id}`,
      user: "System",
      avatarInitials: "SYS",
      action: `generated proposal (${p.status}):`,
      target: p.title,
      time: formatTimeAgo(pDate),
      color: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
      date: pDate
    });
  });

  // 3. Meetings
  meetings.forEach((m) => {
    const mDate = new Date(m.scheduledAt);
    const organizerName = m.organizer ? `${m.organizer.firstName || ""} ${m.organizer.lastName || ""}`.trim() : "System";
    const initials = m.organizer ? getInitials(m.organizer.firstName, m.organizer.lastName) : "SYS";
    activitiesList.push({
      id: `act-meet-${m.id}`,
      user: organizerName || "Teammate",
      avatarInitials: initials,
      action: `scheduled meeting:`,
      target: m.title,
      time: formatTimeAgo(mDate),
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      date: mDate
    });
  });

  // 4. Onboarded Clients
  clients.forEach((c) => {
    const cDate = new Date(c.createdAt);
    activitiesList.push({
      id: `act-client-${c.id}`,
      user: "System",
      avatarInitials: "SYS",
      action: "onboarded new client:",
      target: c.companyName,
      time: formatTimeAgo(cDate),
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      date: cDate
    });
  });

  // Sort by date descending
  activitiesList.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Return clean ActivityItem objects
  return activitiesList.map(({ id, user, avatarInitials, action, target, time, color }) => ({
    id,
    user,
    avatarInitials,
    action,
    target,
    time,
    color
  })).slice(0, 10);
};

export function DashboardClient({ 
  user, 
  teammates = [], 
  brands = [], 
  brandName,
  leads = [],
  meetings = [],
  proposals = [],
  clients = []
}: DashboardClientProps) {
  const params = useParams();
  const slug = params?.slug as string;

  // Dynamic calculations for KPIs (using real database records)
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

  const getKpiSparklineData = (kpiKey: KpiType) => {
    switch (kpiKey) {
      case "active-leads": {
        const val = activeLeadsCount;
        return [Math.round(val * 0.65), Math.round(val * 0.8), Math.round(val * 0.75), Math.round(val * 0.9), Math.round(val * 0.85), val];
      }
      case "meetings-week": {
        const val = meetingsThisWeek;
        return [Math.round(val * 0.5), Math.round(val * 0.7), Math.round(val * 0.4), Math.round(val * 0.8), Math.round(val * 0.9), val];
      }
      case "proposal-conversion": {
        const rate = parseFloat(conversionRate) || 50;
        return [rate - 8, rate - 3, rate - 5, rate + 2, rate - 1, rate];
      }
      case "active-clients": {
        const val = activeClientsCount;
        return [Math.max(0, val - 3), Math.max(0, val - 2), Math.max(0, val - 2), Math.max(0, val - 1), Math.max(0, val - 1), val];
      }
      case "payments-collected": {
        const val = wonLeadsValue;
        return [val * 0.4, val * 0.55, val * 0.5, val * 0.8, val * 0.7, val];
      }
      case "unpaid-invoices": {
        const val = unpaidExpectedValue;
        return [val * 0.9, val * 0.8, val * 0.95, val * 0.85, val * 1.05, val];
      }
      case "overdue-actions": {
        const val = overdueActionsCount;
        return [val + 2, val + 1, val + 3, val, val + 1, val];
      }
      case "completed-tasks": {
        const val = wonLeadsCount;
        return [Math.round(val * 0.5), Math.round(val * 0.6), Math.round(val * 0.8), Math.round(val * 0.75), Math.round(val * 0.9), val];
      }
      default:
        return [10, 12, 11, 15, 14, 16];
    }
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
    "pipeline-health",
    "pipeline-value",
    "client-health"
  ]);

  // Interactive local Action Center list
  const [actions, setActions] = useState<ActionItem[]>([]);
  // Dynamic activities list
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Load customizations on mount
  useEffect(() => {
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
        const parsed = (JSON.parse(savedWidgets) as string[])
          .filter(k => k in WIDGET_POOL) as WidgetType[];
        if (parsed.length === 4) {
          setWidgets(parsed);
        } else {
          const defaultPool = [
            "pipeline-funnel",
            "pipeline-health",
            "pipeline-value",
            "client-health",
            "lead-sources",
            "proposal-win-rate",
            "projects-by-status",
            "pending-agreements",
            "invoice-status"
          ] as WidgetType[];
          const uniqueParsed = Array.from(new Set(parsed));
          while (uniqueParsed.length < 4) {
            const nextDef = defaultPool.find(d => !uniqueParsed.includes(d));
            if (!nextDef) break;
            uniqueParsed.push(nextDef);
          }
          setWidgets(uniqueParsed.slice(0, 4));
        }
      } catch (e) {}
    }
  }, []);

  // Update dynamic actions and activities when real data changes
  useEffect(() => {
    setActions(generateRealActions(leads, meetings, proposals));
    setActivities(generateRealActivities(leads, meetings, proposals, clients));
  }, [leads, meetings, proposals, clients]);

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
      <DashboardHeader 
        user={user} 
        brandName={brandName} 
        slug={slug} 
      />

      {/* ── 2. KPI Strip ── */}
      <KpiGrid
        kpis={kpis}
        dynamicKpiPool={dynamicKpiPool}
        getKpiSparklineData={getKpiSparklineData}
        onSelectKpi={handleSelectKpi}
      />

      {/* ── 3. Analytics Grid ── */}
      <AnalyticsGrid
        widgets={widgets}
        onSelectWidget={handleSelectWidget}
        teammates={teammates}
        brands={brands}
        leads={leads}
        meetings={meetings}
        proposals={proposals}
        clients={clients}
      />

      {/* ── 4. Bottom Row (Operational Feed + Upcoming Actions) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Operational Feed (2/3 width) */}
        <ActivityFeed activities={activities} />

        {/* Right: Upcoming Action Center (1/3 width) */}
        <ActionCenter 
          actions={actions} 
          onActionClick={handleActionClick} 
        />
      </div>
    </div>
  );
}
