import React from "react";

export const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    const title = payload[0].payload.fullName || label;
    return (
      <div className="bg-white/95 dark:bg-[#111114]/95 border border-border/10 p-3 rounded-2xl shadow-xl text-[10px] text-left backdrop-blur-md">
        {title && <p className="font-bold text-foreground mb-1.5 tracking-tight">{title}</p>}
        {payload.map((item: any, index: number) => {
          const color = item.color || item.payload.fill || '#8B5CF6';
          return (
            <div key={index} className="flex items-center gap-2 py-0.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground/80 font-medium">{item.name || "Value"}: </span>
              <span className="font-mono font-bold text-foreground ml-auto">
                {prefix}{Number(item.value).toLocaleString()}{suffix}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};
