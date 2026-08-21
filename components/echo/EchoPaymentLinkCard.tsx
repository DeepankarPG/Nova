"use client";

import { Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
  const handleCopy = () => {
    void navigator.clipboard.writeText(result.url).then(
      () => toast.success("Link copied"),
      () => toast.error("Could not copy")
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: `Payment link — ${result.currency} ${result.amount.toLocaleString()}`,
      text: `Here's your payment link for ${result.currency} ${result.amount.toLocaleString()}:`,
      url: result.url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled — not an error
        if (err instanceof Error && err.name !== "AbortError") {
          // Fallback: copy to clipboard
          handleCopy();
        }
      }
    } else {
      // Desktop fallback — copy link
      handleCopy();
    }
  };

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
      <div className="mt-3 flex items-center justify-center rounded-xl border border-border bg-white p-3">
        <QRCodeSVG value={result.url} size={128} level="M" />
      </div>
      <div className="mt-3 flex gap-2">
        {/* Copy — primary */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy link
        </button>
        {/* Share — native OS share sheet */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-[12px] font-medium transition-colors hover:bg-accent active:bg-accent"
          aria-label="Share payment link"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </div>
  );
}
