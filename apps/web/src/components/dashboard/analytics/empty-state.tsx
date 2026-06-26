import React from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  hint,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-4 px-2">
      <div className="h-12 w-12 rounded-2xl bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#8B5CF6]/40" />
      </div>
      <div className="space-y-1 max-w-[220px]">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">{description}</p>
        {hint && (
          <p className="text-[9px] text-[#8B5CF6]/60 font-medium mt-1 bg-[#8B5CF6]/5 border border-[#8B5CF6]/10 px-2 py-1 rounded-lg">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
