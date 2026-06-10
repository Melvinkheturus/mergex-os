"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Clock, ShieldAlert, Calendar, PauseCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "../profile-section";
import { SettingsPageProps } from "../../types";

import { SlaRulesTab } from "./sla-rules-tab";
import { EscalationRulesTab } from "./escalation-rules-tab";
import { BusinessHoursTab } from "./business-hours-tab";
import { PauseRulesTab } from "./pause-rules-tab";

export const DEFAULT_CRM_SETTINGS = {
  leadSlas: [
    { stage: "Lead Intake", duration: 4, unit: "Hours" },
    { stage: "Business Review", duration: 24, unit: "Hours" },
    { stage: "Lead Qualification", duration: 24, unit: "Hours" },
    { stage: "Lead Classification", duration: 12, unit: "Hours" },
    { stage: "Lead Nurturing", duration: 7, unit: "Days" },
    { stage: "Meeting Readiness", duration: 24, unit: "Hours" }
  ],
  salesSlas: [
    { stage: "Discovery Meeting", duration: 24, unit: "Hours" },
    { stage: "Solution Planning", duration: 48, unit: "Hours" },
    { stage: "Proposal & Commercials", duration: 72, unit: "Hours" },
    { stage: "Agreement & Closure", duration: 3, unit: "Days" },
    { stage: "Engagement Handoff", duration: 24, unit: "Hours" }
  ],
  escalationRules: [
    { level: 1, title: "Level 1", breaches: 1, action: "Sales Manager" },
    { level: 2, title: "Level 2", breaches: 2, action: "Operations Manager" },
    { level: 3, title: "Level 3", breaches: 3, action: "Leadership" }
  ],
  businessHours: {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    timezone: "Asia/Kolkata"
  },
  autoPauseRules: {
    awaitingClientResponse: true,
    awaitingDocuments: true,
    awaitingApproval: true,
    awaitingPayment: false
  }
};

export function CrmSettingsSection({ user }: { user: SettingsPageProps["user"] }) {
  const params = useParams();
  const slug = params?.slug as string;
  const searchParams = useSearchParams();
  const subTabParam = searchParams.get("subTab") || "sla";
  const [activeSubTab, setActiveSubTab] = useState(subTabParam);

  // Sync subTab selection from URL query param
  useEffect(() => {
    const st = searchParams.get("subTab");
    if (st) {
      setActiveSubTab(st);
    }
  }, [searchParams]);

  // Settings State
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`mergex_crm_settings_${slug}`);
      if (stored) {
        try {
          return { ...DEFAULT_CRM_SETTINGS, ...JSON.parse(stored) };
        } catch {}
      }
    }
    return DEFAULT_CRM_SETTINGS;
  });

  const [initialSettings, setInitialSettings] = useState(settings);

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setInitialSettings(settings);
      localStorage.setItem(`mergex_crm_settings_${slug}`, JSON.stringify(settings));
      toast.success("CRM Settings saved successfully!");
      setSaving(false);
      window.dispatchEvent(new CustomEvent("crm-settings-updated"));
    }, 600);
  };

  // Toast wrapper inside module
  const toast = {
    success: (message: string) => {
      import("sonner").then((mod) => mod.toast.success(message));
    }
  };

  const updateLeadSla = (index: number, field: string, value: any) => {
    const newSlas = [...settings.leadSlas];
    newSlas[index] = { ...newSlas[index], [field]: value };
    setSettings({ ...settings, leadSlas: newSlas });
  };

  const updateSalesSla = (index: number, field: string, value: any) => {
    const newSlas = [...settings.salesSlas];
    newSlas[index] = { ...newSlas[index], [field]: value };
    setSettings({ ...settings, salesSlas: newSlas });
  };

  const updateEscalationRule = (index: number, field: string, value: any) => {
    const newRules = [...settings.escalationRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setSettings({ ...settings, escalationRules: newRules });
  };

  const updateBusinessHours = (field: string, value: any) => {
    setSettings({
      ...settings,
      businessHours: { ...settings.businessHours, [field]: value }
    });
  };

  const updateAutoPause = (field: string, value: boolean) => {
    setSettings({
      ...settings,
      autoPauseRules: { ...settings.autoPauseRules, [field]: value }
    });
  };

  const subTabs = [
    { id: "sla", label: "SLA Rules", icon: Clock },
    { id: "escalation", label: "Escalation Rules", icon: ShieldAlert },
    { id: "hours", label: "Business Hours", icon: Calendar },
    { id: "pause", label: "Pause Rules", icon: PauseCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/10 pb-4">
        <div className="text-left">
          <h2 className="text-xl font-bold tracking-tight text-foreground">CRM Settings</h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isDirty && (
            <Badge variant="outline" className="animate-pulse bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold px-2 py-0.5">
              Unsaved Changes
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            {saving ? <LoaderIcon className="mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save CRM Settings
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Horizontal Sub-tabs list */}
        <div className="flex border-b border-border/10 pb-px overflow-x-auto no-scrollbar gap-8">
          {subTabs.map((subTab) => {
            const ActiveIcon = subTab.icon;
            const isActive = activeSubTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-1 pb-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "text-[#8B5CF6]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ActiveIcon className="h-4 w-4 shrink-0" />
                {subTab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8B5CF6] rounded-full shadow-[0_1px_8px_rgba(139,92,246,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="space-y-6">
          {activeSubTab === "sla" && (
            <SlaRulesTab
              settings={settings}
              updateLead={updateLeadSla}
              updateSales={updateSalesSla}
            />
          )}
          {activeSubTab === "escalation" && (
            <EscalationRulesTab 
              settings={settings} 
              updateRule={updateEscalationRule} 
            />
          )}
          {activeSubTab === "hours" && (
            <BusinessHoursTab 
              settings={settings} 
              update={updateBusinessHours} 
            />
          )}
          {activeSubTab === "pause" && (
            <PauseRulesTab 
              settings={settings} 
              update={updateAutoPause} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
