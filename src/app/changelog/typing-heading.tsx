"use client";

import { useEffect, useState } from "react";

export function TypingHeading() {
  const text = "MERGEX OS CHANGELOG";
  const [length, setLength] = useState(0);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current++;
      setLength(current);
      if (current >= text.length) {
        clearInterval(timer);
      }
    }, 70); // 70ms per character for typing speed
    return () => clearInterval(timer);
  }, []);

  const visibleText = text.slice(0, length);
  const part1 = visibleText.slice(0, 9); // "MERGEX OS"
  const part2 = visibleText.slice(9);    // " CHANGELOG"

  return (
    <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight leading-none uppercase min-h-[1.2em] flex items-center flex-wrap font-clash">
      <span>{part1}</span>
      {part2.trim().length > 0 && (
        <span className="bg-linear-to-b from-white to-purple-500 bg-clip-text text-transparent ml-[0.3em]">
          {part2.trim()}
        </span>
      )}
      <span 
        className="inline-block w-1.5 h-[0.85em] bg-purple-500 ml-1.5 align-middle animate-pulse" 
        style={{ animationDuration: "0.8s" }}
      />
    </h1>
  );
}
