"use client";

import { useState } from "react";
import {
  Rocket, Building2, Users, FileText, CheckSquare, Calendar,
  Clock, AlertTriangle, Heart, ChevronRight, Plus, Upload,
  MoreHorizontal, Check, Circle, Shield, Zap, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// ── Types ──────────────────────────────────────────────────────────────────

type LaunchStatus = "INTAKE" | "KICKOFF_PENDING" | "KICKOFF_DONE" | "DOCUMENTS_PENDING" | "IN_DELIVERY" | "COMPLETED";
type Health = "HEALTHY" | "ATTENTION" | "AT_RISK";
type DocStatus = "PENDING" | "UPLOADED" | "REVIEWED" | "MISSING";
type CheckStatus = "PENDING" | "DONE" | "BLOCKED";
type MilestoneStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";

interface ClientLaunch {
  id: string;
  clientName: string;
  companyName: string;
  industry: string;
  contractValue: number;
  currency: string;
  startDate: string;
  deliveryLead: string;
  accountOwner: string;
  proposalManager: string;
  scope: string;
  objectives: string;
  expectedOutcomes: string;
  risks: string;
  health: Health;
  status: LaunchStatus;
  kickoffDate?: string;
}

interface Contact {
  id: string; name: string; role: string; email: string; authority: string; isPrimary: boolean;
}
interface ClientDoc {
  id: string; name: string; category: string; status: DocStatus;
}
interface CheckItem {
  id: string; title: string; category: string; status: CheckStatus; owner?: string;
}
interface Milestone {
  id: string; title: string; weekNumber: number; status: MilestoneStatus; progressPct: number; targetDate: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_CLIENT: ClientLaunch = {
  id: "cl1",
  clientName: "Priya Sharma",
  companyName: "Nexora Digital",
  industry: "SaaS / B2B",
  contractValue: 1200000,
  currency: "INR",
  startDate: "2026-05-20",
  deliveryLead: "Arjun Mehta",
  accountOwner: "Rohan Das",
  proposalManager: "Sneha Patel",
  scope: "6-month CX transformation engagement covering sales process redesign, pipeline automation, and team enablement.",
  objectives: "Reduce lead-to-close time by 40%. Implement structured 11-stage pipeline. Train 12 sales executives.",
  expectedOutcomes: "₹3Cr incremental revenue within 12 months. Fully operational Sales OS.",
  risks: "Delayed access credentials. Key decision maker travel in June.",
  health: "HEALTHY",
  status: "KICKOFF_PENDING",
  kickoffDate: "2026-05-22",
};

const MOCK_CONTACTS: Contact[] = [
  { id: "c1", name: "Priya Sharma", role: "CEO", email: "priya@nexora.in", authority: "DECISION_MAKER", isPrimary: true },
  { id: "c2", name: "Rahul Joshi", role: "Head of Sales", email: "rahul@nexora.in", authority: "PROJECT_OWNER", isPrimary: false },
  { id: "c3", name: "Kavita Nair", role: "CFO", email: "kavita@nexora.in", authority: "FINANCE", isPrimary: false },
];

const MOCK_DOCS: ClientDoc[] = [
  { id: "d1", name: "Signed Agreement", category: "Legal", status: "UPLOADED" },
  { id: "d2", name: "Payment Confirmation", category: "Finance", status: "REVIEWED" },
  { id: "d3", name: "Brand Assets", category: "Marketing", status: "PENDING" },
  { id: "d4", name: "Existing SOPs", category: "Operations", status: "MISSING" },
  { id: "d5", name: "Team Access List", category: "Operations", status: "PENDING" },
];

const MOCK_CHECKLIST: CheckItem[] = [
  { id: "i1", title: "Review proposal & scope", category: "INTERNAL", status: "DONE", owner: "Arjun Mehta" },
  { id: "i2", title: "Review discovery notes", category: "INTERNAL", status: "DONE", owner: "Rohan Das" },
  { id: "i3", title: "Assign delivery owner", category: "INTERNAL", status: "DONE", owner: "Sneha Patel" },
  { id: "i4", title: "Confirm onboarding timeline", category: "INTERNAL", status: "PENDING", owner: "Arjun Mehta" },
  { id: "i5", title: "Signed agreement", category: "CLIENT", status: "DONE" },
  { id: "i6", title: "Invoice confirmed", category: "CLIENT", status: "DONE" },
  { id: "i7", title: "Access credentials shared", category: "CLIENT", status: "PENDING" },
  { id: "i8", title: "Required documents uploaded", category: "CLIENT", status: "PENDING" },
  { id: "i9", title: "Kickoff scheduled", category: "KICKOFF", status: "DONE" },
  { id: "i10", title: "Stakeholders confirmed", category: "KICKOFF", status: "DONE" },
  { id: "i11", title: "Agenda prepared", category: "KICKOFF", status: "PENDING" },
];

const MOCK_MILESTONES: Milestone[] = [
  { id: "m1", title: "Week 1 — Setup & Access", weekNumber: 1, status: "IN_PROGRESS", progressPct: 70, targetDate: "2026-05-27" },
  { id: "m2", title: "Week 2 — Audit & Research", weekNumber: 2, status: "NOT_STARTED", progressPct: 0, targetDate: "2026-06-03" },
  { id: "m3", title: "Week 3 — Implementation", weekNumber: 3, status: "NOT_STARTED", progressPct: 0, targetDate: "2026-06-10" },
  { id: "m4", title: "Week 4 — Review & Handover", weekNumber: 4, status: "NOT_STARTED", progressPct: 0, targetDate: "2026-06-17" },
];

const TIMELINE_STEPS = [
  { label: "Deal Won", done: true },
  { label: "Contract Signed", done: true },
  { label: "Kickoff Scheduled", done: true },
  { label: "Documents Received", done: false },
  { label: "Team Assigned", done: true },
  { label: "Kickoff Meeting", done: false },
  { label: "Execution Started", done: false },
];

// ── Config ────────────────────────────────────────────────────────────────

const HEALTH_CONFIG: Record<Health, { label: string; color: string; icon: React.ElementType }> = {
  HEALTHY:   { label: "Healthy",          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: Heart },
  ATTENTION: { label: "Attention Needed", color: "text-amber-500 bg-amber-500/10 border-amber-500/20",   icon: AlertTriangle },
  AT_RISK:   { label: "At Risk",          color: "text-red-500 bg-red-500/10 border-red-500/20",          icon: Shield },
};

const STATUS_CONFIG: Record<LaunchStatus, { label: string; color: string }> = {
  INTAKE:             { label: "Intake",             color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  KICKOFF_PENDING:    { label: "Kickoff Pending",    color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  KICKOFF_DONE:       { label: "Kickoff Done",       color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  DOCUMENTS_PENDING:  { label: "Docs Pending",       color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  IN_DELIVERY:        { label: "In Delivery",        color: "text-primary bg-primary/10 border-primary/20" },
  COMPLETED:          { label: "Completed",          color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
};

const DOC_CONFIG: Record<DocStatus, { label: string; color: string }> = {
  PENDING:  { label: "Pending",  color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  UPLOADED: { label: "Uploaded", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  REVIEWED: { label: "Reviewed", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  MISSING:  { label: "Missing",  color: "text-red-500 bg-red-500/10 border-red-500/20" },
};

const MS_CONFIG: Record<MilestoneStatus, { label: string; color: string }> = {
  NOT_STARTED: { label: "Not Started", color: "text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-500" },
  COMPLETED:   { label: "Completed",   color: "text-emerald-500" },
  DELAYED:     { label: "Delayed",     color: "text-red-500" },
};

// ── Sub-components ────────────────────────────────────────────────────────

function StatusBadge<T extends string>({ status, config }: { status: T; config: Record<string, { label: string; color: string }> }) {
  const c = config[status] ?? { label: status, color: "text-muted-foreground bg-muted border-border" };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.color}`}>
      {c.label}
    </span>
  );
}

function ChecklistGroup({ title, items, onToggle }: { title: string; items: CheckItem[]; onToggle: (id: string) => void }) {
  const done = items.filter(i => i.status === "DONE").length;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">{done}/{items.length}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors text-left group"
          >
            {item.status === "DONE"
              ? <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><Check className="h-2.5 w-2.5 text-white" /></div>
              : item.status === "BLOCKED"
              ? <div className="h-4 w-4 rounded-full bg-red-500/20 border border-red-500/40 shrink-0" />
              : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
            }
            <span className={`flex-1 text-sm ${item.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>{item.title}</span>
            {item.owner && <span className="text-[10px] text-muted-foreground hidden sm:block">{item.owner}</span>}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────

type Tab = "overview" | "checklist" | "stakeholders" | "documents" | "timeline" | "milestones";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",     label: "Overview",      icon: Building2   },
  { id: "checklist",    label: "Checklist",     icon: CheckSquare },
  { id: "stakeholders", label: "Stakeholders",  icon: Users       },
  { id: "documents",    label: "Documents",     icon: FileText    },
  { id: "timeline",     label: "Timeline",      icon: ArrowRight  },
  { id: "milestones",   label: "Milestones",    icon: Calendar    },
];

// ── Main ──────────────────────────────────────────────────────────────────

export function ClientLaunchPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [checklist, setChecklist] = useState<CheckItem[]>(MOCK_CHECKLIST);
  const client = MOCK_CLIENT;

  const doneCount = checklist.filter(i => i.status === "DONE").length;
  const progress = Math.round((doneCount / checklist.length) * 100);
  const pendingDocs = MOCK_DOCS.filter(d => d.status === "PENDING" || d.status === "MISSING").length;
  const daysSince = Math.floor((Date.now() - new Date("2026-05-10").getTime()) / 86400000);

  const healthCfg = HEALTH_CONFIG[client.health];
  const HealthIcon = healthCfg.icon;

  function toggleItem(id: string) {
    setChecklist(prev => prev.map(i =>
      i.id === id ? { ...i, status: i.status === "DONE" ? "PENDING" : "DONE" } : i
    ));
  }

  const grouped = {
    INTERNAL: checklist.filter(i => i.category === "INTERNAL"),
    CLIENT:   checklist.filter(i => i.category === "CLIENT"),
    KICKOFF:  checklist.filter(i => i.category === "KICKOFF"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Client Launch</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Onboarding & delivery transition</p>
          </div>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Launch</Button>
      </div>

      {/* Active Client KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Onboarding Progress", value: `${progress}%`, sub: `${doneCount}/${checklist.length} tasks`, icon: CheckSquare, color: "text-primary" },
          { label: "Days Since Won",       value: String(daysSince), sub: "May 10, 2026",    icon: Clock,        color: "text-blue-500" },
          { label: "Docs Pending",         value: String(pendingDocs), sub: "of 5 required", icon: FileText,     color: "text-amber-500" },
          { label: "Health",               value: healthCfg.label, sub: client.companyName,  icon: Zap,          color: "text-emerald-500" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold truncate">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {client.companyName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{client.companyName}</div>
                <div className="text-xs text-muted-foreground">{client.clientName} · {client.industry}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={client.status} config={STATUS_CONFIG} />
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${healthCfg.color}`}>
                <HealthIcon className="h-2.5 w-2.5" />{healthCfg.label}
              </span>
              <span className="text-sm font-bold text-emerald-500">
                ₹{(client.contractValue / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Onboarding Progress</span><span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Engagement Scope</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><p className="text-xs text-muted-foreground mb-1">Scope</p><p>{client.scope}</p></div>
              <Separator />
              <div><p className="text-xs text-muted-foreground mb-1">Objectives</p><p>{client.objectives}</p></div>
              <Separator />
              <div><p className="text-xs text-muted-foreground mb-1">Expected Outcomes</p><p>{client.expectedOutcomes}</p></div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold">Team Assignment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { role: "Account Owner",    name: client.accountOwner },
                  { role: "Delivery Lead",    name: client.deliveryLead },
                  { role: "Proposal Manager", name: client.proposalManager },
                ].map(({ role, name }) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{role}</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {name?.split(" ").map(n => n[0]).join("") ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-amber-500/20">
              <CardHeader><CardTitle className="text-sm font-semibold text-amber-500 flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5" />Risks</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{client.risks}</p></CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "checklist" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{doneCount} of {checklist.length} items complete</p>
            <span className="text-sm font-semibold text-primary">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="grid md:grid-cols-3 gap-4 pt-2">
            <ChecklistGroup title="Internal Preparation" items={grouped.INTERNAL} onToggle={toggleItem} />
            <ChecklistGroup title="Client Requirements"  items={grouped.CLIENT}   onToggle={toggleItem} />
            <ChecklistGroup title="Kickoff Readiness"    items={grouped.KICKOFF}  onToggle={toggleItem} />
          </div>
        </div>
      )}

      {tab === "stakeholders" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1.5" />Add Contact</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_CONTACTS.map(c => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.role}</div>
                      </div>
                    </div>
                    {c.isPrimary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border text-violet-500 bg-violet-500/10 border-violet-500/20">
                      {c.authority.replace("_", " ")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{MOCK_DOCS.filter(d => d.status === "REVIEWED").length} reviewed · {pendingDocs} pending</p>
            <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1.5" />Upload</Button>
          </div>
          <Card>
            <CardContent className="p-2 divide-y divide-border">
              {MOCK_DOCS.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 px-3 py-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.category}</p>
                  </div>
                  <StatusBadge status={doc.status} config={DOC_CONFIG} />
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "timeline" && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Onboarding Timeline</CardTitle><CardDescription className="text-xs">Step-by-step delivery transition</CardDescription></CardHeader>
          <CardContent className="pb-6">
            <div className="relative pl-6 space-y-0">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step.label} className="relative flex gap-4">
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`absolute left-0 top-4 bottom-0 w-px -translate-x-px ${step.done ? "bg-primary" : "bg-border"}`} />
                  )}
                  <div className={`absolute left-0 top-1 -translate-x-[7px] h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    step.done ? "bg-primary border-primary" : "bg-background border-border"
                  }`}>
                    {step.done && <Check className="h-2 w-2 text-white" />}
                  </div>
                  <div className="pb-6 pl-4">
                    <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "milestones" && (
        <div className="space-y-3">
          {MOCK_MILESTONES.map(m => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold">{m.title}</p>
                    <p className="text-xs text-muted-foreground">Target: {new Date(m.targetDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className={`text-xs font-semibold ${MS_CONFIG[m.status].color}`}>{MS_CONFIG[m.status].label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={m.progressPct} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{m.progressPct}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
