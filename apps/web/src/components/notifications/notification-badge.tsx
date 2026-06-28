"use client";

import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center",
        "min-w-[16px] h-4 px-1 rounded-full",
        "bg-red-500 text-white text-[9px] font-bold leading-none",
        "ring-1 ring-background",
        "animate-in zoom-in-75 duration-200",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
