"use client";

import { useRouter } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import {
  Calendar, Plus, Video, MapPin, FileText,
  CheckCircle2, Clock, XCircle, Flame, Thermometer, Snowflake,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Meeting = {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduledAt: Date | string;
  duration: number | null;
  location: string | null;
  lead: {
    firstName: string; lastName: string; company: string | null;
    pipelineStage: string; temperature: string | null;
  } | null;
  host: { firstName: string | null; lastName: string | null; avatarUrl: string | null };
  mom: { id: string; summary: string } | null;
  _count: { notes: number };
};

const STATUS_CONFIG = {
  SCHEDULED:   { label: "Scheduled",  icon: Clock,         color: "text-[#3B82F6]",  bg: "bg-[#3B82F6]/10" },
  IN_PROGRESS: { label: "Live",       icon: Video,         color: "text-[#EF4444]",  bg: "bg-[#EF4444]/10" },
  COMPLETED:   { label: "Completed",  icon: CheckCircle2,  color: "text-[#10B981]",  bg: "bg-[#10B981]/10" },
  CANCELLED:   { label: "Cancelled",  icon: XCircle,       color: "text-[#6B7280]",  bg: "bg-[#6B7280]/10" },
  NO_SHOW:     { label: "No Show",    icon: XCircle,       color: "text-[#F97316]",  bg: "bg-[#F97316]/10" },
} as const;

const TEMP_CONFIG = {
  HOT:  { icon: Flame,       color: "text-[#EF4444]" },
  WARM: { icon: Thermometer, color: "text-[#F97316]" },
  COLD: { icon: Snowflake,   color: "text-[#06B6D4]" },
} as const;

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const date = new Date(meeting.scheduledAt);
  const isLive = meeting.status === "IN_PROGRESS";
  const statusCfg = STATUS_CONFIG[meeting.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusCfg?.icon ?? Clock;
  const tempCfg = meeting.lead?.temperature ? TEMP_CONFIG[meeting.lead.temperature as keyof typeof TEMP_CONFIG] : null;
  const TempIcon = tempCfg?.icon;

  return (
    <button
      onClick={() => router.push(`/meetings/${meeting.id}`)}
      className={`w-full text-left bg-white dark:bg-[#16161A] border rounded-xl p-4 hover:border-[#8B5CF6]/40 hover:shadow-sm transition-all duration-150 group ${
        isLive ? "border-[#EF4444]/40 shadow-sm shadow-[#EF4444]/10" : "border-[#E5E7EB] dark:border-[#26262C]"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center ${
          isToday(date) ? "bg-[#8B5CF6] text-white" : "bg-muted text-foreground"
        }`}>
          <span className="text-[10px] font-medium uppercase leading-none">
            {format(date, "MMM")}
          </span>
          <span className="text-lg font-bold leading-tight">{format(date, "d")}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground truncate">{meeting.title}</h3>
            {statusCfg && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${statusCfg.color} ${statusCfg.bg} flex-shrink-0`}>
                <StatusIcon className="w-2.5 h-2.5" /> {statusCfg.label}
              </span>
            )}
          </div>

          {meeting.lead && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
              {TempIcon && tempCfg && <TempIcon className={`w-3 h-3 ${tempCfg.color}`} />}
              <span className="font-medium text-foreground/80">
                {meeting.lead.firstName} {meeting.lead.lastName}
              </span>
              {meeting.lead.company && <span>· {meeting.lead.company}</span>}
            </p>
          )}

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>{format(date, "h:mm a")}</span>
            {meeting.duration && <span>· {meeting.duration} min</span>}
            {meeting.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />{" "}
                {meeting.location.startsWith("http") ? "Video call" : meeting.location}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <FileText className="w-3 h-3" /> {meeting._count.notes} notes
              {meeting.mom && <span className="text-[#10B981] font-semibold ml-1">· MOM ✓</span>}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export default function MeetingsClient({ meetings }: { meetings: Meeting[] }) {
  const router = useRouter();

  const upcoming = meetings.filter(m => m.status === "SCHEDULED" && !isPast(new Date(m.scheduledAt)));
  const past = meetings.filter(m => m.status === "COMPLETED" || (m.status === "SCHEDULED" && isPast(new Date(m.scheduledAt))));
  const noMom = past.filter(m => !m.mom);

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Discovery Meetings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {upcoming.length} upcoming · {noMom.length} missing MOM
          </p>
        </div>
        <Button size="sm" onClick={() => router.push("/meetings/new")}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Schedule Meeting
        </Button>
      </div>

      {/* MOM Alert */}
      {noMom.length > 0 && (
        <div className="mb-5 p-3.5 bg-[#F97316]/10 border border-[#F97316]/20 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F97316]/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-[#F97316]" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {noMom.length} completed meeting{noMom.length > 1 ? "s" : ""} missing MOM
            </p>
            <p className="text-xs text-muted-foreground">Add minutes of meeting to enable proposal creation</p>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Upcoming ({upcoming.length})
          </h2>
          <div className="flex flex-col gap-2.5">
            {upcoming.map(m => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Past ({past.length})
          </h2>
          <div className="flex flex-col gap-2.5">
            {past.map(m => <MeetingCard key={m.id} meeting={m} />)}
          </div>
        </section>
      )}

      {meetings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No meetings yet</h3>
          <p className="text-xs text-muted-foreground mb-4">Schedule your first discovery meeting to get started</p>
          <Button size="sm" onClick={() => router.push("/meetings/new")}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Schedule Meeting
          </Button>
        </div>
      )}
    </div>
  );
}
