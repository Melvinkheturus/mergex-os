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

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  stageId: string | null;
  sourceId: string | null;
  ownerId: string | null;
  icpScore: number;
  temperature: string;
  expectedValue: string | null;
  priority: string;
  services: string[];
  createdAt: string;
  owner?: OptionUser;
  stage?: OptionStage;
  source?: OptionSource;
  // Business Review
  currentSituation: string | null;
  painPoints: string[];
  opportunityNotes: string | null;
  // BANT
  bantBudget: number;
  bantAuthority: number;
  bantNeed: number;
  bantTimeline: number;
  bantScore: number;
  // Win/Loss
  winLossStatus: string | null;
  winLossReason: string | null;
  winLossNotes: string | null;
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
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  sourceId: z.string().optional(),
  stageId: z.string().optional(),
  ownerId: z.string().optional(),
  icpScore: z.coerce.number().min(0).max(100).default(0),
  temperature: z.enum(["HOT", "WARM", "COLD"]).default("COLD"),
  expectedValue: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  services: z.string().optional(),
});
export type LeadFormValues = z.infer<typeof leadFormSchema>;

export const overviewSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  sourceId: z.string().optional().or(z.literal("")),
  ownerId: z.string().optional().or(z.literal("")),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  temperature: z.enum(["HOT", "WARM", "COLD"]).default("COLD"),
  expectedValue: z.string().optional().or(z.literal("")),
  services: z.string().optional().or(z.literal("")),
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
