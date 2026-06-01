import * as z from "zod";

// ─── Shared Entity Types ───────────────────────────────────────────────────────

export interface OptionUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  designation: string | null;
  avatarUrl: string | null;
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
  currentSituation: z.string().optional().or(z.literal("")),
  painPoints: z.string().optional().or(z.literal("")),
  opportunityNotes: z.string().optional().or(z.literal("")),
});
export type BusinessReviewFormValues = z.infer<typeof businessReviewSchema>;

export const bantSchema = z.object({
  bantBudget: z.coerce.number().min(0).max(100).default(0),
  bantAuthority: z.coerce.number().min(0).max(100).default(0),
  bantNeed: z.coerce.number().min(0).max(100).default(0),
  bantTimeline: z.coerce.number().min(0).max(100).default(0),
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
