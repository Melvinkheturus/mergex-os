"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function PauseRulesTab({ settings, update }: { settings: any; update: any }) {
  const rules = [
    { key: "awaitingClientResponse", label: "Awaiting Client Response", desc: "Pause timers when lead/opportunity is waiting for client reply." },
    { key: "awaitingDocuments", label: "Awaiting Documents", desc: "Pause timers when waiting for client documents/NDA files." },
    { key: "awaitingApproval", label: "Awaiting Approval", desc: "Pause timers when waiting for internal manager approval." },
    { key: "awaitingPayment", label: "Awaiting Payment", desc: "Pause timers when waiting for client invoice clearance." },
  ];

  return (
    <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
      <CardHeader className="text-left pb-4">
        <CardTitle className="text-sm font-bold text-foreground">SLA Auto Pause Gates</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Pause SLA countdowns under specific conditions to ensure fair evaluation of response times.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {rules.map((rule) => {
            const checked = !!settings.autoPauseRules[rule.key];
            return (
              <div 
                key={rule.key} 
                className="flex items-start gap-3 p-4 border border-border/20 rounded-xl bg-muted/5 text-left hover:bg-muted/10 transition-colors"
              >
                <input
                  type="checkbox"
                  id={rule.key}
                  checked={checked}
                  onChange={(e) => update(rule.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border/30 bg-background text-[#8B5CF6] focus:ring-[#8B5CF6]/30 cursor-pointer"
                />
                <div className="space-y-1">
                  <Label htmlFor={rule.key} className="text-xs font-bold text-foreground cursor-pointer">
                    {rule.label}
                  </Label>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    {rule.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
