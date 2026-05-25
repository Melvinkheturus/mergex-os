"use client";

import { cn } from "@/lib/utils";
import { NotificationPriority, NotificationType } from "@prisma/client";
import {
  Bell,
  AlertTriangle,
  Clock,
  UserPlus,
  FileText,
  ShieldAlert,
  TrendingUp,
  Activity,
  CheckSquare,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export interface NotificationItemData {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  entityType?: string | null;
  createdAt: string | Date;
}

interface NotificationItemProps {
  notification: NotificationItemData;
  onMarkRead?: (id: string) => void;
  compact?: boolean;
}

// ── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<
  NotificationPriority,
  { color: string; dot: string; border: string }
> = {
  CRITICAL: {
    color: "text-red-500",
    dot: "bg-red-500",
    border: "border-l-red-500",
  },
  HIGH: {
    color: "text-orange-500",
    dot: "bg-orange-500",
    border: "border-l-orange-500",
  },
  MEDIUM: {
    color: "text-violet-500",
    dot: "bg-violet-500",
    border: "border-l-violet-500/60",
  },
  LOW: {
    color: "text-muted-foreground",
    dot: "bg-muted-foreground/40",
    border: "border-l-border",
  },
};

// ── Type → Icon map ──────────────────────────────────────────────────────────
function NotifIcon({ type, priority }: { type: NotificationType; priority: NotificationPriority }) {
  const cfg = PRIORITY_CONFIG[priority];

  const iconMap: Partial<Record<NotificationType, React.ElementType>> = {
    MOM_OVERDUE: AlertTriangle,
    MOM_ESCALATION: ShieldAlert,
    FOLLOW_UP_DUE: Clock,
    LEAD_ASSIGNED: UserPlus,
    MEETING_REMINDER: Bell,
    PROPOSAL_STATUS: FileText,
    QUALIFICATION_BLOCKED: ShieldAlert,
    LEAD_INACTIVITY: TrendingUp,
    TASK_DUE: CheckSquare,
    ESCALATION: AlertTriangle,
    ACTIVITY: Activity,
    STAGE_CHANGED: Zap,
    SYSTEM: Bell,
    REMINDER: Clock,
    APPROVAL: CheckSquare,
  };

  const Icon = iconMap[type] ?? Bell;

  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
        "bg-muted/60 border border-border"
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
    </div>
  );
}

export function NotificationItem({
  notification,
  onMarkRead,
  compact = false,
}: NotificationItemProps) {
  const cfg = PRIORITY_CONFIG[notification.priority];
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const content = (
    <div
      className={cn(
        "group flex gap-3 px-3 py-3 border-l-2 transition-all duration-200 cursor-pointer",
        "hover:bg-muted/40 rounded-r-md",
        cfg.border,
        !notification.isRead && "bg-primary/[0.03]"
      )}
      onClick={() => !notification.isRead && onMarkRead?.(notification.id)}
    >
      {/* Icon */}
      <NotifIcon type={notification.type} priority={notification.priority} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug truncate",
              notification.isRead
                ? "text-muted-foreground font-normal"
                : "text-foreground font-medium"
            )}
          >
            {notification.title}
          </p>
          {/* Unread dot */}
          {!notification.isRead && (
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 mt-1.5", cfg.dot)} />
          )}
        </div>

        {!compact && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
        )}

        <p className="text-[11px] text-muted-foreground/60 mt-1">{timeAgo}</p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
