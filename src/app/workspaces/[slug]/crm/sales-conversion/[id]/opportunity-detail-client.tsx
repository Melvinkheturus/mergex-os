"use client";

import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Trophy,
  Briefcase,
  Target,
  Users,
  FileText,
  Lock,
  ChevronRight,
  ArrowRight,
  Save,
  MapPin,
  CheckCircle,
  XCircle,
  User,
  SlidersHorizontal,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { formatCurrency } from "../components/types";

// Operational Cards from Lead Operations
import { SlaCard } from "../../leads/components/crm/operational-layers/sla-card";
import { EscalationCard } from "../../leads/components/crm/operational-layers/escalation-card";
import { TasksCard } from "../../leads/components/crm/operational-layers/tasks-card";
import { NotesCard } from "../../leads/components/crm/operational-layers/notes-card";
import { TimelineCard } from "../../leads/components/crm/operational-layers/timeline-card";
import { KnowledgeCaptureCard } from "../../leads/components/crm/operational-layers/knowledge-capture-card";

// Hook and Subcomponents
import { useOpportunityDetail } from "./opportunity-detail/hooks/use-opportunity-detail";
import { CardContainer } from "./opportunity-detail/components/card-container";
import { HealthCard } from "./opportunity-detail/components/health-card";
import { LostReasonCard } from "./opportunity-detail/components/lost-reason-card";
import { OpportunityReopenCard } from "./opportunity-detail/components/opportunity-reactivation-card";
import { OpportunityHeader } from "./opportunity-detail/components/opportunity-header";
import { DiscoveryMeetingStep } from "./opportunity-detail/components/discovery-meeting-step";
import { SolutionPlanningStep } from "./opportunity-detail/components/solution-planning-step";
import { ProposalBuilderStep } from "./opportunity-detail/components/proposal-builder-step";
import { AgreementClosureStep } from "./opportunity-detail/components/agreement-closure-step";
import { EngagementHandoffStep } from "./opportunity-detail/components/engagement-handoff-step";

