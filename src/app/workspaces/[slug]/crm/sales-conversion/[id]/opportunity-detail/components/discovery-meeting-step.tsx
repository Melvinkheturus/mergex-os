"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeetingsSection } from "./meetings-section";
import { MeetingRecord } from "../hooks/use-opportunity-detail";

interface DiscoveryMeetingStepProps {
  meetings: MeetingRecord[];
  showScheduleForm: boolean;
  setShowScheduleForm: (v: boolean) => void;
  savingMeeting: boolean;
  meetingForm: any;
  setMeetingForm: React.Dispatch<React.SetStateAction<any>>;
  editingMeetingId: string | null;
  setEditingMeetingId: (v: string | null) => void;
  editMeetingForm: any;
  setEditMeetingForm: React.Dispatch<React.SetStateAction<any>>;
  onAddMeeting: () => void;
  onUpdateMeeting: (id: string) => void;
  contactPerson: string;
  ownerName: string;

  businessGoals: string;
  setBusinessGoals: (v: string) => void;
  desiredOutcome: string;
  setDesiredOutcome: (v: string) => void;
  currentSituation: string;
  setCurrentSituation: (v: string) => void;
  painPoints: string[];
  setPainPoints: (v: string[]) => void;
  budgetDiscussion: string;
  setBudgetDiscussion: (v: string) => void;
  timelineDiscussion: string;
  setTimelineDiscussion: (v: string) => void;
  decisionMaker: string;
  setDecisionMaker: (v: string) => void;
  champion: string;
  setChampion: (v: string) => void;
  stakeholders: string;
  setStakeholders: (v: string) => void;
  risks: string;
  setRisks: (v: string) => void;
  discoveryNotes: string;
  setDiscoveryNotes: (v: string) => void;
}

export function DiscoveryMeetingStep({
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

  businessGoals,
  setBusinessGoals,
  desiredOutcome,
  setDesiredOutcome,
  currentSituation,
  setCurrentSituation,
  painPoints,
  setPainPoints,
  budgetDiscussion,
  setBudgetDiscussion,
  timelineDiscussion,
  setTimelineDiscussion,
  decisionMaker,
  setDecisionMaker,
  champion,
  setChampion,
  stakeholders,
  setStakeholders,
  risks,
  setRisks,
  discoveryNotes,
  setDiscoveryNotes,
}: DiscoveryMeetingStepProps) {
  return (
    <div className="space-y-4">
      {/* Meetings Section */}
      <MeetingsSection
        meetings={meetings}
        showScheduleForm={showScheduleForm}
        setShowScheduleForm={setShowScheduleForm}
        savingMeeting={savingMeeting}
        meetingForm={meetingForm}
        setMeetingForm={setMeetingForm}
        editingMeetingId={editingMeetingId}
        setEditingMeetingId={setEditingMeetingId}
        editMeetingForm={editMeetingForm}
        setEditMeetingForm={setEditMeetingForm}
        onAddMeeting={onAddMeeting}
        onUpdateMeeting={onUpdateMeeting}
        contactPerson={contactPerson}
        ownerName={ownerName}
      />

      {/* Discovery inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Business Goals *</Label>
          <textarea
            value={businessGoals}
            onChange={(e) => setBusinessGoals(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            placeholder="What problem are we solving? What are the key commercial goals?"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Desired Outcome *</Label>
          <textarea
            value={desiredOutcome}
            onChange={(e) => setDesiredOutcome(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]"
            placeholder="What does success look like for the client?"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Current Situation</Label>
          <textarea
            value={currentSituation}
            onChange={(e) => setCurrentSituation(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Current operational setups, stack, teams..."
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Pain Points</Label>
          <input
            type="text"
            value={painPoints.join(", ")}
            onChange={(e) => setPainPoints(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg focus:outline-none"
            placeholder="Comma-separated (e.g. Low Lead Conversions, Complex Flow)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Budget Discussion</Label>
          <Select value={budgetDiscussion} onValueChange={setBudgetDiscussion}>
            <SelectTrigger className="h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {["Not Discussed", "Under 1L", "1L to 5L", "5L to 10L", "Above 10L"].map(opt => (
                <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Timeline Discussion</Label>
          <Select value={timelineDiscussion} onValueChange={setTimelineDiscussion}>
            <SelectTrigger className="h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {["Not Discussed", "Immediate", "Within 30 Days", "Within 90 Days", "Future"].map(opt => (
                <SelectItem key={opt} value={opt} className="text-xs rounded-lg">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Decision Maker</Label>
          <input
            type="text"
            value={decisionMaker}
            onChange={(e) => setDecisionMaker(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Name of DM"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Champion</Label>
          <input
            type="text"
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Name of Champion"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Stakeholders</Label>
          <input
            type="text"
            value={stakeholders}
            onChange={(e) => setStakeholders(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Other stakeholders"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Execution Risks</Label>
          <textarea
            value={risks}
            onChange={(e) => setRisks(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Any early technical or delivery risks identified..."
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Discovery Notes</Label>
          <textarea
            value={discoveryNotes}
            onChange={(e) => setDiscoveryNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-background border border-border/30 rounded-lg"
            placeholder="Additional notes from meeting..."
          />
        </div>
      </div>
    </div>
  );
}
