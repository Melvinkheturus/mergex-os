import type {
  Notification,
  NotificationPreference,
  PlanType,
  NotificationPriority,
  NotificationType,
} from "@prisma/client";

export type {
  Notification,
  NotificationPreference,
  PlanType,
  NotificationPriority,
  NotificationType,
};

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType | string;
  badge?: string | number;
  isComingSoon?: boolean;
  roles?: string[]; // Role names e.g. ['admin', 'manager']
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ── DASHBOARD / ANALYTICS TYPES ──────────────────────

export interface KPICardData {
  title: string;
  value: string | number;
  change: number; // percentage change
  trend: "up" | "down" | "neutral";
  icon: string;
  description?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}
