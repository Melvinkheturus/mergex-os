"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, ShieldAlert, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { NotificationItemData } from "@/components/notifications/notification-item";
import { NotificationPriority } from "@prisma/client";

interface AlertCardProps {
  notification: NotificationItemData;
  onMarkRead: (id: string) => void;
}

function AlertCard({ notification, onMarkRead }: AlertCardProps) {
  const isCritical = notification.priority === NotificationPriority.CRITICAL;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border transition-all duration-200",
        !notification.isRead && "shadow-sm",
        isCritical
          ? "border-red-500/30 bg-red-500/[0.04]"
          : "border-orange-500/30 bg-orange-500/[0.04]"
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5",
          isCritical ? "bg-red-500" : "bg-orange-500"
        )}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5",
                isCritical
                  ? "bg-red-500/10 text-red-500"
                  : "bg-orange-500/10 text-orange-500"
              )}
            >
              {isCritical ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">
                  {notification.title}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] border h-4 px-1.5",
                    isCritical
                      ? "border-red-500/40 text-red-500 bg-red-500/10"
                      : "border-orange-500/40 text-orange-500 bg-orange-500/10"
                  )}
                >
                  {notification.priority.toLowerCase()}
                </Badge>
                {!notification.isRead && (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isCritical ? "bg-red-500" : "bg-orange-500"
                    )}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {notification.message}
              </p>
              <p className="text-[11px] text-muted-foreground/50 mt-2">
                {timeAgo}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 ml-11">
          {notification.link && (
            <Link
              href={notification.link}
              onClick={() => onMarkRead(notification.id)}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors",
                isCritical
                  ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
              )}
            >
              <Zap className="h-3 w-3" />
              Take action
            </Link>
          )}
          {!notification.isRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PulseAlertsPage() {
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const [critRes, highRes] = await Promise.all([
        fetch(`/api/pulse/notifications?priority=${NotificationPriority.CRITICAL}&limit=30`),
        fetch(`/api/pulse/notifications?priority=${NotificationPriority.HIGH}&limit=30`),
      ]);
      const critData = critRes.ok ? await critRes.json() : { notifications: [] };
      const highData = highRes.ok ? await highRes.json() : { notifications: [] };

      const combined = [
        ...(critData.notifications ?? []),
        ...(highData.notifications ?? []),
      ].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(combined);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await fetch(`/api/pulse/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
  };

  const unread = notifications.filter((n) => !n.isRead);
  const acknowledged = notifications.filter((n) => n.isRead);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold">Alert Center</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Critical and high-priority operational alerts only
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">No active alerts</p>
            <p className="text-sm text-muted-foreground mt-1">
              Critical and high-priority issues will appear here when triggered.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Active Alerts ({unread.length})
              </p>
              <div className="space-y-3">
                {unread.map((n) => (
                  <AlertCard key={n.id} notification={n} onMarkRead={handleMarkRead} />
                ))}
              </div>
            </div>
          )}

          {acknowledged.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40 mb-3">
                Acknowledged ({acknowledged.length})
              </p>
              <div className="space-y-3">
                {acknowledged.map((n) => (
                  <AlertCard key={n.id} notification={n} onMarkRead={handleMarkRead} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
