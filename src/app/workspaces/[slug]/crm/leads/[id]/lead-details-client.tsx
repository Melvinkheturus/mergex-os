"use client";

import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Trophy, XCircle, Rocket, Sprout } from "lucide-react";
import { toast } from "sonner";
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
import { LeadStepStepper } from "../components/lead-step-stepper";
import { StepIntakeForm } from "../components/step-intake-form";
import { StepBusinessReviewForm } from "../components/step-business-review-form";
import { StepQualificationForm } from "../components/step-qualification-form";
import { StepClassificationForm } from "../components/step-classification-form";
import { StepNurturingForm } from "../components/step-nurturing-form";
import { StepMeetingReadinessWorkspace } from "../components/step-meeting-readiness-workspace";

import { buildSteps } from "../components/wizard-helpers";

import { useLeadDetails } from "./use-lead-details";
import { LeadSnapshot } from "./lead-snapshot";
import { NurturingBanner } from "./nurturing-banner";

// ─── Component ───────────────────────────────────────────────────────────────

interface LeadDetailsClientProps {
  leadId: string;
}

export function LeadDetailsClient({ leadId }: LeadDetailsClientProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const {
    lead,
    setLead,
    stages,
    sources,
    owners,
    loading,
    isSaving,
    savingStage,
    currentStep,
    setCurrentStep,
    shake,
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
    onPromoteNurturingToReady,
    handleSave,
    handleStageChange,
    handleWinLossSubmit,
    handleConvertToClient,
    isNurturing,
    isReady,
    isFormDirty,
    nextStageLabel,
    handleAdvance,
  } = useLeadDetails({ leadId, slug });

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

  return (
    <div className="space-y-5">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/workspaces/${slug}/crm/leads`)}
            className="text-muted-foreground hover:text-foreground -ml-2 h-8 text-xs font-semibold"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Leads
          </Button>

          {/* Adaptive profile mode label */}
          {isNurturing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-500/8 text-[10px] font-black text-amber-600 dark:text-amber-400 select-none">
              <Sprout className="h-3 w-3" />
              Nurturing Lead Profile
            </div>
          )}
        </div>

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

      {/* Nurturing Banner */}
      <NurturingBanner
        lead={lead}
        onPromoteNurturingToReady={onPromoteNurturingToReady}
        isSaving={isSaving}
      />

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

          {isNurturing && <LeadSnapshot lead={lead} />}

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

        {/* Right — Nurturing Workspace OR 6-step wizard */}
        <div className="min-w-0 space-y-6">
          {isNurturing ? (
            /* ── NURTURING WORKSPACE VARIANT ── */
            <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/10 bg-muted/5 rounded-t-2xl">
                <Sprout className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">Nurturing Workspace</p>
                  <p className="text-[11px] text-muted-foreground/70">Manage follow-ups, engagement signals, and commercial readiness for this lead.</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">NURTURING</span>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <StepNurturingForm
                  form={nurturingForm}
                  onSubmit={onNurturingSubmit}
                  lead={lead}
                  onPromoteToReadyNow={onPromoteNurturingToReady}
                  promoting={isSaving}
                />
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-border/10 bg-muted/5 rounded-b-2xl">
                <span className="text-[10px] text-muted-foreground/60 font-medium">
                  Changes are saved immediately
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => nurturingForm.handleSubmit(onNurturingSubmit)()}
                  disabled={isSaving}
                  className="h-8 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                >
                  {isSaving ? "Saving…" : "Save Nurturing"}
                </Button>
              </div>
            </div>
          ) : (
            /* ── PIPELINE WIZARD VARIANT ── */
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
                currentStep === 5 ? (
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
          )}

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
