"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getStatus } from "../../../components/types";

export interface MeetingRecord {
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

export interface ProposalRecord {
  id: string;
  proposalNumber: string;
  title: string;
  value: string;
  status: string;
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: string;
  content: string;
  performedAt: string;
  user: { firstName: string | null; lastName: string | null } | null;
}

export interface OpportunityDetail {
  id: string;
  leadNumber: string | null;
  companyName: string;
  contactPerson: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  expectedValue: string | null;
  services: string[];
  temperature: string;
  classification: string | null;
  qualScore: number;
  avatarUrl: string | null;
  winLossStatus: string | null;
  winLossReason: string | null;
  winLossNotes: string | null;
  lastActivityAt: string | null;
  updatedAt: string;
  createdAt: string;
  decisionMaker: string | null;
  influencer: string | null;
  champion: string | null;
  valueProposition: string | null;
  painPoints: string[];
  opportunities: string[];
  ownerId: string | null;
  owner: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null } | null;
  stage: { id: string; name: string; label: string; color: string | null } | null;
  opportunityNotes: string | null;
  currentSituation: string | null;
  nextFollowUpAt: string | null;
  nextActionDate: string | null;
}

export function useOpportunityDetail(opportunityId: string, slug: string) {
  const router = useRouter();

  const [detail, setDetail] = useState<OpportunityDetail | null>(null);
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStage, setSavingStage] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);

  // Form States
  // Step 1: Discovery Meeting
  const [businessGoals, setBusinessGoals] = useState("");
  const [currentSituation, setCurrentSituation] = useState("");
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [budgetDiscussion, setBudgetDiscussion] = useState("Not Discussed");
  const [timelineDiscussion, setTimelineDiscussion] = useState("Not Discussed");
  const [stakeholders, setStakeholders] = useState("");
  const [decisionMaker, setDecisionMaker] = useState("");
  const [champion, setChampion] = useState("");
  const [risks, setRisks] = useState("");
  const [discoveryNotes, setDiscoveryNotes] = useState("");

  // Step 2: Solution Planning
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [valueProposition, setValueProposition] = useState("");
  const [feasibilityReview, setFeasibilityReview] = useState("");
  const [executionRisks, setExecutionRisks] = useState("");
  const [internalDependencies, setInternalDependencies] = useState("");
  const [estimatedEffort, setEstimatedEffort] = useState("Medium");
  const [deliveryConfidence, setDeliveryConfidence] = useState("Medium");
  const [planningStatus, setPlanningStatus] = useState("Proceed");

  // Step 3: Proposal builder state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: "",
    proposalNumber: "",
    value: "",
    status: "DRAFT",
    notes: "",
  });
  const [savingProposal, setSavingProposal] = useState(false);

  // Step 4: Agreement & Closure
  const [negotiationNotes, setNegotiationNotes] = useState("");
  const [ndaSigned, setNdaSigned] = useState(false);
  const [proposalSigned, setProposalSigned] = useState(false);
  const [finalAgreement, setFinalAgreement] = useState("");
  const [influencer, setInfluencer] = useState("");

  // Step 5: Engagement Handoff
  const [projectType, setProjectType] = useState("Retainer");
  const [assignedEM, setAssignedEM] = useState("");
  const [handoffNotes, setHandoffNotes] = useState("");
  const [clientExpectations, setClientExpectations] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [deliveryRisksHandoff, setDeliveryRisksHandoff] = useState("");
  const [convertingToClient, setConvertingToClient] = useState(false);

  // Sidebar refresh trigger helper
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Load all workspace data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadRes, meetingsRes, proposalsRes, activitiesRes, optionsRes] = await Promise.all([
        fetch(`/api/crm/leads/${opportunityId}`),
        fetch(`/api/crm/leads/${opportunityId}/meetings`),
        fetch(`/api/crm/leads/${opportunityId}/proposals`),
        fetch(`/api/crm/leads/${opportunityId}/activities`),
        fetch(`/api/crm/options?brandSlug=${slug}`),
      ]);

      if (!leadRes.ok) throw new Error("Not found");

      const leadData = await leadRes.json();
      setDetail({
        ...leadData,
        owner: leadData.User || null,
        stage: leadData.LeadStage || null,
      });

      if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      if (proposalsRes.ok) setProposals(await proposalsRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
      
      if (optionsRes.ok) {
        const optData = await optionsRes.json();
        setOwners(optData.owners || []);
        setStages(optData.stages || []);
      }
    } catch {
      toast.error("Failed to load opportunity");
      router.push(`/workspaces/${slug}/crm/sales-conversion`);
    } finally {
      setLoading(false);
    }
  }, [opportunityId, slug, router]);

  useEffect(() => {
    const t = setTimeout(loadData, 0);
    return () => clearTimeout(t);
  }, [loadData]);

  // Sync details to form states when loaded
  useEffect(() => {
    if (!detail) return;
    try {
      let parsed: Record<string, any> = {};
      if (detail.opportunityNotes) {
        const trimmed = detail.opportunityNotes.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            parsed = JSON.parse(trimmed);
          } catch (e) {
            console.error("Failed to parse opportunityNotes JSON", e);
            parsed = { discoveryNotes: detail.opportunityNotes };
          }
        } else {
          parsed = { discoveryNotes: detail.opportunityNotes };
        }
      }
      
      // Step 1
      setBusinessGoals(parsed.businessGoals || "");
      setCurrentSituation(detail.currentSituation || parsed.currentSituation || "");
      setPainPoints(detail.painPoints || parsed.painPoints || []);
      setDesiredOutcome(parsed.desiredOutcome || "");
      setBudgetDiscussion(parsed.budgetDiscussion || "Not Discussed");
      setTimelineDiscussion(parsed.timelineDiscussion || "Not Discussed");
      setStakeholders(parsed.stakeholders || "");
      setDecisionMaker(detail.decisionMaker || parsed.decisionMaker || "");
      setChampion(detail.champion || parsed.champion || "");
      setRisks(parsed.risks || "");
      setDiscoveryNotes(parsed.discoveryNotes || "");

      // Step 2
      setSelectedServices(detail.services || parsed.selectedServices || []);
      setValueProposition(detail.valueProposition || parsed.valueProposition || "");
      setFeasibilityReview(parsed.feasibilityReview || "");
      setExecutionRisks(parsed.executionRisks || "");
      setInternalDependencies(parsed.internalDependencies || "");
      setEstimatedEffort(parsed.estimatedEffort || "Medium");
      setDeliveryConfidence(parsed.deliveryConfidence || "Medium");
      setPlanningStatus(parsed.planningStatus || "Proceed");

      // Step 4
      setNegotiationNotes(parsed.negotiationNotes || "");
      setNdaSigned(parsed.ndaSigned || false);
      setProposalSigned(parsed.proposalSigned || false);
      setFinalAgreement(parsed.finalAgreement || "");
      setInfluencer(detail.influencer || parsed.influencer || "");

      // Step 5
      setProjectType(parsed.projectType || "Retainer");
      setAssignedEM(parsed.assignedEM || "");
      setHandoffNotes(parsed.handoffNotes || "");
      setClientExpectations(parsed.clientExpectations || "");
      setSuccessCriteria(parsed.successCriteria || "");
      setDeliveryRisksHandoff(parsed.deliveryRisksHandoff || "");

    } catch (e) {
      console.error("Failed to parse opportunityNotes JSON", e);
    }
  }, [detail]);

  // API patch logic
  const patchOpportunity = async (payload: Record<string, any>) => {
    const res = await fetch(`/api/crm/leads/${opportunityId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save");
    const updated = await res.json();
    setDetail({
      ...updated,
      owner: updated.User || null,
      stage: updated.LeadStage || null,
    });
    window.dispatchEvent(new CustomEvent("crm-activity-logged"));
    triggerRefresh();
    return updated;
  };

  // Reopen Logic handler
  const handleReopen = async (targetStageName: "MEETING" | "PROPOSAL") => {
    try {
      const stage = stages.find(s => s.name === targetStageName);
      if (!stage) throw new Error("Target stage not found");

      await patchOpportunity({
        winLossStatus: null,
        winLossReason: null,
        winLossNotes: null,
        classification: "HOT",
        temperature: "HOT",
        stageId: stage.id,
      });

      const targetStep = targetStageName === "MEETING" ? 1 : 3;
      setCurrentStep(targetStep);
      toast.success(`Opportunity reopened to ${stage.label}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to reopen opportunity");
    }
  };

  // Lost Reason Handler
  const handleSaveLostReason = async (reason: string, notes: string) => {
    try {
      await patchOpportunity({
        winLossReason: reason,
        winLossNotes: notes,
      });
      toast.success("Lost reason details saved");
    } catch {
      toast.error("Failed to save lost reason details");
    }
  };

  // Save stage form content
  const handleSaveWorkspace = async () => {
    if (!detail) return;
    setSavingStage(true);
    try {
      let currentNotes: Record<string, any> = {};
      if (detail.opportunityNotes) {
        const trimmed = detail.opportunityNotes.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            currentNotes = JSON.parse(trimmed);
          } catch {}
        } else {
          currentNotes = { discoveryNotes: detail.opportunityNotes };
        }
      }

      let payload: Record<string, any> = {};

      if (currentStep === 1) {
        const mergedNotes = {
          ...currentNotes,
          businessGoals,
          desiredOutcome,
          budgetDiscussion,
          timelineDiscussion,
          stakeholders,
          risks,
          discoveryNotes,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
          currentSituation,
          painPoints,
          decisionMaker,
          champion,
        };
      } else if (currentStep === 2) {
        const mergedNotes = {
          ...currentNotes,
          feasibilityReview,
          executionRisks,
          internalDependencies,
          estimatedEffort,
          deliveryConfidence,
          planningStatus,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
          services: selectedServices,
          valueProposition,
        };
      } else if (currentStep === 4) {
        const mergedNotes = {
          ...currentNotes,
          negotiationNotes,
          ndaSigned,
          proposalSigned,
          finalAgreement,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
          influencer,
        };
      } else if (currentStep === 5) {
        const mergedNotes = {
          ...currentNotes,
          projectType,
          assignedEM,
          handoffNotes,
          clientExpectations,
          successCriteria,
          deliveryRisksHandoff,
        };
        payload = {
          opportunityNotes: JSON.stringify(mergedNotes),
        };
      }

      await patchOpportunity(payload);
      toast.success("Workspace saved successfully");
    } catch {
      toast.error("Failed to save stage details");
    } finally {
      setSavingStage(false);
    }
  };

  // Stepper advance stage transition
  const handleAdvanceStage = async () => {
    if (!detail) return;
    setSavingStage(true);
    try {
      let targetStageName = "";
      let targetStep = currentStep;

      if (currentStep === 1) {
        targetStageName = "PROPOSAL";
        targetStep = 2;
      } else if (currentStep === 2) {
        targetStageName = "PROPOSAL";
        targetStep = 3;
      } else if (currentStep === 3) {
        targetStageName = "DOCUMENTATION";
        targetStep = 4;
      } else if (currentStep === 4) {
        targetStageName = "ENGAGEMENT_MANAGER_ASSIGNED";
        targetStep = 5;
      }

      if (targetStageName) {
        const stageObj = stages.find(s => s.name === targetStageName);
        if (stageObj) {
          await patchOpportunity({ stageId: stageObj.id });
        }
      }

      setCurrentStep(targetStep);
      toast.success("Advanced to next stage!");
    } catch {
      toast.error("Failed to advance stage");
    } finally {
      setSavingStage(false);
    }
  };

  // Convert to Client flow
  const handleConvertToClient = async () => {
    if (!assignedEM) {
      toast.error("Please select an Engagement Manager");
      return;
    }
    setConvertingToClient(true);
    try {
      const res = await fetch(`/api/crm/leads/${detail?.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagementManagerId: assignedEM }),
      });
      if (!res.ok) throw new Error("Failed to convert opportunity to client");
      toast.success("Opportunity successfully converted to Client! 🎉");
      router.push(`/workspaces/${slug}/crm/sales-conversion`);
    } catch (err: any) {
      toast.error(err.message || "Failed to convert");
    } finally {
      setConvertingToClient(false);
    }
  };

  // Win/Loss Closures
  const handleCloseDeal = async (status: "WON" | "LOST") => {
    try {
      await patchOpportunity({
        winLossStatus: status,
        winLossReason: status === "WON" ? "Closed Won" : "Budget",
      });
      toast.success(`Deal marked as ${status}`);
    } catch {
      toast.error("Failed to close deal");
    }
  };

  // Discovery Meeting Scheduler
  const [savingMeeting, setSavingMeeting] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    scheduledAt: "",
    duration: "60",
    mode: "GOOGLE_MEET",
    meetingUrl: "",
  });
  const [editMeetingForm, setEditMeetingForm] = useState({
    title: "",
    scheduledAt: "",
    duration: "60",
    mode: "GOOGLE_MEET",
    meetingUrl: "",
    status: "SCHEDULED",
  });

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      const target = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      const parsed = new URL(target);
      return parsed.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const handleAddMeeting = async () => {
    if (!meetingForm.title || !meetingForm.scheduledAt) {
      toast.error("Meeting title and date/time are required");
      return;
    }
    if (meetingForm.meetingUrl && !isValidUrl(meetingForm.meetingUrl)) {
      toast.error("Please enter a valid meeting link URL");
      return;
    }
    setSavingMeeting(true);
    try {
      const res = await fetch(`/api/crm/leads/${opportunityId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingForm.title,
          scheduledAt: meetingForm.scheduledAt,
          duration: parseInt(meetingForm.duration),
          mode: meetingForm.mode,
          meetingUrl: meetingForm.meetingUrl || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule meeting");
      toast.success("Meeting scheduled successfully");
      setMeetingForm({ title: "", scheduledAt: "", duration: "60", mode: "GOOGLE_MEET", meetingUrl: "" });
      setShowScheduleForm(false);
      loadData();
    } catch {
      toast.error("Failed to schedule meeting");
    } finally {
      setSavingMeeting(false);
    }
  };

  const handleUpdateMeeting = async (meetingId: string) => {
    if (!editMeetingForm.title || !editMeetingForm.scheduledAt) {
      toast.error("Meeting title and date/time are required");
      return;
    }
    if (editMeetingForm.meetingUrl && !isValidUrl(editMeetingForm.meetingUrl)) {
      toast.error("Please enter a valid meeting link URL");
      return;
    }
    setSavingMeeting(true);
    try {
      const res = await fetch(`/api/crm/meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editMeetingForm.title,
          scheduledAt: editMeetingForm.scheduledAt,
          duration: parseInt(editMeetingForm.duration),
          mode: editMeetingForm.mode,
          meetingUrl: editMeetingForm.meetingUrl || null,
          status: editMeetingForm.status,
        }),
      });
      if (!res.ok) throw new Error("Failed to update meeting");
      toast.success("Meeting updated successfully");
      setEditingMeetingId(null);
      loadData();
    } catch {
      toast.error("Failed to update meeting");
    } finally {
      setSavingMeeting(false);
    }
  };

  // Proposal Creation
  const handleAddProposal = async () => {
    if (!proposalForm.title || !proposalForm.value) {
      toast.error("Title and value are required");
      return;
    }
    setSavingProposal(true);
    try {
      const res = await fetch(`/api/crm/leads/${opportunityId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: proposalForm.title,
          proposalNumber: proposalForm.proposalNumber || `PROP-${Date.now().toString().slice(-6)}`,
          value: parseFloat(proposalForm.value),
          status: proposalForm.status,
          notes: proposalForm.notes || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create proposal");
      toast.success("Proposal created successfully");
      setShowProposalForm(false);
      setProposalForm({ title: "", proposalNumber: "", value: "", status: "DRAFT", notes: "" });
      loadData();
    } catch {
      toast.error("Failed to create proposal");
    } finally {
      setSavingProposal(false);
    }
  };

  // Proposal status update
  const handleUpdateProposalStatus = async (proposalId: string, status: string) => {
    try {
      const res = await fetch(`/api/crm/proposals/${proposalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Proposal status updated to ${status}`);
      loadData();
    } catch {
      toast.error("Failed to update proposal status");
    }
  };

  return {
    detail,
    meetings,
    proposals,
    activities,
    owners,
    stages,
    loading,
    savingStage,
    savingOwner,
    setSavingOwner,
    currentStep,
    setCurrentStep,
    businessGoals,
    setBusinessGoals,
    currentSituation,
    setCurrentSituation,
    painPoints,
    setPainPoints,
    desiredOutcome,
    setDesiredOutcome,
    budgetDiscussion,
    setBudgetDiscussion,
    timelineDiscussion,
    setTimelineDiscussion,
    stakeholders,
    setStakeholders,
    decisionMaker,
    setDecisionMaker,
    champion,
    setChampion,
    risks,
    setRisks,
    discoveryNotes,
    setDiscoveryNotes,
    selectedServices,
    setSelectedServices,
    valueProposition,
    setValueProposition,
    feasibilityReview,
    setFeasibilityReview,
    executionRisks,
    setExecutionRisks,
    internalDependencies,
    setInternalDependencies,
    estimatedEffort,
    setEstimatedEffort,
    deliveryConfidence,
    setDeliveryConfidence,
    planningStatus,
    setPlanningStatus,
    showProposalForm,
    setShowProposalForm,
    proposalForm,
    setProposalForm,
    savingProposal,
    negotiationNotes,
    setNegotiationNotes,
    ndaSigned,
    setNdaSigned,
    proposalSigned,
    setProposalSigned,
    finalAgreement,
    setFinalAgreement,
    influencer,
    setInfluencer,
    projectType,
    setProjectType,
    assignedEM,
    setAssignedEM,
    handoffNotes,
    setHandoffNotes,
    clientExpectations,
    setClientExpectations,
    successCriteria,
    setSuccessCriteria,
    deliveryRisksHandoff,
    setDeliveryRisksHandoff,
    convertingToClient,
    refreshKey,
    triggerRefresh,
    patchOpportunity,
    handleReopen,
    handleSaveLostReason,
    handleSaveWorkspace,
    handleAdvanceStage,
    handleConvertToClient,
    handleCloseDeal,
    savingMeeting,
    showScheduleForm,
    setShowScheduleForm,
    editingMeetingId,
    setEditingMeetingId,
    meetingForm,
    setMeetingForm,
    editMeetingForm,
    setEditMeetingForm,
    handleAddMeeting,
    handleUpdateMeeting,
    handleAddProposal,
    handleUpdateProposalStatus,
  };
}
