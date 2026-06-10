"use client";

import { PauseCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function AutoPauseTab({ settings, update }: { settings: any; update: any }) {
  const rules = [
    { 
      key: "awaitingClientResponse", 
      label: "Awaiting Client Response", 
      trigger: "CRM status updated to 'Awaiting Client Reply'", 
      desc: "Pause timers when lead/opportunity is waiting for client reply." 
    },
    { 
      key: "awaitingDocuments", 
      label: "Awaiting Documents", 
      trigger: "Checklist item 'Required Client Docs' pending upload", 
      desc: "Pause timers when waiting for client documents/NDA files." 
    },
    { 
      key: "awaitingApproval", 
      label: "Awaiting Approval", 
      trigger: "Approval request submitted to VP/Manager", 
      desc: "Pause timers when waiting for internal manager approval." 
    },
    { 
      key: "awaitingPayment", 
      label: "Awaiting Payment", 
      trigger: "Invoice sent to customer, payment verification pending", 
      desc: "Pause timers when waiting for client invoice clearance." 
    },
  ];

  const timerBehavior = settings.autoPauseRules.timerBehavior || "freeze";

  const handleBehaviorChange = (behavior: string) => {
    update("timerBehavior", behavior);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
        <CardHeader className="text-left pb-4">
          <div className="flex items-center gap-2">
            <PauseCircle className="h-5 w-5 text-[#8B5CF6]" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">SLA Auto Pause Gates</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Automatically suspend active countdowns when external roadblocks or client-waiting dependencies arise.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Pause Conditions Table */}
          <div className="border border-border/20 rounded-xl overflow-hidden bg-card text-left">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow>
                  <TableHead className="text-xs font-bold text-muted-foreground">Pause Event</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Trigger Condition</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-36">SLA Impact Action</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground w-20 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.key} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="text-xs py-3.5">
                      <p className="font-bold text-foreground">{rule.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{rule.desc}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {rule.trigger}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] text-[9px] uppercase tracking-wider font-extrabold border-0">
                        Freeze Timer
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-3.5">
                      <Switch
                        checked={!!settings.autoPauseRules[rule.key]}
                        onCheckedChange={(v) => update(rule.key, v)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Segmented Radio Cards for Timer behavior */}
          <div className="space-y-3 text-left pt-4 border-t border-border/10">
            <div>
              <Label className="text-xs font-bold text-foreground">SLA Timer Resumption Behavior</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Choose how active SLA clocks behave when a pause condition resolves.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Option 1: Freeze & Resume */}
              <div 
                onClick={() => handleBehaviorChange("freeze")}
                className={cn(
                  "p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2",
                  timerBehavior === "freeze" 
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/5" 
                    : "border-border/10 hover:border-border/30 bg-muted/5"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">Freeze & Resume</span>
                  <div className={cn(
                    "h-3 w-3 rounded-full border flex items-center justify-center",
                    timerBehavior === "freeze" ? "border-[#8B5CF6]" : "border-muted-foreground/30"
                  )}>
                    {timerBehavior === "freeze" && <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Timer pauses and resumes counting down from the exact second it was frozen.
                </p>
              </div>

              {/* Option 2: Reset & Restart */}
              <div 
                onClick={() => handleBehaviorChange("reset")}
                className={cn(
                  "p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2",
                  timerBehavior === "reset" 
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/5" 
                    : "border-border/10 hover:border-border/30 bg-muted/5"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">Reset & Restart</span>
                  <div className={cn(
                    "h-3 w-3 rounded-full border flex items-center justify-center",
                    timerBehavior === "reset" ? "border-[#8B5CF6]" : "border-muted-foreground/30"
                  )}>
                    {timerBehavior === "reset" && <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Timer resets to its full default duration and restarts from the beginning.
                </p>
              </div>

              {/* Option 3: Ignore & Log */}
              <div 
                onClick={() => handleBehaviorChange("ignore")}
                className={cn(
                  "p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2",
                  timerBehavior === "ignore" 
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/5" 
                    : "border-border/10 hover:border-border/30 bg-muted/5"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">Ignore & Log</span>
                  <div className={cn(
                    "h-3 w-3 rounded-full border flex items-center justify-center",
                    timerBehavior === "ignore" ? "border-[#8B5CF6]" : "border-muted-foreground/30"
                  )}>
                    {timerBehavior === "ignore" && <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Timer continues running in background. Breaches are logged as "excused" in audits.
                </p>
              </div>

            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
