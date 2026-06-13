import * as z from "zod";

// ─── Shared Entity Types ───────────────────────────────────────────────────────

export interface OptionUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  designation: string | null;
  avatarUrl: string | null;
  status?: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
}

export interface OptionStage {
  id: string;
  name: string;
  label: string;
  color: string | null;
}

export interface OptionSource {
  id: string;
  name: string;
}

export type NextActionType =
  | "CALL_CLIENT"
  | "FOLLOW_UP"
  | "SEND_PROPOSAL"
  | "SCHEDULE_MEETING"
  | "WAITING_RESPONSE";

export const NEXT_ACTION_LABELS: Record<NextActionType, string> = {
  CALL_CLIENT: "Call Client",
  FOLLOW_UP: "Follow Up",
  SEND_PROPOSAL: "Send Proposal",
  SCHEDULE_MEETING: "Schedule Meeting",
  WAITING_RESPONSE: "Waiting Response",
};

export interface Lead {
  id: string;
  leadNumber: string | null;
  companyName: string;
  contactPerson: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  stageId: string | null;
  sourceId: string | null;
  ownerId: string | null;
  icpScore: number;
  temperature: string;
  expectedValue: string | null;
  priority: string;
  services: string[];
  leadCategory: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
  // Tracking dates
  lastActivityAt: string | null;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  // Next Action
  nextAction: NextActionType | null;
  nextActionDate: string | null;
  owner?: OptionUser;
  stage?: OptionStage;
  source?: OptionSource;
  // Legacy inline Business Review fields
  currentSituation: string | null;
  painPoints: string[];
  opportunityNotes: string | null;
  // BANT (kept on Lead)
  bantBudget: number;
  bantAuthority: number;
  bantNeed: number;
  bantTimeline: number;
  bantScore: number;
  // Win/Loss
  winLossStatus: string | null;
  winLossReason: string | null;
  winLossNotes: string | null;
  // Relationship Intelligence fields
  decisionMaker: string | null;
  influencer: string | null;
  champion: string | null;
  financeContact: string | null;
  // Step 1 — Intake
  sourceNotes: string | null;
  // Step 2 — Business Review (new fields)
  businessModel: string | null;
  businessAge: string | null;
  teamSize: string | null;
  revenueRange: string | null;
  primaryChannel: string | null;
  hasWebsite: boolean;
  hasEcommerce: boolean;
  hasInstagram: boolean;
  hasFacebook: boolean;
  hasLinkedIn: boolean;
  hasGoogleBiz: boolean;
  opportunities: string[];
  outreachAngle: string | null;
  relevantServices: string | null;
  valueProposition: string | null;
  businessConfidence: string | null;
  // Step 3 — Qualification (BANT + ICP)
  qualIcpFit: number;
  qualBudgetLikelihood: number;
  qualDecisionMakerAccess: number;
  qualOperationalFeasibility: number;
  qualServiceAlignment: number;
  qualGrowthPotential: number;
  qualNeed: number;
  qualTimeline: number;
  qualIcpFitDesc: string | null;
  qualBudgetLikelihoodDesc: string | null;
  qualDecisionMakerAccessDesc: string | null;
  qualNeedDesc: string | null;
  qualTimelineDesc: string | null;
  qualScore: number;
  qualStatus: string | null;
  qualRisks: string[];
  qualOtherRisk: string | null;
  qualOutcome: string | null;
  // Step 4 — Classification
  classification: string | null;
  nurturingDirection: string | null;
  // Step 5 — Nurturing
  nurturingStatus: string | null;
  nurturingChannel: string | null;
  conversationNotes: string | null;
  reopenAt: string | null; // Scheduled reactivation date
}


export interface BusinessReview {
  id: string;
  leadId: string;
  businessModel: string | null;
  targetMarket: string | null;
  currentChannels: string | null;
  currentChallenges: string | null;
  currentStrengths: string | null;
  currentWeaknesses: string | null;
  painPoints: string[];
  opportunities: string[];
  recommendedServices: string[];
  reviewNotes: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  leadId: string;
  title: string | null;
  content: string;
  visibility: string;
  createdBy: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface AuditLogEntry {
  id: string;
  leadId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
  actor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

export interface Activity {
  id: string;
  type: string;
  content: string;
  performedAt: string;
  user: { firstName: string | null; lastName: string | null } | null;
}

export interface Meeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  mode: string;
  meetingUrl: string | null;
  summary: string | null;
  outcome: string | null;
  status: string;
  organizer: { firstName: string | null; lastName: string | null } | null;
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  value: string;
  status: string;
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
}

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

export const leadFormSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  sourceId: z.string().min(1, "Source is required"),
  ownerId: z.string().optional().or(z.literal("")),
  initialNotes: z.string().optional().or(z.literal("")),
});
export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const overviewSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  designation: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  sourceId: z.string().optional().or(z.literal("")),
  ownerId: z.string().optional().or(z.literal("")),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  temperature: z.enum(["HOT", "WARM", "COLD"]).default("COLD"),
  expectedValue: z.string().optional().or(z.literal("")),
  services: z.string().optional().or(z.literal("")),
  leadCategory: z.string().optional().or(z.literal("")),
  nextAction: z.string().optional().or(z.literal("")),
  nextActionDate: z.string().optional().or(z.literal("")),
  nextFollowUpAt: z.string().optional().or(z.literal("")),
  // Relationship Intelligence
  decisionMaker: z.string().optional().or(z.literal("")),
  influencer: z.string().optional().or(z.literal("")),
  champion: z.string().optional().or(z.literal("")),
  financeContact: z.string().optional().or(z.literal("")),
});
export type OverviewFormValues = z.infer<typeof overviewSchema>;

