"use client";

import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function BankDetailRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-[12px] font-medium text-gray-500 w-[9.25rem] shrink-0 sm:w-[10rem]">{label}</dt>
      <dd className="flex min-w-0 flex-1 items-baseline gap-1.5">
        <span className="text-[13px] font-semibold text-gray-900 break-words">{value}</span>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded p-1 -my-0.5 transition-all duration-150",
            "text-gray-400 hover:bg-gray-100 hover:text-[#0061E3]",
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0061E3]/30"
          )}
          aria-label={`Copy ${label}`}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </dd>
    </div>
  );
}
