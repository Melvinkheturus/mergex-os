"use client";

import { useRouter, useParams } from "next/navigation";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import {
  TrendingUp, Plus, MoreHorizontal, ExternalLink, Trash2,
  CalendarClock, IndianRupee, Building2, User, MapPin, ArrowRight, FolderOpen,
  Star, Video, Phone, Locate, Calendar, Clock, Mail
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead, NEXT_ACTION_LABELS, NextActionType } from "./types";
import { TemperatureIcon } from "./ui-helpers";
import { cn } from "@/lib/utils";

function formatFollowUp(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "Not Scheduled", urgent: false };
  const d = new Date(dateStr);
  if (isToday(d)) return { label: "Today", urgent: true };
  if (isTomorrow(d)) return { label: "Tomorrow", urgent: false };
  if (isPast(d)) return { label: `${formatDistanceToNow(d)} ago`, urgent: true };
  return { label: format(d, "d MMM"), urgent: false };
}

function LeadCard({ lead, onDelete }: { lead: Lead; onDelete: (id: string) => Promise<void> }) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const initials = `${lead.companyName[0] || "L"}`.toUpperCase();
  const followUp = formatFollowUp(lead.nextFollowUpAt);

  // Status indicator based on Temperature
  let tempLabel = "Cold";
  if (lead.temperature === "HOT") {
    tempLabel = "Hot";
  } else if (lead.temperature === "WARM") {
    tempLabel = "Warm";
  }

  // Format expected value cleanly (e.g. ₹50k or ₹1.2M)
  const formatExpectedValue = (val: any) => {
    if (!val || Number(val) === 0) return "Not Set";
    const num = Number(val);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${num}`;
  };

  return (
    <Card 
      onClick={() => router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)}
      className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-[20px] hover:shadow-lg transition-all duration-300 cursor-pointer group p-5 flex flex-col justify-between gap-4"
    >
      {/* 3-Dot Actions Menu (Absolute Top Right) */}
      <div 
        className="absolute top-5 right-5 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full border border-zinc-200/60 dark:border-zinc-800/80 hover:border-[#8B5CF6]/25 bg-white/80 dark:bg-zinc-800/35 backdrop-blur-xs transition-all shadow-2xs"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <DropdownMenuItem
              onClick={() => router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)}
              className="text-xs cursor-pointer flex items-center justify-between font-semibold py-2"
            >
              <span>Open Workspace</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60" />
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800/60" />
            <DropdownMenuItem
              onClick={() => onDelete(lead.id)}
              className="text-xs cursor-pointer text-red-500 focus:text-red-500 flex items-center justify-between font-semibold py-2"
            >
              <span>Delete Lead</span>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        {/* Top Section: Avatar left, Text right */}
        <div className="flex items-start gap-4">
          {/* Square Avatar — clip-path forces rounded-square regardless of child border-radius */}
          <div
            className="lead-avatar-square h-[88px] w-[88px] shrink-0 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center relative"
            style={{
              clipPath: 'inset(0 round 12px)',
              border: '1px solid rgba(161,161,170,0.3)',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              minWidth: '88px',
              minHeight: '88px',
            }}
          >
            {lead.avatarUrl ? (
              <img
                src={lead.avatarUrl}
                alt={lead.companyName}
                style={{
                  display: 'block',
                  width: '88px',
                  height: '88px',
                  objectFit: 'cover',
                  borderRadius: '0',
                  flexShrink: 0,
                }}
              />
            ) : (
              <span className="text-3xl font-black text-[#8B5CF6]">
                {initials}
              </span>
            )}
          </div>

          {/* Business Details Info */}
          <div className="min-w-0 flex-1 pr-6">
            {/* Status dot badge (Online style with Icon) */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border",
              lead.temperature === "HOT" && "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/30",
              lead.temperature === "WARM" && "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/30",
              (lead.temperature === "COLD" || !lead.temperature) && "bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/30"
            )}>
              <TemperatureIcon temp={lead.temperature} />
              <span>{tempLabel}</span>
            </div>

            <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-base leading-snug tracking-tight truncate mt-1">
              {lead.companyName}
            </h4>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate mb-1.5">
              {lead.industry || "General Prospect"}
            </p>

            {/* Contact Details Section */}
            <div className="space-y-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold truncate">
                <User className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span className="truncate">{lead.contactPerson || "No contact"}</span>
                {lead.designation && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
                {lead.designation && <span className="text-zinc-500 dark:text-zinc-450 font-medium truncate">{lead.designation}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Owner Section (replacing location, without right button) */}
        <div className="flex items-center px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 mt-4">
          <div className="flex items-center gap-2 min-w-0">
            {lead.owner?.avatarUrl ? (
              <img 
                src={lead.owner.avatarUrl} 
                alt={lead.owner.firstName || "Owner"} 
                className="h-5 w-5 rounded-full object-cover border border-zinc-200/80 dark:border-zinc-800" 
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center border border-[#8B5CF6]/20">
                <User className="h-3 w-3 text-[#8B5CF6]" />
              </div>
            )}
            <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 truncate">
              {lead.owner ? `Owner: ${lead.owner.firstName} ${lead.owner.lastName || ""}` : "Owner: Unassigned"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom section: 3 mini-cards (Stage, Value, Follow-up) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Card 1: Stage (Highlighted) */}
        <div className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-center min-w-0">
          <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 block truncate max-w-full">
            Stage
          </span>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 max-w-full">
            {lead.stage?.label.split(" ")[0] || "Intake"}
          </span>
        </div>

        {/* Card 2: Value */}
        <div className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-center min-w-0">
          <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 block truncate max-w-full">
            Value
          </span>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 max-w-full">
            {formatExpectedValue(lead.expectedValue)}
          </span>
        </div>

        {/* Card 3: Follow-up */}
        <div className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-center min-w-0">
          <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 block truncate max-w-full">
            Follow-up
          </span>
          <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 max-w-full">
            {lead.nextFollowUpAt ? followUp.label : "Not Scheduled"}
          </span>
        </div>
      </div>
    </Card>
  );
}

interface LeadsGridViewProps {
  leads: Lead[];
  loading: boolean;
  onDelete: (leadId: string) => Promise<void>;
  onAddClick: () => void;
}

export function LeadsGridView({ leads, loading, onDelete, onAddClick }: LeadsGridViewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border border-zinc-200 dark:border-zinc-800/80 rounded-[20px] p-5 bg-card/5 space-y-4 shadow-xs">
            <div className="flex items-start gap-4">
              <Skeleton className="h-[88px] w-[88px] rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-border/30 border-dashed rounded-2xl bg-card/5">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
          <TrendingUp className="h-7 w-7 text-primary animate-pulse" />
        </div>
        <h3 className="text-base font-semibold">No leads found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Try adjusting your filters or search query to find what you are looking for.
        </p>
        <Button size="sm" className="mt-4" onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Lead
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} onDelete={onDelete} />
      ))}
    </div>
  );
}
