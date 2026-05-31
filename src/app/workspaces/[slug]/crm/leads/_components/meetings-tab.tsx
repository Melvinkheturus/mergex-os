"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { meetingSchema, MeetingFormValues, Meeting } from "./types";
import { MeetingModeIcon } from "./ui-helpers";

interface MeetingsTabProps {
  leadId: string;
}

export function MeetingsTab({ leadId }: MeetingsTabProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      mode: "GOOGLE_MEET",
      duration: 30,
      scheduledAt: new Date().toISOString().slice(0, 16),
      title: "",
      meetingUrl: "",
    },
  });

  const loadMeetings = useCallback(async () => {
    setLoadingMeetings(true);
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/meetings`);
      if (res.ok) {
        setMeetings(await res.json());
      } else {
        toast.error("Failed to load meetings");
      }
    } catch {
      toast.error("An error occurred loading meetings");
    } finally {
      setLoadingMeetings(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const onMeetingSubmit = async (values: MeetingFormValues) => {
    try {
      const res = await fetch(`/api/crm/leads/${leadId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to schedule meeting");
      }
      toast.success("Meeting scheduled");
      form.reset({
        mode: "GOOGLE_MEET",
        duration: 30,
        scheduledAt: new Date().toISOString().slice(0, 16),
      });
      setShowMeetingForm(false);
      loadMeetings();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to schedule meeting");
    }
  };

  return (
    <Card className="border border-border/40 shadow-none rounded-2xl bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-bold">Meetings</CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 border-border/40"
          onClick={() => setShowMeetingForm((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Schedule Meeting
        </Button>
      </CardHeader>

      {showMeetingForm && (
        <CardContent className="pt-0 pb-4 border-b border-border/20">
          <form onSubmit={form.handleSubmit(onMeetingSubmit)} className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <Label className="font-semibold">Meeting Title</Label>
              <Input className="h-9 text-sm" placeholder="Discovery Call, Demo Session..." {...form.register("title")} />
              {form.formState.errors.title && (
                <span className="text-red-500 text-[10px]">{form.formState.errors.title.message as string}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold">Date & Time</Label>
                <Input type="datetime-local" className="h-9 text-xs" {...form.register("scheduledAt")} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold">Duration (mins)</Label>
                <Input type="number" className="h-9 text-sm" min={5} {...form.register("duration")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-semibold">Meeting Mode</Label>
                <Select
                  value={form.watch("mode")}
                  onValueChange={(v) => form.setValue("mode", v as MeetingFormValues["mode"])}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                    <SelectItem value="ZOOM">Zoom</SelectItem>
                    <SelectItem value="PHONE">Phone Call</SelectItem>
                    <SelectItem value="IN_PERSON">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold">Meeting URL</Label>
                <Input className="h-9 text-sm" placeholder="https://meet.google.com/..." {...form.register("meetingUrl")} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowMeetingForm(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs h-8"
              >
                {form.formState.isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Schedule"}
              </Button>
            </div>
          </form>
        </CardContent>
      )}

      <CardContent className="pt-4 pb-2">
        {loadingMeetings ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs text-muted-foreground font-semibold">No meetings scheduled</p>
            <p className="text-[10px] text-muted-foreground">Schedule a discovery call or demo to begin engagement.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((mtg) => {
              const isPast = new Date(mtg.scheduledAt) < new Date();
              return (
                <div key={mtg.id} className="flex gap-3 p-3.5 rounded-xl border border-border/30 bg-muted/20">
                  <div
                    className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center ${
                      isPast ? "bg-muted/50 border-border/20 text-muted-foreground" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <span className="text-xs font-bold text-foreground">{mtg.title}</span>
                      <Badge
                        className={`text-[10px] border ${
                          mtg.status === "SCHEDULED"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : mtg.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"
                        }`}
                      >
                        {mtg.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-[10px] text-muted-foreground">
                      <span>
                        {new Date(mtg.scheduledAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>· {mtg.duration} min</span>
                      <MeetingModeIcon mode={mtg.mode} />
                    </div>
                    {mtg.meetingUrl && (
                      <a href={mtg.meetingUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary/70 hover:underline mt-1 block truncate">
                        {mtg.meetingUrl}
                      </a>
                    )}
                    {mtg.summary && <p className="text-[10px] text-muted-foreground mt-1.5 italic">{mtg.summary}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
