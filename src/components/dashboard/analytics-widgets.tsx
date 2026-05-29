"use client";

import { useState, useEffect } from "react";
import { NumberCounter } from "@/components/ui/number-counter";
import { 
  AlertCircle, 
  HelpCircle,
  FileText,
  Share2,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

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

interface AnalyticsWidgetProps {
  type: string;
  teammates: Teammate[];
  brands: Brand[];
}

export function AnalyticsWidget({ type, teammates, brands }: AnalyticsWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#8B5CF6]/20 border-t-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  switch (type) {
    // ── CRM Analytics ───────────────────────────────────────
    case "pipeline-funnel":
      return <PipelineFunnel />;
    case "lead-sources":
      return <LeadSources />;
    case "proposal-win-rate":
      return <ProposalWinRate />;

    // ── Client Analytics ────────────────────────────────────
    case "client-health":
      return <ClientHealth />;
    case "projects-by-status":
      return <ProjectsByStatus />;

    // ── Team Analytics ──────────────────────────────────────
    case "cx-workload":
      return <CXWorkload teammates={teammates} />;

    // ── Document Analytics ──────────────────────────────────
    case "pending-agreements":
      return <PendingAgreements brands={brands} />;
    case "invoice-status":
      return <InvoiceStatus />;

    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <HelpCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-xs font-semibold text-foreground">Widget Not Found</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            This module has no visualization layout.
          </p>
        </div>
      );
  }
}

// ─────────────────────────────────────────────────────────────
// 1. CRM WIDGETS (RECHARTS BAR & PIE CHARTS)
// ─────────────────────────────────────────────────────────────

