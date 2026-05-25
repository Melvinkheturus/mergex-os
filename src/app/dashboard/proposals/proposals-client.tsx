"use client";

import { useState } from "react";
import {
  FileText, Plus, Search, MoreHorizontal, DollarSign,
  Calendar, Clock, CheckCircle, XCircle, Send, Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProposalStatus = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "EXPIRED";

interface Proposal {
  id: string;
  title: string;
  value: number;
  currency: string;
  status: ProposalStatus;
  validUntil?: string;
  sentAt?: string;
  lead?: { firstName: string; lastName: string };
  owner: { firstName: string; lastName: string };
  createdAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProposalStatus, { label: string; icon: React.ElementType; color: string }> = {
  DRAFT:    { label: "Draft",    icon: FileText,      color: "text-muted-foreground bg-muted border-border" },
  SENT:     { label: "Sent",     icon: Send,          color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  VIEWED:   { label: "Viewed",   icon: Eye,           color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  ACCEPTED: { label: "Accepted", icon: CheckCircle,   color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  REJECTED: { label: "Rejected", icon: XCircle,       color: "text-red-500 bg-red-500/10 border-red-500/20" },
  EXPIRED:  { label: "Expired",  icon: Clock,         color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
};

function StatusBadge({ status }: { status: ProposalStatus }) {
  const { label, icon: Icon, color } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function ProposalRow({ proposal }: { proposal: Proposal }) {
  const initials = proposal.owner.firstName[0] + proposal.owner.lastName[0];
  const fmtValue = proposal.currency === "INR"
    ? `₹${(proposal.value / 100000).toFixed(1)}L`
    : `$${(proposal.value / 1000).toFixed(0)}k`;

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 rounded-lg transition-colors group text-sm">
      {/* Title + Lead */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{proposal.title}</p>
        {proposal.lead && (
          <p className="text-xs text-muted-foreground">
            {proposal.lead.firstName} {proposal.lead.lastName}
          </p>
        )}
      </div>

      {/* Value */}
      <div className="flex items-center gap-1 text-sm font-semibold text-emerald-500 shrink-0">
        <DollarSign className="h-3.5 w-3.5" />
        {fmtValue}
      </div>

      {/* Status */}
      <StatusBadge status={proposal.status} />

      {/* Valid Until */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Calendar className="h-3.5 w-3.5" />
        {proposal.validUntil
          ? new Date(proposal.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : "—"
        }
      </div>

      {/* Owner */}
      <Avatar className="h-7 w-7 shrink-0 hidden sm:flex">
        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
          {initials.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="text-xs">View Proposal</DropdownMenuItem>
          <DropdownMenuItem className="text-xs">Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Send className="h-3.5 w-3.5 mr-2" />Send to Client
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ProposalsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const proposals: Proposal[] = []; // TODO: fetch from API

  const filtered = proposals.filter(p => {
    const matchSearch = `${p.title} ${p.lead?.firstName ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = proposals.reduce((s, p) => s + p.value, 0);
  const acceptedCount = proposals.filter(p => p.status === "ACCEPTED").length;
  const winRate = proposals.length > 0 ? Math.round((acceptedCount / proposals.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Proposals</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sales proposals, contracts, and quotes
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> New Proposal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Proposals", value: String(proposals.length), icon: FileText },
          { label: "Total Value", value: `₹${(totalValue / 100000).toFixed(1)}L`, icon: DollarSign },
          { label: "Win Rate", value: `${winRate}%`, icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search proposals…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(Object.keys(STATUS_CONFIG) as ProposalStatus[]).map(s => (
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            <span className="flex-1">Proposal</span>
            <span className="w-16 shrink-0">Value</span>
            <span className="w-20 shrink-0">Status</span>
            <span className="hidden md:block w-20 shrink-0">Expires</span>
            <span className="hidden sm:block w-7 shrink-0">Rep</span>
            <span className="w-7 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No proposals yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create your first proposal to start closing deals.
              </p>
              <Button size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-1.5" /> New Proposal
              </Button>
            </div>
          ) : (
            filtered.map(p => <ProposalRow key={p.id} proposal={p} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
