"use client";

interface ErrorMsgProps {
  message: string;
}

export function ErrorMsg({ message }: ErrorMsgProps) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5">
      <p className="text-[10px] font-medium text-rose-400 leading-relaxed">
        {message}
      </p>
    </div>
  );
}
