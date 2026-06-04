"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  Video,
  Phone,
  Users,
  MapPin,
  Clock,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Meeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  mode: string;
  meetingUrl: string | null;
  status: string;
  lead: { id: string; companyName: string; contactPerson: string };
  organizer: { firstName: string | null; lastName: string | null; avatarUrl: string | null };
}

type FilterType = "all" | "upcoming" | "past";

const MODE_ICON: Record<string, React.ReactNode> = {
  GOOGLE_MEET: <Video className="h-3.5 w-3.5 text-blue-500" />,
  ZOOM: <Video className="h-3.5 w-3.5 text-sky-500" />,
  PHONE: <Phone className="h-3.5 w-3.5 text-emerald-500" />,
  IN_PERSON: <MapPin className="h-3.5 w-3.5 text-amber-500" />,
};

const MODE_LABEL: Record<string, string> = {
  GOOGLE_MEET: "Google Meet",
  ZOOM: "Zoom",
  PHONE: "Phone",
  IN_PERSON: "In Person",
};

const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function MeetingsPageClient() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("upcoming");

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/meetings?filter=${filter}&brandSlug=${slug}`);
      if (res.ok) setMeetings(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter, slug]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const filters: { key: FilterType; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Meetings</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            All scheduled and past client meetings across your pipeline.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-muted/20">
          <Filter className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          {filters.map((f) => (
            <button
              key={f.key}
              id={`meetings-filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Scheduled",
            count: meetings.filter((m) => m.status === "SCHEDULED").length,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Completed",
            count: meetings.filter((m) => m.status === "COMPLETED").length,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Google Meet",
            count: meetings.filter((m) => m.mode === "GOOGLE_MEET").length,
            color: "text-sky-500",
            bg: "bg-sky-500/10",
          },
          {
            label: "In Person",
            count: meetings.filter((m) => m.mode === "IN_PERSON").length,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border/30 rounded-xl p-3 bg-card/30"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Meetings List */}
      <Card className="border border-border/40 shadow-none rounded-xl overflow-hidden">
        {/* Table header */}
        <CardHeader className="px-5 py-3 border-b border-border/30 bg-muted/10">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_100px] gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            <span>Lead & Meeting</span>
            <span>Date & Time</span>
            <span>Mode</span>
            <span>Owner</span>
            <span>Status</span>
          </div>
        </CardHeader>

        <CardContent className="p-2 bg-card/5">
          {loading ? (
            <div className="divide-y divide-border/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_100px] items-center gap-4 px-4 py-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                <Calendar className="h-6 w-6 text-primary/60" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {filter === "upcoming" ? "No upcoming meetings" : filter === "past" ? "No past meetings" : "No meetings found"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Schedule meetings from the Lead Profile.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  onClick={() =>
                    router.push(`/workspaces/${slug}/crm/leads/${m.lead.id}?tab=meetings`)
                  }
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_100px] items-center gap-4 px-4 py-3 hover:bg-muted/20 rounded-lg transition-all text-xs cursor-pointer border border-transparent hover:border-border/30"
                >
                  {/* Lead & Meeting */}
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{m.lead.companyName}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {m.title}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground text-[11px]">
                        {new Date(m.scheduledAt).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(m.scheduledAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {m.duration}m
                      </p>
                    </div>
                  </div>

                  {/* Mode */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {MODE_ICON[m.mode] || <Users className="h-3.5 w-3.5" />}
                    <span className="text-[11px] font-medium">
                      {MODE_LABEL[m.mode] || m.mode}
                    </span>
                  </div>

                  {/* Organizer */}
                  <span className="text-[11px] text-muted-foreground truncate font-medium">
                    {m.organizer.firstName} {m.organizer.lastName}
                  </span>

                  {/* Status */}
                  <div>
                    <Badge
                      className={`text-[10px] border ${STATUS_CLASS[m.status] || "bg-muted/30 border-border/30"}`}
                    >
                      {m.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
