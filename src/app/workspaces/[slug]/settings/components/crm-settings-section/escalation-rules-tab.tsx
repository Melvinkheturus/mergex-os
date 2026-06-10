"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EscalationRulesTab({ settings, updateRule }: { settings: any; updateRule: any }) {
  return (
    <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
      <CardHeader className="text-left pb-4">
        <CardTitle className="text-sm font-bold text-foreground">Escalation Pathways</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Define notification levels when SLAs are breached sequentially.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {settings.escalationRules.map((rule: any, idx: number) => (
            <div 
              key={rule.level} 
              className="flex flex-col sm:flex-row items-stretch gap-4 p-4 border border-border/20 rounded-xl bg-muted/5 text-left hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-3 shrink-0">
                <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-red-600 text-sm">
                  L{rule.level}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{rule.title}</h4>
                  <p className="text-[10px] text-muted-foreground">Notification cascade step</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row gap-3 items-end sm:items-center justify-between mt-2 sm:mt-0">
                <div className="w-full sm:max-w-xs space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Breach Threshold</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min={1}
                      value={rule.breaches}
                      onChange={(e) => updateRule(idx, "breaches", parseInt(e.target.value) || 1)}
                      className="h-8.5 w-20 text-xs font-semibold bg-background"
                    />
                    <span className="text-xs text-muted-foreground font-medium">Breach(es)</span>
                  </div>
                </div>
                <div className="w-full sm:max-w-xs space-y-1">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Escalate To</Label>
                  <Input
                    value={rule.action || ""}
                    onChange={(e) => updateRule(idx, "action", e.target.value)}
                    placeholder="e.g. Sales Manager"
                    className="h-8.5 text-xs font-semibold bg-background"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