export const businessReviewSchema = z.object({
  // Section 1 – Business Snapshot (dropdowns)
  businessAge: z.string().optional().or(z.literal("")),
  teamSize: z.string().optional().or(z.literal("")),
  revenueRange: z.string().optional().or(z.literal("")),
  primaryChannel: z.string().optional().or(z.literal("")),
  // Section 2 – Current Situation (structured)
  hasWebsite: z.string().optional().or(z.literal("")),         // "Yes" | "No"
  leadManagement: z.string().optional().or(z.literal("")),     // "Manual" | "CRM" | "Mixed"
  currentSituation: z.string().optional().or(z.literal("")),  // free-text notes
  // Section 3 – Pain Points (comma-separated)
  painPoints: z.string().optional().or(z.literal("")),
  // Section 4 – Growth Opportunities (comma-separated)
  opportunityNotes: z.string().optional().or(z.literal("")),
  // Section 5 – Decision Maker (dropdown)
  decisionMaker: z.string().optional().or(z.literal("")),
  // Section 6 – Urgency (chips)
  urgency: z.string().optional().or(z.literal("")),
  // Section 7 – Budget Readiness (chips)
  budgetReadiness: z.string().optional().or(z.literal("")),
  // Section 8 – Review Notes
  reviewNotes: z.string().optional().or(z.literal("")),
});
export type BusinessReviewFormValues = z.infer<typeof businessReviewSchema>;

export const bantSchema = z.object({
  bantBudget: z.coerce.number().min(0).max(100).default(0),
  bantAuthority: z.coerce.number().min(0).max(100).default(0),
  bantNeed: z.coerce.number().min(0).max(100).default(0),
  bantTimeline: z.coerce.number().min(0).max(100).default(0),
  temperature: z.enum(["HOT", "WARM", "COLD"]).default("COLD"),
});
export type BantFormValues = z.infer<typeof bantSchema>;

export const activitySchema = z.object({
  type: z.enum(["CALL", "EMAIL", "WHATSAPP", "NOTE", "TASK"]),
  content: z.string().min(1, "Activity detail is required"),
  performedAt: z.string().min(1, "Date/time is required"),
});
export type ActivityFormValues = z.infer<typeof activitySchema>;

export const meetingSchema = z.object({
  title: z.string().min(2, "Title is required"),
  scheduledAt: z.string().min(1, "Date/time is required"),
  duration: z.coerce.number().min(5).default(30),
  mode: z.enum(["GOOGLE_MEET", "ZOOM", "PHONE", "IN_PERSON"]),
  meetingUrl: z.string().optional().or(z.literal("")),
});
export type MeetingFormValues = z.infer<typeof meetingSchema>;

export const proposalSchema = z.object({
  proposalNumber: z.string().min(1, "Proposal number is required"),
  title: z.string().min(2, "Title is required"),
  value: z.coerce.number().min(0, "Value is required"),
  status: z.enum(["DRAFT", "SENT", "NEGOTIATION", "APPROVED", "REJECTED"]).default("DRAFT"),
  notes: z.string().optional().or(z.literal("")),
});
export type ProposalFormValues = z.infer<typeof proposalSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 6-STEP WIZARD SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

// Step 1 — Lead Intake
export const intakeSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  designation: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")).superRefine((val, ctx) => {
    if (val && val.trim().length > 0) {
      const parsed = z.string().email().safeParse(val);
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid email",
        });
      }
    }
  }),
  website: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  sourceId: z.string().min(1, "Lead Source is required"),
  ownerId: z.string().optional().or(z.literal("")),
  sourceNotes: z.string().optional().or(z.literal("")),
  leadNotes: z.string().optional().or(z.literal("")),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  temperature: z.enum(["HOT", "WARM", "COLD"]).default("COLD"),
}).refine((data) => {
  const hasPhone = !!data.phone && data.phone.trim().length > 0;
  const hasEmail = !!data.email && data.email.trim().length > 0;
  return hasPhone || hasEmail;
}, {
  message: "Either Phone or Email is required",
  path: ["phone"],
});
export type IntakeFormValues = z.infer<typeof intakeSchema>;

