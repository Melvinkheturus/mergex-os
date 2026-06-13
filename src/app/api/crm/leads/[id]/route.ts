import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function verifyLeadAccess(leadId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      User: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
      LeadStage: {
        select: { id: true, name: true, label: true, color: true },
      },
      LeadSource: {
        select: { id: true, name: true },
      },
    },
  });

  if (!lead) return { error: "Lead not found", status: 404 };

  const isAdmin = user.role.name === "super_admin" || user.role.name === "admin";
  if (!isAdmin) {
    const access = await db.userBrandAccess.findFirst({
      where: { userId: user.id, brandId: lead.brandId },
    });
    if (!access) {
      return { error: "Forbidden: No access to this workspace", status: 403 };
    }
  }

  return { lead, user };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  const { lead, user } = result;
  if (!lead || !user) {
    return NextResponse.json({ error: result.error || "Not Found" }, { status: result.status || 404 });
  }
  const mappedLead = {
    ...lead,
    owner: lead.User || null,
    stage: lead.LeadStage || null,
    source: lead.LeadSource || null,
  };
  return NextResponse.json(mappedLead);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  const { lead, user } = result;
  if (!lead || !user) {
    return NextResponse.json({ error: result.error || "Not Found" }, { status: result.status || 404 });
  }

  try {
    const body = await req.json();
    const stages = await db.leadStage.findMany({
      where: { brandId: lead.brandId },
      orderBy: { order: "asc" },
    });
    const {
      companyName,
      contactPerson,
      designation,
      email,
      phone,
      website,
      industry,
      location,
      sourceId,
      stageId,
      ownerId,
      icpScore,
      temperature,
      expectedValue,
      priority,
      services,
      leadCategory,
      nextAction,
      nextActionDate,
      lastContactAt,
      nextFollowUpAt,
      // Legacy inline Business Review fields
      currentSituation,
      painPoints,
      opportunityNotes,
      // BANT (kept on Lead)
      bantBudget,
      bantAuthority,
      bantNeed,
      bantTimeline,
      // Win/Loss
      winLossStatus,
      winLossReason,
      winLossNotes,
      // Relationship Intelligence
      decisionMaker,
      influencer,
      champion,
      financeContact,
      avatarUrl,
      // Step 1 — Intake
      sourceNotes,
      // Step 2 — Business Review (new fields)
      businessModel,
      businessAge,
      teamSize,
      revenueRange,
      primaryChannel,
      hasWebsite,
      hasEcommerce,
      hasInstagram,
      hasFacebook,
      hasLinkedIn,
      hasGoogleBiz,
      opportunities,
      outreachAngle,
      relevantServices,
      valueProposition,
      businessConfidence,
      // Step 3 — Qualification (BANT + ICP)
      qualIcpFit,
      qualIcpFitDesc,
      qualBudgetLikelihood,
      qualBudgetLikelihoodDesc,
      qualDecisionMakerAccess,
      qualDecisionMakerAccessDesc,
      qualNeed,
      qualNeedDesc,
      qualTimeline,
      qualTimelineDesc,
      qualRisks,
      qualOtherRisk,
      qualOutcome,
      // Step 4 — Classification
      classification,
      nurturingDirection,
      // Step 5 — Nurturing
      nurturingStatus,
      nurturingChannel,
      conversationNotes,
      reopenAt,
    } = body;

    // Calculate BANT score if any slider changes
    let finalBantScore: number | undefined = undefined;
    if (
      bantBudget !== undefined ||
      bantAuthority !== undefined ||
      bantNeed !== undefined ||
      bantTimeline !== undefined
    ) {
      const b = bantBudget !== undefined ? bantBudget : lead.bantBudget;
      const a = bantAuthority !== undefined ? bantAuthority : lead.bantAuthority;
      const n = bantNeed !== undefined ? bantNeed : lead.bantNeed;
      const t = bantTimeline !== undefined ? bantTimeline : lead.bantTimeline;
      finalBantScore = Math.round((b + a + n + t) / 4);
    }

    // Calculate qualification score from 5 dimensions (ICP Fit + BANT)
    let finalQualScore: number | undefined = undefined;
    let finalQualStatus: string | undefined = undefined;
    const qualFields = { qualIcpFit, qualBudgetLikelihood, qualDecisionMakerAccess, qualNeed, qualTimeline };
    const hasQualChange = Object.values(qualFields).some((v) => v !== undefined);
    if (hasQualChange) {
      const f = (key: keyof typeof qualFields, fallback: number) =>
        qualFields[key] !== undefined ? (qualFields[key] as number) : fallback;
      finalQualScore =
        f("qualIcpFit",              (lead as any).qualIcpFit              || 0) +
        f("qualBudgetLikelihood",    (lead as any).qualBudgetLikelihood    || 0) +
        f("qualDecisionMakerAccess", (lead as any).qualDecisionMakerAccess || 0) +
        f("qualNeed",                (lead as any).qualNeed                || 0) +
        f("qualTimeline",            (lead as any).qualTimeline            || 0);
      finalQualStatus = finalQualScore >= 80 ? "QUALIFIED" : "DISQUALIFIED";
    }

    // Calculate stageId dynamically if not explicitly provided (e.g. on form Save)
    let finalStageId: string | null = lead.stageId;
    if (stageId !== undefined) {
      finalStageId = stageId;
    } else {
      // Reconstruct merged lead with incoming updates to calculate stage completion
      const mergedLead = {
        ...lead,
        companyName: companyName !== undefined ? companyName : lead.companyName,
        contactPerson: contactPerson !== undefined ? contactPerson : lead.contactPerson,
        phone: phone !== undefined ? (phone || null) : lead.phone,
        email: email !== undefined ? (email || null) : lead.email,
        sourceId: sourceId !== undefined ? sourceId : lead.sourceId,
        ownerId: ownerId !== undefined ? ownerId : lead.ownerId,
        businessAge: businessAge !== undefined ? (businessAge || null) : (lead as any).businessAge,
        teamSize: teamSize !== undefined ? (teamSize || null) : (lead as any).teamSize,
        painPoints: painPoints !== undefined ? painPoints : lead.painPoints,
        qualIcpFit: qualIcpFit !== undefined ? qualIcpFit : (lead as any).qualIcpFit,
        qualBudgetLikelihood: qualBudgetLikelihood !== undefined ? qualBudgetLikelihood : (lead as any).qualBudgetLikelihood,
        qualDecisionMakerAccess: qualDecisionMakerAccess !== undefined ? qualDecisionMakerAccess : (lead as any).qualDecisionMakerAccess,
        qualNeed: qualNeed !== undefined ? qualNeed : (lead as any).qualNeed,
        qualTimeline: qualTimeline !== undefined ? qualTimeline : (lead as any).qualTimeline,
        classification: classification !== undefined ? (classification || null) : (lead as any).classification,
        services: services !== undefined ? services : lead.services,
        nurturingStatus: nurturingStatus !== undefined ? (nurturingStatus || null) : (lead as any).nurturingStatus,
      };

      const intakeStage = stages.find((s) => s.name === "LEAD_INTAKE");
      const reviewStage = stages.find((s) => s.name === "BUSINESS_REVIEW");
      const qualStage = stages.find((s) => s.name === "LEAD_QUALIFICATION");
      const classStage = stages.find((s) => s.name === "LEAD_CLASSIFICATION");
      const nurturingStage = stages.find((s) => s.name === "LEAD_NURTURING");
      const meetingStage = stages.find((s) => s.name === "MEETING");
      const lostStage = stages.find((s) => s.name === "LOST");
      const onHoldStage = stages.find((s) => s.name === "ON_HOLD");

      // Validate stages sequentially
      const hasContact = !!(mergedLead.phone || mergedLead.email);
      const s1Complete = !!(mergedLead.companyName && mergedLead.contactPerson && mergedLead.sourceId && mergedLead.ownerId && hasContact);

      const s2Complete = !!(mergedLead.businessAge || mergedLead.teamSize) && (mergedLead.painPoints?.length ?? 0) > 0;

      const s3Complete = !!(
        mergedLead.qualIcpFit > 0 &&
        mergedLead.qualBudgetLikelihood > 0 &&
        mergedLead.qualDecisionMakerAccess > 0 &&
        mergedLead.qualNeed > 0 &&
        mergedLead.qualTimeline > 0
      );

      let s4Complete = !!(mergedLead.classification && mergedLead.services?.length > 0);
      if (mergedLead.classification === "WARM" && !mergedLead.nurturingDirection) {
        s4Complete = false;
      }
      if ((mergedLead.classification === "COLD" || mergedLead.classification === "ARCHIVE") && !mergedLead.winLossReason) {
        s4Complete = false;
      }

      const needsNurturing = mergedLead.classification === "WARM";
      const s5Complete = needsNurturing ? !!(mergedLead.nurturingStatus) : true;

      if (!s1Complete) {
        finalStageId = intakeStage?.id || lead.stageId;
      } else if (!s2Complete) {
        finalStageId = reviewStage?.id || lead.stageId;
      } else if (!s3Complete) {
        finalStageId = qualStage?.id || lead.stageId;
      } else if (!s4Complete) {
        finalStageId = classStage?.id || lead.stageId;
      } else if (mergedLead.classification === "COLD") {
        finalStageId = lostStage?.id || lead.stageId;
      } else if (mergedLead.classification === "ARCHIVE") {
        finalStageId = onHoldStage?.id || lostStage?.id || lead.stageId;
      } else if (needsNurturing && !s5Complete) {
        finalStageId = nurturingStage?.id || lead.stageId;
      } else {
        finalStageId = meetingStage?.id || lead.stageId;
      }
    }

    // Detect auditable changes
    const auditEntries: { action: string; oldValue: string | null; newValue: string | null }[] = [];
    if (finalStageId !== lead.stageId) {
      auditEntries.push({
        action: "STAGE_CHANGED",
        oldValue: lead.LeadStage?.label ?? lead.stageId ?? null,
        newValue: finalStageId ?? null,
      });
    }
    if (ownerId !== undefined && ownerId !== lead.ownerId) {
      auditEntries.push({
        action: "OWNER_CHANGED",
        oldValue: lead.ownerId ?? null,
        newValue: ownerId ?? null,
      });
    }
    if (winLossStatus !== undefined && winLossStatus !== lead.winLossStatus) {
      auditEntries.push({
        action: "STATUS_CHANGED",
        oldValue: lead.winLossStatus ?? null,
        newValue: winLossStatus ?? null,
      });
    }
    // Trigger rebuild to reload updated Prisma Client
    const updatedLead = await db.lead.update({
      where: { id },
      data: {
        companyName: companyName !== undefined ? companyName : lead.companyName,
        contactPerson: contactPerson !== undefined ? contactPerson : lead.contactPerson,
        designation: designation !== undefined ? (designation || null) : lead.designation,
        email: email !== undefined ? (email || null) : lead.email,
        phone: phone !== undefined ? (phone || null) : lead.phone,
        website: website !== undefined ? (website || null) : lead.website,
        industry: industry !== undefined ? (industry || null) : lead.industry,
        location: location !== undefined ? (location || null) : lead.location,
        // Prisma v7: sourceId must be set via relation connect/disconnect, not scalar
        ...(sourceId !== undefined
          ? {
              LeadSource: sourceId
                ? { connect: { id: sourceId } }
                : { disconnect: true },
            }
          : {}),
        // Prisma v7: stageId must be set via relation connect/disconnect, not scalar
        ...(finalStageId !== lead.stageId
          ? {
              LeadStage: finalStageId
                ? { connect: { id: finalStageId } }
                : { disconnect: true },
            }
          : {}),
        // Prisma v7: ownerId must be set via relation connect/disconnect, not scalar
        ...(ownerId !== undefined
          ? {
              User: ownerId
                ? { connect: { id: ownerId } }
                : { disconnect: true },
            }
          : {}),
        avatarUrl: avatarUrl !== undefined ? (avatarUrl || null) : lead.avatarUrl,
        icpScore: icpScore !== undefined ? icpScore : lead.icpScore,
        temperature: temperature !== undefined ? temperature : lead.temperature,
        expectedValue:
          expectedValue !== undefined
            ? expectedValue
              ? parseFloat(expectedValue)
              : null
            : lead.expectedValue,
        priority: priority !== undefined ? priority : lead.priority,
        services: services !== undefined ? services : lead.services,
        leadCategory: leadCategory !== undefined ? (leadCategory || null) : lead.leadCategory,
        nextAction: nextAction !== undefined ? (nextAction || null) : lead.nextAction,
        nextActionDate:
          nextActionDate !== undefined
            ? nextActionDate
              ? new Date(nextActionDate)
              : null
            : lead.nextActionDate,
        lastContactAt:
          lastContactAt !== undefined
            ? lastContactAt
              ? new Date(lastContactAt)
              : null
            : lead.lastContactAt,
        nextFollowUpAt:
          nextFollowUpAt !== undefined
            ? nextFollowUpAt
              ? new Date(nextFollowUpAt)
              : null
            : lead.nextFollowUpAt,
        // Legacy inline
        currentSituation: currentSituation !== undefined ? currentSituation : lead.currentSituation,
        painPoints: painPoints !== undefined ? painPoints : lead.painPoints,
        opportunityNotes: opportunityNotes !== undefined ? opportunityNotes : lead.opportunityNotes,
        // BANT
        bantBudget: bantBudget !== undefined ? bantBudget : lead.bantBudget,
        bantAuthority: bantAuthority !== undefined ? bantAuthority : lead.bantAuthority,
        bantNeed: bantNeed !== undefined ? bantNeed : lead.bantNeed,
        bantTimeline: bantTimeline !== undefined ? bantTimeline : lead.bantTimeline,
        bantScore: finalBantScore !== undefined ? finalBantScore : lead.bantScore,
        // Win/Loss
        winLossStatus: winLossStatus !== undefined ? winLossStatus : lead.winLossStatus,
        winLossReason: winLossReason !== undefined ? winLossReason : lead.winLossReason,
        winLossNotes: winLossNotes !== undefined ? winLossNotes : lead.winLossNotes,
        // Relationship Intelligence
        decisionMaker: decisionMaker !== undefined ? (decisionMaker || null) : lead.decisionMaker,
        influencer: influencer !== undefined ? (influencer || null) : lead.influencer,
        champion: champion !== undefined ? (champion || null) : lead.champion,
        financeContact: financeContact !== undefined ? (financeContact || null) : lead.financeContact,
        // Step 1 — Intake
        sourceNotes: sourceNotes !== undefined ? (sourceNotes || null) : (lead as any).sourceNotes,
        // Step 2 — Business Review (new fields)
        businessModel: businessModel !== undefined ? (businessModel || null) : (lead as any).businessModel,
        businessAge: businessAge !== undefined ? (businessAge || null) : (lead as any).businessAge,
        teamSize: teamSize !== undefined ? (teamSize || null) : (lead as any).teamSize,
        revenueRange: revenueRange !== undefined ? (revenueRange || null) : (lead as any).revenueRange,
        primaryChannel: primaryChannel !== undefined ? (primaryChannel || null) : (lead as any).primaryChannel,
        hasWebsite: hasWebsite !== undefined ? hasWebsite : (lead as any).hasWebsite,
        hasEcommerce: hasEcommerce !== undefined ? hasEcommerce : (lead as any).hasEcommerce,
        hasInstagram: hasInstagram !== undefined ? hasInstagram : (lead as any).hasInstagram,
        hasFacebook: hasFacebook !== undefined ? hasFacebook : (lead as any).hasFacebook,
        hasLinkedIn: hasLinkedIn !== undefined ? hasLinkedIn : (lead as any).hasLinkedIn,
        hasGoogleBiz: hasGoogleBiz !== undefined ? hasGoogleBiz : (lead as any).hasGoogleBiz,
        opportunities: opportunities !== undefined ? opportunities : (lead as any).opportunities,
        outreachAngle: outreachAngle !== undefined ? (outreachAngle || null) : (lead as any).outreachAngle,
        relevantServices: relevantServices !== undefined ? (relevantServices || null) : (lead as any).relevantServices,
        valueProposition: valueProposition !== undefined ? (valueProposition || null) : (lead as any).valueProposition,
        businessConfidence: businessConfidence !== undefined ? (businessConfidence || null) : (lead as any).businessConfidence,
        // Step 3 — Qualification (BANT + ICP)
        qualIcpFit:                  qualIcpFit !== undefined ? qualIcpFit : (lead as any).qualIcpFit,
        qualIcpFitDesc:              qualIcpFitDesc !== undefined ? (qualIcpFitDesc || null) : (lead as any).qualIcpFitDesc,
        qualBudgetLikelihood:        qualBudgetLikelihood !== undefined ? qualBudgetLikelihood : (lead as any).qualBudgetLikelihood,
        qualBudgetLikelihoodDesc:    qualBudgetLikelihoodDesc !== undefined ? (qualBudgetLikelihoodDesc || null) : (lead as any).qualBudgetLikelihoodDesc,
        qualDecisionMakerAccess:     qualDecisionMakerAccess !== undefined ? qualDecisionMakerAccess : (lead as any).qualDecisionMakerAccess,
        qualDecisionMakerAccessDesc: qualDecisionMakerAccessDesc !== undefined ? (qualDecisionMakerAccessDesc || null) : (lead as any).qualDecisionMakerAccessDesc,
        qualNeed:                    qualNeed !== undefined ? qualNeed : (lead as any).qualNeed,
        qualNeedDesc:                qualNeedDesc !== undefined ? (qualNeedDesc || null) : (lead as any).qualNeedDesc,
        qualTimeline:                qualTimeline !== undefined ? qualTimeline : (lead as any).qualTimeline,
        qualTimelineDesc:            qualTimelineDesc !== undefined ? (qualTimelineDesc || null) : (lead as any).qualTimelineDesc,
        qualScore:                   finalQualScore !== undefined ? finalQualScore : (lead as any).qualScore,
        qualStatus:                  finalQualStatus !== undefined ? finalQualStatus : (lead as any).qualStatus,
        qualRisks:                   qualRisks !== undefined ? qualRisks : (lead as any).qualRisks,
        qualOtherRisk:               qualOtherRisk !== undefined ? (qualOtherRisk || null) : (lead as any).qualOtherRisk,
        qualOutcome:                 qualOutcome !== undefined ? (qualOutcome || null) : (lead as any).qualOutcome,
        // Step 4 — Classification
        classification: classification !== undefined ? (classification || null) : (lead as any).classification,
        nurturingDirection: nurturingDirection !== undefined ? (nurturingDirection || null) : (lead as any).nurturingDirection,
        // Step 5 — Nurturing
        nurturingStatus: nurturingStatus !== undefined ? (nurturingStatus || null) : (lead as any).nurturingStatus,
        nurturingChannel: nurturingChannel !== undefined ? (nurturingChannel || null) : (lead as any).nurturingChannel,
        conversationNotes: conversationNotes !== undefined ? (conversationNotes || null) : (lead as any).conversationNotes,
        reopenAt: reopenAt !== undefined ? (reopenAt ? new Date(reopenAt) : null) : (lead as any).reopenAt,
        // Always bump lastActivityAt
        lastActivityAt: new Date(),
      },
      include: {
        User: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        LeadStage: {
          select: { id: true, name: true, label: true, color: true },
        },
        LeadSource: {
          select: { id: true, name: true },
        },
      },
    });

    // Write audit log entries for tracked changes
    if (auditEntries.length > 0) {
      const now = new Date();
      await db.auditLog.createMany({
        data: auditEntries.map((entry) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          leadId: id,
          brandId: lead.brandId,
          action: entry.action,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          changedBy: user.id,
          changedAt: now,
        })),
      });
    }

    // ─── System-Generated Timeline Activity Logging ──────────────────────────
    // 1. Stage Changed
    if (finalStageId !== lead.stageId) {
      const oldStageLabel = lead.LeadStage?.label ?? "Intake";
      const newStage = finalStageId ? stages.find(s => s.id === finalStageId) : null;
      const newStageLabel = newStage?.label ?? "Unknown";
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "STAGE",
          content: `Stage changed: ${oldStageLabel} → ${newStageLabel}`,
        },
      });
    }

    // 2. Owner Changed
    if (ownerId !== undefined && ownerId !== lead.ownerId) {
      const newOwner = ownerId ? await db.user.findUnique({ where: { id: ownerId } }) : null;
      const newOwnerName = newOwner ? `${newOwner.firstName || ""} ${newOwner.lastName || ""}`.trim() : "Unassigned";
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "OWNER",
          content: `Owner assigned: ${newOwnerName}`,
        },
      });
    }

    // 3. Business Review Saved
    const brFields = [
      "businessModel", "businessAge", "teamSize", "revenueRange",
      "primaryChannel", "opportunities", "outreachAngle", "relevantServices",
      "valueProposition", "currentSituation", "painPoints", "opportunityNotes",
      "businessConfidence"
    ];
    const hasBrChanges = brFields.some((field) => body[field] !== undefined && body[field] !== (lead as any)[field]);
    if (hasBrChanges) {
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "DEFAULT",
          content: "Business Review saved",
        },
      });
    }

    // 4. Qualification Completed
    const qualFieldsList = [
      "qualIcpFit", "qualBudgetLikelihood", "qualDecisionMakerAccess",
      "qualOperationalFeasibility", "qualServiceAlignment", "qualGrowthPotential"
    ];
    const hasQualChanges = qualFieldsList.some((field) => body[field] !== undefined && body[field] !== (lead as any)[field]);
    if (hasQualChanges) {
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "DEFAULT",
          content: `Qualification completed (Score: ${finalQualScore ?? lead.qualScore ?? 0})`,
        },
      });
    }

    // 5. Classification Updated
    if (
      (classification !== undefined && classification !== lead.classification) ||
      (nurturingDirection !== undefined && nurturingDirection !== lead.nurturingDirection)
    ) {
      const val = classification || lead.classification || "None";
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "DEFAULT",
          content: `Classification updated: ${val}`,
        },
      });
    }

    // 6. Nurturing Updated
    if (
      (nurturingStatus !== undefined && nurturingStatus !== lead.nurturingStatus) ||
      (nurturingChannel !== undefined && nurturingChannel !== lead.nurturingChannel)
    ) {
      const statusVal = nurturingStatus || lead.nurturingStatus || "None";
      const channelVal = nurturingChannel || lead.nurturingChannel || "None";
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "DEFAULT",
          content: `Nurturing updated: Status: ${statusVal.replace(/_/g, " ")}, Channel: ${channelVal}`,
        },
      });
    }

    // 7. Lead Closed
    if (winLossStatus !== undefined && winLossStatus !== lead.winLossStatus) {
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "DEFAULT",
          content: `Lead Closed: ${winLossStatus}`,
        },
      });
    }

    // 8. Lead Reopened / Scheduled
    if (reopenAt === null && lead.reopenAt !== null) {
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "DEFAULT",
          content: "Lead Reopened",
        },
      });
    } else if (reopenAt !== undefined && reopenAt !== lead.reopenAt) {
      const formattedDate = new Date(reopenAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      await db.activity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: "DEFAULT",
          content: `Reactivation scheduled for ${formattedDate}`,
        },
      });
    }

    const mappedLead = {
      ...updatedLead,
      owner: updatedLead.User || null,
      stage: updatedLead.LeadStage || null,
      source: updatedLead.LeadSource || null,
    };

    return NextResponse.json(mappedLead);
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await verifyLeadAccess(id);
  const { lead, user } = result;
  if (!lead || !user) {
    return NextResponse.json({ error: result.error || "Not Found" }, { status: result.status || 404 });
  }

  try {
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
