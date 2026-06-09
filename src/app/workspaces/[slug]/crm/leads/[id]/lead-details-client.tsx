"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft, Trophy, XCircle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { LeadCommandCenter } from "../components/lead-command-center";
import { LeadInfoPanel } from "../components/lead-info-panel";
import { HandoverPanel } from "../components/handover-panel";
import { WinLossDialog } from "../components/win-loss-dialog";
import { LeadSidebar, LeadUtilityGrid } from "./lead-sidebar";

// New 6-step wizard components
import { LeadStepStepper, WizardStep } from "../components/lead-step-stepper";
import { StepIntakeForm } from "../components/step-intake-form";
import { StepBusinessReviewForm } from "../components/step-business-review-form";
import { StepQualificationForm } from "../components/step-qualification-form";
import { StepClassificationForm } from "../components/step-classification-form";
import { StepNurturingForm } from "../components/step-nurturing-form";
import { StepMeetingReadinessWorkspace } from "../components/step-meeting-readiness-workspace";

import {
  getStep1Complete,
  getStep2Complete,
  getStep3Complete,
  buildSteps
} from "../components/wizard-helpers";

import {
  Lead,
  OptionStage,
  OptionSource,
  OptionUser,
  // Step schemas
  intakeSchema,
  IntakeFormValues,
  businessReviewV2Schema,
  BusinessReviewV2FormValues,
  qualificationSchema,
  QualificationFormValues,
  classificationSchema,
  ClassificationFormValues,
  nurturingSchema,
  NurturingFormValues,
  meetingReadinessSchema,
  MeetingReadinessFormValues,
} from "../components/types";

// ─── Component ───────────────────────────────────────────────────────────────

interface LeadDetailsClientProps {
  leadId: string;
}

