"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const RISK_OPTIONS = [
  "No Budget",
  "Decision Maker Missing",
  "No Urgency",
  "Need Unclear",
  "Internal Delays",
  "Competitor Involved",
  "Already Using Alternative",
  "Not Responsive",
  "Other",
];

interface RiskDropdownProps {
  selected: string[];
  onChange: (v: string[]) => void;
  otherValue: string;
  onOtherChange: (v: string) => void;
}

export function RiskDropdown({
  selected,
  onChange,
  otherValue,
  onOtherChange,
}: RiskDropdownProps) {
  const [open, setOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCustomInput(false);
        setCustomVal("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (risk: string) => {
    onChange(
      selected.includes(risk) ? selected.filter((r) => r !== risk) : [...selected, risk]
    );
  };

  const remove = (risk: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((r) => r !== risk));
  };

  const handleAddCustom = () => {
    const val = customVal.trim();
    if (val) {
      if (!selected.includes(val)) {
        onChange([...selected, val]);
      }
      setCustomVal("");
      setShowCustomInput(false);
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full min-h-[34px] flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left",
          "bg-background/40 border-border/40 hover:border-border/70 transition-colors cursor-pointer",
          open && "border-[#8B5CF6]/40 ring-1 ring-[#8B5CF6]/25"
        )}
      >
        {selected.length === 0 ? (
          <span className="text-xs text-muted-foreground/50">Select risks…</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selected.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-500 text-[10px] font-semibold"
              >
                {r}
                <X 
                  className="h-2.5 w-2.5 cursor-pointer hover:text-rose-400" 
                  onClick={(e) => remove(r, e)} 
                />
              </span>
            ))}
          </div>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/40 ml-auto shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {/* Dropdown Box */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border/50 bg-popover shadow-xl p-1.5 space-y-0.5 animate-in fade-in-50 duration-100">
          {RISK_OPTIONS.filter(o => o !== "Other").map((risk) => {
            const isSelected = selected.includes(risk);
            return (
              <button
                key={risk}
                type="button"
                onClick={() => toggle(risk)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  isSelected
                    ? "bg-rose-500/10 text-rose-500"
                    : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {risk}
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
              </button>
            );
          })}

          {/* Custom "Other" entry */}
          <div className="border-t border-border/20 my-1 pt-1" />

          {showCustomInput ? (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                placeholder="Type custom risk..."
                className="h-7 w-full border border-border/40 rounded px-2 text-xs bg-background text-foreground focus:outline-none focus:border-[#8B5CF6]/50"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="text-xs font-bold text-violet-600 hover:text-[#8B5CF6] cursor-pointer px-1 shrink-0"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCustomInput(true);
              }}
              className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <span className="h-4 w-4 shrink-0 rounded border flex items-center justify-center border-border/50 bg-transparent text-[10px]">
                +
              </span>
              Other (Type custom...)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