// Step 2 — Business Review (updated schema)
export const businessReviewV2Schema = z.object({
  // Section A: Business Profile
  businessModel: z.string().optional().or(z.literal("")),
  businessAge: z.string().optional().or(z.literal("")),
  teamSize: z.string().optional().or(z.literal("")),
  revenueRange: z.string().optional().or(z.literal("")),
  primaryChannel: z.string().optional().or(z.literal("")),
  primaryChannelOther: z.string().optional().or(z.literal("")),
  // Section B: Digital Presence (booleans)
  hasWebsite: z.boolean().default(false),
  hasEcommerce: z.boolean().default(false),
  hasInstagram: z.boolean().default(false),
  hasFacebook: z.boolean().default(false),
  hasLinkedIn: z.boolean().default(false),
  hasGoogleBiz: z.boolean().default(false),
  // Section C: Opportunity Analysis (multi-select chip values)
  opportunities: z.array(z.string()).default([]),
  // Section D: Strategic Positioning
  painPoints: z.array(z.string()).default([]),
  outreachAngle: z.string().optional().or(z.literal("")),
  relevantServices: z.string().optional().or(z.literal("")),
  valueProposition: z.string().optional().or(z.literal("")),
  opportunityNotes: z.string().optional().or(z.literal("")),
  currentSituation: z.string().optional().or(z.literal("")),
  businessConfidence: z.string().optional().or(z.literal("")),
});
export type BusinessReviewV2FormValues = z.infer<typeof businessReviewV2Schema>;

// Step 3 — Qualification (BANT + ICP methodology)
export const qualificationSchema = z.object({
  qualIcpFit: z.number().min(0).max(25).default(0),
  qualBudgetLikelihood: z.number().min(0).max(25).default(0),
  qualDecisionMakerAccess: z.number().min(0).max(25).default(0),
  qualNeed: z.number().min(0).max(25).default(0),
  qualTimeline: z.number().min(0).max(25).default(0),
  qualIcpFitDesc: z.string().optional().nullable().default(""),
  qualBudgetLikelihoodDesc: z.string().optional().nullable().default(""),
  qualDecisionMakerAccessDesc: z.string().optional().nullable().default(""),
  qualNeedDesc: z.string().optional().nullable().default(""),
  qualTimelineDesc: z.string().optional().nullable().default(""),
  qualRisks: z.array(z.string()).default([]),
  qualOtherRisk: z.string().optional().or(z.literal("")),
  qualOutcome: z.string().nullable().default(null),
  qualificationNotes: z.string().optional().or(z.literal("")),
});
export type QualificationFormValues = z.infer<typeof qualificationSchema>;

// Step 4 — Classification
export const classificationSchema = z.object({
  classification: z.enum(["HOT", "WARM", "COLD", "ARCHIVE"]).nullable().default(null),
  nurturingDirection: z.enum([
    "SHORT_TERM",
    "MEDIUM_TERM",
    "LONG_TERM",
    "PARTNER_FOLLOWUP",
    "MANUAL_FOLLOWUP",
  ]).nullable().default(null),
  services: z.array(z.string()).default([]),
  expectedValue: z.string().optional().or(z.literal("")),
  classificationNotes: z.string().optional().or(z.literal("")),
  lossReason: z.string().optional().nullable(),
  archiveReason: z.string().optional().nullable(),
});
export type ClassificationFormValues = z.infer<typeof classificationSchema>;

export const nurturingSchema = z.object({
  nurturingStatus: z.enum([
    "ACTIVE",
    "WAITING_BUDGET",
    "WAITING_APPROVAL",
    "WAITING_TIMING",
    "UNRESPONSIVE",
    "PAUSED",
  ]).nullable().default(null),
  nurturingChannel: z.enum(["WHATSAPP", "EMAIL", "CALL", "MEETING", "LINKEDIN"]).nullable().default(null),
  nextFollowUpAt: z.string().optional().or(z.literal("")),
  conversationNotes: z.string().optional().or(z.literal("")),
  nurturingObjective: z.string().optional().or(z.literal("")),
});
export type NurturingFormValues = z.infer<typeof nurturingSchema>;

export const meetingReadinessSchema = z.object({
  meetingObjective: z.enum(["DISCOVERY", "QUALIFICATION", "SOLUTION_DISCUSSION", "BUDGET_DISCUSSION"]).default("DISCOVERY"),
  meetingTopics: z.string().optional().or(z.literal("")),
  meetingQuestions: z.string().optional().or(z.literal("")),
});
export type MeetingReadinessFormValues = z.infer<typeof meetingReadinessSchema>;


