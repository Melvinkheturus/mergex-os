import React from "react";
import { cn } from "@/lib/utils";

export function CardContainer({
  title,
  icon: Icon,
  borderStyle,
  children,
}: {
  title: string;
  icon: React.ElementType;
  borderStyle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("border shadow-xs rounded-2xl bg-card p-4", borderStyle || "border-border/40")}>
      <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border/10">
        <Icon className="h-3.5 w-3.5 text-[#8B5CF6]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}