export function OpportunityDetailClient({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const {
    detail,
    meetings,
    proposals,
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
  } = useOpportunityDetail(opportunityId, slug);

  // Opportunity Health Calculation
  const checkDiscovery = meetings.some(m => m.status === "COMPLETED" || m.status === "SCHEDULED");
  const checkDM = !!decisionMaker;
  const checkProposal = proposals.some(p => p.status === "SENT" || p.status === "NEGOTIATION" || p.status === "APPROVED" || p.status === "REJECTED");
  const checkResponsive = (() => {
    if (!detail?.lastActivityAt) return false;
    const diff = Date.now() - new Date(detail.lastActivityAt).getTime();
    return diff < 10 * 86400000;
  })();
  const checkTimeline = !!(detail?.nextFollowUpAt || detail?.nextActionDate);

  const healthScore = [
    checkDiscovery,
    checkDM,
    checkProposal,
    checkResponsive,
    checkTimeline
  ].filter(Boolean).length * 20;

  const healthChecks = [
    { label: "Discovery Complete", isComplete: checkDiscovery },
    { label: "Decision Maker Identified", isComplete: checkDM },
    { label: "Proposal Sent", isComplete: checkProposal },
    { label: "Client Responsive", isComplete: checkResponsive },
    { label: "Timeline Confirmed", isComplete: checkTimeline },
  ];

  // Steps configuration
  const steps = [
    {
      id: 1,
      label: "Discovery Meeting",
      sublabel: "Conduct discovery and document goals",
      icon: Users,
      isComplete: checkDiscovery && !!businessGoals && !!desiredOutcome,
      isLocked: false,
    },
    {
      id: 2,
      label: "Solution Planning",
      sublabel: "Plan solution options & execution feasibility",
      icon: SlidersHorizontal,
      isComplete: selectedServices.length > 0 && !!feasibilityReview && !!estimatedEffort,
      isLocked: !(checkDiscovery && !!businessGoals && !!desiredOutcome),
    },
    {
      id: 3,
      label: "Proposal & Commercials",
      sublabel: "Issue formal commercials & track proposal versions",
      icon: FileText,
      isComplete: proposals.length > 0,
      isLocked: !(selectedServices.length > 0 && !!feasibilityReview),
    },
    {
      id: 4,
      label: "Agreement & Closure",
      sublabel: "Finalize agreement terms & obtain approval",
      icon: Handshake,
      isComplete: proposals.some(p => p.status === "APPROVED") || detail?.winLossStatus === "WON",
      isLocked: proposals.length === 0,
    },
    {
      id: 5,
      label: "Engagement Handoff",
      sublabel: "Handover account context & assign EM",
      icon: Trophy,
      isComplete: detail?.winLossStatus === "WON",
      isLocked: !proposals.some(p => p.status === "APPROVED") && detail?.winLossStatus !== "WON",
    },
  ];

  // Contextual recommended action
  let recommendedAction = null;
  if (currentStep === 1 && (!businessGoals || !desiredOutcome)) {
    recommendedAction = {
      title: "Discovery Details Missing",
      desc: "Complete meeting details and goals to unlock Solution Planning.",
      btnLabel: "Focus Discovery",
      action: () => setCurrentStep(1),
    };
  } else if (currentStep === 2 && !selectedServices.length) {
    recommendedAction = {
      title: "Solution Details Incomplete",
      desc: "Define solutions and feasibility review to prepare commercial proposals.",
      btnLabel: "Define Solution",
      action: () => setCurrentStep(2),
    };
  } else if (currentStep === 3 && proposals.length === 0) {
    recommendedAction = {
      title: "Proposal Creation Pending",
      desc: "Create and send the first proposal version to initiate commercials.",
      btnLabel: "Create Proposal",
      action: () => setCurrentStep(3),
    };
  } else if (currentStep === 4 && !proposals.some(p => p.status === "APPROVED")) {
    recommendedAction = {
      title: "Proposal Approval Pending",
      desc: "Track client proposal feedback. Obtain approval to unlock Agreement & Closure.",
      btnLabel: "Track Proposal",
      action: () => setCurrentStep(3),
    };
  } else if (currentStep === 5 && !assignedEM) {
    recommendedAction = {
      title: "Handoff Context Missing",
      desc: "Assign an Engagement Manager and define expectations to convert to client.",
      btnLabel: "Complete Handoff",
      action: () => setCurrentStep(5),
    };
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const ownerName = detail.owner
    ? `${detail.owner.firstName || ""} ${detail.owner.lastName || ""}`.trim()
    : "—";
  const activeStepConfig = steps.find(s => s.id === currentStep);
  const showAdvance = !activeStepConfig?.isLocked && activeStepConfig?.isComplete && currentStep < 5;

  return (
    <div className="space-y-5">
      {/* Top bar & Header Actions */}
      <OpportunityHeader
        detail={detail}
        slug={slug}
        onBack={() => router.push(`/workspaces/${slug}/crm/sales-conversion`)}
        onOpenLeadProfile={() => router.push(`/workspaces/${slug}/crm/leads/${detail.id}`)}
        onCloseDeal={handleCloseDeal}
      />

      {/* Company Header Banner */}
      <div className="rounded-2xl border border-border/30 bg-gradient-to-r from-violet-500/5 to-transparent p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {detail.avatarUrl ? (
          <img src={detail.avatarUrl} alt={detail.companyName} className="h-14 w-14 rounded-2xl object-cover border border-violet-500/10 shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-2xl bg-violet-500/15 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
              {detail.companyName[0]?.toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">{detail.companyName}</h1>
            {detail.leadNumber && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                {detail.leadNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {detail.contactPerson}{detail.designation ? ` · ${detail.designation}` : ""}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {detail.industry && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {detail.industry}
              </span>
            )}
            {detail.location && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {detail.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-1 shrink-0">
          <div className="text-2xl font-black text-foreground">
            {formatCurrency(detail.expectedValue)}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expected Value</span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-violet-500">Active</span>
          </div>
        </div>
      </div>

      {/* Recommended Action Card */}
      {recommendedAction && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500/70 block">
              RECOMMENDED ACTION
            </span>
            <h4 className="text-xs font-bold text-foreground">{recommendedAction.title}</h4>
            <p className="text-[11px] text-muted-foreground/80 leading-normal">{recommendedAction.desc}</p>
          </div>
          {recommendedAction.btnLabel && (
            <Button
              size="sm"
              onClick={recommendedAction.action}
              className="h-8 text-[11px] font-bold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shrink-0 self-start sm:self-center"
            >
              {recommendedAction.btnLabel}
            </Button>
          )}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
        
        {/* Left Rail (Operational Cards) */}
        <div className="space-y-4">
          
          {/* Health Card */}
          <HealthCard score={healthScore} checks={healthChecks} />

          {/* Ownership Card */}
          <CardContainer title="Opportunity Owner" icon={User}>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0 border border-violet-500/10">
                  <AvatarImage src={detail.owner?.avatarUrl || ""} alt={ownerName} className="object-cover" />
                  <AvatarFallback className="text-sm font-black bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    {ownerName[0]?.toUpperCase() || "—"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{ownerName}</p>
                  <p className="text-[11px] text-muted-foreground">Account Owner</p>
                </div>
              </div>
              
              <div className="pt-2">
                <Select
                  value={detail.ownerId || ""}
                  disabled={savingOwner}
                  onValueChange={async (val) => {
                    try {
                      setSavingOwner(true);
                      await patchOpportunity({ ownerId: val });
                      toast.success("Owner updated");
                    } catch {
                      toast.error("Failed to update owner");
                    } finally {
                      setSavingOwner(false);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs focus:ring-[#8B5CF6]/50 rounded-lg">
                    <SelectValue placeholder="Change Owner" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40">
                    {owners.map((o) => (
                      <SelectItem key={o.id} value={o.id} className="text-xs rounded-lg">
                        {o.firstName} {o.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContainer>

          {/* Lost Reason Card */}
          <LostReasonCard detail={detail} onSaveReason={handleSaveLostReason} />

          {/* Reopen Logic Card */}
          <OpportunityReopenCard detail={detail} onReopen={handleReopen} />

          {/* SLA Card */}
          <SlaCard key={`sla-${refreshKey}`} lead={detail as any} />

          {/* Escalation Card */}
          <EscalationCard key={`esc-${refreshKey}`} lead={detail as any} />

          {/* Tasks Card */}
          <TasksCard key={`tasks-${refreshKey}`} leadId={detail.id} owners={owners} />

          {/* Notes Card */}
          <NotesCard key={`notes-${refreshKey}`} leadId={detail.id} owners={owners} onNoteAdded={triggerRefresh} />

          {/* Knowledge Capture Card */}
          <KnowledgeCaptureCard leadId={detail.id} key={`kc-${refreshKey}`} />

          {/* Timeline Card */}
          <TimelineCard leadId={detail.id} key={`timeline-${refreshKey}`} />
        </div>

        {/* Right Column (Stepper + Active Stage Workspace) */}
        <div className="space-y-5">
          
          {/* Stepper Navigator */}
          <div className="w-full overflow-hidden bg-card border border-border/40 rounded-xl shadow-xs">
            <div className="flex items-center justify-between w-full py-2 px-2 text-[10px] sm:text-[11px] font-semibold whitespace-nowrap">
              {steps.map((s, idx) => {
                const isCurrent = s.id === currentStep;
                const isCompleted = s.isComplete;
                const isOpenedFromLock = !s.isLocked && !s.isComplete;
                const isClickable = !s.isLocked;
                const StepIcon = s.icon;
    
                return (
                  <div key={s.id} className="flex items-center gap-1 flex-1 min-w-0 justify-center">
                    <button
                      type="button"
                      disabled={s.isLocked}
                      onClick={() => isClickable && setCurrentStep(s.id)}
                      className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                        isCurrent
                          ? "bg-gradient-to-t from-[#8B5CF6]/15 via-white/40 to-white dark:from-purple-950/20 dark:to-zinc-900 border border-[#8B5CF6]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_2px_rgba(139,92,246,0.15)] text-[#8B5CF6] dark:text-[#a78bfa] font-bold"
                          : isCompleted
                          ? "text-[#8B5CF6]/70 dark:text-[#a78bfa]/75 font-semibold"
                          : isOpenedFromLock
                          ? "text-amber-600 dark:text-amber-400 font-semibold"
                          : "text-muted-foreground/50 font-normal"
                      )}
                    >
                      {s.isLocked ? (
                        <Lock className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                      ) : (
                        <StepIcon className={cn(
                          "h-3 w-3 shrink-0",
                          isCurrent
                            ? "text-[#8B5CF6]"
                            : isCompleted
                            ? "text-[#8B5CF6]/75"
                            : "text-amber-500 dark:text-amber-400"
                        )} />
                      )}
                      <span className="truncate max-w-[80px] sm:max-w-none">{s.label}</span>
                    </button>
                    
                    {idx < steps.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground/25 shrink-0 ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper Card Stage Workspace */}
          <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-visible relative">
            
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/20 bg-muted/10 rounded-t-2xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{activeStepConfig?.label}</p>
                <p className="text-[11px] text-muted-foreground/70">{activeStepConfig?.sublabel}</p>
              </div>
              {activeStepConfig?.isComplete && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Complete</span>
                </div>
              )}
            </div>

            {/* Form Content */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* STEP 1: Discovery Meeting */}
              {currentStep === 1 && (
                <DiscoveryMeetingStep
                  meetings={meetings}
                  showScheduleForm={showScheduleForm}
                  setShowScheduleForm={setShowScheduleForm}
                  savingMeeting={savingMeeting}
                  meetingForm={meetingForm}
                  setMeetingForm={setMeetingForm}
                  editingMeetingId={editingMeetingId}
                  setEditingMeetingId={setEditingMeetingId}
                  editMeetingForm={editMeetingForm}
                  setEditMeetingForm={setEditMeetingForm}
                  onAddMeeting={handleAddMeeting}
                  onUpdateMeeting={handleUpdateMeeting}
                  contactPerson={detail.contactPerson}
                  ownerName={ownerName}
                  businessGoals={businessGoals}
                  setBusinessGoals={setBusinessGoals}
                  desiredOutcome={desiredOutcome}
                  setDesiredOutcome={setDesiredOutcome}
                  currentSituation={currentSituation}
                  setCurrentSituation={setCurrentSituation}
                  painPoints={painPoints}
                  setPainPoints={setPainPoints}
                  budgetDiscussion={budgetDiscussion}
                  setBudgetDiscussion={setBudgetDiscussion}
                  timelineDiscussion={timelineDiscussion}
                  setTimelineDiscussion={setTimelineDiscussion}
                  decisionMaker={decisionMaker}
                  setDecisionMaker={setDecisionMaker}
                  champion={champion}
                  setChampion={setChampion}
                  stakeholders={stakeholders}
                  setStakeholders={setStakeholders}
                  risks={risks}
                  setRisks={setRisks}
                  discoveryNotes={discoveryNotes}
                  setDiscoveryNotes={setDiscoveryNotes}
                />
              )}

              {/* STEP 2: Solution Planning */}
              {currentStep === 2 && (
                <SolutionPlanningStep
                  selectedServices={selectedServices}
                  setSelectedServices={setSelectedServices}
                  valueProposition={valueProposition}
                  setValueProposition={setValueProposition}
                  feasibilityReview={feasibilityReview}
                  setFeasibilityReview={setFeasibilityReview}
                  executionRisks={executionRisks}
                  setExecutionRisks={setExecutionRisks}
                  internalDependencies={internalDependencies}
                  setInternalDependencies={setInternalDependencies}
                  estimatedEffort={estimatedEffort}
                  setEstimatedEffort={setEstimatedEffort}
                  deliveryConfidence={deliveryConfidence}
                  setDeliveryConfidence={setDeliveryConfidence}
                  planningStatus={planningStatus}
                  setPlanningStatus={setPlanningStatus}
                />
              )}

              {/* STEP 3: Proposal & Commercials */}
              {currentStep === 3 && (
                <ProposalBuilderStep
                  proposals={proposals}
                  showProposalForm={showProposalForm}
                  setShowProposalForm={setShowProposalForm}
                  proposalForm={proposalForm}
                  setProposalForm={setProposalForm}
                  savingProposal={savingProposal}
                  onAddProposal={handleAddProposal}
                  onUpdateProposalStatus={handleUpdateProposalStatus}
                />
              )}

              {/* STEP 4: Agreement & Closure */}
              {currentStep === 4 && (
                <AgreementClosureStep
                  negotiationNotes={negotiationNotes}
                  setNegotiationNotes={setNegotiationNotes}
                  finalAgreement={finalAgreement}
                  setFinalAgreement={setFinalAgreement}
                  ndaSigned={ndaSigned}
                  setNdaSigned={setNdaSigned}
                  proposalSigned={proposalSigned}
                  setProposalSigned={setProposalSigned}
                  decisionMaker={decisionMaker}
                  setDecisionMaker={setDecisionMaker}
                  champion={champion}
                  setChampion={setChampion}
                  influencer={influencer}
                  setInfluencer={setInfluencer}
                />
              )}

              {/* STEP 5: Engagement Handoff */}
              {currentStep === 5 && (
                <EngagementHandoffStep
                  projectType={projectType}
                  setProjectType={setProjectType}
                  assignedEM={assignedEM}
                  setAssignedEM={setAssignedEM}
                  clientExpectations={clientExpectations}
                  setClientExpectations={setClientExpectations}
                  successCriteria={successCriteria}
                  setSuccessCriteria={setSuccessCriteria}
                  handoffNotes={handoffNotes}
                  setHandoffNotes={setHandoffNotes}
                  deliveryRisksHandoff={deliveryRisksHandoff}
                  setDeliveryRisksHandoff={setDeliveryRisksHandoff}
                  convertingToClient={convertingToClient}
                  onConvertToClient={handleConvertToClient}
                  owners={owners}
                />
              )}
            </div>

            {/* Stepper Card Footer Actions */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border/20 bg-muted/5 rounded-b-2xl">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="h-8 text-xs font-semibold border-border/60 hover:bg-muted text-foreground rounded-lg"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveWorkspace}
                  disabled={savingStage}
                  className="h-8 text-xs font-semibold bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg transition-all"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {savingStage ? "Saving..." : "Save Details"}
                </Button>
                
                {showAdvance && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAdvanceStage}
                    disabled={savingStage}
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                  >
                    Advance Stage <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
