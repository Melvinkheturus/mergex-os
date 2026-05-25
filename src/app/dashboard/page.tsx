import {
  TrendingUp,
  Users,
  Handshake,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Placeholder KPI data ──────────────────────────────────────────────────
const kpiCards = [
  {
    title: "Total Revenue",
    value: "$0",
    change: 0,
    trend: "up" as const,
    icon: DollarSign,
    description: "Pipeline value tracked",
  },
  {
    title: "Active Leads",
    value: "0",
    change: 0,
    trend: "up" as const,
    icon: TrendingUp,
    description: "Leads in pipeline",
  },
  {
    title: "Deals Won",
    value: "0",
    change: 0,
    trend: "up" as const,
    icon: Handshake,
    description: "This month",
  },
  {
    title: "Team Members",
    value: "0",
    change: 0,
    trend: "neutral" as const,
    icon: Users,
    description: "Active reps",
  },
];

function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
}: (typeof kpiCards)[number]) {
  return (
    <Card className="relative overflow-hidden">
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
        <div className="flex items-center gap-1.5 mt-1">
          {(trend as string) === "up" && (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
          )}
          {(trend as string) === "down" && (
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={`text-xs font-medium ${
              (trend as string) === "up"
                ? "text-emerald-500"
                : (trend as string) === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
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

function SetupChecklist() {
  const steps = [
    {
      label: "Connect your Clerk account",
      done: true,
      action: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY configured ✓",
    },
    {
      label: "Connect your Neon database",
      done: true,
      action: "DATABASE_URL and DIRECT_URL configured ✓",
    },
    {
      label: "Run Prisma migration",
      done: true,
      action: "20260512170158_sales_execution_engine applied ✓",
    },
    {
      label: "Invite your first team member",
      done: false,
      action: "Navigate to Team → Invite",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Getting Started</CardTitle>
          <Badge variant="secondary" className="text-xs ml-auto">
            Setup
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                step.done
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-muted-foreground/40"
              }`}
            >
              {step.done && (
                <svg
                  className="h-2.5 w-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{step.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.action}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No activity yet
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Activities will appear here as your team uses the platform
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome to MergeX Sales OS — your all-in-one sales command center.
        </p>
      </div>

      <Separator />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </div>

      {/* Secondary row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Revenue Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Charts ready for Phase 2
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Revenue and pipeline analytics will appear here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Setup checklist */}
      <div className="grid gap-4 md:grid-cols-2">
        <SetupChecklist />

        {/* Modules overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Platform Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Pipeline", desc: "11-stage lead pipeline", status: "Live ✓" },
              { name: "CRM", desc: "Leads, Contacts, Deals", status: "Phase 3" },
              { name: "Knowledge Base", desc: "Playbooks, SOPs, Docs", status: "Phase 4" },
              { name: "Operations", desc: "Tasks", status: "Phase 5" },
              { name: "Analytics", desc: "Charts, KPIs", status: "Phase 2" },
            ].map((module) => (
              <div
                key={module.name}
                className="flex items-center justify-between py-1"
              >
                <div>
                  <p className="text-sm font-medium">{module.name}</p>
                  <p className="text-xs text-muted-foreground">{module.desc}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {module.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
