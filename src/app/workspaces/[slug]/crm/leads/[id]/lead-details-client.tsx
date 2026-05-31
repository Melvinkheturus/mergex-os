"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft, Trophy, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LeadInfoPanel } from "../_components/lead-info-panel";
import { HandoverPanel } from "../_components/handover-panel";
import { OverviewTab } from "../_components/overview-tab";
import { BusinessReviewTab } from "../_components/business-review-tab";
import { BantTab } from "../_components/bant-tab";
import { ActivitiesTab } from "../_components/activities-tab";
import { MeetingsTab } from "../_components/meetings-tab";
import { ProposalsTab } from "../_components/proposals-tab";
import { WinLossDialog } from "../_components/win-loss-dialog";

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
  const overviewForm = useForm<any>({ resolver: zodResolver(overviewSchema) });
  const businessReviewForm = useForm<any>({ resolver: zodResolver(businessReviewSchema) });
  const bantForm = useForm<any>({ resolver: zodResolver(bantSchema) });

  // ── Data Loader ─────────────────────────────────────────────────────────────

  const loadLeadData = useCallback(async () => {
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
      });

      businessReviewForm.reset({
        currentSituation: data.currentSituation || "",
        painPoints: data.painPoints.join(", "),
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
    loadLeadData();
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
      setLead(await res.json());
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

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/workspaces/${slug}/crm/leads`)}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Leads
        </Button>

        <div className="flex items-center gap-2">
          {lead.winLossStatus ? (
            <Badge
              className={
                isWon
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }
            >
              {isWon ? <Trophy className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              {lead.winLossStatus} {lead.winLossReason ? `— ${lead.winLossReason}` : ""}
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowWinLossDialog(true)}
              className="text-xs border-border/40"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Close Lead
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <LeadInfoPanel
            lead={lead}
            stages={stages}
            owners={owners}
            savingStage={savingStage}
            savingOwner={savingOwner}
            onStageChange={handleStageChange}
            onOwnerChange={handleOwnerChange}
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

        {/* Right Column — Tabs */}
        <div className="min-w-0">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/40 p-1 w-full justify-start overflow-x-auto flex h-10 border-b border-border/20 rounded-xl">
              <TabsTrigger value="overview" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-card">
                Overview
              </TabsTrigger>
              <TabsTrigger value="review" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-card">
                Business Review
              </TabsTrigger>
              <TabsTrigger value="bant" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-card">
                Qualification
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-card">
                Activities
              </TabsTrigger>
              <TabsTrigger value="meetings" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-card">
                Meetings
              </TabsTrigger>
              <TabsTrigger value="proposals" className="text-xs font-semibold px-4 rounded-lg data-[state=active]:bg-card">
                Proposals
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

            <TabsContent value="activities" className="mt-0">
              <ActivitiesTab leadId={leadId} />
            </TabsContent>

            <TabsContent value="meetings" className="mt-0">
              <MeetingsTab leadId={leadId} />
            </TabsContent>

            <TabsContent value="proposals" className="mt-0">
              <ProposalsTab leadId={leadId} />
            </TabsContent>
          </Tabs>
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
