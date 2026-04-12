"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={cn("relative rounded-xl border border-border bg-card shadow-sm", className)}>
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        aria-label={copied ? "Copied" : "Copy code"}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      </button>
      <pre className="overflow-x-auto px-4 py-4 pr-14 text-left sm:px-5 sm:py-5 sm:pr-14">
        <code className="font-mono text-[12px] leading-relaxed text-foreground">{code}</code>
      </pre>
    </div>
  );
}
