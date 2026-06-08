"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IntakeFormValues, OptionSource, OptionUser, Lead } from "./types";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface StepIntakeFormProps {
  form: UseFormReturn<IntakeFormValues>;
  sources: OptionSource[];
  owners: OptionUser[];
  lead?: Lead;
  onSubmit: (values: IntakeFormValues) => Promise<void>;
}

export function StepIntakeForm({ form, sources, owners, lead, onSubmit }: StepIntakeFormProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const { user: currentUser } = useCurrentUser();

  const selectedSourceId = watch("sourceId");
  const selectedSource = sources.find((s) => s.id === selectedSourceId);
  const showSourceDetails = selectedSource?.name.toLowerCase() === "other";

  const assignedBy = currentUser?.fullName || "System";
  const assignedDate = lead?.createdAt
    ? new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-xs">
      {/* Section 1: Company Information */}
      <div className="space-y-4">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
          Section 1 — Company Information
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-xs font-semibold text-foreground">
              Company Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Enter company name..."
              {...register("companyName")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.companyName && (
              <p className="text-[10px] text-red-500 font-medium">{errors.companyName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-xs font-semibold text-foreground">Website</Label>
            <Input
              id="website"
              placeholder="example.com"
              {...register("website")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.website && (
              <p className="text-[10px] text-red-500 font-medium">{errors.website.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="industry" className="text-xs font-semibold text-foreground">
              Industry <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="industry"
              placeholder="e.g. Retail, Healthcare"
              {...register("industry")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.industry && (
              <p className="text-[10px] text-red-500 font-medium">{errors.industry.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold text-foreground">Location</Label>
            <Input
              id="location"
              placeholder="e.g. Bangalore, KA"
              {...register("location")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.location && (
              <p className="text-[10px] text-red-500 font-medium">{errors.location.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Primary Contact */}
      <div className="space-y-4">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
          Section 2 — Primary Contact
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactPerson" className="text-xs font-semibold text-foreground">
              Contact Person <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="contactPerson"
              placeholder="John Doe"
              {...register("contactPerson")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.contactPerson && (
              <p className="text-[10px] text-red-500 font-medium">{errors.contactPerson.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="designation" className="text-xs font-semibold text-foreground">Designation</Label>
            <Input
              id="designation"
              placeholder="e.g. CEO, Founder, Manager"
              {...register("designation")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.designation && (
              <p className="text-[10px] text-red-500 font-medium">{errors.designation.message}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@company.com"
              {...register("email")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.email && (
              <p className="text-[10px] text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
              Phone <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              {...register("phone")}
              className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
            />
            {errors.phone && (
              <p className="text-[10px] text-red-500 font-medium">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Lead Source */}
      <div className="space-y-4">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
          Section 3 — Lead Source
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Lead Source <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={watch("sourceId") || "none"}
              onValueChange={(v) => setValue("sourceId", v === "none" ? "" : v, { shouldValidate: true })}
            >
              <SelectTrigger className="h-9 text-xs focus:ring-[#8B5CF6] rounded-md border-border/80">
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Source</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sourceId && (
              <p className="text-[10px] text-red-500 font-medium">{errors.sourceId.message}</p>
            )}
          </div>

          {showSourceDetails && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <Label htmlFor="sourceNotes" className="text-xs font-semibold text-foreground">Source Details</Label>
              <Input
                id="sourceNotes"
                placeholder="Enter details for Other source..."
                {...register("sourceNotes")}
                className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
              />
              {errors.sourceNotes && (
                <p className="text-[10px] text-red-500 font-medium">{errors.sourceNotes.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Initial Notes */}
      <div className="space-y-4">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
          Section 4 — Initial Notes
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="leadNotes" className="text-xs font-semibold text-foreground">Lead Notes</Label>
          <Textarea
            id="leadNotes"
            placeholder={"e.g. Interested in website redesign.\nCame through referral from Arun."}
            {...register("leadNotes")}
            className="text-sm resize-none min-h-[96px] focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
          />
          {errors.leadNotes && (
            <p className="text-[10px] text-red-500 font-medium">{errors.leadNotes.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
