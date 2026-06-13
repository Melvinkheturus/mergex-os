import { Lead } from "./types";
import { WizardStep } from "./lead-step-stepper";

export function getStep1Complete(lead: Lead) {
  const hasContact = !!(lead.phone || lead.email);
  return !!(lead.companyName && lead.contactPerson && lead.sourceId && lead.ownerId && hasContact);
}

export function getStep2Complete(lead: Lead) {
  return !!(lead.businessAge || lead.teamSize) && (lead.painPoints?.length ?? 0) > 0;
}

export function getStep3Complete(lead: Lead) {
  return !!(
    lead.qualIcpFit > 0 &&
    lead.qualBudgetLikelihood > 0 &&
    lead.qualDecisionMakerAccess > 0 &&
    lead.qualNeed > 0 &&
    lead.qualTimeline > 0
  );
}

export function getStep4Complete(lead: Lead) {
  if (!lead.classification) return false;
  if (lead.classification === "WARM" && !lead.nurturingDirection) return false;
  if ((lead.classification === "COLD" || lead.classification === "ARCHIVE") && !lead.winLossReason) return false;
  return lead.services?.length > 0;
}

// Build the wizard steps array from lead data
export function buildSteps(lead: Lead, currentStep: number): WizardStep[] {
  const s1 = getStep1Complete(lead);
  const s2 = getStep2Complete(lead);
  const s3 = getStep3Complete(lead);
  const s4 = getStep4Complete(lead);

  const isHot = lead.classification === "HOT";
  const isWarm = lead.classification === "WARM";
  const isCold = lead.classification === "COLD";
  const isArchive = lead.classification === "ARCHIVE";

  // Nurturing is only relevant for WARM leads, not HOT, COLD, or ARCHIVE
  const needsNurturing = isWarm;

  // Step 5 (Nurturing) complete = has nurturing status set
  const s5 = !!(lead.nurturingStatus);

  const stepsList: WizardStep[] = [
    {
      id: 1,
      label: "Lead Intake",
      sublabel: "Capture lead contact and source",
      isComplete: s1,
      isLocked: false,
      canAdvance: s1,
    },
    {
      id: 2,
      label: "Business Review",
      sublabel: "Research the business before outreach",
      isComplete: s2,
      isLocked: !s1,
      canAdvance: s2,
    },
    {
      id: 3,
      label: "Qualification",
      sublabel: "Score commercial viability (6 dimensions)",
      isComplete: s3,
      isLocked: !s2,
      canAdvance: s3,
      badge: lead.qualScore > 0 ? `${lead.qualScore}/110` : undefined,
    },
    {
      id: 4,
      label: "Classification",
      sublabel: "Set status, services, and deal value",
      isComplete: s4,
      isLocked: !s3,
      // Can advance from classification if classification is HOT or WARM
      canAdvance: isHot || isWarm,
      badge: lead.classification || undefined,
    },
  ];

  if (needsNurturing) {
    stepsList.push({
      id: 5,
      label: "Nurturing",
      sublabel: "Manage holding state & engagement",
      isComplete: s5,
      // Nurturing is locked if: classification step not done, OR lead is HOT, OR lead is ARCHIVE
      isLocked: !s4 || isHot || isArchive,
      canAdvance: isHot || (needsNurturing && s5),
      badge: lead.nurturingStatus || undefined,
    });
  }

  stepsList.push({
    id: 6,
    label: "Meeting Readiness",
    sublabel: "Gate review & discovery meeting prep",
    isComplete: false,
    // Meeting Readiness unlocks when lead is HOT
    isLocked: !isHot,
    canAdvance: isHot,
  });

  return stepsList;
}
