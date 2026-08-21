"use client";

import { useState } from "react";
import { ChevronDown, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotesAndTermsSection({
  memo,
  onMemoChange,
  footer,
  onFooterChange,
}: {
  memo: string;
  onMemoChange: (v: string) => void;
  footer: string;
  onFooterChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/30"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <PenLine className="h-4 w-4" />
        </div>
        <span className="flex flex-1 items-center gap-2">
          <span className="text-[15px] font-semibold text-foreground">Memo &amp; footer</span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Optional</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border px-5 py-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Memo</label>
            <textarea
              value={memo}
              onChange={(e) => onMemoChange(e.target.value)}
              placeholder="Thank you for your business"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Footer</label>
            <textarea
              value={footer}
              onChange={(e) => onFooterChange(e.target.value)}
              placeholder="Payment due within the agreed terms"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>
      )}
    </div>
  );
}
