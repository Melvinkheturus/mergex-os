"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1 w-full">
      <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase select-none">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[9px] text-zinc-500 leading-normal">{hint}</p>
      )}
      {error && <p className="text-[10px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-white/10 bg-transparent px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15 ${className ?? ""}`}
      {...props}
    />
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="ml-2 shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
