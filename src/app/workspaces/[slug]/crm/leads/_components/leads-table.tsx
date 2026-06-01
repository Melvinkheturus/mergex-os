"use client";

import { useRouter, useParams } from "next/navigation";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import {
  TrendingUp, Plus, MoreHorizontal, ExternalLink, Trash2, Loader2,
  CalendarClock, IndianRupee, User,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead } from "./types";
import { TemperatureIcon } from "./ui-helpers";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  onDelete: (leadId: string) => Promise<void>;
  onAddClick: () => void;
}

function formatFollowUp(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "-", urgent: false };
  const d = new Date(dateStr);
  if (isToday(d)) return { label: "Today", urgent: true };
  if (isTomorrow(d)) return { label: "Tomorrow", urgent: false };
  if (isPast(d)) return { label: `${formatDistanceToNow(d)} ago`, urgent: true };
  return { label: format(d, "d MMM"), urgent: false };
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
        <TrendingUp className="h-7 w-7 text-primary animate-pulse" />
      </div>
      <h3 className="text-base font-semibold">No leads yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Add your first lead manually to start managing your pipeline.
      </p>
      <Button size="sm" className="mt-4" onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-1.5" />
        Add Lead
      </Button>
    </div>
  );
}

export function LeadsTable({
  leads,
  loading,
  onDelete,
  onAddClick,
}: LeadsTableProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <Card className="border border-border/40 shadow-none overflow-hidden rounded-xl">
      {/* Header row */}
      <CardHeader className="px-5 py-3.5 border-b border-border bg-card/10">
        <div className="grid grid-cols-[2fr_1.4fr_1.2fr_1.2fr_1fr_1.2fr_1fr_40px] gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          <span>Company</span>
          <span>Contact</span>
          <span>Stage</span>
          <span>Owner</span>
          <span>Temp</span>
          <span>Est. Value</span>
          <span>Follow-up</span>
          <span />
        </div>
      </CardHeader>

      <CardContent className="p-2 bg-card/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
            <span className="text-xs">Loading Leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <EmptyState onAddClick={onAddClick} />
        ) : (
          <div className="divide-y divide-border/20">
            {leads.map((lead) => {
              const initials = `${lead.companyName[0] || "L"}`.toUpperCase();
              const followUp = formatFollowUp(lead.nextFollowUpAt);

              return (
                <div
                  key={lead.id}
                  onClick={() => router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)}
                  className="grid grid-cols-[2fr_1.4fr_1.2fr_1.2fr_1fr_1.2fr_1fr_40px] items-center gap-3 px-4 py-3 hover:bg-muted/20 rounded-lg transition-all group text-xs border border-transparent hover:border-border/30 hover:shadow-xs cursor-pointer"
                >
                  {/* Company */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0 border border-[#8B5CF6]/10">
                      <AvatarFallback className="text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{lead.companyName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {lead.industry || lead.location || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{lead.contactPerson}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {lead.designation || lead.email || "-"}
                    </p>
                  </div>

                  {/* Stage */}
                  <div>
                    {lead.stage ? (
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${lead.stage.color || "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}
                      >
                        {lead.stage.label}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </div>

                  {/* Owner */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    {lead.owner ? (
                      <>
                        <div className="h-5 w-5 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                          <User className="h-3 w-3 text-[#8B5CF6]" />
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {lead.owner.firstName} {lead.owner.lastName}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/40 text-[11px]">Unassigned</span>
                    )}
                  </div>

                  {/* Temperature */}
                  <div className="flex items-center gap-1">
                    <TemperatureIcon temp={lead.temperature} />
                  </div>

                  {/* Est. Value */}
                  <div>
                    {lead.expectedValue ? (
                      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <IndianRupee className="h-3 w-3" />
                        {Number(lead.expectedValue).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">-</span>
                    )}
                  </div>

                  {/* Next Follow-up */}
                  <div className="flex items-center gap-1">
                    {lead.nextFollowUpAt ? (
                      <span
                        className={`flex items-center gap-1 text-[10px] font-semibold ${
                          followUp.urgent
                            ? "text-rose-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        <CalendarClock className="h-3 w-3 shrink-0" />
                        {followUp.label}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40 text-[11px]">-</span>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <div
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md border border-transparent hover:border-border/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => router.push(`/workspaces/${slug}/crm/leads/${lead.id}`)}
                          className="text-xs cursor-pointer flex items-center justify-between"
                        >
                          <span>Open Workspace</span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => onDelete(lead.id)}
                          className="text-xs cursor-pointer text-red-500 focus:text-red-500 flex items-center justify-between"
                        >
                          <span>Delete Lead</span>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
