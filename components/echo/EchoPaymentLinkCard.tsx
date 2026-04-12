"use client";

import Link from "next/link";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import type { EchoPaymentLinkResult } from "@/lib/echo/types";
import { cn } from "@/lib/utils";

export function EchoPaymentLinkCard({
  result,
  className,
}: {
  result: EchoPaymentLinkResult;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-3 shadow-sm dark:bg-card/95",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Payment link
      </p>
      <p className="mt-1 text-[15px] font-semibold text-foreground">
        {result.currency} {result.amount.toLocaleString()}
      </p>
      <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{result.url}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-accent"
          onClick={() => {
            void navigator.clipboard.writeText(result.url).then(
              () => toast.success("Link copied"),
              () => toast.error("Could not copy")
            );
          }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy link
        </button>
        <Link
          href="/payment-products/payment-links"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open payment links
        </Link>
      </div>
    </div>
  );
}
