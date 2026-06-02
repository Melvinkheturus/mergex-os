"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ChevronRight, Loader2, Building2, CheckCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { type Resolver } from "react-hook-form";
import { leadFormSchema, LeadFormValues, OptionSource, OptionUser } from "../_components/types";

export function NewLeadClientPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [sources, setSources] = useState<OptionSource[]>([]);
  const [owners, setOwners] = useState<OptionUser[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Fetch Options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const optRes = await fetch(`/api/crm/options?brandSlug=${slug}`);
        if (optRes.ok) {
          const { sources: src, owners: own } = await optRes.json();
          setSources(src || []);
          setOwners(own || []);
        }
      } catch (error) {
        console.error("Error loading options:", error);
        toast.error("Failed to load options");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [slug]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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
      location: "",
      designation: "",
      sourceId: "",
      ownerId: "",
      initialNotes: "",
    },
  });

  // Load draft on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = `draft_new_lead_${slug}`;
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
      setTimeout(() => {
        setIsDraftLoaded(true);
      }, 0);
    }
  }, [slug, setValue]);

  // Save draft on change
  const formValues = watch();
  useEffect(() => {
    if (!isDraftLoaded) return;
    if (typeof window !== "undefined") {
      const storageKey = `draft_new_lead_${slug}`;
      localStorage.setItem(storageKey, JSON.stringify(formValues));
    }
  }, [formValues, isDraftLoaded, slug]);

  const onSubmit = async (values: LeadFormValues) => {
    try {
      const res = await fetch(`/api/crm/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create lead");
      }

      const data = await res.json();

      if (typeof window !== "undefined") {
        localStorage.removeItem(`draft_new_lead_${slug}`);
      }

      toast.success("Lead created successfully");
      router.push(`/workspaces/${slug}/crm/leads/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      console.error("Create lead error:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 pt-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 px-1">
        <Link href={`/workspaces/${slug}/crm/leads`} className="hover:text-foreground transition-colors">
          Leads
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">New Lead</span>
      </div>

      {loadingOptions ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2 bg-card border border-border/80 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
          <span className="text-xs">Loading form configuration options...</span>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-md shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center gap-3.5 p-6 border-b border-border/40 bg-muted/5">
            <div className="h-10 w-10 rounded-md border border-border bg-card flex items-center justify-center text-foreground/80 shrink-0 shadow-2xs">
              <Building2 className="h-5 w-5 text-[#8B5CF6]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">Create New Lead</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Provide necessary contact and company details to intake the new lead.
              </p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }}>
            <div className="p-6 space-y-8">
              {/* Section 1: Company Profile */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
                  Section 1 — Company Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="text-xs font-semibold text-foreground">
                      Company Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name..."
                      {...register("companyName")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                    {errors.companyName && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.companyName.message as string}</p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-xs font-semibold text-foreground">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      {...register("website")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <Label htmlFor="industry" className="text-xs font-semibold text-foreground">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="SaaS / Retail / Real Estate..."
                      {...register("industry")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-xs font-semibold text-foreground">Location</Label>
                    <Input
                      id="location"
                      placeholder="Mumbai, Maharashtra, India"
                      {...register("location")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Details */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
                  Section 2 — Contact Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Person Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPerson" className="text-xs font-semibold text-foreground">
                      Contact Person <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="contactPerson"
                      placeholder="John Doe"
                      {...register("contactPerson")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                    {errors.contactPerson && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.contactPerson.message as string}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="johndoe@company.com"
                      {...register("email")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                    {errors.email && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.email.message as string}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                      Phone <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      {...register("phone")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                    {errors.phone && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.phone.message as string}</p>
                    )}
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="designation" className="text-xs font-semibold text-foreground">Designation</Label>
                    <Input
                      id="designation"
                      placeholder="VP of Operations / CEO / Developer..."
                      {...register("designation")}
                      className="h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 rounded-md border-border/80"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Lead Source & Section 4: Ownership */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section 3: Lead Source */}
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
                    Section 3 — Lead Source
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Source <span className="text-rose-500">*</span>
                    </Label>
                    <Select value={watch("sourceId") || ""} onValueChange={(v) => setValue("sourceId", v, { shouldValidate: true })}>
                      <SelectTrigger className="h-10 text-sm focus:ring-[#8B5CF6] rounded-md border-border/80">
                        <SelectValue placeholder="Select Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sourceId && (
                      <p className="text-[10px] text-red-500 font-medium">{errors.sourceId.message as string}</p>
                    )}
                  </div>
                </div>

                {/* Section 4: Ownership */}
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
                    Section 4 — Ownership
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Lead Owner</Label>
                    <Select value={watch("ownerId") || ""} onValueChange={(v) => setValue("ownerId", v, { shouldValidate: true })}>
                      <SelectTrigger className="h-10 text-sm focus:ring-[#8B5CF6] rounded-md border-border/80">
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
              </div>

              {/* Section 5: Notes */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/40">
                  Section 5 — Notes
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="initialNotes" className="text-xs font-semibold text-foreground">Initial Notes</Label>
                  <textarea
                    id="initialNotes"
                    placeholder="e.g. Interested in website redesign."
                    {...register("initialNotes")}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-md bg-white dark:bg-[#050507] border border-border/80 text-sm text-foreground placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 focus:border-[#8B5CF6]/40 transition-all resize-none font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Footer Form Actions */}
            <div className="flex items-center justify-between p-6 border-t border-border/40 bg-muted/5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem(`draft_new_lead_${slug}`);
                  }
                  router.push(`/workspaces/${slug}/crm/leads`);
                }}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold h-9 px-4"
                type="button"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => reset()}
                  className="text-xs font-semibold h-9 px-4 border-border/80 hover:bg-muted/30"
                >
                  Reset Data
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#0F172A] hover:bg-[#1E293B] dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold px-5 h-9 rounded-md transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Create Lead
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

