import { db } from "@/lib/db";

export async function seedBrandDefaults(brandId: string) {
  // 1. Seed Lead Sources
  const sources = [
    "LinkedIn",
    "Instagram",
    "Website",
    "Referral",
    "Cold Call",
    "WhatsApp",
    "Email",
    "Event",
    "Other",
  ];

  await Promise.all(
    sources.map((name) =>
      db.leadSource.upsert({
        where: { brandId_name: { brandId, name } },
        update: {},
        create: { brandId, name, isSystem: true },
      })
    )
  );

  // 2. Seed Lead Stages
  // ── Phase A: Lead Operations (stages 0–5) ───────────────────────────
  // ── Phase B: Sales Conversion (stages 6–9) ──────────────────────────
  // ── Terminal States (10–12, not shown in progress bar) ──────────────
  const stages = [
    {
      name: "LEAD_INTAKE",
      label: "Lead Intake",
      order: 0,
      color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    },
    {
      name: "BUSINESS_REVIEW",
      label: "Business Review",
      order: 1,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "LEAD_QUALIFICATION",
      label: "Lead Qualification",
      order: 2,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      name: "LEAD_CLASSIFICATION",
      label: "Lead Classification",
      order: 3,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    },
    {
      name: "LEAD_NURTURING",
      label: "Lead Nurturing",
      order: 4,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    {
      name: "QUALIFICATION_AUDIT",
      label: "Qualification Audit",
      order: 5,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      name: "MEETING",
      label: "Meeting Readiness",
      order: 6,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      name: "PROPOSAL",
      label: "Proposal",
      order: 7,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
    },
    {
      name: "DOCUMENTATION",
      label: "Documentation",
      order: 8,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "ENGAGEMENT_MANAGER_ASSIGNED",
      label: "Engagement Manager", // Full label - terminal phase of CRM workflow
      order: 9,
      color: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20",
    },
    // ── Terminal outcome states - not part of the workflow progress bar ──
    {
      name: "WON",
      label: "Won",
      order: 10,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "LOST",
      label: "Lost",
      order: 11,
      color: "text-red-500 bg-red-500/10 border-red-500/20",
    },
    {
      name: "ON_HOLD",
      label: "On Hold",
      order: 12,
      color: "text-gray-500 bg-gray-500/10 border-gray-500/20",
    },
  ];

  await Promise.all(
    stages.map((stage) =>
      db.leadStage.upsert({
        where: { brandId_name: { brandId, name: stage.name } },
        update: { label: stage.label, order: stage.order, color: stage.color },
        create: {
          brandId,
          name: stage.name,
          label: stage.label,
          order: stage.order,
          color: stage.color,
          isSystem: true,
        },
      })
    )
  );
}
