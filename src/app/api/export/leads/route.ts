import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

// ── GET /api/export/leads — Export leads as XLSX ──
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { organizationId: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const temperature = searchParams.get("temperature");

    const leads = await db.lead.findMany({
      where: {
        organizationId: user.organizationId,
        ...(stage && { pipelineStage: stage as never }),
        ...(temperature && { temperature: temperature as never }),
      },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build worksheet rows
    const rows = leads.map((l) => ({
      "First Name": l.firstName,
      "Last Name": l.lastName,
      "Email": l.email ?? "",
      "Phone": l.phone ?? "",
      "Company": l.company ?? "",
      "Industry": l.industry ?? "",
      "Job Title": l.jobTitle ?? "",
      "LinkedIn": l.linkedIn ?? "",
      "Source": l.sourceTag ?? l.source ?? "",
      "Pipeline Stage": l.pipelineStage,
      "Temperature": l.temperature ?? "",
      "ICP Score": l.icpScore,
      "ICP Industry": l.icpIndustry,
      "ICP Revenue": l.icpRevenue,
      "ICP Urgency": l.icpUrgency,
      "ICP Decision Access": l.icpDecisionAccess,
      "ICP Budget Fit": l.icpBudget,
      "Decision Maker": l.decisionMaker ?? "",
      "Budget Range": l.budget ?? "",
      "Timeline": l.timeline ?? "",
      "Pain Points": l.painPoints ?? "",
      "Notes": l.notes ?? "",
      "Owner": `${l.owner.firstName ?? ""} ${l.owner.lastName ?? ""}`.trim(),
      "Owner Email": l.owner.email,
      "Created At": l.createdAt.toISOString().split("T")[0],
      "Updated At": l.updatedAt.toISOString().split("T")[0],
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    // Auto-size columns
    const colWidths = Object.keys(rows[0] ?? {}).map((k) => ({ wch: Math.max(k.length, 15) }));
    ws["!cols"] = colWidths;

    // Write as ArrayBuffer to avoid Node Buffer BodyInit conflict
    const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const filename = `mergex-leads-${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[export/leads:GET]", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
