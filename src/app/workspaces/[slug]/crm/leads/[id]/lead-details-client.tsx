"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft, Trophy, XCircle, Loader2, Phone, MessageSquare, Mail, FileText, CheckCircle2, MoreHorizontal, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { StageProgressBar } from "../_components/stage-progress-bar";
import { LeadInfoPanel } from "../_components/lead-info-panel";
import { HandoverPanel } from "../_components/handover-panel";
import { OverviewTab } from "../_components/overview-tab";
import { BusinessReviewTab } from "../_components/business-review-tab";
import { BantTab } from "../_components/bant-tab";
import { ClassificationTab } from "../_components/classification-tab";
import { WinLossDialog } from "../_components/win-loss-dialog";
import { LeadSidebar } from "./lead-sidebar";

// Helper functions for lead completeness and stage mapping
function calculateCompleteness(lead: Lead) {
  const fields = [
    lead.companyName,
    lead.contactPerson,
    lead.phone,
    lead.email,
    lead.website,
    lead.sourceId,
    lead.currentSituation,
    lead.painPoints && lead.painPoints.length > 0 ? "filled" : null,
    lead.opportunityNotes,
    lead.bantBudget > 0 ? "filled" : null,
    lead.bantAuthority > 0 ? "filled" : null,
    lead.bantNeed > 0 ? "filled" : null,
    lead.bantTimeline > 0 ? "filled" : null,
    lead.icpScore > 0 ? "filled" : null,
    lead.services && lead.services.length > 0 ? "filled" : null,
    lead.priority,
    lead.expectedValue,
    lead.decisionMaker,
    lead.influencer,
    lead.champion,
    lead.financeContact
  ];
  const filled = fields.filter(val => val !== null && val !== undefined && val !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function getOverviewCompletion(lead: Lead) {
  const fields = [lead.companyName, lead.contactPerson, lead.phone, lead.email, lead.website, lead.sourceId];
  const filled = fields.filter(Boolean).length;
  return { filled, total: fields.length, isComplete: filled === fields.length };
}

function getBusinessReviewCompletion(lead: Lead) {
  const fields = [
    lead.currentSituation,
    lead.painPoints && lead.painPoints.length > 0 ? "filled" : null,
    lead.opportunityNotes
  ];
  const filled = fields.filter(Boolean).length;
  return { filled, total: fields.length, isComplete: filled === fields.length };
}

function getQualificationCompletion(lead: Lead) {
  const fields = [
    lead.bantBudget > 0 ? "filled" : null,
    lead.bantAuthority > 0 ? "filled" : null,
    lead.bantNeed > 0 ? "filled" : null,
    lead.bantTimeline > 0 ? "filled" : null
  ];
  const filled = fields.filter(Boolean).length;
  return { filled, total: fields.length, isComplete: filled === fields.length };
}

function getClassificationCompletion(lead: Lead) {
  const fields = [
    lead.icpScore > 0 ? "filled" : null,
    lead.services && lead.services.length > 0 ? "filled" : null,
    lead.priority,
    lead.expectedValue
  ];
  const filled = fields.filter(Boolean).length;
  return { filled, total: fields.length, isComplete: filled === fields.length };
}

function getTabForStage(stageName: string): string {
  const name = (stageName || "").toUpperCase();
  if (name.includes("INTAKE")) return "overview";
  if (name.includes("REVIEW")) return "review";
  if (name.includes("QUALIFICATION") && !name.includes("AUDIT")) return "bant";
  if (name.includes("CLASSIFICATION")) return "classification";
  return "classification";
}


import {
  Lead,
  OptionStage,
  OptionSource,
  OptionUser,
  overviewSchema,
  OverviewFormValues,
  businessReviewSchema,
  BusinessReviewFormValues,
  bantSchema,
  BantFormValues,
} from "../_components/types";

interface LeadDetailsClientProps {
  leadId: string;
}

export function LeadDetailsClient({ leadId }: LeadDetailsClientProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  // Core Entity States
  const [lead, setLead] = useState<Lead | null>(null);
  const [stages, setStages] = useState<OptionStage[]>([]);
  const [sources, setSources] = useState<OptionSource[]>([]);
  const [owners, setOwners] = useState<OptionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStage, setSavingStage] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);

  // Quick action tab navigation
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarActiveAction, setSidebarActiveAction] = useState<"CALL" | "EMAIL" | "WHATSAPP" | "NOTE" | null>(null);

  // Win/Loss State
  const [showWinLossDialog, setShowWinLossDialog] = useState(false);
  const [winLossStatus, setWinLossStatus] = useState<"WON" | "LOST">("WON");
  const [winLossReason, setWinLossReason] = useState("");
  const [winLossNotes, setWinLossNotes] = useState("");
  const [savingWinLoss, setSavingWinLoss] = useState(false);

  // Client Handover State
  const [handoverEM, setHandoverEM] = useState("");
  const [convertingToClient, setConvertingToClient] = useState(false);

  // Form Initializations
  const overviewForm = useForm<OverviewFormValues>({ resolver: zodResolver(overviewSchema) as Resolver<OverviewFormValues> });
  const businessReviewForm = useForm<BusinessReviewFormValues>({ resolver: zodResolver(businessReviewSchema) as Resolver<BusinessReviewFormValues> });
  const bantForm = useForm<BantFormValues>({ resolver: zodResolver(bantSchema) as Resolver<BantFormValues> });

  // ── Data Loader ─────────────────────────────────────────────────────────────

  const loadLeadData = useCallback(async () => {
    // Avoid calling setState synchronously within effect
    await Promise.resolve();
    try {
      setLoading(true);
      const [optRes, leadRes] = await Promise.all([
        fetch(`/api/crm/options`),
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
      if (data.stage?.name) {
        setActiveTab(getTabForStage(data.stage.name));
      }

      // Populate form defaults
      overviewForm.reset({
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email || "",
        phone: data.phone || "",
        website: data.website || "",
        industry: data.industry || "",
        sourceId: data.sourceId || "",
        ownerId: data.ownerId || "",
        priority: data.priority as "HIGH" | "MEDIUM" | "LOW",
        temperature: data.temperature as "HOT" | "WARM" | "COLD",
        expectedValue: data.expectedValue ? String(data.expectedValue) : "",
        services: data.services.join(", "),
        decisionMaker: data.decisionMaker || "",
        influencer: data.influencer || "",
        champion: data.champion || "",
        financeContact: data.financeContact || "",
      });

      businessReviewForm.reset({
        currentSituation: data.currentSituation || "",
        painPoints: data.painPoints.join(", "),
        // opportunityNotes stores opportunities as comma-delimited
        opportunityNotes: data.opportunityNotes || "",
      });

      bantForm.reset({
        bantBudget: data.bantBudget,
        bantAuthority: data.bantAuthority,
        bantNeed: data.bantNeed,
        bantTimeline: data.bantTimeline,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to load lead details";
      toast.error(msg);
      router.push(`/workspaces/${slug}/crm/leads`);
    } finally {
      setLoading(false);
    }
  }, [leadId, slug, router, overviewForm, businessReviewForm, bantForm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [leadId, loadLeadData]);

  // ── Quick Action Handlers ───────────────────────────────────────────────────

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
      const updated = await res.json();
      setLead(updated);
      if (updated.stage?.name) {
        setActiveTab(getTabForStage(updated.stage.name));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update stage");
    } finally {
      setSavingStage(false);
    }
  };

  const handleOwnerChange = async (ownerId: string) => {
    try {
      setSavingOwner(true);
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId }),
      });
      if (!res.ok) throw new Error("Failed to update owner");
      toast.success("Owner updated");
      setLead(await res.json());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update owner");
    } finally {
      setSavingOwner(false);
    }
  };

  // Quick action handler - navigate to relevant tab
  const handleQuickAction = (type: "EMAIL" | "MEETING" | "PROPOSAL") => {
    if (type === "EMAIL") setActiveTab("activities");
    if (type === "MEETING") setActiveTab("meetings");
    if (type === "PROPOSAL") setActiveTab("proposals");
  };

  // ── Tab Submit Handlers ──────────────────────────────────────────────────────

  const onOverviewSubmit = async (values: OverviewFormValues) => {
    try {
      const servicesArray = values.services
        ? values.services.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, services: servicesArray }),
      });
      if (!res.ok) throw new Error("Failed to update overview");
      toast.success("Overview saved");
      setLead(await res.json());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save overview");
    }
  };

  const onBusinessReviewSubmit = async (values: BusinessReviewFormValues) => {
    try {
      const painPointsArray = values.painPoints
        ? values.painPoints.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSituation: values.currentSituation,
          opportunityNotes: values.opportunityNotes,
          painPoints: painPointsArray,
        }),
      });
      if (!res.ok) throw new Error("Failed to update business review");
      toast.success("Business Review saved");
      setLead(await res.json());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save business review");
    }
  };

  const onBantSubmit = async (values: BantFormValues) => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update BANT qualification");
      toast.success("Qualification metrics saved");
      setLead(await res.json());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save BANT");
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
        <p className="text-sm text-muted-foreground">Loading Lead Profile...</p>
      </div>
    );
  }

  if (!lead) return null;

  const isWon = lead.winLossStatus === "WON";

  // Calculate completeness and completion badges client-side
  const completeness = calculateCompleteness(lead);
  const overviewComp = getOverviewCompletion(lead);
  const reviewComp = getBusinessReviewCompletion(lead);
  const qualComp = getQualificationCompletion(lead);
  const classComp = getClassificationCompletion(lead);

  return (
    <div className="space-y-5">
      {/* Redesigned Premium Page Header */}
      <div className="flex flex-col gap-4 border border-border/30 rounded-2xl bg-card/30 p-5 shadow-sm">
        {/* Back Link & Win/Loss Status */}
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
                className="text-xs border-border/40 hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20 h-8 font-semibold"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Close Lead
              </Button>
            )}
          </div>
        </div>

        {/* Title, Subtitle, and Completeness */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">{lead.companyName}</h1>
              {lead.leadNumber && (
                <Badge variant="outline" className="bg-[#8B5CF6]/5 border-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold px-2 h-5">
                  {lead.leadNumber}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {lead.industry && <span>{lead.industry} · </span>}
              {lead.source?.name && <span>{lead.source.name} · </span>}
              <span>Created {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </p>
          </div>

          {/* Global Completeness indicator */}
          <div className="flex items-center gap-3 bg-muted/20 border border-border/20 px-4 py-2.5 rounded-xl self-start md:self-auto min-w-[200px]">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                <span>Lead Completeness</span>
                <span className="text-[#8B5CF6]">{completeness}%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-violet-500 to-[#8B5CF6] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Quick Actions Command Bar */}
        <div className="border-t border-border/10 pt-4 flex flex-wrap gap-2">
          {[
            {
              id: "call",
              label: "Call",
              icon: Phone,
              disabled: !lead.phone,
              action: () => {
                if (lead.phone) window.location.href = `tel:${lead.phone}`;
              },
            },
            {
              id: "whatsapp",
              label: "WhatsApp",
              icon: MessageSquare,
              disabled: !lead.phone,
              action: () => {
                if (lead.phone) {
                  const clean = lead.phone.replace(/\D/g, "");
                  window.open(`https://wa.me/${clean}`, "_blank");
                }
              },
            },
            {
              id: "email",
              label: "Email",
              icon: Mail,
              disabled: !lead.email,
              action: () => {
                if (lead.email) window.location.href = `mailto:${lead.email}`;
              },
            },
            {
              id: "note",
              label: "Add Note",
              icon: StickyNote,
              disabled: false,
              action: () => {
                setSidebarActiveAction("NOTE");
              },
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                size="sm"
                variant="outline"
                disabled={action.disabled}
                onClick={action.action}
                className="h-8 text-xs border-border/40 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 hover:text-[#8B5CF6] font-semibold flex items-center gap-1.5 transition-all active:scale-95 duration-100"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground/75" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Next Action Banner - shown when set */}
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

      {/* ── Stage Progress Bar ─────────────────────────────── */}
      {stages.length > 0 && (
        <div className="border border-border/30 rounded-2xl bg-card/30 py-6 px-5 overflow-hidden">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">
            Pipeline Journey
          </p>
          <StageProgressBar
            stages={stages}
            currentStageId={lead.stageId}
            onStageClick={handleStageChange}
            saving={savingStage}
            lead={lead}
          />
        </div>
      )}

      {/* Main Grid Layout - 3 columns on xl, 2 on lg, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_300px] gap-6">
        {/* Left Column - Info Panel */}
        <div className="space-y-4">
          <LeadInfoPanel
            lead={lead}
            stages={stages}
            owners={owners}
            savingStage={savingStage}
            savingOwner={savingOwner}
            onStageChange={handleStageChange}
            onOwnerChange={handleOwnerChange}
            onLeadUpdate={setLead}
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

        {/* Center Column - Tabs */}
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="bg-muted/40 p-1 w-full justify-start overflow-x-auto flex h-10 border-b border-border/20 rounded-xl gap-1">
              <TabsTrigger
                value="overview"
                className="text-xs xl:text-[11px] font-semibold px-4 xl:px-2.5 rounded-lg data-[state=active]:bg-card whitespace-nowrap flex items-center gap-1.5 xl:gap-1"
              >
                Overview
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 h-4 bg-muted-foreground/10 text-muted-foreground font-bold shrink-0"
                >
                  {overviewComp.isComplete ? "✓" : `${overviewComp.filled}/${overviewComp.total}`}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="text-xs xl:text-[11px] font-semibold px-4 xl:px-2.5 rounded-lg data-[state=active]:bg-card whitespace-nowrap flex items-center gap-1.5 xl:gap-1"
              >
                Business Review
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 h-4 bg-muted-foreground/10 text-muted-foreground font-bold shrink-0"
                >
                  {reviewComp.isComplete ? "✓" : `${reviewComp.filled}/${reviewComp.total}`}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="bant"
                className="text-xs xl:text-[11px] font-semibold px-4 xl:px-2.5 rounded-lg data-[state=active]:bg-card whitespace-nowrap flex items-center gap-1.5 xl:gap-1"
              >
                Qualification
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 h-4 bg-muted-foreground/10 text-muted-foreground font-bold shrink-0"
                >
                  {qualComp.isComplete ? "✓" : `${qualComp.filled}/${qualComp.total}`}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="classification"
                className="text-xs xl:text-[11px] font-semibold px-4 xl:px-2.5 rounded-lg data-[state=active]:bg-card whitespace-nowrap flex items-center gap-1.5 xl:gap-1"
              >
                Classification
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 h-4 bg-muted-foreground/10 text-muted-foreground font-bold shrink-0"
                >
                  {classComp.isComplete ? "✓" : `${classComp.filled}/${classComp.total}`}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <OverviewTab form={overviewForm} sources={sources} onSubmit={onOverviewSubmit} />
            </TabsContent>

            <TabsContent value="review" className="mt-0">
              <BusinessReviewTab form={businessReviewForm} onSubmit={onBusinessReviewSubmit} />
            </TabsContent>

            <TabsContent value="bant" className="mt-0">
              <BantTab form={bantForm} bantScore={lead.bantScore} onSubmit={onBantSubmit} />
            </TabsContent>

            <TabsContent value="classification" className="mt-0">
              <ClassificationTab form={overviewForm} onSubmit={onOverviewSubmit} leadId={leadId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - hidden on lg, visible on xl+ */}
        <div className="hidden xl:block">
          <LeadSidebar
            lead={lead}
            activeAction={sidebarActiveAction}
            onActiveActionChange={setSidebarActiveAction}
          />
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
