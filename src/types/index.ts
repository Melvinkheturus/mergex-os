// ─────────────────────────────────────────────
// SHARED TYPESCRIPT TYPES & INTERFACES
// MergeX Sales OS
// ─────────────────────────────────────────────

import type {
  User,
  Organization,
  Lead,
  Contact,
  Company,
  Deal,
  Activity,
  Document,
  Task,
  Workflow,
  LeadStatus,
  DealStage,
  Priority,
  ActivityType,
  DocumentType,
  DocumentStatus,
  TaskStatus,
  PlanType,
} from "@prisma/client";

// Re-export Prisma enums for use across the app
export type {
  User,
  Organization,
  Lead,
  Contact,
  Company,
  Deal,
  Activity,
  Document,
  Task,
  Workflow,
  LeadStatus,
  DealStage,
  Priority,
  ActivityType,
  DocumentType,
  DocumentStatus,
  TaskStatus,
  PlanType,
};

// ─────────────────────────────────────────────
// EXTENDED / ENRICHED TYPES
// ─────────────────────────────────────────────

export type UserWithOrg = User & {
  organization: Organization;
};

export type LeadWithOwner = Lead & {
  owner: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">;
};

export type DealWithRelations = Deal & {
  owner: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">;
  lead?: Pick<Lead, "id" | "firstName" | "lastName"> | null;
  contact?: Pick<Contact, "id" | "firstName" | "lastName"> | null;
  company?: Pick<Company, "id" | "name"> | null;
};

export type ActivityWithUser = Activity & {
  user: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">;
};

export type DocumentWithAuthor = Document & {
  author: Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">;
};

// ─────────────────────────────────────────────
// NAVIGATION TYPES
// ─────────────────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  roles?: string[]; // Role names e.g. ['admin', 'manager']
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ─────────────────────────────────────────────
// DASHBOARD / ANALYTICS TYPES
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// SERVER ACTION RESPONSE TYPES
// ─────────────────────────────────────────────

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ─────────────────────────────────────────────
// PAGINATION / FILTER TYPES
// ─────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  status?: string;
  ownerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
