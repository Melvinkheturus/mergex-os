"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { proposalSchema, ProposalFormValues, Proposal } from "./types";
import { ProposalStatusBadge } from "./ui-helpers";

interface ProposalsTabProps {
  leadId: string;
}

export function ProposalsTab({ leadId }: ProposalsTabProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      status: "DRAFT",
      proposalNumber: "",
      title: "",
      value: 0,
      notes: "",
    },
  });

  const loadProposals = useCallback(async () => {
    setLoadingProposals(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/proposals`);
      if (res.ok) {
        setProposals(await res.json());
      } else {
        toast.error("Failed to load proposals");
      }
    } catch {
      toast.error("An error occurred loading proposals");
    } finally {
      setLoadingProposals(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const onProposalSubmit = async (values: ProposalFormValues) => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create proposal");
      }
      toast.success("Proposal created");
      form.reset({
        status: "DRAFT",
        proposalNumber: "",
        title: "",
        value: 0,
        notes: "",
      });
      setShowProposalForm(false);
      loadProposals();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create proposal");
    }
  };

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold">Proposals</CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 border-border/40"
          onClick={() => setShowProposalForm((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> New Proposal
        </Button>
      </CardHeader>

      {showProposalForm && (
        <CardContent className="pt-0 pb-4 border-b border-border/20">
          <form onSubmit={form.handleSubmit(onProposalSubmit)} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold">Proposal Number</Label>
                <Input className="h-9 text-sm" placeholder="MX-2024-001" {...form.register("proposalNumber")} />
                {form.formState.errors.proposalNumber && (
                  <span className="text-red-500 text-[10px]">{form.formState.errors.proposalNumber.message as string}</span>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold">Value (₹)</Label>
                <Input type="number" className="h-9 text-sm" placeholder="50000" {...form.register("value")} />
                {form.formState.errors.value && (
                  <span className="text-red-500 text-[10px]">{form.formState.errors.value.message as string}</span>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Proposal Title</Label>
              <Input className="h-9 text-sm" placeholder="Website Redesign + SEO Package" {...form.register("title")} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as ProposalFormValues["status"])}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Notes</Label>
              <Textarea placeholder="Additional context or conditions..." rows={2} {...form.register("notes")} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowProposalForm(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs h-8"
              >
                {form.formState.isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      )}

      <CardContent className="pt-4 pb-2">
        {loadingProposals ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground font-semibold">No proposals yet</p>
            <p className="text-[10px] text-muted-foreground">Create a commercial proposal to track deal value and status.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => (
              <div key={p.id} className="flex gap-3 p-3.5 rounded-xl border border-border/30 bg-muted/20">
                <div className="shrink-0 w-7 h-7 rounded-full border bg-purple-500/10 border-purple-500/20 text-purple-500 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between flex-wrap">
                    <div>
                      <span className="text-xs font-bold text-foreground">{p.title}</span>
                      <span className="text-[10px] text-muted-foreground ml-2 font-mono">#{p.proposalNumber}</span>
                    </div>
                    <ProposalStatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground flex-wrap">
                    <span className="font-bold text-foreground/80">₹{Number(p.value).toLocaleString("en-IN")}</span>
                    <span>· Created {new Date(p.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                    {p.sentAt && <span>· Sent {new Date(p.sentAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>}
                  </div>
                  {p.notes && <p className="text-[10px] text-muted-foreground mt-1.5 italic">{p.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
