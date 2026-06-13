"use client";

import React from "react";

interface ScoreCircleProps {
  score: number;
  max?: number;
}

export function ScoreCircle({ score, max = 125 }: ScoreCircleProps) {
  const R = 38;
  const C = 2 * Math.PI * R;
  const pct = Math.min(score / max, 1);
  const offset = C * (1 - pct);

  let gradStart = "#3f3f46";
  let gradEnd = "#27272a";

  if (score >= 80) {
    gradStart = "#10b981"; // Emerald
    gradEnd = "#059669";   // Green
  } else if (score >= 45) {
    gradStart = "#f59e0b"; // Amber
    gradEnd = "#d97706";   // Orange
  } else if (score > 0) {
    gradStart = "#f43f5e"; // Rose
    gradEnd = "#e11d48";   // Red
  }

  return (
    <svg width="112" height="112" viewBox="0 0 100 100" className="rotate-[-90deg] overflow-visible">
      <defs>
        {/* Glow Filter */}
        <filter id="circle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Gradient */}
        <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradStart} />
          <stop offset="100%" stopColor={gradEnd} />
        </linearGradient>
      </defs>
      
      {/* Background Track */}
      <circle 
        cx="50" cy="50" r={R} 
        fill="none" 
        stroke="rgba(255,255,255,0.06)" 
        strokeWidth="7" 
      />
      
      {/* Glow path */}
      {score > 0 && (
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke={gradStart}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          filter="url(#circle-glow)"
          className="transition-all duration-500 ease-out"
          style={{ 
            opacity: 0.65,
          }}
        />
      )}

      {/* Foreground path */}
      <circle
        cx="50" cy="50" r={R}
        fill="none"
        stroke="url(#score-grad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}
