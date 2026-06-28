// ─────────────────────────────────────────────
// SHARED TYPESCRIPT TYPES & INTERFACES
// MergeX OS
// ─────────────────────────────────────────────

export * from "./auth";
export * from "./permissions";
export * from "./api";
export * from "./common";

// ── Legacy Placeholders for decoupled CRM modules ──
// These will be migrated to modules/crm/types in Phase 6.
// Using `unknown` instead of `any` is safer and satisfies the linter.
export type Organization = unknown;
export type Lead = unknown;
export type Contact = unknown;
export type Company = unknown;
export type Deal = unknown;
export type Activity = unknown;
export type Document = unknown;
export type Task = unknown;
export type Workflow = unknown;
export type LeadStatus = unknown;
export type DealStage = unknown;
export type Priority = unknown;
export type ActivityType = unknown;
export type DocumentType = unknown;
export type DocumentStatus = unknown;
export type TaskStatus = unknown;

export type LeadWithOwner = unknown;
export type DealWithRelations = unknown;
export type ActivityWithUser = unknown;
export type DocumentWithAuthor = unknown;
