"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTour } from "@/providers/OnboardingProvider";
import { CheckCircle2, RotateCcw, HelpCircle, Compass, ShieldAlert } from "lucide-react";

export function HelpOnboardingSection() {
  const { completedTours, resetAllTours } = useTour();

  const tourRegistry = [
    { id: "first-login", label: "First Login Walkthrough", desc: "A general layout guide to platform controls, settings, and search." },
    { id: "dashboard", label: "Dashboard Guide", desc: "Covers key executive analytics, operations indicators, and action items." },
    { id: "crm", label: "CRM Operations Guide", desc: "Detailed walkthrough of lead pipelines, statistics, filtering, and view styles." },
    { id: "clients", label: "Client Management Tour", desc: "Explains active brand clients, engagement scoring, and project timelines." },
    { id: "documents", label: "Documents Vault Walkthrough", desc: "Walks through proposals, signed agreements, and contract templates." },
    { id: "knowledge", label: "Operational Wiki Manual", desc: "Guides you through playbooks, sales SOPs, and system documents." },
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-[#8B5CF6]" />
            Help & Onboarding
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Manage your guided walkthroughs, tour resets, and system learning paths.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Main Controls Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-[#8B5CF6]/15 rounded-xl bg-[#8B5CF6]/5 text-left">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-[#8B5CF6]" />
                Restart Guided Walkthroughs
              </h3>
              <p className="text-[10px] text-muted-foreground max-w-lg leading-relaxed">
                Resetting will clear all your completed tour logs and restart the main walkthrough. 
                You will be redirected to the dashboard to begin.
              </p>
            </div>
            <Button
              onClick={resetAllTours}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-bold h-8 px-4 flex items-center gap-1.5 shrink-0 rounded-lg shadow-sm"
              data-tour="restart-tour-btn"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restart MergeX Tour
            </Button>
          </div>

          {/* Tour Status Tracker */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground text-left">Walkthrough Status Tracker</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tourRegistry.map((tour) => {
                const isCompleted = completedTours.includes(tour.id);
                return (
                  <div
                    key={tour.id}
                    className="p-3 border border-border/20 rounded-xl bg-muted/10 flex items-start justify-between gap-3 text-left transition-all hover:bg-muted/20"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">{tour.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-normal">{tour.desc}</p>
                    </div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notice Card */}
          <div className="p-3.5 border border-border/10 rounded-xl bg-muted/5 flex items-start gap-3 text-left">
            <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground">Self-Guided Help Tip</p>
              <p className="text-[9.5px] text-muted-foreground leading-relaxed">
                You can manually re-trigger a tour on any screen by clicking the question mark (?) button 
                located at the top navigation bar next to search. Dynamic popovers will skip missing DOM components.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
