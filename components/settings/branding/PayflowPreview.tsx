"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYFLOW_ICONS, PaymentIconRow } from "@/components/settings/branding/payflow-brand-icons";

const MOCK_TXN = "Txn ID: 6DHSETFS83493";
const MOCK_AMOUNT = "₹19,616 INR";

export type PayflowPreviewProps = {
  brandColor: string;
  accentColor: string;
  radiusPx: number;
  hosted: boolean;
  preferLogo: boolean;
  logoUrl: string | null;
  iconUrl: string | null;
  /** Tighter typography and spacing for narrow mobile preview */
  compact?: boolean;
  merchantName?: string;
};

export function PayflowPreview({
  brandColor,
  accentColor,
  radiusPx,
  hosted,
  preferLogo,
  logoUrl,
  iconUrl,
  compact = false,
  merchantName = "mcatest123",
}: PayflowPreviewProps) {
  const r = Math.max(0, Math.min(24, radiusPx));
  const pad = compact ? "px-3 py-2.5" : "px-4 py-3.5";
  const gap = compact ? "gap-2" : "gap-3";
  const titleClass = compact ? "text-sm font-semibold leading-tight" : "text-[15px] font-semibold leading-tight";
  const subClass = compact ? "text-[10px] text-white/80" : "text-[11px] text-white/85";

  const listPad = compact ? "p-0.5" : "p-1";
  const rowPad = compact ? "px-2.5 py-2" : "px-3 py-2.5";
  const labelClass = compact ? "text-xs font-medium text-[#111827]" : "text-[13px] font-medium text-[#111827]";

  const outerR = r > 0 ? `${Math.min(r + 2, 20)}px` : "0";

  const methodRows = [
    { label: "Credit or debit card", icons: [...PAYFLOW_ICONS.card], more: "+4" as const, selected: true },
    { label: "UPI", icons: [...PAYFLOW_ICONS.upi], more: "+4" as const, selected: false },
    { label: "Net banking", icons: [...PAYFLOW_ICONS.netBanking], more: "+32" as const, selected: false },
    { label: "Paypal", icons: [...PAYFLOW_ICONS.paypal], more: undefined, selected: false },
    { label: "Global Payment Methods", icons: [...PAYFLOW_ICONS.global], more: "+4" as const, selected: false },
  ] as const;

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden bg-white font-sans text-[#111827] antialiased",
        !compact && "shadow-sm"
      )}
      style={
        {
          borderRadius: outerR,
          ["--pf-accent" as string]: accentColor,
          ["--pf-brand" as string]: brandColor,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className={cn("flex items-start justify-between", pad)} style={{ backgroundColor: brandColor }}>
        <div className={cn("flex min-w-0 flex-1 items-start", gap)}>
          <div className="shrink-0">
            {preferLogo && logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className={cn(
                  "object-contain object-left brightness-0 invert",
                  compact ? "h-6 max-w-[88px]" : "h-7 max-w-[120px]"
                )}
              />
            ) : iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt=""
                className={cn("rounded-md border border-white/35 object-cover", compact ? "h-8 w-8" : "h-9 w-9")}
                style={{ borderRadius: r > 0 ? `${Math.min(r, 8)}px` : 0 }}
              />
            ) : (
              <span
                className={cn(
                  "flex items-center justify-center rounded-md bg-white font-bold text-[#111827]",
                  compact ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs"
                )}
                style={{ borderRadius: r > 0 ? `${Math.min(r, 8)}px` : 0 }}
              >
                {merchantName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(titleClass, "text-white")}>{merchantName}</p>
            <p className={cn(subClass, "mt-0.5")}>{MOCK_TXN}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/90"
            style={{ borderRadius: r > 0 ? 4 : 0 }}
          >
            {hosted ? "Hosted" : "Embedded"}
          </span>
          <span className="text-white/90" aria-hidden>
            <X className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"} strokeWidth={2} />
          </span>
        </div>
      </div>

      {/* Amount bar */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-[#e5e7eb] bg-[#f3f4f6]",
          compact ? "px-3 py-2.5" : "px-4 py-3"
        )}
      >
        <span className={cn("text-[#374151]", compact ? "text-xs" : "text-sm")}>Total Amount</span>
        <span className={cn("font-semibold tabular-nums text-[#111827]", compact ? "text-sm" : "text-base")}>{MOCK_AMOUNT}</span>
      </div>

      <div className={cn("bg-white", compact ? "space-y-3 px-3 pb-4 pt-3" : "space-y-4 px-4 pb-5 pt-4")}>
        {/* Express */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("font-semibold text-[#111827]", compact ? "text-xs" : "text-sm")}>Express checkout</span>
              <span
                className="px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  color: accentColor,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 18%, white)`,
                  borderRadius: r > 0 ? 999 : 0,
                }}
              >
                Fastest
              </span>
            </div>
            <PaymentIconRow icons={[...PAYFLOW_ICONS.express]} compact={compact} />
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 bg-black py-2.5 font-medium text-white"
            style={{ borderRadius: r > 0 ? `${Math.min(r + 2, 14)}px` : 0 }}
          >
            <svg className={compact ? "h-5 w-5" : "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.55-1.31 3.07-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className={compact ? "text-xs tracking-tight" : "text-sm tracking-tight"}>Pay</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[#e5e7eb]" />
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">Or pay with</span>
          <div className="h-px flex-1 bg-[#e5e7eb]" />
        </div>

        {/* Methods */}
        <div
          className={cn("border border-[#e5e7eb] bg-white", listPad)}
          style={{ borderRadius: r > 0 ? `${Math.min(r + 4, 16)}px` : 0 }}
        >
          {methodRows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between gap-2 border-[#e5e7eb]",
                rowPad,
                i > 0 ? "border-t" : ""
              )}
            >
              <div className="min-w-0 flex-1">
                <p className={cn(labelClass, "truncate")}>{row.label}</p>
                <div className="mt-1">
                  <PaymentIconRow icons={row.icons} more={row.more} compact={compact} />
                </div>
              </div>
              <span
                className="h-4 w-4 shrink-0 rounded-full border-2"
                style={{
                  borderColor: row.selected ? accentColor : "#d1d5db",
                  backgroundColor: row.selected ? accentColor : "transparent",
                }}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="w-full py-2.5 text-sm font-semibold text-white shadow-sm"
          style={{
            backgroundColor: accentColor,
            borderRadius: r > 0 ? `${Math.min(r + 2, 14)}px` : 0,
          }}
        >
          Pay {MOCK_AMOUNT}
        </button>

        {/* Footer */}
        <div className="pt-1 text-center">
          <p className="text-[10px] text-[#9ca3af]">Powered by</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: accentColor }}>
            PayGlocal
          </p>
        </div>
      </div>
    </div>
  );
}
