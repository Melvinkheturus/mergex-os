"use client";

import { useState } from "react";
import { 
  Brain, Target, TrendingDown, Users, Timer, PieChart, 
  AlertTriangle, Filter, ArrowDownRight, RefreshCcw, Swords
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Tab = "overview" | "reasons" | "competitors" | "team" | "reengagement";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",     label: "Overview",         icon: PieChart },
  { id: "reasons",      label: "Loss Reasons",     icon: Target },
  { id: "competitors",  label: "Competitors",      icon: Swords },
  { id: "team",         label: "Team Performance", icon: Users },
  { id: "reengagement", label: "Re-engagement",    icon: RefreshCcw },
];

const MOCK_REASONS = [
  { reason: "PRICE", label: "Too expensive", pct: 35, count: 14 },
  { reason: "NO_RESPONSE", label: "Ghosted", pct: 22, count: 9 },
  { reason: "COMPETITOR", label: "Competitor won", pct: 18, count: 7 },
  { reason: "TIMING", label: "Timing/Delay", pct: 15, count: 6 },
  { reason: "FIT", label: "Scope mismatch", pct: 10, count: 4 },
];

const MOCK_STAGES = [
  { stage: "Discovery", drop: 12 },
  { stage: "Proposal", drop: 48 },
  { stage: "Negotiation", drop: 25 },
];

const MOCK_COMPETITORS = [
  { name: "McKinsey Digital", losses: 4, value: "₹45L", reason: "Brand trust" },
  { name: "Internal Team", losses: 2, value: "₹18L", reason: "Budget constraints" },
  { name: "Freelancer", losses: 1, value: "₹5L", reason: "Price" },
];

const MOCK_REENGAGE = [
  { client: "Nexora Inc", reason: "BUDGET_DELAY", days: 12, value: "₹12L", owner: "Rohan Das" },
  { client: "Vanguard Tech", reason: "TIMING", days: 45, value: "₹24L", owner: "Sneha Patel" },
];

export function PipelineIntelligenceClient() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Pipeline Intelligence</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Turn lost deals into operational strategy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1.5" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Lost Deals", value: "24", sub: "+3 from last month", icon: Target, color: "text-red-500" },
          { label: "Lost Revenue", value: "₹1.4Cr", sub: "Pipeline value", icon: TrendingDown, color: "text-amber-500" },
          { label: "Top Reason", value: "Price", sub: "35% of all losses", icon: AlertTriangle, color: "text-purple-500" },
          { label: "Re-engageable", value: "8", sub: "Worth ₹65L", icon: RefreshCcw, color: "text-blue-500" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold truncate">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label} — {sub}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              tab === id
                ? "border-purple-500 text-purple-500"
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
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Loss Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_REASONS.map(r => (
                <div key={r.reason} className="flex items-center gap-3">
                  <div className="w-24 text-xs font-medium truncate">{r.label}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-purple-500/50" style={{ width: `${r.pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-xs text-muted-foreground">{r.pct}%</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                Stage Drop-Off Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_STAGES.map(s => (
                <div key={s.stage} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{s.stage} Stage</span>
                    <span className="font-bold text-red-500">{s.drop}% Drop</span>
                  </div>
                  <div className="h-1.5 w-full bg-red-500/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${s.drop}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm text-amber-600 dark:text-amber-400">
                <strong>Insight:</strong> 48% of leads die at the Proposal stage. Consider revising proposal delivery speed or pricing models.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "competitors" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Competitor Leaderboard</CardTitle>
            <CardDescription className="text-xs">Who is taking your deals?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_COMPETITORS.map(c => (
              <div key={c.name} className="flex items-center justify-between p-3 rounded-md border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Swords className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Most common reason: {c.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-500">{c.losses} Deals Lost</div>
                  <div className="text-xs text-muted-foreground">Value: {c.value}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "reengagement" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Upcoming Re-engagements</CardTitle>
            <CardDescription className="text-xs">Leads marked for future follow-up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_REENGAGE.map(r => (
              <div key={r.client} className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/20">
                <div>
                  <div className="text-sm font-semibold">{r.client}</div>
                  <div className="text-xs text-muted-foreground">Owner: {r.owner} · Value: {r.value}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">{r.reason.replace("_", " ")}</Badge>
                  <div className="text-xs font-medium flex items-center gap-1.5 bg-blue-500/10 text-blue-600 px-2 py-1 rounded-md">
                    <Timer className="h-3.5 w-3.5" />
                    In {r.days} days
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty states for others */}
      {(tab === "reasons" || tab === "team") && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Brain className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Detailed Analytics Coming Soon</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              We are gathering more data to provide detailed breakdowns for this section.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
