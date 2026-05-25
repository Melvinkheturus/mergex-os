"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast, isWithinInterval, addDays } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import type { NotificationItemData } from "@/components/notifications/notification-item";

const REMINDER_TYPES = [
  "FOLLOW_UP_DUE",
  "MEETING_REMINDER",
  "REMINDER",
  "TASK_DUE",
  "MOM_OVERDUE",
  "MOM_ESCALATION",
];

interface ReminderCardProps {
  notification: NotificationItemData;
  onDismiss: (id: string) => void;
}

const PRIORITY_STYLES = {
  CRITICAL: {
    badge: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: "text-red-500",
    border: "border-l-red-500",
  },
  HIGH: {
    badge: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    icon: "text-orange-500",
    border: "border-l-orange-500",
  },
  MEDIUM: {
    badge: "bg-violet-500/10 text-violet-500 border-violet-500/30",
    icon: "text-violet-500",
    border: "border-l-violet-500/60",
  },
  LOW: {
    badge: "bg-muted text-muted-foreground border-border",
    icon: "text-muted-foreground",
    border: "border-l-border",
  },
} as const;

function ReminderCard({ notification, onDismiss }: ReminderCardProps) {
  const styles = PRIORITY_STYLES[notification.priority] ?? PRIORITY_STYLES.LOW;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });
  const isUnread = !notification.isRead;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border border-border border-l-2 transition-all",
        styles.border,
        isUnread ? "bg-card" : "bg-muted/20 opacity-75"
      )}
    >
      {/* Status icon */}
      <div className={cn("mt-0.5 shrink-0", styles.icon)}>
        {notification.isRead ? (
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              !isUnread && "text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          <Badge
            variant="outline"
            className={cn("text-[10px] shrink-0 border", styles.badge)}
          >
            {notification.priority.toLowerCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[11px] text-muted-foreground/60">{timeAgo}</span>
          {notification.link && (
            <Link
              href={notification.link}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Open →
            </Link>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            className="text-[11px] text-muted-foreground hover:text-foreground ml-auto"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PulseRemindersPage() {
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/pulse/notifications?limit=60");
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.notifications ?? []).filter((n: NotificationItemData) =>
        REMINDER_TYPES.includes(n.type)
      );
      setNotifications(items);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const handleDismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/pulse/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    toast.success("Reminder dismissed");
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold">Reminders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Time-based operational alerts requiring your attention
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => fetch_(true)}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">No active reminders</p>
            <p className="text-sm text-muted-foreground mt-1">
              Follow-ups, meeting reminders, and overdue alerts will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Active ({unread.length})
                </p>
              </div>
              <div className="space-y-2">
                {unread.map((n) => (
                  <ReminderCard
                    key={n.id}
                    notification={n}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Completed ({read.length})
                </p>
              </div>
              <div className="space-y-2">
                {read.map((n) => (
                  <ReminderCard
                    key={n.id}
                    notification={n}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
