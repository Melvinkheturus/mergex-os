"use client";

import { Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ActionItem {
  id: string;
  text: string;
  urgency: string;
  done: boolean;
}

interface ActionCenterProps {
  actions: ActionItem[];
  onActionClick: (id: string, text: string) => void;
}

export function ActionCenter({ actions, onActionClick }: ActionCenterProps) {
  return (
    <Card className="flex flex-col min-h-[220px]">
      <CardHeader className="pb-3 p-6 shrink-0">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8B5CF6]" />
          Action Center
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground/60">
          Immediate tasks requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 grow flex items-center justify-center">
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/30 mb-2" />
            <p className="font-semibold text-foreground">All caught up!</p>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5 max-w-[200px]">
              No urgent action items or approval requests require your attention today.
            </p>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {actions.map((act) => (
              <div 
                key={act.id} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border border-border/10 text-xs transition-all",
                  act.done ? "opacity-45 bg-muted/20 border-muted" : "bg-muted/30 hover:bg-muted/50 cursor-pointer"
                )}
                onClick={() => !act.done && onActionClick(act.id, act.text)}
              >
                <div className="mt-0.5 shrink-0">
                  {act.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <div className="h-4 w-4 rounded border border-muted-foreground/30 hover:border-[#8B5CF6] transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className={cn("font-semibold text-foreground leading-tight truncate", act.done && "line-through")}>
                    {act.text}
                  </p>
                  <span className={cn(
                    "text-[8px] uppercase tracking-wide font-extrabold px-1 rounded-sm mt-1 inline-block",
                    act.urgency === "High" ? "bg-red-500/10 text-red-500" :
                    act.urgency === "Medium" ? "bg-amber-500/10 text-amber-500" :
                    "bg-blue-500/10 text-blue-500"
                  )}>
                    {act.urgency} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
