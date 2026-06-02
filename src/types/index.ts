// ─────────────────────────────────────────────
// SHARED TYPESCRIPT TYPES & INTERFACES
// MergeX OS
// ─────────────────────────────────────────────

export * from "./auth";
export * from "./permissions";
export * from "./api";
export * from "./common";

// ── Legacy Placeholders for decoupled CRM modules ──
// These will be migrated to modules/crm/types in Phase 6
export type Organization = any;
export type Lead = any;
export type Contact = any;
export type Company = any;
export type Deal = any;
export type Activity = any;
export type Document = any;
export type Task = any;
export type Workflow = any;
export type LeadStatus = any;
export type DealStage = any;
export type Priority = any;
export type ActivityType = any;
export type DocumentType = any;
export type DocumentStatus = any;
export type TaskStatus = any;

export type LeadWithOwner = any;
export type DealWithRelations = any;
export type ActivityWithUser = any;
export type DocumentWithAuthor = any;
