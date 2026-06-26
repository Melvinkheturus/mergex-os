"use client";

import { TrendingUp, Users, FileText, MoreVertical, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { AnalyticsWidget } from "@/components/dashboard/analytics-widgets";
import { 
  Teammate, 
  Brand, 
  Lead, 
  Meeting, 
  Proposal, 
  Client, 
  WidgetType, 
  WIDGET_POOL 
} from "./dashboard-types";

interface AnalyticsGridProps {
  widgets: WidgetType[];
  onSelectWidget: (slotIndex: number, widgetKey: WidgetType) => void;
  teammates: Teammate[];
  brands: Brand[];
  leads: Lead[];
  meetings: Meeting[];
  proposals: Proposal[];
  clients: Client[];
}

export function AnalyticsGrid({
  widgets,
  onSelectWidget,
  teammates,
  brands,
  leads,
  meetings,
  proposals,
  clients
}: AnalyticsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {widgets.map((widgetKey, slotIndex) => {
        const activeWidget = WIDGET_POOL[widgetKey];
        return (
          <Card key={slotIndex} className="flex flex-col h-[375px] group/card relative">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 shrink-0 p-6">
              <div className="space-y-1 text-left">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {widgetKey.startsWith("pipeline") || widgetKey.startsWith("lead") || widgetKey.startsWith("proposal") ? (
                    <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                  ) : widgetKey.startsWith("client") || widgetKey.startsWith("projects") ? (
                    <Users className="w-4 h-4 text-[#8B5CF6]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#8B5CF6]" />
                  )}
                  <span>{activeWidget.label}</span>
                </CardTitle>
              </div>

              {/* Dropdown panel switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-[#8B5CF6] hover:bg-muted/40 cursor-pointer rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 focus:outline-hidden"
                    aria-label="Change Widget"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 bg-white dark:bg-[#111114] border border-border/20 rounded-xl p-1 shadow-md max-h-80 overflow-y-auto">
                  
                  {/* Helper to render widget items with active state indicators */}
                  {(["CRM", "Clients", "Team", "Documents"] as const).map((category, catIdx) => {
                    const categoryWidgets = (Object.keys(WIDGET_POOL) as WidgetType[])
                      .filter(k => WIDGET_POOL[k].category === category);
                    if (categoryWidgets.length === 0) return null;
                    return (
                      <div key={category}>
                        {catIdx > 0 && <DropdownMenuSeparator className="bg-border/10 my-1" />}
                        <DropdownMenuLabel className="text-[9px] uppercase font-bold text-muted-foreground/60 px-2 py-1">
                          {category === "CRM" ? "CRM Analytics" : category === "Clients" ? "Client Analytics" : category === "Team" ? "Team Analytics" : "Document Analytics"}
                        </DropdownMenuLabel>
                        {categoryWidgets.map(k => {
                          const isCurrentSlot = widgets[slotIndex] === k;
                          const isUsedElsewhere = !isCurrentSlot && widgets.includes(k);
                          return (
                            <DropdownMenuItem
                              key={k}
                              onClick={() => onSelectWidget(slotIndex, k)}
                              className={cn(
                                "text-xs px-2 py-1.5 cursor-pointer rounded-md flex items-center justify-between gap-2",
                                isCurrentSlot
                                  ? "bg-[#8B5CF6]/5 text-[#8B5CF6] font-semibold"
                                  : isUsedElsewhere
                                  ? "text-muted-foreground/60 hover:bg-muted/50"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <span>{WIDGET_POOL[k].label}</span>
                              {isCurrentSlot && (
                                <CheckCircle2 className="h-3 w-3 text-[#8B5CF6] shrink-0" />
                              )}
                              {isUsedElsewhere && (
                                <span className="text-[8px] bg-muted/60 px-1 py-0.5 rounded font-medium shrink-0">↔ Swap</span>
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center overflow-hidden p-6 pt-0">
               <AnalyticsWidget 
                type={widgetKey} 
                teammates={teammates} 
                brands={brands} 
                leads={leads}
                meetings={meetings}
                proposals={proposals}
                clients={clients}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
