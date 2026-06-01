"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
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
import { leadFormSchema, LeadFormValues, OptionSource, OptionUser } from "./types";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: OptionSource[];
  owners: OptionUser[];
  onSubmit: (values: LeadFormValues) => Promise<void>;
}

export function AddLeadDialog({
  open,
  onOpenChange,
  sources,
  owners,
  onSubmit,
}: AddLeadDialogProps) {
  const params = useParams();
  const slug = params?.slug as string;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as Resolver<LeadFormValues>,
    defaultValues: {
      companyName: "",
      contactPerson: "",
      phone: "",
      email: "",
      website: "",
      industry: "",
      designation: "",
      sourceId: "",
      ownerId: "",
      initialNotes: "",
    },
  });

  // Reset form when dialog closes, load draft when it opens
  useEffect(() => {
    if (!open) {
      reset();
    } else if (typeof window !== "undefined") {
      const storageKey = `draft_add_lead_${slug}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Object.entries(parsed).forEach(([key, val]) => {
            setValue(key as keyof LeadFormValues, val as never);
          });
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
  }, [open, slug, setValue, reset]);

  // Save draft on change if dialog is open
  const formValues = watch();
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const storageKey = `draft_add_lead_${slug}`;
      localStorage.setItem(storageKey, JSON.stringify(formValues));
    }
  }, [formValues, open, slug]);

  const handleFormSubmit = async (values: LeadFormValues) => {
    await onSubmit(values);
    if (typeof window !== "undefined") {
      const storageKey = `draft_add_lead_${slug}`;
      localStorage.removeItem(storageKey);
    }
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
            Enter the intake details below to add the lead to your pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(handleFormSubmit)(); }} className="space-y-4 py-2">
          {/* Section 1: Company Info */}
          <div className="space-y-3 pt-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/40">
              Section 1 — Company Information
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-semibold">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name..."
                  {...register("companyName")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
                {errors.companyName && (
                  <span className="text-[10px] text-red-500 font-medium">{errors.companyName.message as string}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dlg-website" className="text-xs font-semibold">Website</Label>
                <Input
                  id="dlg-website"
                  placeholder="https://example.com"
                  {...register("website")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dlg-industry" className="text-xs font-semibold">Industry</Label>
                <Input
                  id="dlg-industry"
                  placeholder="SaaS / Retail / Real Estate..."
                  {...register("industry")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dlg-location" className="text-xs font-semibold">Location</Label>
                <Input
                  id="dlg-location"
                  placeholder="City, Region, Country"
                  {...register("location")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-3 pt-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/40">
              Section 2 — Contact Information
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson" className="text-xs font-semibold">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  placeholder="John Doe"
                  {...register("contactPerson")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
                {errors.contactPerson && (
                  <span className="text-[10px] text-red-500 font-medium">{errors.contactPerson.message as string}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dlg-email" className="text-xs font-semibold">Email Address</Label>
                <Input
                  id="dlg-email"
                  type="email"
                  placeholder="johndoe@company.com"
                  {...register("email")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
                {errors.email && (
                  <span className="text-[10px] text-red-500 font-medium">{errors.email.message as string}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dlg-phone" className="text-xs font-semibold">Phone *</Label>
                <Input
                  id="dlg-phone"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
                {errors.phone && (
                  <span className="text-[10px] text-red-500 font-medium">{errors.phone.message as string}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dlg-designation" className="text-xs font-semibold">Designation</Label>
                <Input
                  id="dlg-designation"
                  placeholder="VP of Operations / CEO / Developer"
                  {...register("designation")}
                  className="h-9 text-sm rounded-md border-border/80"
                />
              </div>
            </div>
          </div>

          {/* Section 3 & 4: Source & Owner */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Section 3: Lead Source */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Source *</Label>
              <Select value={watch("sourceId") || ""} onValueChange={(v) => setValue("sourceId", v)}>
                <SelectTrigger className="h-9 text-sm rounded-md border-border/80">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sourceId && (
                <span className="text-[10px] text-red-500 font-medium">{errors.sourceId.message as string}</span>
              )}
            </div>

            {/* Section 4: Ownership */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Lead Owner</Label>
              <Select value={watch("ownerId") || ""} onValueChange={(v) => setValue("ownerId", v)}>
                <SelectTrigger className="h-9 text-sm rounded-md border-border/80">
                  <SelectValue placeholder="Select Owner (Current User if empty)" />
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

          {/* Section 5: Notes */}
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="dlg-initialNotes" className="text-xs font-semibold">Initial Notes</Label>
            <textarea
              id="dlg-initialNotes"
              placeholder="e.g. Interested in website redesign."
              {...register("initialNotes")}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-white dark:bg-[#050507] border border-border/80 text-sm text-foreground placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]/40 transition-all resize-none font-sans"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border/40 bg-muted/5 -mx-6 -mb-6 p-4 mt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const storageKey = `draft_add_lead_${slug}`;
                  localStorage.removeItem(storageKey);
                }
                onOpenChange(false);
              }}
              className="text-xs h-9 px-4 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold px-5 h-9 rounded-md transition-colors"
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
