"use client";

import React from "react";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const digits = value.split("").slice(0, 6);
  while (digits.length < 6) digits.push("");

  const handleChange = (i: number, v: string) => {
    const cleanValue = v.replace(/\D/g, "");
    if (cleanValue.length > 1) {
      const newDigits = [...digits];
      for (let j = 0; j < cleanValue.length && i + j < 6; j++) {
        newDigits[i + j] = cleanValue[j];
      }
      const newOtp = newDigits.join("").slice(0, 6);
      onChange(newOtp);
      const focusIndex = Math.min(i + cleanValue.length, 5);
      (document.getElementById(`otp-inv-${focusIndex}`) as HTMLInputElement)?.focus();
      return;
    }

    const d = [...digits];
    d[i] = cleanValue.slice(-1);
    onChange(d.join(""));
    if (cleanValue && i < 5) {
      (document.getElementById(`otp-inv-${i + 1}`) as HTMLInputElement)?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[i] && i > 0) {
        const d = [...digits];
        d[i - 1] = "";
        onChange(d.join(""));
        (document.getElementById(`otp-inv-${i - 1}`) as HTMLInputElement)?.focus();
        e.preventDefault();
      } else if (digits[i]) {
        const d = [...digits];
        d[i] = "";
        onChange(d.join(""));
        e.preventDefault();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const cleanValue = pastedText.replace(/\D/g, "").slice(0, 6);
    if (cleanValue.length > 0) {
      onChange(cleanValue);
      const focusIndex = Math.min(cleanValue.length, 5);
      (document.getElementById(`otp-inv-${focusIndex}`) as HTMLInputElement)?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-inv-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={i === 0}
          className="w-10 h-12 text-center text-sm font-semibold rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/60 focus:bg-purple-500/5 transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}
