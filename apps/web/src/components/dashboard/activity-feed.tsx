"use client";

import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatarInitials: string;
  color: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="lg:col-span-2 flex flex-col min-h-[220px]">
      <CardHeader className="pb-3 p-6 shrink-0">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#8B5CF6]" />
          Operational Activity Feed
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground/60">
          Real-time events happening across divisions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 grow overflow-y-auto max-h-[300px]">
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between text-xs py-2 border-b border-border/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0", act.color)}>
                  {act.avatarInitials}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground/90 leading-tight">
                    {act.user} <span className="font-normal text-muted-foreground">{act.action}</span> {act.target}
                  </p>
                  <span className="text-[9px] text-muted-foreground/50 font-medium mt-0.5 inline-block">{act.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
