"use client";

import { useState } from "react";
import { Sliders, Clock, ShieldAlert, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "../profile-section";

export function SlaConfigTab({
  settings,
  updateLead,
  updateSales,
  updateGlobalSla,
  updateHealth
}: {
  settings: any;
  updateLead: any;
  updateSales: any;
  updateGlobalSla: any;
  updateHealth: any;
}) {
  const [slaPhase, setSlaPhase] = useState<"lead" | "sales">("lead");
  const [editingSla, setEditingSla] = useState<{
    type: "lead" | "sales";
    index: number;
    data: any;
  } | null>(null);

  const getCriticality = (stageName: string) => {
    if (["Lead Intake", "Proposal & Commercials", "Discovery Meeting"].includes(stageName)) return "Critical";
    if (["Lead Classification"].includes(stageName)) return "Fast Track";
    return "Standard";
  };

  const getTimelineScale = (duration: number, unit: string) => {
    const hours = unit === "Days" ? duration * 24 : duration;
    if (hours <= 12) return { label: "Fast Track (<12h)", width: "33%", color: "bg-emerald-500" };
    if (hours <= 48) return { label: "Standard (12-48h)", width: "66%", color: "bg-indigo-500" };
    return { label: "Extended (>48h)", width: "100%", color: "bg-amber-500" };
  };

  const timezoneOptions = ["Asia/Kolkata", "UTC", "Asia/Singapore", "Europe/London", "US/Eastern", "US/Pacific"];

  const currentSlas = slaPhase === "lead" ? settings.leadSlas : settings.salesSlas;

  return (
    <div className="space-y-6">
      
      {/* Global Defaults Section */}
      <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
        <CardHeader className="text-left pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#8B5CF6]" />
            Global SLA Settings
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Configure system-wide baseline defaults for operational SLA timing and calculation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Default Time Zone</Label>
            <select
              value={settings.globalSlaSettings?.timezone || "Asia/Kolkata"}
              onChange={(e) => updateGlobalSla("timezone", e.target.value)}
              className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Countdown Mode</Label>
            <select
              value={settings.globalSlaSettings?.countdownMode || "business-hours"}
              onChange={(e) => updateGlobalSla("countdownMode", e.target.value)}
              className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer"
            >
              <option value="business-hours">Business Hours Only</option>
              <option value="calendar">24/7 Calendar Time</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Default Escalation</Label>
            <select
              value={settings.globalSlaSettings?.defaultEscalation || "level-1"}
              onChange={(e) => updateGlobalSla("defaultEscalation", e.target.value)}
              className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer"
            >
              <option value="level-1">Level 1 (Immediate Alert)</option>
              <option value="level-2">Level 2 (Manager Escalation)</option>
              <option value="none">None</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* SLA Phase Split and Table */}
      <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
        <CardHeader className="text-left pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">Operational Stage SLA Configuration</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Define response and resolution times for Lead Operations (Phase A) and Sales Conversion (Phase B).
            </CardDescription>
          </div>
          
          {/* Phase Tabs Switcher */}
          <div className="flex gap-1.5 bg-muted/20 p-1 rounded-lg border border-border/10 shrink-0">
            <button
              onClick={() => setSlaPhase("lead")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                slaPhase === "lead" 
                  ? "bg-[#8B5CF6] text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Lead Operations
            </button>
            <button
              onClick={() => setSlaPhase("sales")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                slaPhase === "sales" 
                  ? "bg-[#8B5CF6] text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sales Conversion
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* SLA Table */}
          <div className="border border-border/20 rounded-xl overflow-hidden bg-card text-left">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow>
                  <TableHead className="w-12 text-xs font-bold text-muted-foreground">#</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Stage</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">SLA Name / Type</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Starts When (Trigger)</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Action / Escalation</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-32">Criticality</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-16 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSlas.map((sla: any, idx: number) => {
                  const stageNum = slaPhase === "lead" ? idx + 1 : idx + 7;
                  const criticality = getCriticality(sla.stage);
                  
                  return (
                    <TableRow 
                      key={sla.stage}
                      className="hover:bg-muted/5 cursor-pointer group transition-colors"
                      onClick={() => setEditingSla({ type: slaPhase, index: idx, data: { ...sla } })}
                    >
                      <TableCell className="text-xs text-muted-foreground font-bold">{stageNum}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground">
                        {stageNum}. {sla.stage}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        <Badge variant="outline" className="text-[10px] border-border/40 font-semibold px-2 py-0.5">
                          {sla.type || sla.slaName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        {sla.duration} {sla.unit}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sla.trigger || sla.startsWhen}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {slaPhase === "lead" 
                          ? `Escalate after ${sla.escalateAfter} breach` 
                          : `${sla.breachAction}`}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 text-white shadow-sm border-0",
                            criticality === "Critical" 
                              ? "bg-red-500 hover:bg-red-600" 
                              : criticality === "Fast Track" 
                              ? "bg-[#8B5CF6] hover:bg-[#7C3AED]" 
                              : "bg-slate-500 hover:bg-slate-600"
                          )}
                        >
                          {criticality}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSla({ type: slaPhase, index: idx, data: { ...sla } });
                          }}
                        >
                          <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* SLA Visual Timeline */}
          <div className="space-y-3.5 text-left border-t border-border/10 pt-4">
            <div>
              <h4 className="text-xs font-bold text-foreground">SLA Visual Timeline</h4>
              <p className="text-[10px] text-muted-foreground">
                Overview of stage duration categories mapping to the active operational phases.
              </p>
            </div>
            
            <div className="space-y-3">
              {currentSlas.map((sla: any, idx: number) => {
                const stageNum = slaPhase === "lead" ? idx + 1 : idx + 7;
                const scale = getTimelineScale(sla.duration, sla.unit);

                return (
                  <div key={sla.stage} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="w-48 shrink-0 flex items-center gap-2">
                      <span className="font-bold text-muted-foreground w-6 text-right">{stageNum}.</span>
                      <span className="font-semibold text-foreground truncate">{sla.stage}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-3 w-full">
                      <div className="flex-1 h-3.5 bg-muted/40 rounded-lg overflow-hidden border border-border/10">
                        <div 
                          className={cn("h-full rounded-lg transition-all", scale.color)} 
                          style={{ width: scale.width }} 
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground w-36 text-right shrink-0">
                        {scale.label}
                      </span>
                    </div>

                    <div className="w-24 shrink-0 text-right font-bold text-foreground">
                      {sla.duration} {sla.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </CardContent>
      </Card>

      {/* Edit SLA Drawer Sheet */}
      <Sheet open={editingSla !== null} onOpenChange={(open) => !open && setEditingSla(null)}>
        {editingSla && (
          <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l border-border/20 bg-background/95 backdrop-blur-lg">
            <SheetHeader className="text-left pb-4 border-b border-border/10">
              <SheetTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#8B5CF6]" />
                Configure Stage SLA
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Modify operational thresholds and rules for Stage {editingSla.type === "lead" ? editingSla.index + 1 : editingSla.index + 7}: **{editingSla.data.stage}**
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-6 py-6 text-left">
              {/* Derived Criticality Alert */}
              <div className="p-3.5 rounded-xl border border-border/10 bg-muted/5 flex items-start gap-2.5">
                <ShieldAlert className={cn(
                  "h-4 w-4 shrink-0 mt-0.5",
                  getCriticality(editingSla.data.stage) === "Critical" 
                    ? "text-red-500" 
                    : getCriticality(editingSla.data.stage) === "Fast Track" 
                    ? "text-[#8B5CF6]" 
                    : "text-slate-500"
                )} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Operational Criticality:</span>
                    <Badge className={cn(
                      "text-[9px] uppercase font-bold border-0 px-2 py-0.5",
                      getCriticality(editingSla.data.stage) === "Critical" 
                        ? "bg-red-500 text-white" 
                        : getCriticality(editingSla.data.stage) === "Fast Track" 
                        ? "bg-[#8B5CF6] text-white" 
                        : "bg-slate-500 text-white"
                    )}>
                      {getCriticality(editingSla.data.stage)}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                    This criticality level is derived based on MergeX system-wide workflow rules and cannot be directly modified.
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Duration</Label>
                    <Input
                      type="number"
                      min={1}
                      value={editingSla.data.duration}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const updated = { ...editingSla.data, duration: val };
                        setEditingSla({ ...editingSla, data: updated });
                        if (editingSla.type === "lead") {
                          updateLead(editingSla.index, "duration", val);
                        } else {
                          updateSales(editingSla.index, "duration", val);
                        }
                      }}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="w-32 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Unit</Label>
                    <select
                      value={editingSla.data.unit}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = { ...editingSla.data, unit: val };
                        setEditingSla({ ...editingSla, data: updated });
                        if (editingSla.type === "lead") {
                          updateLead(editingSla.index, "unit", val);
                        } else {
                          updateSales(editingSla.index, "unit", val);
                        }
                      }}
                      className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer"
                    >
                      <option value="Hours">Hours</option>
                      <option value="Days">Days</option>
                    </select>
                  </div>
                </div>

                {editingSla.type === "lead" ? (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Trigger Condition</Label>
                      <Input
                        value={editingSla.data.trigger}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingSla({ ...editingSla, data: { ...editingSla.data, trigger: val } });
                          updateLead(editingSla.index, "trigger", val);
                        }}
                        className="h-9 text-xs"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Escalate After (Breaches)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={editingSla.data.escalateAfter}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setEditingSla({ ...editingSla, data: { ...editingSla.data, escalateAfter: val } });
                          updateLead(editingSla.index, "escalateAfter", val);
                        }}
                        className="h-9 text-xs"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Starts When (Trigger)</Label>
                      <Input
                        value={editingSla.data.startsWhen}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingSla({ ...editingSla, data: { ...editingSla.data, startsWhen: val } });
                          updateSales(editingSla.index, "startsWhen", val);
                        }}
                        className="h-9 text-xs"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground">Breach Action</Label>
                      <select
                        value={editingSla.data.breachAction}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingSla({ ...editingSla, data: { ...editingSla.data, breachAction: val } });
                          updateSales(editingSla.index, "breachAction", val);
                        }}
                        className="w-full h-9 px-3 text-xs bg-background border border-border/30 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30 cursor-pointer"
                      >
                        <option value="Escalate">Escalate</option>
                        <option value="Notify Only">Notify Only</option>
                        <option value="Auto Assign">Auto Assign</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* SLA Preview Flow Panel */}
              <div className="space-y-3 pt-4 border-t border-border/10">
                <Label className="text-xs font-bold text-foreground">SLA Action Flow Preview</Label>
                <div className="border border-border/20 rounded-xl bg-muted/5 p-4 relative pl-7 space-y-4">
                  
                  {/* Flow line */}
                  <div className="absolute left-[13px] top-5 bottom-5 w-[1px] bg-border/40" />

                  {/* Flow Node 1 */}
                  <div className="relative flex gap-3">
                    <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-background flex items-center justify-center shrink-0 z-10">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none">Timer Starts</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Trigger: {editingSla.type === "lead" ? editingSla.data.trigger : editingSla.data.startsWhen}
                      </p>
                    </div>
                  </div>

                  {/* Flow Node 2 */}
                  <div className="relative flex gap-3">
                    <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#8B5CF6] bg-background flex items-center justify-center shrink-0 z-10">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none">Countdown Active</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Timer running for {editingSla.data.duration} {editingSla.data.unit.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Flow Node 3 */}
                  <div className="relative flex gap-3">
                    <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-red-500 bg-background flex items-center justify-center shrink-0 z-10">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none">SLA Threshold Reached</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Breach flags at exactly {editingSla.data.duration} {editingSla.data.unit.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Flow Node 4 */}
                  <div className="relative flex gap-3">
                    <div className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-amber-500 bg-background flex items-center justify-center shrink-0 z-10">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none">Escalation Triggered</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {editingSla.type === "lead" 
                          ? `Notify Owner, escalate after ${editingSla.data.escalateAfter} breach` 
                          : `Execute Action: ${editingSla.data.breachAction}`}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-border/10 flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setEditingSla(null)}
                  className="text-xs cursor-pointer"
                >
                  Close Settings
                </Button>
              </div>

            </div>
          </SheetContent>
        )}
      </Sheet>

      {/* SLA Health Score Impact Configuration */}
      <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
        <CardHeader className="text-left pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#8B5CF6]" />
            Health Score Impact Configuration
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Configure default reward and penalty points applied to Lead and Opportunity health scores based on SLA breaches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            
            <div className="border border-emerald-500/20 p-4 rounded-xl bg-emerald-500/5 space-y-2">
              <div className="flex justify-between items-center">
                <Badge className="bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider border-0">On Track</Badge>
                <span className="text-xs font-bold text-emerald-600">+10 Points</span>
              </div>
              <p className="text-xs font-bold text-foreground mt-1">0 Breaches</p>
              <p className="text-[10px] text-muted-foreground leading-normal">Full score contribution. No SLA violations occurred.</p>
            </div>
            
            <div className="border border-amber-500/20 p-4 rounded-xl bg-amber-500/5 space-y-2">
              <div className="flex justify-between items-center">
                <Badge className="bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider border-0">Warning Status</Badge>
                <span className="text-xs font-bold text-amber-600">-5 Points</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Input
                  type="number"
                  min={1}
                  value={settings.healthConfig.warningBreaches}
                  onChange={(e) => updateHealth("warningBreaches", parseInt(e.target.value) || 1)}
                  className="h-7 w-16 text-xs bg-background"
                />
                <span className="text-xs text-foreground font-semibold">Breach(es)</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">Minor penalty applied. Flags standard warning alert in CRM.</p>
            </div>

            <div className="border border-red-500/20 p-4 rounded-xl bg-red-500/5 space-y-2">
              <div className="flex justify-between items-center">
                <Badge className="bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider border-0">Critical Status</Badge>
                <span className="text-xs font-bold text-red-600">-15 Points</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Input
                  type="number"
                  min={2}
                  value={settings.healthConfig.criticalBreaches}
                  onChange={(e) => updateHealth("criticalBreaches", parseInt(e.target.value) || 2)}
                  className="h-7 w-16 text-xs bg-background"
                />
                <span className="text-xs text-foreground font-semibold">Breach(es)</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">Critical violation score deduction. High-risk flag is set.</p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* SLA Lifecycle & Rules Explanation Footer */}
      <div className="p-4 rounded-xl border border-border/20 bg-muted/5 text-left space-y-3">
        <h4 className="text-xs font-bold text-foreground">How SLA Timers Operate</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] text-muted-foreground leading-relaxed">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">1. Lead Intake (Stage 1)</p>
            <p>Timer initiates immediately upon Lead Assignment. Measures first representative response time.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">2. Pipeline Stages (Stages 2-6)</p>
            <p>Timer begins automatically as soon as the lead transitions into the respective stage.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">3. Lead Nurturing (Stage 5)</p>
            <p>Timer resets dynamically after each documented outbound follow-up attempt.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
