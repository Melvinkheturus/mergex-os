"use client";

import { useState, useEffect } from "react";
import { Award, Compass, Cpu, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface KnowledgeCaptureCardProps {
  leadId: string;
}

export function KnowledgeCaptureCard({ leadId }: KnowledgeCaptureCardProps) {
  const [competitors, setCompetitors] = useState("");
  const [techStack, setTechStack] = useState("");
  const [decisionCriteria, setDecisionCriteria] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load knowledge from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`lead-knowledge-${leadId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompetitors(parsed.competitors || "");
        setTechStack(parsed.techStack || "");
        setDecisionCriteria(parsed.decisionCriteria || "");
      } catch {
        // use empty
      }
    }
  }, [leadId]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      const payload = { competitors, techStack, decisionCriteria };
      localStorage.setItem(`lead-knowledge-${leadId}`, JSON.stringify(payload));
      toast.success("Knowledge details captured successfully");
    } catch {
      toast.error("Failed to save knowledge details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-border/40 shadow-sm rounded-2xl bg-card">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-[#8B5CF6]" /> Knowledge Capture
        </CardTitle>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="h-6 text-[10px] font-bold px-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
        >
          <Save className="h-3 w-3 mr-1" /> {isSaving ? "Saving..." : "Save"}
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3.5 text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="competitors" className="font-semibold text-foreground/80 flex items-center gap-1">
            <Compass className="h-3 w-3 text-muted-foreground" /> Competitors
          </Label>
          <Input
            id="competitors"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="e.g. SalesForce, HubSpot..."
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="techStack" className="font-semibold text-foreground/80 flex items-center gap-1">
            <Cpu className="h-3 w-3 text-muted-foreground" /> Technology Stack
          </Label>
          <Input
            id="techStack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="e.g. Next.js, PostgreSQL, AWS..."
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="decisionCriteria" className="font-semibold text-foreground/80">
            Decision Criteria
          </Label>
          <Textarea
            id="decisionCriteria"
            value={decisionCriteria}
            onChange={(e) => setDecisionCriteria(e.target.value)}
            placeholder="What matters most to this lead? Budget / Timelines / Technical support..."
            className="text-xs resize-none min-h-[60px]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
