"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export function AuditLogsSection() {
  return (
    <div className="space-y-6">
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Activity Log</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Events are retained for 90 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2.5 text-xs bg-muted/5 p-4 rounded-xl border border-border/10 items-center">
            <ShieldCheck className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            <p className="text-muted-foreground/60">No audit events recorded yet. Activity will appear here as the workspace is used.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