function PipelineFunnel() {
  const stages = [
    { name: "Inbound", leads: 145, conv: "100%", bg: "bg-[#8B5CF6]/5 text-[#8B5CF6]" },
    { name: "Qualified", leads: 92, conv: "63%", bg: "bg-[#8B5CF6]/10 text-[#8B5CF6]" },
    { name: "Meetings", leads: 54, conv: "37%", bg: "bg-[#8B5CF6]/15 text-[#8B5CF6]" },
    { name: "Proposal", leads: 28, conv: "19%", bg: "bg-[#8B5CF6]/20 text-[#8B5CF6]" },
    { name: "Won", leads: 16, conv: "11%", bg: "bg-[#8B5CF6]/25 text-[#8B5CF6]" },
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between pt-1">
      <div className="flex-grow space-y-3.5">
        {stages.map((stage, idx) => {
          const prevLeads = idx > 0 ? stages[idx - 1].leads : 145;
          const dropOff = idx > 0 ? Math.round((stage.leads / prevLeads) * 100) : 100;
          return (
            <div key={stage.name} className="flex items-center gap-3 text-xs">
              {/* Stage bullet and index */}
              <div className="relative flex items-center justify-center shrink-0">
                <div className={cn("h-6 w-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] leading-none shrink-0 shadow-xs", stage.bg)}>
                  {idx + 1}
                </div>
                {idx < stages.length - 1 && (
                  <div className="absolute top-6 bottom-[-14px] left-3 w-px bg-border/20" />
                )}
              </div>
              
              {/* Stage description */}
              <div className="flex-grow flex items-center justify-between">
                <div className="text-left space-y-1">
                  <p className="font-semibold text-foreground/85 leading-snug">{stage.name}</p>
                  <div className="h-1.5 w-32 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6] rounded-full" style={{ width: `${stage.conv}` }} />
                  </div>
                </div>
                <div className="text-right flex items-center gap-4 shrink-0">
                  <div className="space-y-0.5">
                    <p className="font-mono font-bold text-foreground leading-snug">
                      <NumberCounter value={stage.leads} duration={1.2} />
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 leading-none">leads</p>
                  </div>
                  <div className="w-12 text-left">
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                      <NumberCounter value={parseInt(stage.conv, 10)} suffix="%" duration={1.2} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[10px] text-muted-foreground/50 border-t border-border/10 pt-2 shrink-0 font-medium mt-3">
        <span>Intake conversion target: 15%</span>
        <span>Current: 11%</span>
      </div>
    </div>
  );
}

function LeadSources() {
  const data = [
    { name: "LinkedIn", count: 58, percentage: 40, iconColor: "text-[#0A66C2]" },
    { name: "Instagram", count: 36, percentage: 25, iconColor: "text-[#E1306C]" },
    { name: "Referrals", count: 29, percentage: 20, iconColor: "text-emerald-500" },
    { name: "Website", count: 22, percentage: 15, iconColor: "text-[#8B5CF6]" }
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between pt-1">
      <div className="flex-grow space-y-4.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3 text-xs">
            {/* Source label */}
            <div className={cn("h-7 w-7 flex items-center justify-center shrink-0", item.iconColor)}>
              {item.name === "LinkedIn" && (
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" stroke="none" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              )}
              {item.name === "Instagram" && (
                <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              )}
              {item.name === "Referrals" && <Share2 className="h-5 w-5" />}
              {item.name === "Website" && <Globe className="h-5 w-5" />}
            </div>
            
            {/* Bar & statistics */}
            <div className="flex-grow space-y-1">
              <div className="flex justify-between items-center text-[11px] font-semibold text-foreground/80 leading-snug">
                <span>{item.name}</span>
                <span className="font-mono text-muted-foreground font-bold">
                  <NumberCounter value={item.count} duration={1.2} />{" "}
                  <span className="text-[9px] opacity-50 font-normal">
                    (<NumberCounter value={item.percentage} suffix="%" duration={1.2} />)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6] rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalWinRate() {
  const data = [
    { name: "Accepted", value: 18, color: "#8B5CF6" },
    { name: "Pending", value: 8, color: "var(--muted-foreground)" },
    { name: "Declined", value: 4, color: "#EF4444" }
  ];

  return (
    <div className="h-full min-h-[220px] w-full flex items-center justify-between gap-4">
      <div className="w-[120px] h-[120px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient id="purplePieGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              innerRadius={40}
              outerRadius={52}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === "Accepted" ? "url(#purplePieGradient)" : entry.color} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "8px",
                fontSize: "9px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2">
        <div className="p-3 border border-border/10 bg-muted/20 rounded-xl text-left mb-1 shrink-0">
          <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-wider">Overall Win Rate</span>
          <h4 className="text-xl font-bold text-foreground font-mono leading-none mt-1">
            <NumberCounter value={60} suffix="%" decimals={1} duration={1.2} />
          </h4>
        </div>
        <div className="space-y-1.5">
          {data.map((item) => (
            <div key={item.name} className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground/80 px-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <span className="font-mono text-foreground font-bold">
                <NumberCounter value={item.value} duration={1.2} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. CLIENT WIDGETS
// ─────────────────────────────────────────────────────────────

function ClientHealth() {
  const metrics = [
    { label: "Healthy", count: 12, color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" },
    { label: "Attention", count: 3, color: "text-amber-500 bg-amber-500/5 border-amber-500/10" },
    { label: "At Risk", count: 1, color: "text-red-500 bg-red-500/5 border-red-500/10" },
  ];

  return (
    <div className="h-full w-full flex flex-col justify-between pt-1">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={cn("p-4 rounded-xl border flex flex-col justify-between items-start text-left shadow-xs", m.color)}>
            <span className="text-[9px] uppercase font-bold tracking-wider leading-none">
              {m.label}
            </span>
            <span className="text-xl font-bold font-mono text-foreground mt-2 leading-none">
              <NumberCounter value={m.count} duration={1.2} />
            </span>
          </div>
        ))}
      </div>

      <div className="p-3.5 border border-border/10 rounded-xl bg-muted/20 space-y-1 text-left shrink-0">
        <h5 className="text-[10px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider opacity-75">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          Attention Needed
        </h5>
        <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5 bg-card/70 p-2 rounded-lg border border-border/10">
          <span className="font-semibold text-foreground/80">Menswear Brand</span>
          <span className="font-mono text-red-500 font-semibold bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-md uppercase text-[8px] tracking-wide shrink-0">
            Overdue Review
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectsByStatus() {
  const data = [
    { name: "Setup", count: 3 },
    { name: "Active", count: 8 },
    { name: "Review", count: 4 },
    { name: "Done", count: 12 },
  ];

  return (
    <div className="h-full min-h-[220px] w-full pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
        >
          <defs>
            <linearGradient id="purpleBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 10, opacity: 0.65, fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 9, opacity: 0.5 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(139, 92, 246, 0.02)" }}
            contentStyle={{
              background: "var(--background)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "10px"
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[6, 6, 0, 0]}
            barSize={20}
          >
            {data.map((entry, index) => {
              const colors = ["#9CA3AF", "url(#purpleBarGradient)", "#3B82F6", "#10B981"];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} opacity={0.85} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. TEAM WIDGETS
// ─────────────────────────────────────────────────────────────

function CXWorkload({ teammates }: { teammates: Teammate[] }) {
  const workloadMock = [24, 18, 12, 8, 4];

  if (teammates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-muted-foreground/40 text-xs font-bold">—</span>
        </div>
        <p className="text-[11px] text-muted-foreground/60 font-medium">No teammates yet. Invite your team in Settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1 max-h-[280px] overflow-y-auto pr-1">
      {teammates.map((mate, idx) => {
        const initials = ((mate.firstName?.[0] ?? "") + (mate.lastName?.[0] ?? mate.email[0])).toUpperCase();
        const displayName = mate.firstName ? `${mate.firstName} ${mate.lastName ?? ""}` : mate.email;
        const leadsCount = workloadMock[idx % workloadMock.length];
        const barWidth = Math.min((leadsCount / 30) * 100, 100);

        return (
          <div key={mate.id} className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 flex items-center justify-center text-[9px] font-extrabold text-[#8B5CF6] shrink-0">
                  {initials}
                </div>
                <span className="font-semibold text-foreground/80 truncate max-w-[110px]">
                  {displayName}
                </span>
                <span className="text-[8px] text-[#8B5CF6] bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                  {mate.designation ?? mate.role.label}
                </span>
              </div>
              <span className="font-mono text-muted-foreground font-semibold shrink-0">
                <NumberCounter value={leadsCount} duration={1.2} /> leads
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#C4B5FD] to-[#8B5CF6] rounded-full transition-all duration-300"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. DOCUMENT WIDGETS
// ─────────────────────────────────────────────────────────────

function PendingAgreements({ brands }: { brands: Brand[] }) {
  void brands; // reserved for future brand-scoped filtering

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
      <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
        <span className="text-muted-foreground/40 text-xs font-bold">—</span>
      </div>
      <p className="text-[11px] text-muted-foreground/60 font-medium">No pending agreements. Documents will appear here once created.</p>
    </div>
  );
}

function InvoiceStatus() {
  const data = [
    { name: "W1", Collected: 12000, Unpaid: 4000 },
    { name: "W2", Collected: 24000, Unpaid: 6000 },
    { name: "W3", Collected: 38000, Unpaid: 9000 },
    { name: "W4", Collected: 48000, Unpaid: 12000 }
  ];

  return (
    <div className="h-full min-h-[220px] w-full flex flex-col justify-between pt-1">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
          >
            <defs>
              <linearGradient id="strokeCollectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: "currentColor", fontSize: 10, opacity: 0.65, fontWeight: 600 }}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v) => `₹${v / 1000}k`}
              tick={{ fill: "currentColor", fontSize: 9, opacity: 0.5 }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "8px",
                fontSize: "10px"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="Collected" 
              stroke="url(#strokeCollectedGradient)" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCollected)"
            />
            <Line 
              type="monotone" 
              dataKey="Unpaid" 
              stroke="var(--muted-foreground)" 
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={{ r: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-center text-[10px] text-muted-foreground/60 border-t border-border/10 pt-2 px-1 shrink-0 font-medium mt-1">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
          <span>Collected: ₹48k (80%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          <span>Unpaid: ₹12k (20%)</span>
        </div>
      </div>
    </div>
  );
}
