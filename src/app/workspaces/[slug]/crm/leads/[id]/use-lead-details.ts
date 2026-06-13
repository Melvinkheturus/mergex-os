"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  getStep1Complete,
  getStep2Complete,
  getStep3Complete,
  getStep4Complete,
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

interface UseLeadDetailsProps {
  leadId: string;
  slug: string;
}

export function useLeadDetails({ leadId, slug }: UseLeadDetailsProps) {
  const router = useRouter();

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

      // Determine starting step using the same first-incomplete-stage logic
      const _s1 = getStep1Complete(data);
      const _s2 = getStep2Complete(data);
      const _s3 = getStep3Complete(data);
      const _s4 = getStep4Complete(data);
      const _needsNurturing = data.classification === "WARM";
      const _isTerminal = data.classification === "COLD" || data.classification === "ARCHIVE";

      if (!_s1) setCurrentStep(1);
      else if (!_s2) setCurrentStep(2);
      else if (!_s3) setCurrentStep(3);
      else if (!_s4) setCurrentStep(4);
      else if (_isTerminal) setCurrentStep(4);
      else if (_needsNurturing) setCurrentStep(4);
      else setCurrentStep(5);

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
        nurturingDirection: (data.nurturingDirection as "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM" | "PARTNER_FOLLOWUP" | "MANUAL_FOLLOWUP" | null) || null,
        services: data.services || [],
        expectedValue: data.expectedValue ? String(data.expectedValue) : "",
        classificationNotes: "",
        lossReason: data.classification === "COLD" ? data.winLossReason || "" : "",
        archiveReason: data.classification === "ARCHIVE" ? data.winLossReason || "" : "",
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
      const rawNurturingStatus = data.nurturingStatus as string | null;
      const mappedNurturingStatus = ((): NurturingFormValues["nurturingStatus"] => {
        const validStatuses = ["ACTIVE", "WAITING_BUDGET", "WAITING_APPROVAL", "WAITING_TIMING", "UNRESPONSIVE", "PAUSED"];
        if (rawNurturingStatus && validStatuses.includes(rawNurturingStatus)) {
          return rawNurturingStatus as NurturingFormValues["nurturingStatus"];
        }
        return null;
      })();
      let nurturingInitial: NurturingFormValues = {
        nurturingStatus: mappedNurturingStatus,
        nurturingChannel: (data.nurturingChannel as "WHATSAPP" | "EMAIL" | "CALL" | "MEETING" | "LINKEDIN" | null) || null,
        nextFollowUpAt: data.nextFollowUpAt
          ? new Date(data.nextFollowUpAt).toISOString().slice(0, 16)
          : "",
        conversationNotes: data.conversationNotes || "",
        nurturingObjective: "",
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

  // Dynamic browser tab title based on lead nurturing mode
  useEffect(() => {
    if (!lead) return;
    const baseName = lead.companyName || "Lead";
    document.title = lead.classification === "WARM"
      ? `Nurturing Lead Profile · ${baseName} | MergeX OS`
      : `Lead Profile · ${baseName} | MergeX OS`;
    return () => { document.title = "Lead Profile | MergeX OS"; };
  }, [lead?.classification, lead?.companyName]);

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

  // Autosave nurturing form to database (debounced)
  useEffect(() => {
    if (!isDataLoaded) return;

    let timer: NodeJS.Timeout;

    const subscription = nurturingForm.watch((value) => {
      // 1. Save to local storage draft immediately
      localStorage.setItem(`nurturing-draft-${leadId}`, JSON.stringify(value));

      // 2. If form is dirty, debounce save to DB
      if (nurturingForm.formState.isDirty) {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          try {
            setIsSaving(true);
            await patchLead({
              nurturingStatus: value.nurturingStatus || null,
              nurturingChannel: value.nurturingChannel || null,
              nextFollowUpAt: value.nextFollowUpAt || "",
              conversationNotes: value.conversationNotes || "",
              nurturingObjective: value.nurturingObjective || "",
              classification: "WARM",
              temperature: "WARM",
            });
            localStorage.removeItem(`nurturing-draft-${leadId}`);
            // Reset form state so it's not dirty anymore, keeping current values
            nurturingForm.reset(value);
          } catch (e) {
            console.error("Autosave failed:", e);
          } finally {
            setIsSaving(false);
          }
        }, 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
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
      const { classificationNotes: _, lossReason, archiveReason, ...rest } = values;
      
      let winLossStatusVal: string | null = null;
      let winLossReasonVal: string | null = null;
      
      if (values.classification === "COLD") {
        winLossStatusVal = "LOST";
        winLossReasonVal = lossReason || null;
      } else if (values.classification === "ARCHIVE") {
        winLossStatusVal = "LOST";
        winLossReasonVal = archiveReason || null;
      }

      await patchLead({
        ...rest,
        services: values.services,
        temperature: values.classification === "HOT" ? "HOT" : values.classification === "WARM" ? "WARM" : "COLD",
        winLossStatus: winLossStatusVal,
        winLossReason: winLossReasonVal,
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
      await patchLead({
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

  const onPromoteNurturingToReady = async (overrideReason?: string) => {
    setIsSaving(true);
    try {
      const meetingStage = stages.find(s => s.name === "MEETING");
      await patchLead({
        classification: "HOT",
        temperature: "HOT",
        ...(meetingStage ? { stageId: meetingStage.id } : {}),
        overrideReason,
      });
      classificationForm.setValue("classification", "HOT");
      toast.success(overrideReason ? "Lead force promoted to Meeting Readiness! 🚀" : "Lead moved to Meeting Readiness! 🚀");
      setCurrentStep(5);
    } catch {
      toast.error("Failed to promote lead to Meeting Readiness");
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
    else if (currentStep === 5) await meetingReadinessForm.handleSubmit(onMeetingReadinessSubmit, onError)();
  };

  const handleContinue = async () => {
    await handleSave();
    if (currentStep === 4) {
      const classification = classificationForm.getValues("classification");
      if (classification === "HOT") {
        setCurrentStep(5);
      }
    } else if (currentStep < 5) {
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
        else if (name.includes("NURTURING")) targetStep = 4;
        else if (name.includes("MEETING")) targetStep = 5;
        setCurrentStep(targetStep);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage");
    } finally {
      setSavingStage(false);
    }
  };

  const handleWinLossSubmit = async () => {
    if (!winLossReason) {
      toast.error("Please select a reason");
      return;
    }
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
    if (!handoverEM) {
      toast.error("Please select an Engagement Manager");
      return;
    }
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

  // derived metadata values
  const isNurturing = lead?.classification === "WARM";

  // Check meeting readiness checks (matches step-meeting-readiness-workspace.tsx)
  const checkBR = lead ? getStep2Complete(lead) : false;
  const checkQual = lead ? getStep3Complete(lead) : false;
  const checkPainPoint = lead ? (lead.painPoints?.length ?? 0) > 0 : false;
  const checkOutreach = lead ? (!!lead.lastContactAt || !!lead.nextFollowUpAt || !!lead.lastActivityAt) : false;
  const checkHot = lead ? lead.classification === "HOT" : false;
  const checkDM = lead ? lead.qualDecisionMakerAccess > 0 : false;
  const isReady = checkBR && checkQual && checkPainPoint && checkOutreach && checkHot && checkDM;

  // Determine form dirtiness for current step
  let isFormDirty = false;
  if (currentStep === 1) isFormDirty = intakeForm.formState.isDirty;
  else if (currentStep === 2) isFormDirty = businessReviewForm.formState.isDirty;
  else if (currentStep === 3) isFormDirty = qualificationForm.formState.isDirty;
  else if (currentStep === 4) isFormDirty = classificationForm.formState.isDirty;
  else if (currentStep === 5) isFormDirty = meetingReadinessForm.formState.isDirty;

  // Next stage information based on current wizard step
  let nextStageLabel: string | null = null;
  let nextStageId: string | null = null;

  if (stages.length > 0 && lead) {
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
      } else if (classification === "WARM") {
        const st = stages.find(s => s.name === "LEAD_NURTURING");
        nextStageLabel = st?.label || "Lead Nurturing";
        nextStageId = st?.id || null;
      } else if (classification === "COLD") {
        const st = stages.find(s => s.name === "LOST");
        nextStageLabel = st?.label || "Lost";
        nextStageId = st?.id || null;
      } else if (classification === "ARCHIVE") {
        const st = stages.find(s => s.name === "ON_HOLD") || stages.find(s => s.name === "LOST");
        nextStageLabel = st?.label || "Archived";
        nextStageId = st?.id || null;
      }
    }
  }

  const handleAdvance = async () => {
    if (nextStageId) {
      await handleStageChange(nextStageId);
    }
  };

  return {
    lead,
    setLead,
    stages,
    sources,
    owners,
    loading,
    isSaving,
    savingStage,
    isDataLoaded,
    currentStep,
    setCurrentStep,
    shake,
    triggerShake,
    showWinLossDialog,
    setShowWinLossDialog,
    winLossStatus,
    setWinLossStatus,
    winLossReason,
    setWinLossReason,
    winLossNotes,
    setWinLossNotes,
    savingWinLoss,
    handoverEM,
    setHandoverEM,
    convertingToClient,
    sidebarActiveAction,
    setSidebarActiveAction,
    intakeForm,
    businessReviewForm,
    qualificationForm,
    classificationForm,
    nurturingForm,
    meetingReadinessForm,
    onIntakeSubmit,
    onBusinessReviewSubmit,
    onQualificationSubmit,
    onClassificationSubmit,
    onNurturingSubmit,
    onMeetingReadinessSubmit,
    onPromoteToReadyNow,
    onPromoteNurturingToReady,
    handleSave,
    handleContinue,
    handleStageChange,
    handleWinLossSubmit,
    handleConvertToClient,
    isNurturing,
    isReady,
    isFormDirty,
    nextStageLabel,
    nextStageId,
    handleAdvance,
  };
}
