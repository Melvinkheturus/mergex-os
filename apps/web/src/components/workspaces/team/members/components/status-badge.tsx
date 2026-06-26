import React from "react";
import { UserStatus } from "../../types";

export function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "ACTIVE") return null;
  if (status === "SUSPENDED") {
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
        Suspended
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
      Archived
    </span>
  );
}
