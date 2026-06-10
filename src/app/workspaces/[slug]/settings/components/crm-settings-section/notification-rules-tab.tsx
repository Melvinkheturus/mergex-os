"use client";

import { BellRing, Check, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function NotificationRulesTab({ settings, update }: { settings: any; update: any }) {
  const timeOptions = [
    { value: 15, label: "15 Minutes Before" },
    { value: 30, label: "30 Minutes Before" },
    { value: 60, label: "1 Hour Before" },
    { value: 120, label: "2 Hours Before" },
  ];

  const handleTimeToggle = (minutes: number) => {
    const currentTimes = [...(settings.notificationRules?.preBreachTimes || [])];
    if (currentTimes.includes(minutes)) {
      update("preBreachTimes", currentTimes.filter((m) => m !== minutes));
    } else {
      update("preBreachTimes", [...currentTimes, minutes].sort((a, b) => a - b));
    }
  };

  const channels = settings.notificationRules?.channels || { inApp: true, email: true, whatsapp: true };

  const handleChannelToggle = (key: string, value: boolean) => {
    update("channels", { ...channels, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-frost-card border border-border/20 rounded-[20px] shadow-sm">
        <CardHeader className="text-left pb-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-[#8B5CF6]" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">SLA Alert & Notification Rules</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Set up warning alert notifications to reps before an SLA breach occurs, and select active communication channels.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Pre-Breach Warnings Section */}
          <div className="space-y-3.5 text-left">
            <div>
              <Label className="text-xs font-bold text-foreground">Pre-Breach Warning Milestones</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Trigger warning notifications to the owner at specified countdown intervals before a breach is finalized.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {timeOptions.map((option) => {
                const active = (settings.notificationRules?.preBreachTimes || []).includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTimeToggle(option.value)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                      active
                        ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]"
                        : "border-border/10 bg-muted/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0",
                      active ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" : "border-muted-foreground/30"
                    )}>
                      {active && <Check className="h-2.5 w-2.5" />}
                    </div>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Channels Grid */}
          <div className="space-y-3.5 text-left pt-4 border-t border-border/10">
            <div>
              <Label className="text-xs font-bold text-foreground">Communication Delivery Channels</Label>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Toggle the notification protocols to define where alerts are pushed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* In-App Alerts */}
              <div className="p-4 rounded-xl border border-border/10 bg-muted/5 flex items-start justify-between gap-3 text-left">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] shrink-0 mt-0.5">
                    <BellRing className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">In-App Alerts</p>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                      Sends real-time bell notifications within the CRM browser tab.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!channels.inApp}
                  onCheckedChange={(v) => handleChannelToggle("inApp", v)}
                />
              </div>

              {/* Email Alerts */}
              <div className="p-4 rounded-xl border border-border/10 bg-muted/5 flex items-start justify-between gap-3 text-left">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Email Alerts</p>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                      Dispatches direct emails and breach notices to owner/manager.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!channels.email}
                  onCheckedChange={(v) => handleChannelToggle("email", v)}
                />
              </div>

              {/* WhatsApp Alerts */}
              <div className="p-4 rounded-xl border border-border/10 bg-muted/5 flex items-start justify-between gap-3 text-left">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">WhatsApp Push</p>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                      Delivers urgent escalation alerts directly to registered mobile devices.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!channels.whatsapp}
                  onCheckedChange={(v) => handleChannelToggle("whatsapp", v)}
                />
              </div>

            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
