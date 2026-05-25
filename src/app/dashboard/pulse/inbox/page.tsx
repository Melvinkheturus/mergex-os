"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCheck, Filter, RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NotificationItem, type NotificationItemData } from "@/components/notifications/notification-item";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotificationPriority, NotificationType } from "@prisma/client";

type FilterTab = "all" | "unread" | "critical" | "reminders";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "critical", label: "Critical" },
  { id: "reminders", label: "Reminders" },
];

const REMINDER_TYPES: NotificationType[] = [
  "FOLLOW_UP_DUE",
  "MEETING_REMINDER",
  "REMINDER",
  "TASK_DUE",
];

function buildQueryString(filter: FilterTab) {
  const params = new URLSearchParams({ limit: "50" });
  if (filter === "unread") params.set("unreadOnly", "true");
  if (filter === "critical") params.set("priority", NotificationPriority.CRITICAL);
  return params.toString();
}

function groupByDate(notifications: NotificationItemData[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: NotificationItemData[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const n of notifications) {
    const date = new Date(n.createdAt);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      groups[0].items.push(n);
    } else if (date.getTime() === yesterday.getTime()) {
      groups[1].items.push(n);
    } else {
      groups[2].items.push(n);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function PulseInboxPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      try {
        let url = `/api/pulse/notifications?${buildQueryString(activeFilter)}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        let items = data.notifications ?? [];

        // Client-side filter for reminders tab
        if (activeFilter === "reminders") {
          items = items.filter((n: NotificationItemData) =>
            REMINDER_TYPES.includes(n.type)
          );
        }

        setNotifications(items);
        setUnreadCount(data.unreadCount ?? 0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/pulse/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/pulse/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    toast.success("All notifications marked as read");
  };

  const groups = groupByDate(notifications);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                activeFilter === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.id === "unread" && unreadCount > 0 && (
                <Badge variant="secondary" className="h-4 text-[10px] px-1.5 py-0">
                  {unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-muted-foreground"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {activeFilter === "all" ? "No notifications yet" : `No ${activeFilter} notifications`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeFilter === "all"
                ? "Operational events will appear here as your team works."
                : "Try switching to a different filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group, gi) => (
            <div key={group.label}>
              {gi > 0 && <Separator className="mb-4 opacity-50" />}
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2 px-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
