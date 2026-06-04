"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { activitySchema, ActivityFormValues, Activity } from "./types";
import { ActivityIcon } from "./ui-helpers";

interface ActivitiesTabProps {
  leadId: string;
}

export function ActivitiesTab({ leadId }: ActivitiesTabProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "CALL",
      performedAt: new Date().toISOString().slice(0, 16),
      content: "",
    },
  });

  const loadActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/activities`);
      if (res.ok) {
        setActivities(await res.json());
      } else {
        toast.error("Failed to load activities");
      }
    } catch {
      toast.error("An error occurred loading activities");
    } finally {
      setLoadingActivities(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const onActivitySubmit = async (values: ActivityFormValues) => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to log activity");
      }
      toast.success("Activity logged");
      form.reset({
        type: "CALL",
        content: "",
        performedAt: new Date().toISOString().slice(0, 16),
      });
      setShowActivityForm(false);
      loadActivities();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to log activity");
    }
  };

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold">Activity Timeline</CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 border-border/40"
          onClick={() => setShowActivityForm((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Log Activity
        </Button>
      </CardHeader>

      {showActivityForm && (
        <CardContent className="pt-0 pb-4 border-b border-border/20">
          <form onSubmit={form.handleSubmit(onActivitySubmit)} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold">Activity Type</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v as ActivityFormValues["type"])}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">📞 Call</SelectItem>
                    <SelectItem value="EMAIL">✉️ Email</SelectItem>
                    <SelectItem value="WHATSAPP">💬 WhatsApp</SelectItem>
                    <SelectItem value="NOTE">📝 Note</SelectItem>
                    <SelectItem value="TASK">✅ Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold">Date & Time</Label>
                <Input type="datetime-local" className="h-9 text-xs" {...form.register("performedAt")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Details</Label>
              <Textarea placeholder="Describe the interaction, outcome, or task..." rows={2} {...form.register("content")} />
              {form.formState.errors.content && (
                <span className="text-red-500 text-[10px]">{form.formState.errors.content.message}</span>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowActivityForm(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs h-8"
              >
                {form.formState.isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Log"}
              </Button>
            </div>
          </form>
        </CardContent>
      )}

      <CardContent className="pt-4 pb-2">
        {loadingActivities ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="shrink-0 w-6 h-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3.5 w-1/4 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground font-semibold">No activities logged yet</p>
            <p className="text-[10px] text-muted-foreground">Log a call, email, or note to start building the timeline.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((act, i) => (
              <div key={act.id} className="flex gap-3 pb-5 relative">
                {i < activities.length - 1 && (
                  <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border/30" />
                )}
                <ActivityIcon type={act.type} />
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{act.type}</span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(act.performedAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {act.user && (
                      <span className="text-[10px] text-muted-foreground/60">
                        by {act.user.firstName} {act.user.lastName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{act.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
