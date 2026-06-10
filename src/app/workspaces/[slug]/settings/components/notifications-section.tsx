"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function NotificationsSection() {
  const items = [
    { key: "lead_assigned",   label: "Lead Assigned",         desc: "When a new lead is assigned to you.",            default: true  },
    { key: "status_change",   label: "Status Change",         desc: "When a lead or client status changes.",          default: true  },
    { key: "doc_uploaded",    label: "Document Uploaded",     desc: "When a document is added to your workspace.",    default: false },
    { key: "invite_accepted", label: "Invitation Accepted",   desc: "When a teammate accepts your invitation.",       default: true  },
    { key: "billing_alert",   label: "Billing Reminders",     desc: "Overdue invoices and payment alerts.",           default: true  },
    { key: "system_update",   label: "Platform Updates",      desc: "Release notes and new feature announcements.",   default: false },
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-frost-card rounded-[20px] shadow-sm border-transparent">
        <CardHeader className="pb-3 text-left">
          <CardTitle className="text-sm font-bold text-foreground">Notification Preferences</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Changes apply immediately to your account only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                defaultChecked={item.default}
                onCheckedChange={(v) => toast.success(`${item.label} notifications ${v ? "enabled" : "disabled"}.`)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
