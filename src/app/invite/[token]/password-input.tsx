"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-white/10 bg-transparent pl-9 pr-9 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/20 disabled:opacity-50 hover:border-white/15"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
