"use client";

import { UseFormReturn } from "react-hook-form";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { OverviewFormValues, OptionSource } from "./types";

interface OverviewTabProps {
  form: UseFormReturn<any>;
  sources: OptionSource[];
  onSubmit: (values: OverviewFormValues) => Promise<void>;
}

export function OverviewTab({ form, sources, onSubmit }: OverviewTabProps) {
  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader>
        <CardTitle className="text-sm font-bold">Lead Profile Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="font-semibold">Company Name</Label>
              <Input id="companyName" className="h-9 text-sm" {...form.register("companyName")} />
              {form.formState.errors.companyName && (
                <span className="text-red-500 text-[10px]">{form.formState.errors.companyName.message as string}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson" className="font-semibold">Contact Person</Label>
              <Input id="contactPerson" className="h-9 text-sm" {...form.register("contactPerson")} />
              {form.formState.errors.contactPerson && (
                <span className="text-red-500 text-[10px]">{form.formState.errors.contactPerson.message as string}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input id="email" type="email" className="h-9 text-sm" {...form.register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="font-semibold">Phone</Label>
              <Input id="phone" className="h-9 text-sm" {...form.register("phone")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="website" className="font-semibold">Website</Label>
              <Input id="website" className="h-9 text-sm" {...form.register("website")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="font-semibold">Industry</Label>
              <Input id="industry" className="h-9 text-sm" {...form.register("industry")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expectedValue" className="font-semibold">Expected Value (₹)</Label>
              <Input id="expectedValue" type="number" className="h-9 text-sm" {...form.register("expectedValue")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">Temperature</Label>
              <Select
                value={form.watch("temperature")}
                onValueChange={(v) => form.setValue("temperature", v as "HOT" | "WARM" | "COLD")}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLD">Cold</SelectItem>
                  <SelectItem value="WARM">Warm</SelectItem>
                  <SelectItem value="HOT">Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(v) => form.setValue("priority", v as "HIGH" | "MEDIUM" | "LOW")}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Source</Label>
              <Select
                value={form.watch("sourceId") || "none"}
                onValueChange={(v) => form.setValue("sourceId", v === "none" ? "" : v)}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Source</SelectItem>
                  {sources.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="services" className="font-semibold">Services Interested (comma separated)</Label>
            <Input id="services" className="h-9 text-sm" placeholder="Web Dev, Marketing..." {...form.register("services")} />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
              <Save className="h-4 w-4 mr-1.5" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
