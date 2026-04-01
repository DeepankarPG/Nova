"use client";

import { Briefcase, Facebook, Instagram, X, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentRequestEmailPreviewProps = {
  brandColor: string;
  accentColor: string;
  radiusPx: number;
  compact?: boolean;
  merchantName?: string;
};

export function PaymentRequestEmailPreview({
  brandColor,
  accentColor,
  radiusPx,
  compact = false,
  merchantName = "mcatest123",
}: PaymentRequestEmailPreviewProps) {
  const r = Math.max(0, Math.min(20, radiusPx));
  const pad = compact ? "px-3 py-3" : "px-5 py-4";
  const cardR = r > 0 ? `${Math.min(r, 12)}px` : "0";

  return (
    <div className={cn("w-full min-w-0 max-w-full font-sans antialiased", compact && "min-h-0")}>
      {/* Email client chrome (light) — square top in phone preview so device mask clips cleanly */}
      <div
        className={cn(
          "overflow-hidden border border-b-0 border-border bg-muted/50 px-2 py-1.5 text-[10px] text-muted-foreground dark:bg-zinc-900/80",
          compact ? "rounded-none border-x-0 border-t-0" : "rounded-t-lg"
        )}
      >
        <span className="truncate font-mono">To: customer@example.com · Payment request</span>
      </div>

      <div
        className={cn(
          "overflow-hidden border border-border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
          compact ? "rounded-none border-x-0 border-b-0 shadow-none" : "rounded-b-lg"
        )}
      >
        {/* Header */}
        <div className={cn("text-white", pad)} style={{ backgroundColor: brandColor }}>
          <p className={cn("font-semibold leading-snug", compact ? "text-sm" : "text-lg md:text-xl")}>
            Payment request from {merchantName}
          </p>
          <div
            className={cn(
              "mt-2 inline-flex max-w-full items-center gap-1.5 bg-white/15 px-2 py-1 text-[11px] font-medium text-white/95",
              r > 0 && "rounded-full"
            )}
            style={{ borderRadius: r > 0 ? 999 : 0 }}
          >
            <Briefcase className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
            <span className="truncate">For ASUS ZEN laptop XX2345</span>
          </div>
        </div>

        <div className={cn("space-y-4 bg-white px-4 py-4 text-[#111827] dark:bg-zinc-950 dark:text-zinc-100", !compact && "px-6 py-6")}>
          <p className={cn("font-semibold", compact ? "text-sm" : "text-base")}>Hi Deepankar Raj,</p>
          <p className={cn("leading-relaxed text-[#4b5563] dark:text-zinc-400", compact ? "text-xs" : "text-sm")}>
            You&apos;ve received a payment request of{" "}
            <strong className="text-[#111827] dark:text-zinc-100">₹19,616.00 INR</strong> from{" "}
            <strong className="text-[#111827] dark:text-zinc-100">{merchantName}</strong>. Here are the details:
          </p>

          <div
            className="border border-[#e5e7eb] bg-[#fafafa] p-3 dark:border-zinc-700 dark:bg-zinc-900/50"
            style={{ borderRadius: cardR }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Payment details</p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-[#6b7280] dark:text-zinc-500">Issued to</dt>
                <dd>
                  <span className="font-medium" style={{ color: accentColor }}>
                    accounts@acmecorp.in
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-[#6b7280] dark:text-zinc-500">Link expiry</dt>
                <dd className="font-medium text-amber-800 dark:text-amber-400">28 Mar &apos;26, 03:59 AM</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-[#6b7280] dark:text-zinc-500">Billing details</dt>
                <dd className="text-[#374151] dark:text-zinc-300">221B Baker Street, Bengaluru 560001, India</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#e5e7eb] pt-4 dark:border-zinc-700 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Amount payable</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-[#111827] dark:text-zinc-100">₹19,616.00 INR</p>
            </div>
            <button
              type="button"
              className="w-full shrink-0 px-5 py-2.5 text-sm font-semibold text-white shadow-sm sm:w-auto"
              style={{ backgroundColor: accentColor, borderRadius: cardR }}
            >
              Proceed to pay
            </button>
          </div>

          <p className="text-xs leading-relaxed text-[#6b7280] dark:text-zinc-500">
            For any order or payment-related queries, please reach out to <strong className="text-[#374151] dark:text-zinc-300">{merchantName}</strong>{" "}
            support.
          </p>
        </div>

        {/* Footer strip */}
        <div className="border-t border-[#e5e7eb] bg-[#f9fafb] px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: accentColor }}>
                PayGlocal
              </p>
              <p className="mt-0.5 text-[10px] text-[#9ca3af]">Fostering Global Commerce</p>
            </div>
            <div className="flex gap-3 text-[#9ca3af]" aria-hidden>
              <Instagram className="h-3.5 w-3.5" />
              <Facebook className="h-3.5 w-3.5" />
              <X className="h-3.5 w-3.5" />
              <Youtube className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="mt-3 text-[10px] text-[#9ca3af]">© 2026 PayGlocal Technologies Pvt. Ltd.</p>
        </div>
      </div>
    </div>
  );
}
