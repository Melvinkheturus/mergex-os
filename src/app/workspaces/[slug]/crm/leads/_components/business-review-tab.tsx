"use client";

import { UseFormReturn } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessReviewFormValues } from "./types";

interface BusinessReviewTabProps {
  form: UseFormReturn<any>;
  onSubmit: (values: BusinessReviewFormValues) => Promise<void>;
}

export function BusinessReviewTab({ form, onSubmit }: BusinessReviewTabProps) {
  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader>
        <CardTitle className="text-sm font-bold">Lead Enrichment & Audits</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="currentSituation" className="font-semibold">Current Business Situation</Label>
            <Textarea
              id="currentSituation"
              placeholder="Describe the client's current workflow, scale, and operational background..."
              rows={3}
              {...form.register("currentSituation")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="painPoints" className="font-semibold">Pain Points Identified (comma separated)</Label>
            <Input
              id="painPoints"
              placeholder="No Website, Low Conversion, Poor Branding..."
              className="h-9 text-sm"
              {...form.register("painPoints")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opportunityNotes" className="font-semibold">Opportunity Notes</Label>
            <Textarea
              id="opportunityNotes"
              placeholder="Outline where MergeX services can support client growth gaps..."
              rows={3}
              {...form.register("opportunityNotes")}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
              <Save className="h-4 w-4 mr-1.5" /> Save Audit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
