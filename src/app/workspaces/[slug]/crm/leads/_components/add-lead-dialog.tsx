"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { leadFormSchema, LeadFormValues, OptionStage, OptionSource, OptionUser } from "./types";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: OptionStage[];
  sources: OptionSource[];
  owners: OptionUser[];
  onSubmit: (values: LeadFormValues) => Promise<void>;
}

export function AddLeadDialog({
  open,
  onOpenChange,
  stages,
  sources,
  owners,
  onSubmit,
}: AddLeadDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      sourceId: "",
      stageId: "",
      ownerId: "",
      icpScore: 0,
      temperature: "COLD",
      expectedValue: "",
      priority: "MEDIUM",
      services: "",
    },
  });

  // Reset form when dialog closes/opens
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = async (values: LeadFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Add New Lead</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter the lead details below to add them to your pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-xs font-semibold">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="Enter company name..."
                {...register("companyName")}
                className="h-9 text-sm"
              />
              {errors.companyName && (
                <span className="text-[10px] text-red-500 font-medium">{errors.companyName.message as string}</span>
              )}
            </div>

            {/* Contact Person */}
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson" className="text-xs font-semibold">Contact Person *</Label>
              <Input
                id="contactPerson"
                placeholder="John Doe..."
                {...register("contactPerson")}
                className="h-9 text-sm"
              />
              {errors.contactPerson && (
                <span className="text-[10px] text-red-500 font-medium">{errors.contactPerson.message as string}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-email" className="text-xs font-semibold">Email</Label>
              <Input
                id="dlg-email"
                type="email"
                placeholder="johndoe@company.com..."
                {...register("email")}
                className="h-9 text-sm"
              />
              {errors.email && (
                <span className="text-[10px] text-red-500 font-medium">{errors.email.message as string}</span>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-phone" className="text-xs font-semibold">Phone</Label>
              <Input
                id="dlg-phone"
                placeholder="+91..."
                {...register("phone")}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Website */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-website" className="text-xs font-semibold">Website</Label>
              <Input
                id="dlg-website"
                placeholder="https://..."
                {...register("website")}
                className="h-9 text-sm"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-industry" className="text-xs font-semibold">Industry</Label>
              <Input
                id="dlg-industry"
                placeholder="SaaS / retail / etc..."
                {...register("industry")}
                className="h-9 text-sm"
              />
            </div>

            {/* Expected Deal Value */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-expectedValue" className="text-xs font-semibold">Expected Deal Value (₹)</Label>
              <Input
                id="dlg-expectedValue"
                type="number"
                placeholder="Value in INR..."
                {...register("expectedValue")}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Source */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Source</Label>
              <Select value={watch("sourceId") || ""} onValueChange={(v) => setValue("sourceId", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Initial Stage</Label>
              <Select value={watch("stageId") || ""} onValueChange={(v) => setValue("stageId", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((st) => (
                    <SelectItem key={st.id} value={st.id}>{st.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Owner */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign Owner</Label>
              <Select value={watch("ownerId") || ""} onValueChange={(v) => setValue("ownerId", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select Owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.firstName} {o.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Temperature */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Temperature</Label>
              <Select value={watch("temperature")} onValueChange={(v: "HOT" | "WARM" | "COLD") => setValue("temperature", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Cold/Warm/Hot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLD">Cold</SelectItem>
                  <SelectItem value="WARM">Warm</SelectItem>
                  <SelectItem value="HOT">Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Priority</Label>
              <Select value={watch("priority")} onValueChange={(v: "HIGH" | "MEDIUM" | "LOW") => setValue("priority", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ICP Score */}
            <div className="space-y-1.5">
              <Label htmlFor="dlg-icpScore" className="text-xs font-semibold">ICP Match (0-100)</Label>
              <Input
                id="dlg-icpScore"
                type="number"
                min="0"
                max="100"
                placeholder="85..."
                {...register("icpScore")}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Services Interested */}
          <div className="space-y-1.5">
            <Label htmlFor="dlg-services" className="text-xs font-semibold">Services Interested</Label>
            <Input
              id="dlg-services"
              placeholder="Consulting, Web Development, Marketing (comma separated)..."
              {...register("services")}
              className="h-9 text-sm"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
