"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, AlertTriangle, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "./setup-helpers";

export function RecoveryCodesScreen({
  employeeId,
  codes,
  onDone,
}: {
  employeeId: string;
  codes: string[];
  onDone: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const copyAll = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    toast.success("All codes copied to clipboard");
  };

  const downloadTxt = () => {
    const text = `MERGEX OS RECOVERY CODES
Employee ID: ${employeeId}
Generated: ${new Date().toLocaleString()}

Keep these codes secure. They can be used to recover access if you lose your credentials.

${codes.map((code, index) => `${index + 1}. ${code}`).join("\n")}
`;
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `mergex-recovery-codes-${employeeId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Recovery codes downloaded as TXT file");
  };

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="flex flex-col items-center text-center gap-2 py-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Platform Initialized</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Save your recovery codes before continuing
          </p>
        </div>
        {/* Employee ID badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1">
          <KeyRound className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 font-mono tracking-wider">
            Your ID: {employeeId}
          </span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[10px] font-medium text-amber-300/80 leading-relaxed">
          These codes will <strong>never be shown again</strong>. Store them in a password
          manager or secure offline location.
        </p>
      </div>

      {/* Recovery codes list */}
      <div className="rounded-lg border border-white/5 bg-[#121214] overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-white/2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            Recovery Codes ({codes.length})
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadTxt}
              className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <Download className="h-2.5 w-2.5" /> Download TXT
            </button>
            <div className="h-2.5 w-px bg-white/10" />
            <button
              onClick={copyAll}
              className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              {copiedAll ? (
                <><Check className="h-2.5 w-2.5 text-emerald-400" /> Copied!</>
              ) : (
                <><Copy className="h-2.5 w-2.5" /> Copy all</>
              )}
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {codes.map((code, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3.5 py-2 hover:bg-white/1 transition-colors"
            >
              <span className="font-mono text-xs font-semibold tracking-wider text-white">
                {code}
              </span>
              <CopyButton text={code} />
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`h-4 w-4 rounded border flex items-center justify-center transition-all duration-200 ${
              saved
                ? "border-purple-500 bg-purple-500"
                : "border-white/10 group-hover:border-white/20 bg-transparent"
            }`}
          >
            {saved && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
          </div>
        </div>
        <span className="text-[11px] text-zinc-400 leading-normal select-none">
          I have securely saved all recovery codes and know they are lost forever if I don't.
        </span>
      </label>

      {/* CTA */}
      <button
        type="button"
        onClick={onDone}
        disabled={!saved}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-black disabled:text-zinc-500 py-2.5 text-xs font-bold shadow-lg shadow-black/25 active:scale-[0.99] transition-all disabled:opacity-40 duration-200"
      >
        Go to Sign In
      </button>
    </div>
  );
}
