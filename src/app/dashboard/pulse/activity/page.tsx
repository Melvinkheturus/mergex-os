"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  RefreshCw,
  StickyNote,
  Phone,
  Mail,
  Video,
  Zap,
  CheckSquare,
  TrendingUp,
  Trophy,
  XCircle,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ActivityType } from "@prisma/client";

interface EnrichedActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  typeLabel: string;
  createdAt: string;
  user: { firstName?: string | null; lastName?: string | null; avatarUrl?: string | null };
  lead?: { firstName: string; lastName: string; company?: string | null } | null;
}

// ── Activity type config ─────────────────────────────────────────────────────
const ACTIVITY_CONFIG: Partial<
  Record<ActivityType, { icon: React.ElementType; color: string; bg: string }>
> = {
  NOTE: { icon: StickyNote, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  CALL: { icon: Phone, color: "text-blue-500", bg: "bg-blue-500/10" },
  EMAIL: { icon: Mail, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  MEETING: { icon: Video, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  TASK: { icon: CheckSquare, color: "text-violet-500", bg: "bg-violet-500/10" },
  STAGE_CHANGE: { icon: Zap, color: "text-primary", bg: "bg-primary/10" },
  DEAL_WON: { icon: Trophy, color: "text-green-500", bg: "bg-green-500/10" },
  DEAL_LOST: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  FOLLOW_UP: { icon: CornerDownRight, color: "text-orange-500", bg: "bg-orange-500/10" },
  SCORE_CHANGED: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
};

function getInitials(first?: string | null, last?: string | null): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

function ActivityRow({ activity }: { activity: EnrichedActivity }) {
  const cfg = ACTIVITY_CONFIG[activity.type] ?? {
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-muted",
  };
  const Icon = cfg.icon;
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });
  const actorName =
    [activity.user.firstName, activity.user.lastName].filter(Boolean).join(" ") || "System";

  return (
    <div className="flex items-start gap-3 py-3 group">
      {/* Actor avatar */}
      <div className="relative shrink-0">
        <div
          className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-[11px] font-semibold text-muted-foreground"
          title={actorName}
        >
          {activity.user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.user.avatarUrl}
              alt={actorName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getInitials(activity.user.firstName, activity.user.lastName)
          )}
        </div>
        {/* Activity type icon overlay */}
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-background",
            cfg.bg
          )}
        >
          <Icon className={cn("h-2 w-2", cfg.color)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-medium text-foreground">{actorName}</span>{" "}
          <span className="text-muted-foreground">{activity.typeLabel}</span>
          {activity.lead && (
            <>
              {" "}
              <span className="text-muted-foreground">for</span>{" "}
              <span className="font-medium text-foreground">
                {activity.lead.firstName} {activity.lead.lastName}
              </span>
              {activity.lead.company && (
                <span className="text-muted-foreground">
                  {" "}
                  @ {activity.lead.company}
                </span>
              )}
            </>
          )}
        </p>
        {activity.title && activity.title !== activity.typeLabel && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {activity.title}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground/50 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}

export default function PulseActivityPage() {
  const [activities, setActivities] = useState<EnrichedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = useCallback(
    async (pageNum = 1, showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      try {
        const res = await fetch(
          `/api/pulse/activity?limit=20&page=${pageNum}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (pageNum === 1) {
          setActivities(data.activities ?? []);
        } else {
          setActivities((prev) => [...prev, ...(data.activities ?? [])]);
        }
        setTotalPages(data.pagination?.pages ?? 1);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchActivities(next);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold">Activity Feed</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time team activity across your entire pipeline
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => {
            setPage(1);
            fetchActivities(1, true);
          }}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Activity list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Activity className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">No activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Team actions like meetings, stage changes, and follow-ups will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="divide-y divide-border/50">
            {activities.map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </div>

          {page < totalPages && (
            <div className="pt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleLoadMore}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
