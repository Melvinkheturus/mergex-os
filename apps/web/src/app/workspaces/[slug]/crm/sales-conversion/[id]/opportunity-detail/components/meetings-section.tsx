"use client";

import React from "react";
import { Video, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { cn } from "@/lib/utils";
import { MeetingRecord } from "../hooks/use-opportunity-detail";

const MEETING_MODE_LABELS: Record<string, string> = {
  GOOGLE_MEET: "Google Meet",
  ZOOM: "Zoom",
  PHONE: "Phone Call",
  IN_PERSON: "In Person",
};

interface MeetingsSectionProps {
  meetings: MeetingRecord[];
  showScheduleForm: boolean;
  setShowScheduleForm: (v: boolean) => void;
  savingMeeting: boolean;
  meetingForm: {
    title: string;
    scheduledAt: string;
    duration: string;
    mode: string;
    meetingUrl: string;
  };
  setMeetingForm: React.Dispatch<React.SetStateAction<{
    title: string;
    scheduledAt: string;
    duration: string;
    mode: string;
    meetingUrl: string;
  }>>;
  editingMeetingId: string | null;
  setEditingMeetingId: (v: string | null) => void;
  editMeetingForm: {
    title: string;
    scheduledAt: string;
    duration: string;
    mode: string;
    meetingUrl: string;
    status: string;
  };
  setEditMeetingForm: React.Dispatch<React.SetStateAction<{
    title: string;
    scheduledAt: string;
    duration: string;
    mode: string;
    meetingUrl: string;
    status: string;
  }>>;
  onAddMeeting: () => void;
  onUpdateMeeting: (id: string) => void;
  contactPerson: string;
  ownerName: string;
}

export function MeetingsSection({
  meetings,
  showScheduleForm,
  setShowScheduleForm,
  savingMeeting,
  meetingForm,
  setMeetingForm,
  editingMeetingId,
  setEditingMeetingId,
  editMeetingForm,
  setEditMeetingForm,
  onAddMeeting,
  onUpdateMeeting,
  contactPerson,
  ownerName,
}: MeetingsSectionProps) {
  return (
    <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-border/10">
        <span className="text-xs font-bold text-foreground">Discovery Scheduled Meetings</span>
        <div className="flex items-center gap-2">
          {meetings.length > 0 && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="h-6 px-2 text-[10px] font-semibold border-border/60 hover:bg-muted text-foreground rounded-lg"
            >
              {showScheduleForm ? "Cancel" : "Schedule Meeting"}
            </Button>
          )}
          <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20 font-bold text-[9px] uppercase">
            {meetings.length} Total
          </Badge>
        </div>
      </div>

      {meetings.length === 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] text-muted-foreground/75 italic">No meetings scheduled yet.</p>
        </div>
      )}

      {(meetings.length === 0 || showScheduleForm) && (
        <div className="p-3 border border-violet-500/10 bg-violet-500/5 rounded-xl space-y-2 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">
            {meetings.length === 0 ? "Schedule First Discovery Meeting" : "Schedule Discovery Meeting"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Meeting title *"
              value={meetingForm.title}
              onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))}
              className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            />
            <input
              type="text"
              placeholder="Meeting link (URL)"
              value={meetingForm.meetingUrl}
              onChange={(e) => setMeetingForm((p) => ({ ...p, meetingUrl: e.target.value }))}
              className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            />
            <DateTimePicker
              value={meetingForm.scheduledAt}
              onChange={(val) => setMeetingForm((p) => ({ ...p, scheduledAt: val }))}
              className="bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={meetingForm.mode}
              onValueChange={(val) => setMeetingForm((p) => ({ ...p, mode: val }))}
            >
              <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                <SelectValue placeholder="Select mode..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                <SelectItem value="ZOOM">Zoom</SelectItem>
                <SelectItem value="PHONE">Phone Call</SelectItem>
                <SelectItem value="IN_PERSON">In Person</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={onAddMeeting}
              disabled={savingMeeting}
              className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED] h-8 text-xs font-semibold rounded-lg"
            >
              {savingMeeting ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </div>
        </div>
      )}

      {meetings.length > 0 && (
        <div className="space-y-2">
          {meetings.map((m) => {
            const isEditing = editingMeetingId === m.id;
            if (isEditing) {
              return (
                <div key={m.id} className="p-3 border border-violet-500/30 bg-violet-500/5 rounded-xl space-y-2 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">Edit Meeting</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Meeting title *"
                      value={editMeetingForm.title}
                      onChange={(e) => setEditMeetingForm((p) => ({ ...p, title: e.target.value }))}
                      className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                    <input
                      type="text"
                      placeholder="Meeting link (URL)"
                      value={editMeetingForm.meetingUrl}
                      onChange={(e) => setEditMeetingForm((p) => ({ ...p, meetingUrl: e.target.value }))}
                      className="px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                    <DateTimePicker
                      value={editMeetingForm.scheduledAt}
                      onChange={(val) => setEditMeetingForm((p) => ({ ...p, scheduledAt: val }))}
                      className="bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={editMeetingForm.mode}
                      onValueChange={(val) => setEditMeetingForm((p) => ({ ...p, mode: val }))}
                    >
                      <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                        <SelectValue placeholder="Select mode..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
                        <SelectItem value="ZOOM">Zoom</SelectItem>
                        <SelectItem value="PHONE">Phone Call</SelectItem>
                        <SelectItem value="IN_PERSON">In Person</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={editMeetingForm.status}
                      onValueChange={(val) => setEditMeetingForm((p) => ({ ...p, status: val }))}
                    >
                      <SelectTrigger size="sm" className="bg-background border border-border/30 rounded-lg">
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onUpdateMeeting(m.id)}
                        disabled={savingMeeting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 h-8 text-xs font-semibold rounded-lg"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMeetingId(null)}
                        className="border-border/60 hover:bg-muted text-foreground flex-1 h-8 text-xs font-semibold rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/20 bg-background/50 text-xs">
                <div>
                  <p className="font-bold text-foreground">{m.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(m.scheduledAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })} · {MEETING_MODE_LABELS[m.mode] || m.mode}
                  </p>
                  {m.meetingUrl && (
                    <p className="text-[10px] text-violet-500 font-medium mt-0.5">
                      <a
                        href={m.meetingUrl.startsWith('http') ? m.meetingUrl : `https://${m.meetingUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        <Video className="h-3.5 w-3.5" />
                        {m.meetingUrl}
                      </a>
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Attendees: Contact Person ({contactPerson}) & Opportunity Owner ({ownerName})
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setEditingMeetingId(m.id);
                      setEditMeetingForm({
                        title: m.title,
                        scheduledAt: m.scheduledAt,
                        duration: String(m.duration),
                        mode: m.mode,
                        meetingUrl: m.meetingUrl || "",
                        status: m.status,
                      });
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Badge className={cn(
                    "text-[9px] uppercase font-bold px-2 border",
                    m.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : m.status === "CANCELLED"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-sky-500/10 text-sky-500 border-sky-500/20"
                  )}>
                    {m.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
