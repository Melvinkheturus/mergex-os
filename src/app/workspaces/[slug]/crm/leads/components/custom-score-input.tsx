"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Option Pill Button ───────────────────────────────────────────────────────
interface OptionPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionPill({ label, selected, onClick }: OptionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap",
        selected
          ? "border-[#8B5CF6]/45 bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#a78bfa] shadow-xs"
          : "border-border/30 bg-muted/10 text-muted-foreground hover:border-border/50 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

// ─── Custom Number Spinner (Scroll Slider with Up/Down Arrows) ────────────────
interface CustomNumberSpinnerProps {
  value: number;
  onChange: (v: number) => void;
}

export function CustomNumberSpinner({ value, onChange }: CustomNumberSpinnerProps) {
  const increment = () => {
    if (value < 10) onChange(value + 1);
  };
  const decrement = () => {
    if (value > 1) onChange(value - 1);
  };

  return (
    <div className="flex items-center border border-[#8B5CF6]/50 bg-background rounded-md h-[24px] overflow-hidden select-none">
      {/* Number Display with Vertical Sliding Animation */}
      <div className="w-7 h-[24px] relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute left-0 right-0 flex flex-col items-center transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateY(${-((value - 1) * 24)}px)`,
            top: "0px"
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <div key={n} className="h-[24px] flex items-center justify-center text-[11px] font-black text-[#8B5CF6]">
              {n}
            </div>
          ))}
        </div>
      </div>
      
      {/* Up/Down buttons stacked vertically */}
      <div className="flex flex-col border-l border-[#8B5CF6]/25 h-full w-[16px] bg-muted/20">
        <button
          type="button"
          onClick={increment}
          className="flex-1 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-[#8B5CF6] border-b border-[#8B5CF6]/15 transition-colors cursor-pointer"
        >
          <ChevronUp className="h-2 w-2 shrink-0" />
        </button>
        <button
          type="button"
          onClick={decrement}
          className="flex-1 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-[#8B5CF6] transition-colors cursor-pointer"
        >
          <ChevronDown className="h-2 w-2 shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ─── Custom Desc & Rating Input Component ──────────────────────────────────────
interface CustomScoreInputProps {
  descValue: string;
  scoreValue: number;
  isCustomSelected: boolean;
  onUpdate: (desc: string, score: number) => void;
  isActiveMode: boolean;
  setActiveMode: (active: boolean) => void;
}

export function CustomScoreInput({
  descValue,
  scoreValue,
  isCustomSelected,
  onUpdate,
  isActiveMode,
  setActiveMode,
}: CustomScoreInputProps) {
  const currentRating = scoreValue > 0 ? Math.round(scoreValue / 2.5) : 10;
  const [desc, setDesc] = useState(isCustomSelected ? descValue : "");
  const [rating, setRating] = useState(currentRating);

  useEffect(() => {
    if (isCustomSelected) {
      setDesc(descValue);
      setRating(currentRating);
    } else {
      setDesc("");
      setRating(10);
    }
  }, [descValue, scoreValue, isCustomSelected, currentRating]);

  const handleSave = () => {
    const trimmedDesc = desc.trim();
    if (trimmedDesc) {
      const calculatedScore = Math.round(rating * 2.5);
      onUpdate(trimmedDesc, calculatedScore);
      setActiveMode(false);
    }
  };

  if (isActiveMode) {
    return (
      <div className="flex items-center gap-1.5 animate-in fade-in-30 duration-150">
        {/* Rectangle Text Input */}
        <input
          type="text"
          placeholder="Enter custom value..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          className="h-[24px] flex-1 min-w-[120px] max-w-[200px] px-2 rounded-md border border-[#8B5CF6]/50 bg-background text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/30"
          autoFocus
        />
        
        {/* Custom scroll animation spinner */}
        <CustomNumberSpinner value={rating} onChange={setRating} />

        {/* Small check button */}
        <button
          type="button"
          onClick={handleSave}
          className="h-[24px] px-2 rounded-md bg-[#8B5CF6] text-white hover:bg-[#7C3AED] text-[10px] font-bold shrink-0 cursor-pointer"
        >
          Add
        </button>

        {/* Small cancel button */}
        <button
          type="button"
          onClick={() => setActiveMode(false)}
          className="h-[24px] w-[24px] flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-muted-foreground shrink-0 cursor-pointer"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActiveMode(true)}
      className={cn(
        "px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap",
        isCustomSelected
          ? "border-[#8B5CF6]/45 bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-[#a78bfa] shadow-xs"
          : "border-border/30 bg-muted/10 text-muted-foreground hover:border-border/50 hover:text-foreground"
      )}
    >
      {isCustomSelected ? `${descValue} (Rating: ${currentRating}/10)` : "Custom"}
    </button>
  );
}
