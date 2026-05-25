"use client";

import { useState } from "react";
import {
  Building2, Zap, Users, TrendingUp, Mail, BarChart3, Shield, Palette, Settings, Check, Save, Download, Trash2, Key, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type SettingsTab = "organization" | "workspace" | "team" | "pipeline" | "communication" | "reports" | "security" | "appearance" | "advanced";

const NAV: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "organization",  label: "Organization",   icon: Building2   },
  { id: "workspace",     label: "Workspace",      icon: Zap         },
  { id: "team",          label: "Team & Access",  icon: Users       },
  { id: "pipeline",      label: "Pipeline Rules", icon: TrendingUp  },
  { id: "communication", label: "Communication",  icon: Mail        },
  { id: "reports",       label: "Reports",        icon: BarChart3   },
  { id: "security",      label: "Security",       icon: Shield      },
  { id: "appearance",    label: "Appearance",     icon: Palette     },
  { id: "advanced",      label: "Advanced",       icon: Settings    },
];

// ── Sections ────────────────────────────────────────────────────────────────

function OrganizationSettings() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Core Identity</CardTitle>
          <CardDescription className="text-xs">Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Company Name</Label>
              <Input defaultValue="MergeX" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Workspace URL</Label>
              <Input defaultValue="cx.mergex.in" className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Default Currency</Label>
            <Select defaultValue="INR">
              <SelectTrigger className="h-9 text-sm w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR — Indian Rupee</SelectItem>
                <SelectItem value="USD">$ USD — US Dollar</SelectItem>
                <SelectItem value="EUR">€ EUR — Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Timezone</Label>
            <Select defaultValue="Asia/Kolkata">
              <SelectTrigger className="h-9 text-sm w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">America/New_York (ET)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={save}>
              {saved ? <><Check className="h-3.5 w-3.5 mr-1.5 text-emerald-300" />Saved</> : <><Save className="h-3.5 w-3.5 mr-1.5" />Save Changes</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkspaceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">General Formatting</CardTitle>
          <CardDescription className="text-xs">Dates, times, and default views</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date Format</Label>
              <Select defaultValue="DD/MM/YYYY">
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Time Format</Label>
              <Select defaultValue="12h">
                <SelectTrigger className="h-9 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Operational Defaults</CardTitle>
          <CardDescription className="text-xs">System behavior and timing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Warm Lead Expiry (Days)</Label>
            <Input type="number" defaultValue="14" className="h-9 text-sm w-full sm:w-32" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cold Review Cycle (Days)</Label>
            <Input type="number" defaultValue="30" className="h-9 text-sm w-full sm:w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamAccessSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Roles & Permissions</CardTitle>
          <CardDescription className="text-xs">Manage team access levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {["Super Admin", "Admin", "CX Manager", "CX Executive", "Proposal Manager", "Analyst"].map(role => (
              <div key={role} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                <span className="text-sm font-medium">{role}</span>
                <Button variant="ghost" size="sm" className="h-8 text-xs">Edit Permissions</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Audit Logs</CardTitle>
          <CardDescription className="text-xs">Track login activity and sensitive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm">View Audit Logs</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PipelineRulesSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Lead Temperature</CardTitle>
          <CardDescription className="text-xs">Scoring thresholds for pipeline stages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Hot Score Threshold</Label>
              <Input type="number" defaultValue="80" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Warm Score Threshold</Label>
              <Input type="number" defaultValue="50" className="h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Qualification Gate</CardTitle>
          <CardDescription className="text-xs">Requirements before proposal stage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Meeting completed", defaultOn: true },
            { label: "MOM submitted", defaultOn: true },
            { label: "Decision maker identified", defaultOn: true },
          ].map(({ label, defaultOn }) => {
            const [on, setOn] = useState(defaultOn);
            return (
              <div key={label} className="flex items-center justify-between">
                <p className="text-sm font-medium">{label}</p>
                <Switch checked={on} onCheckedChange={setOn} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function CommunicationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Meeting Templates</CardTitle>
          <CardDescription className="text-xs">Standardized structures for team meetings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {["Discovery questions", "MOM structure", "Pre-meeting brief"].map(tpl => (
            <div key={tpl} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
              <span className="text-sm font-medium">{tpl}</span>
              <Button variant="ghost" size="sm" className="h-8 text-xs">Edit</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Internal Alerts</CardTitle>
          <CardDescription className="text-xs">Configure email and in-app notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">In-app notifications</p>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Email alerts</p>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">KPI Targets</CardTitle>
          <CardDescription className="text-xs">Organizational goals and benchmarks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Monthly Revenue Target (INR)</Label>
              <Input type="number" defaultValue="5000000" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Monthly Meeting Target</Label>
              <Input type="number" defaultValue="40" className="h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Scheduled Reports</CardTitle>
          <CardDescription className="text-xs">Automated analytics delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Daily summaries</p>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Weekly pipeline reports</p>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Authentication Rules</CardTitle>
          <CardDescription className="text-xs">Manage how users access the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Require OTP</p>
              <p className="text-xs text-muted-foreground">Force multi-factor authentication</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Session Timeout (Hours)</Label>
            <Input type="number" defaultValue="12" className="h-9 text-sm w-full sm:w-32" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Access Security</CardTitle>
          <CardDescription className="text-xs">IP and login restrictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">IP Restrictions</p>
              <p className="text-xs text-muted-foreground">Only allow office IP addresses</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Data Export Restrictions</p>
              <p className="text-xs text-muted-foreground">Limit who can export lists</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Theme</CardTitle>
          <CardDescription className="text-xs">Customize the interface look</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Select defaultValue="system">
              <SelectTrigger className="h-9 text-sm w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Layout Density</CardTitle>
          <CardDescription className="text-xs">Adjust spacing in tables and lists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Select defaultValue="compact">
              <SelectTrigger className="h-9 text-sm w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact (More data)</SelectItem>
                <SelectItem value="comfortable">Comfortable (More spacing)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Data Management</CardTitle>
          <CardDescription className="text-xs">System-level data operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Import Leads</p>
              <p className="text-xs text-muted-foreground">Bulk upload from CSV</p>
            </div>
            <Button variant="outline" size="sm">Import</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">System Logs</p>
              <p className="text-xs text-muted-foreground">View error and activity logs</p>
            </div>
            <Button variant="outline" size="sm">View Logs</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-xs">Irreversible system actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Archive old data", desc: "Archive records older than 2 years", btn: "Archive" },
            { label: "Reset workspace", desc: "Clear all records and start fresh", btn: "Reset" },
          ].map(({ label, desc, btn }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Button variant="destructive" size="sm" className="shrink-0">{btn}</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("organization");

  const CONTENT: Record<SettingsTab, React.ReactNode> = {
    organization:  <OrganizationSettings />,
    workspace:     <WorkspaceSettings />,
    team:          <TeamAccessSettings />,
    pipeline:      <PipelineRulesSettings />,
    communication: <CommunicationSettings />,
    reports:       <ReportsSettings />,
    security:      <SecuritySettings />,
    appearance:    <AppearanceSettings />,
    advanced:      <AdvancedSettings />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground shrink-0">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage operational settings for MergeX Sales OS</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="space-y-0.5">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left
                  ${tab === id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden w-full overflow-x-auto pb-2">
          <Tabs value={tab} onValueChange={v => setTab(v as SettingsTab)}>
            <TabsList className="h-9 inline-flex w-max">
              {NAV.map(({ id, label }) => (
                <TabsTrigger key={id} value={id} className="text-xs px-3 shrink-0">{label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{CONTENT[tab]}</div>
      </div>
    </div>
  );
}
