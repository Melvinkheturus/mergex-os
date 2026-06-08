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
  return (
    lead.qualIcpFit > 0 ||
    lead.qualBudgetLikelihood >= 0 ||
    lead.qualDecisionMakerAccess >= 0
  ) &&
    lead.qualIcpFit > 0 &&
    lead.qualOperationalFeasibility > 0 &&
    lead.qualServiceAlignment > 0 &&
    lead.qualGrowthPotential > 0;
}

export function getStep4Complete(lead: Lead) {
  return !!(lead.classification && lead.services?.length > 0);
}

// Build the wizard steps array from lead data
export function buildSteps(lead: Lead, currentStep: number): WizardStep[] {
  const s1 = getStep1Complete(lead);
  const s2 = getStep2Complete(lead);
  const s3 = getStep3Complete(lead);
  const s4 = getStep4Complete(lead);
  const s5 = lead.classification === "HOT"; // Completed when lead is promoted to HOT

  return [
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
      canAdvance: lead.classification === "HOT" || lead.classification === "WARM",
      badge: lead.classification || undefined,
    },
    {
      id: 5,
      label: "Nurturing",
      sublabel: "Manage holding state & engagement",
      isComplete: s5,
      isLocked: !s4 || lead.classification === "COLD" || lead.classification === "ARCHIVE",
      canAdvance: lead.classification === "HOT",
      badge: lead.nurturingStatus || undefined,
    },
    {
      id: 6,
      label: "Meeting Readiness",
      sublabel: "Gate review & discovery meeting prep",
      isComplete: false,
      isLocked: lead.classification !== "HOT",
      canAdvance: true,
    },
  ];
}
