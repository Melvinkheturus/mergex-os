"use client";

import {
  PhoneCall, Send, MessageSquare, StickyNote, CheckSquare,
  Video, MapPin, Flame, Thermometer, Snowflake, Minus,
  ChevronUp, ChevronDown, ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Temperature Icon ─────────────────────────────────────────────────────────

export function TemperatureIcon({ temp }: { temp?: string }) {
  if (!temp) return <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />;
  if (temp === "HOT") return <Flame className="h-3.5 w-3.5 text-rose-500" />;
  if (temp === "WARM") return <Thermometer className="h-3.5 w-3.5 text-amber-500" />;
  return <Snowflake className="h-3.5 w-3.5 text-sky-500" />;
}

// ─── ICP Score Badge ──────────────────────────────────────────────────────────

export function IcpBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20" :
    score >= 60 ? "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20" :
    score >= 40 ? "text-orange-600 bg-orange-500/10 dark:text-orange-400 dark:bg-orange-500/20" :
    "text-muted-foreground bg-muted";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>
      {score}
      {score >= 80 ? <ChevronUp className="h-2.5 w-2.5" /> :
       score >= 40 ? <ArrowUpRight className="h-2.5 w-2.5" /> :
       <ChevronDown className="h-2.5 w-2.5" />}
    </span>
  );
}

// ─── Activity Type Icon ───────────────────────────────────────────────────────

export function ActivityIcon({ type }: { type: string }) {
  const cfg: Record<string, { icon: React.ReactNode; color: string }> = {
    CALL:     { icon: <PhoneCall className="h-3.5 w-3.5" />,    color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    EMAIL:    { icon: <Send className="h-3.5 w-3.5" />,          color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    WHATSAPP: { icon: <MessageSquare className="h-3.5 w-3.5" />, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    NOTE:     { icon: <StickyNote className="h-3.5 w-3.5" />,    color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    TASK:     { icon: <CheckSquare className="h-3.5 w-3.5" />,   color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  };
  const c = cfg[type] ?? cfg.NOTE;
  return (
    <div className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center ${c.color}`}>
      {c.icon}
    </div>
  );
}

// ─── Meeting Mode Icon ────────────────────────────────────────────────────────

export function MeetingModeIcon({ mode }: { mode: string }) {
  const cfg: Record<string, { icon: React.ReactNode; label: string }> = {
    GOOGLE_MEET: { icon: <Video className="h-3.5 w-3.5 text-emerald-500" />,  label: "Google Meet" },
    ZOOM:        { icon: <Video className="h-3.5 w-3.5 text-blue-500" />,     label: "Zoom" },
    PHONE:       { icon: <PhoneCall className="h-3.5 w-3.5 text-amber-500" />,label: "Phone" },
    IN_PERSON:   { icon: <MapPin className="h-3.5 w-3.5 text-rose-500" />,    label: "In Person" },
  };
  const c = cfg[mode] ?? cfg.PHONE;
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-[10px]">
      {c.icon}
      <span>{c.label}</span>
    </span>
  );
}

// ─── Proposal Status Badge ────────────────────────────────────────────────────

export function ProposalStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    DRAFT:       "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
    SENT:        "bg-blue-500/10 text-blue-500 border-blue-500/20",
    NEGOTIATION: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    APPROVED:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    REJECTED:    "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <Badge className={`border text-[10px] font-bold uppercase tracking-wide ${cfg[status] ?? ""}`}>
      {status}
    </Badge>
  );
}