export function LeadDetailsClient({ leadId }: LeadDetailsClientProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  // Core state
  const [lead, setLead] = useState<Lead | null>(null);
  const [stages, setStages] = useState<OptionStage[]>([]);
  const [sources, setSources] = useState<OptionSource[]>([]);
  const [owners, setOwners] = useState<OptionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStage, setSavingStage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [shake, setShake] = useState(false);
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);

  // Win/Loss state
  const [showWinLossDialog, setShowWinLossDialog] = useState(false);
  const [winLossStatus, setWinLossStatus] = useState<"WON" | "LOST">("WON");
  const [winLossReason, setWinLossReason] = useState("");
  const [winLossNotes, setWinLossNotes] = useState("");
  const [savingWinLoss, setSavingWinLoss] = useState(false);

  // Handover state
  const [handoverEM, setHandoverEM] = useState("");
  const [convertingToClient, setConvertingToClient] = useState(false);
  const [sidebarActiveAction, setSidebarActiveAction] = useState<"CALL" | "EMAIL" | "WHATSAPP" | "NOTE" | null>(null);

  // ─── Forms ──────────────────────────────────────────────────────────────────

  const intakeForm = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema) as Resolver<IntakeFormValues>,
  });

  const businessReviewForm = useForm<BusinessReviewV2FormValues>({
    resolver: zodResolver(businessReviewV2Schema) as Resolver<BusinessReviewV2FormValues>,
  });

  const qualificationForm = useForm<QualificationFormValues>({
    resolver: zodResolver(qualificationSchema) as Resolver<QualificationFormValues>,
  });

  const classificationForm = useForm<ClassificationFormValues>({
    resolver: zodResolver(classificationSchema) as Resolver<ClassificationFormValues>,
  });

  const nurturingForm = useForm<NurturingFormValues>({
    resolver: zodResolver(nurturingSchema) as Resolver<NurturingFormValues>,
  });

  const meetingReadinessForm = useForm<MeetingReadinessFormValues>({
    resolver: zodResolver(meetingReadinessSchema) as Resolver<MeetingReadinessFormValues>,
  });

  // ─── Data Loader ─────────────────────────────────────────────────────────────

  const loadLeadData = useCallback(async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const [optRes, leadRes] = await Promise.all([
        fetch(`/api/crm/options?brandSlug=${slug}`),
        fetch(`/api/crm/leads/${leadId}`),
      ]);

      if (optRes.ok) {
        const { stages: s, sources: sr, owners: o } = await optRes.json();
        setStages(s || []);
        setSources(sr || []);
        setOwners(o || []);
      }

      if (!leadRes.ok) throw new Error("Failed to load lead details");
      const data: Lead = await leadRes.json();
      setLead(data);

      // Determine starting step directly from lead's database stage name
      const stageName = data.stage?.name || "";
      if (stageName === "LEAD_INTAKE") {
        setCurrentStep(1);
      } else if (stageName === "BUSINESS_REVIEW") {
        setCurrentStep(2);
      } else if (stageName === "LEAD_QUALIFICATION") {
        setCurrentStep(3);
      } else if (stageName === "LEAD_CLASSIFICATION") {
        setCurrentStep(4);
      } else if (stageName === "LEAD_NURTURING") {
        setCurrentStep(5);
      } else if (stageName === "MEETING") {
        setCurrentStep(6);
      } else {
        // Fallback to data completeness check if stageName is unrecognized/null
        const s1 = getStep1Complete(data);
        const s2 = getStep2Complete(data);
        const s3 = getStep3Complete(data);

        if (data.classification === "HOT") setCurrentStep(6);
        else if (data.classification === "WARM" && s3) setCurrentStep(5);
        else if (data.classification === "COLD" && s3) setCurrentStep(4);
        else if (s3) setCurrentStep(4);
        else if (s2) setCurrentStep(3);
        else if (s1) setCurrentStep(2);
        else setCurrentStep(1);
      }

      setIsDataLoaded(false);

      // Populate forms
      // 1. Intake Form Draft
      const savedIntakeDraft = localStorage.getItem(`intake-draft-${leadId}`);
      let intakeInitial = {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        designation: data.designation || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        location: data.location || "",
        industry: data.industry || "",
        sourceId: data.sourceId || "",
        ownerId: data.ownerId || "",
        sourceNotes: data.sourceNotes || "",
        leadNotes: "",
        priority: (data.priority as "HIGH" | "MEDIUM" | "LOW") || "MEDIUM",
        temperature: (data.temperature as "HOT" | "WARM" | "COLD") || "COLD",
      };
      if (savedIntakeDraft) {
        try {
          const parsed = JSON.parse(savedIntakeDraft);
          intakeInitial = { ...intakeInitial, ...parsed };
        } catch {}
      }
      intakeForm.reset(intakeInitial);

      // 2. Business Review Form Draft
      const knownChannels = ["Instagram", "WhatsApp", "Website", "Marketplace", "Referral", "Offline"];
      const rawChannel = data.primaryChannel || "";
      const isKnown = knownChannels.includes(rawChannel);
      const primaryChannelValue = rawChannel === "" ? "" : (isKnown ? rawChannel : "Other");
      const primaryChannelOtherValue = isKnown ? "" : rawChannel;

      const savedBusinessReviewDraft = localStorage.getItem(`business-review-draft-${leadId}`);
      let businessReviewInitial = {
        businessModel: data.businessModel || "",
        businessAge: data.businessAge || "",
        teamSize: data.teamSize || "",
        revenueRange: data.revenueRange || "",
        primaryChannel: primaryChannelValue,
        primaryChannelOther: primaryChannelOtherValue,
        hasWebsite: data.hasWebsite ?? false,
        hasEcommerce: data.hasEcommerce ?? false,
        hasInstagram: data.hasInstagram ?? false,
        hasFacebook: data.hasFacebook ?? false,
        hasLinkedIn: data.hasLinkedIn ?? false,
        hasGoogleBiz: data.hasGoogleBiz ?? false,
        opportunities: data.opportunities || [],
        painPoints: data.painPoints || [],
        outreachAngle: data.outreachAngle || "",
        relevantServices: data.relevantServices || "",
        valueProposition: data.valueProposition || "",
        opportunityNotes: data.opportunityNotes || "",
        currentSituation: data.currentSituation || "",
        businessConfidence: data.businessConfidence || "",
      };
      if (savedBusinessReviewDraft) {
        try {
          const parsed = JSON.parse(savedBusinessReviewDraft);
          businessReviewInitial = { ...businessReviewInitial, ...parsed };
        } catch {}
      }
      businessReviewForm.reset(businessReviewInitial);

      // 3. Qualification Form Draft
      const savedQualificationDraft = localStorage.getItem(`qualification-draft-${leadId}`);
      let qualificationInitial = {
        qualIcpFit:                  data.qualIcpFit || 0,
        qualIcpFitDesc:              data.qualIcpFitDesc || "",
        qualBudgetLikelihood:        data.qualBudgetLikelihood || 0,
        qualBudgetLikelihoodDesc:    data.qualBudgetLikelihoodDesc || "",
        qualDecisionMakerAccess:     data.qualDecisionMakerAccess || 0,
        qualDecisionMakerAccessDesc: data.qualDecisionMakerAccessDesc || "",
        qualNeed:                    data.qualNeed || 0,
        qualNeedDesc:                data.qualNeedDesc || "",
        qualTimeline:                data.qualTimeline || 0,
        qualTimelineDesc:            data.qualTimelineDesc || "",
        qualRisks:                   data.qualRisks || [],
        qualOtherRisk:               data.qualOtherRisk || "",
        qualOutcome:                 data.qualOutcome || null,
        qualificationNotes:          "",
      };
      if (savedQualificationDraft) {
        try {
          const parsed = JSON.parse(savedQualificationDraft);
          qualificationInitial = { ...qualificationInitial, ...parsed };
        } catch {}
      }
      qualificationForm.reset(qualificationInitial);

      // 4. Classification Form Draft
      const savedClassificationDraft = localStorage.getItem(`classification-draft-${leadId}`);
      let classificationInitial = {
        classification: (data.classification as "HOT" | "WARM" | "COLD" | "ARCHIVE" | null) || null,
        nurturingDirection: (data.nurturingDirection as "IMMEDIATE_SALES" | "SHORT_TERM" | "LONG_TERM" | "ARCHIVE" | null) || null,
        services: data.services || [],
        expectedValue: data.expectedValue ? String(data.expectedValue) : "",
        classificationNotes: "",
      };
      if (savedClassificationDraft) {
        try {
          const parsed = JSON.parse(savedClassificationDraft);
          classificationInitial = { ...classificationInitial, ...parsed };
        } catch {}
      }
      classificationForm.reset(classificationInitial);

      // 5. Nurturing Form Draft
      const savedNurturingDraft = localStorage.getItem(`nurturing-draft-${leadId}`);
      let nurturingInitial = {
        nurturingStatus: (data.nurturingStatus as "NO_RESPONSE" | "ENGAGED" | "INTERESTED" | "MEETING_REQUESTED" | null) || null,
        nurturingChannel: (data.nurturingChannel as "WHATSAPP" | "EMAIL" | "CALL" | "MEETING" | "LINKEDIN" | null) || null,
        nextFollowUpAt: data.nextFollowUpAt
          ? new Date(data.nextFollowUpAt).toISOString().slice(0, 16)
          : "",
        conversationNotes: data.conversationNotes || "",
      };
      if (savedNurturingDraft) {
        try {
          const parsed = JSON.parse(savedNurturingDraft);
          nurturingInitial = { ...nurturingInitial, ...parsed };
        } catch {}
      }
      nurturingForm.reset(nurturingInitial);

      // Load meeting prep details from localStorage
      const savedPrep = localStorage.getItem(`meeting-prep-${leadId}`);
      if (savedPrep) {
        try {
          const parsed = JSON.parse(savedPrep);
          meetingReadinessForm.reset({
            meetingObjective: parsed.meetingObjective || "DISCOVERY",
            meetingTopics: parsed.meetingTopics || "",
            meetingQuestions: parsed.meetingQuestions || "",
          });
        } catch {
          meetingReadinessForm.reset({
            meetingObjective: "DISCOVERY",
            meetingTopics: "",
            meetingQuestions: "",
          });
        }
      } else {
        meetingReadinessForm.reset({
          meetingObjective: "DISCOVERY",
          meetingTopics: "",
          meetingQuestions: "",
        });
      }

      setIsDataLoaded(true);
    } catch (error: unknown) {
      setIsDataLoaded(false);
      const msg = error instanceof Error ? error.message : "Failed to load lead details";
      toast.error(msg);
      router.push(`/workspaces/${slug}/crm/leads`);
    } finally {
      setLoading(false);
    }
  }, [leadId, slug, router, intakeForm, businessReviewForm, qualificationForm, classificationForm, nurturingForm, meetingReadinessForm]);

  useEffect(() => {
    const timer = setTimeout(() => loadLeadData(), 0);
    return () => clearTimeout(timer);
  }, [leadId, loadLeadData]);

  // Watchers to persist drafts
  useEffect(() => {
    if (!isDataLoaded) return;
    const subscription = intakeForm.watch((value) => {
      localStorage.setItem(`intake-draft-${leadId}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [intakeForm, leadId, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const subscription = businessReviewForm.watch((value) => {
      localStorage.setItem(`business-review-draft-${leadId}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [businessReviewForm, leadId, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const subscription = qualificationForm.watch((value) => {
      localStorage.setItem(`qualification-draft-${leadId}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [qualificationForm, leadId, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const subscription = classificationForm.watch((value) => {
      localStorage.setItem(`classification-draft-${leadId}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [classificationForm, leadId, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const subscription = nurturingForm.watch((value) => {
      localStorage.setItem(`nurturing-draft-${leadId}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [nurturingForm, leadId, isDataLoaded]);

  // ─── Save helpers ────────────────────────────────────────────────────────────

  const patchLead = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/crm/leads/${leadId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save");
    const updated: Lead = await res.json();
    setLead(updated);
    // Notify sidebar cards (timeline, SLA, escalation) to re-fetch
    window.dispatchEvent(new CustomEvent("crm-activity-logged"));
    return updated;
  };

  // ─── Step Submit Handlers ────────────────────────────────────────────────────

  const onIntakeSubmit = async (values: IntakeFormValues) => {
    setIsSaving(true);
    try {
      const { leadNotes, ...rest } = values;
      await patchLead({ ...rest });
      if (leadNotes && leadNotes.trim()) {
        await fetch(`/api/crm/leads/${leadId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "NOTE",
            content: leadNotes.trim(),
          }),
        });
        intakeForm.setValue("leadNotes", "");
      }
      localStorage.removeItem(`intake-draft-${leadId}`);
      intakeForm.reset({ ...values, leadNotes: "" });
      toast.success("Lead Intake saved");
    } catch {
      toast.error("Failed to save Intake");
    } finally {
      setIsSaving(false);
    }
  };

  const onBusinessReviewSubmit = async (values: BusinessReviewV2FormValues) => {
    setIsSaving(true);
    try {
      const { primaryChannel, primaryChannelOther, ...rest } = values;
      const finalChannel = primaryChannel === "Other" ? (primaryChannelOther || "Other") : primaryChannel;
      await patchLead({
        ...rest,
        primaryChannel: finalChannel,
      });
      localStorage.removeItem(`business-review-draft-${leadId}`);
      businessReviewForm.reset(values);
      toast.success("Business Review saved");
    } catch {
      toast.error("Failed to save Business Review");
    } finally {
      setIsSaving(false);
    }
  };

  const onQualificationSubmit = async (values: QualificationFormValues) => {
    setIsSaving(true);
    try {
      const { qualificationNotes: _, ...rest } = values;
      await patchLead({ ...rest });
      localStorage.removeItem(`qualification-draft-${leadId}`);
      qualificationForm.reset(values);
      toast.success("Qualification saved");
    } catch {
      toast.error("Failed to save Qualification");
    } finally {
      setIsSaving(false);
    }
  };

  const onClassificationSubmit = async (values: ClassificationFormValues) => {
    setIsSaving(true);
    try {
      const { classificationNotes: _, ...rest } = values;
      await patchLead({
        ...rest,
        services: values.services,
        temperature: values.classification === "HOT" ? "HOT" : values.classification === "WARM" ? "WARM" : "COLD",
      });
      localStorage.removeItem(`classification-draft-${leadId}`);
      classificationForm.reset(values);
      toast.success("Classification saved");
    } catch {
      toast.error("Failed to save Classification");
    } finally {
      setIsSaving(false);
    }
  };

  const onNurturingSubmit = async (values: NurturingFormValues) => {
    setIsSaving(true);
    try {
      await patchLead({
        ...values,
        classification: "WARM",
        temperature: "WARM",
      });
      localStorage.removeItem(`nurturing-draft-${leadId}`);
      nurturingForm.reset(values);
      toast.success("Nurturing Workspace saved");
    } catch {
      toast.error("Failed to save Nurturing Workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const onMeetingReadinessSubmit = async (values: MeetingReadinessFormValues) => {
    setIsSaving(true);
    try {
      localStorage.setItem(`meeting-prep-${leadId}`, JSON.stringify(values));
      meetingReadinessForm.reset(values);
      toast.success("Meeting preparation saved");
    } catch {
      toast.error("Failed to save Meeting preparation");
    } finally {
      setIsSaving(false);
    }
  };

  const onPromoteToReadyNow = async () => {
    setIsSaving(true);
    try {
      const updated = await patchLead({
        classification: "HOT",
        temperature: "HOT",
      });
      classificationForm.setValue("classification", "HOT");
      toast.success("Lead marked as Ready Now! Meeting Readiness unlocked.");
      setCurrentStep(6);
    } catch {
      toast.error("Failed to promote lead");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Stepper actions ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    const onError = () => {
      triggerShake();
    };
    if (currentStep === 1) await intakeForm.handleSubmit(onIntakeSubmit, onError)();
    else if (currentStep === 2) await businessReviewForm.handleSubmit(onBusinessReviewSubmit, onError)();
    else if (currentStep === 3) await qualificationForm.handleSubmit(onQualificationSubmit, onError)();
    else if (currentStep === 4) await classificationForm.handleSubmit(onClassificationSubmit, onError)();
    else if (currentStep === 5) await nurturingForm.handleSubmit(onNurturingSubmit, onError)();
    else if (currentStep === 6) await meetingReadinessForm.handleSubmit(onMeetingReadinessSubmit, onError)();
  };

  const handleContinue = async () => {
    await handleSave();
    if (currentStep === 4) {
      const classification = classificationForm.getValues("classification");
      if (classification === "HOT") {
        setCurrentStep(6); // Skip Nurturing, go to Meeting Readiness
      } else if (classification === "WARM" || classification === "COLD") {
        setCurrentStep(5); // Go to Nurturing
      }
      // ARCHIVE/null: stay on step 4 (no next step to advance to)
    } else if (currentStep < 6) {
      setCurrentStep((p) => p + 1);
    }
  };

  const handleStageChange = async (stageId: string) => {
    try {
      setSavingStage(true);
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      toast.success("Stage updated");
      const updatedLead = await res.json();
      setLead(updatedLead);
      window.dispatchEvent(new CustomEvent("crm-activity-logged"));

      // Update active wizard step to match the new stage
      const newStage = stages.find((s) => s.id === stageId);
      if (newStage) {
        const name = (newStage.name || "").toUpperCase();
        let targetStep = 1;
        if (name.includes("REVIEW")) targetStep = 2;
        else if (name.includes("QUALIFICATION") && !name.includes("AUDIT")) targetStep = 3;
        else if (name.includes("CLASSIFICATION")) targetStep = 4;
        else if (name.includes("NURTURING")) targetStep = 5;
        else if (name.includes("MEETING")) targetStep = 6;
        setCurrentStep(targetStep);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage");
    } finally {
      setSavingStage(false);
    }
  };

  const handleWinLossSubmit = async () => {
    if (!winLossReason) { toast.error("Please select a reason"); return; }
    try {
      setSavingWinLoss(true);
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winLossStatus, winLossReason, winLossNotes }),
      });
      if (!res.ok) throw new Error("Failed to close lead");
      toast.success(`Lead marked as ${winLossStatus}`);
      setLead(await res.json());
      setShowWinLossDialog(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to close lead");
    } finally {
      setSavingWinLoss(false);
    }
  };

  const handleConvertToClient = async () => {
    if (!handoverEM) { toast.error("Please select an Engagement Manager"); return; }
    try {
      setConvertingToClient(true);
      const res = await fetch(`/api/crm/leads/${leadId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementManagerId: handoverEM }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to convert lead");
      }
      toast.success("Lead converted to client! 🎉");
      router.push(`/workspaces/${slug}/crm/leads`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to convert lead");
    } finally {
      setConvertingToClient(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="border border-border/30 rounded-2xl p-5 bg-card/20">
          <div className="grid grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!lead) return null;

  const isWon = lead.winLossStatus === "WON";
  const steps = buildSteps(lead, currentStep);

  // Check meeting readiness checks (matches step-meeting-readiness-workspace.tsx)
  const checkBR = getStep2Complete(lead);
  const checkQual = getStep3Complete(lead);
  const checkPainPoint = (lead.painPoints?.length ?? 0) > 0;
  const checkOutreach = !!lead.lastContactAt || !!lead.nextFollowUpAt || !!lead.lastActivityAt;
  const checkHot = lead.classification === "HOT";
  const checkDM = lead.qualDecisionMakerAccess > 0;
  const isReady = checkBR && checkQual && checkPainPoint && checkOutreach && checkHot && checkDM;

  // Determine form dirtiness for current step
  let isFormDirty = false;
  if (currentStep === 1) isFormDirty = intakeForm.formState.isDirty;
  else if (currentStep === 2) isFormDirty = businessReviewForm.formState.isDirty;
  else if (currentStep === 3) isFormDirty = qualificationForm.formState.isDirty;
  else if (currentStep === 4) isFormDirty = classificationForm.formState.isDirty;
  else if (currentStep === 5) isFormDirty = nurturingForm.formState.isDirty;
  else if (currentStep === 6) isFormDirty = meetingReadinessForm.formState.isDirty;

  // Next stage information based on current wizard step
  let nextStageLabel: string | null = null;
  let nextStageId: string | null = null;

  if (stages.length > 0) {
    if (currentStep === 1) {
      const st = stages.find(s => s.name === "BUSINESS_REVIEW");
      nextStageLabel = st?.label || "Business Review";
      nextStageId = st?.id || null;
    } else if (currentStep === 2) {
      const st = stages.find(s => s.name === "LEAD_QUALIFICATION");
      nextStageLabel = st?.label || "Lead Qualification";
      nextStageId = st?.id || null;
    } else if (currentStep === 3) {
      const st = stages.find(s => s.name === "LEAD_CLASSIFICATION");
      nextStageLabel = st?.label || "Lead Classification";
      nextStageId = st?.id || null;
    } else if (currentStep === 4) {
      const classification = classificationForm.getValues("classification") || lead.classification;
      if (classification === "HOT") {
        const st = stages.find(s => s.name === "MEETING");
        nextStageLabel = st?.label || "Meeting Readiness";
        nextStageId = st?.id || null;
      } else if (classification === "WARM" || classification === "COLD") {
        const st = stages.find(s => s.name === "LEAD_NURTURING");
        nextStageLabel = st?.label || "Lead Nurturing";
        nextStageId = st?.id || null;
      }
    } else if (currentStep === 5) {
      const st = stages.find(s => s.name === "MEETING");
      nextStageLabel = st?.label || "Meeting Readiness";
      nextStageId = st?.id || null;
    }
  }

  const handleAdvance = async () => {
    if (nextStageId) {
      await handleStageChange(nextStageId);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/workspaces/${slug}/crm/leads`)}
          className="text-muted-foreground hover:text-foreground -ml-2 h-8 text-xs font-semibold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Leads
        </Button>

        <div className="flex items-center gap-2">
          {lead.winLossStatus ? (
            <Badge
              className={
                isWon
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold"
                  : "bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 text-xs font-bold"
              }
            >
              {isWon ? <Trophy className="h-3.5 w-3.5 mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
              {lead.winLossStatus} {lead.winLossReason ? `- ${lead.winLossReason}` : ""}
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowWinLossDialog(true)}
              className="text-xs text-muted-foreground hover:text-foreground h-8 font-semibold border-border/40"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Close Lead
            </Button>
          )}
        </div>
      </div>

      {/* Lead Command Center (mini header with stage + temperature + quick actions) */}
      <LeadCommandCenter
        lead={lead}
        stages={stages}
        onStageClick={handleStageChange}
        savingStage={savingStage}
        onNoteClick={() => setSidebarActiveAction("NOTE")}
        onLeadUpdate={setLead}
        onStepClick={setCurrentStep}
      />

      {/* Next Action Banner */}
      {lead.nextAction && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-violet-500/20 bg-violet-500/5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500/70">Next Action</span>
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
            {lead.nextAction.replace(/_/g, " ")}
          </span>
          {lead.nextActionDate && (
            <span className="text-xs text-muted-foreground ml-auto">
              Due: {new Date(lead.nextActionDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left sidebar */}
        <div className="space-y-4">
          <LeadInfoPanel
            lead={lead}
            owners={owners}
            onLeadUpdate={setLead}
            onOwnerChange={async (ownerId) => {
              try {
                const res = await fetch(`/api/crm/leads/${leadId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ownerId }),
                });
                if (!res.ok) throw new Error("Failed to update owner");
                setLead(await res.json());
              } catch {
                toast.error("Failed to update owner");
              }
            }}
            savingOwner={false}
          />

          <LeadSidebar
            lead={lead}
            owners={owners}
            onLeadUpdate={setLead}
            currentStep={currentStep}
          />

          {isWon && (
            <HandoverPanel
              owners={owners}
              handoverEM={handoverEM}
              setHandoverEM={setHandoverEM}
              converting={convertingToClient}
              onConvert={handleConvertToClient}
            />
          )}
        </div>

        {/* Right — 6-step wizard */}
        <div className="min-w-0 space-y-6">
          <LeadStepStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            onSave={handleSave}
            onAdvance={handleAdvance}
            isSaving={isSaving}
            isDirty={isFormDirty}
            nextStageLabel={nextStageLabel}
            customAction={
              currentStep === 6 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (isReady) {
                      router.push(`/workspaces/${slug}/crm/meetings`);
                    } else {
                      toast.error("Complete all 6 internal checks to unlock launching the discovery meeting.");
                    }
                  }}
                  disabled={!isReady}
                  className={cn(
                    "h-8 text-xs font-bold text-white rounded-lg transition-all flex items-center shadow-sm select-none",
                    isReady 
                      ? "bg-[#8B5CF6] hover:bg-[#7C3AED] hover:shadow-violet-500/10 cursor-pointer" 
                      : "bg-[#8B5CF6]/50 cursor-not-allowed opacity-50"
                  )}
                >
                  <Rocket className="h-3.5 w-3.5 mr-1.5" />
                  Launch Discovery Meeting
                </Button>
              ) : undefined
            }
          >
            {currentStep === 1 && (
              <StepIntakeForm
                form={intakeForm}
                sources={sources}
                owners={owners}
                lead={lead}
                onSubmit={onIntakeSubmit}
                shake={shake}
              />
            )}
            {currentStep === 2 && (
              <StepBusinessReviewForm
                form={businessReviewForm}
                onSubmit={onBusinessReviewSubmit}
              />
            )}
            {currentStep === 3 && (
              <StepQualificationForm
                form={qualificationForm}
                onSubmit={onQualificationSubmit}
              />
            )}
            {currentStep === 4 && (
              <StepClassificationForm
                form={classificationForm}
                lead={lead}
                stages={stages}
                onSubmit={onClassificationSubmit}
              />
            )}
            {currentStep === 5 && (
              <StepNurturingForm
                form={nurturingForm}
                lead={lead}
                onSubmit={onNurturingSubmit}
                onPromoteToReadyNow={onPromoteToReadyNow}
                promoting={isSaving}
              />
            )}
            {currentStep === 6 && (
              <StepMeetingReadinessWorkspace
                form={meetingReadinessForm}
                onSubmit={onMeetingReadinessSubmit}
                lead={lead}
                stages={stages}
                onStepClick={setCurrentStep}
                onStageClick={handleStageChange}
                savingStage={savingStage}
                onLeadUpdate={setLead}
              />
            )}
          </LeadStepStepper>

          <LeadUtilityGrid lead={lead} />
        </div>
      </div>

      <WinLossDialog
        open={showWinLossDialog}
        onOpenChange={setShowWinLossDialog}
        winLossStatus={winLossStatus}
        setWinLossStatus={setWinLossStatus}
        winLossReason={winLossReason}
        setWinLossReason={setWinLossReason}
        winLossNotes={winLossNotes}
        setWinLossNotes={setWinLossNotes}
        onSubmit={handleWinLossSubmit}
        saving={savingWinLoss}
      />
    </div>
  );
}
