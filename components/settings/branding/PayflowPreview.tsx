"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PayflowCardMethodExpanded } from "@/components/settings/branding/PayflowCardMethodExpanded";
import {
  DEFAULT_ENABLED_METHODS,
  PAYFLOW_METHOD_CONFIG,
  type PayflowMethodId,
} from "@/components/settings/branding/payflow-methods-config";
import { PAYFLOW_ICONS, PaymentIconRow } from "@/components/settings/branding/payflow-brand-icons";

const MOCK_TXN = "Txn ID: 6DHSETFS83493";
const MOCK_AMOUNT = "₹19,616 INR";

export type PayflowPreviewProps = {
  brandColor: string;
  accentColor: string;
  radiusPx: number;
  preferLogo: boolean;
  logoUrl: string | null;
  iconUrl: string | null;
  /** Vertical rule between wide logo and brand name in the checkout header */
  showLogoBrandDivider?: boolean;
  /** Which payment rails appear in the mock (order preserved). */
  enabledMethods?: Record<PayflowMethodId, boolean>;
  /** Tighter typography and spacing for narrow mobile preview */
  compact?: boolean;
  /** Full-width column inside a scrolling phone shell (no flex “fill” tricks). */
  mobileScrollLayout?: boolean;
  merchantName?: string;
};

export function PayflowPreview({
  brandColor,
  accentColor,
  radiusPx,
  preferLogo,
  logoUrl,
  iconUrl,
  showLogoBrandDivider = true,
  enabledMethods: enabledMethodsProp,
  compact = false,
  mobileScrollLayout = false,
  merchantName = "mcatest123",
}: PayflowPreviewProps) {
  const enabledMethods = useMemo(
    () => ({ ...DEFAULT_ENABLED_METHODS, ...enabledMethodsProp }),
    [enabledMethodsProp]
  );
  const visibleMethods = useMemo(
    () => PAYFLOW_METHOD_CONFIG.filter((m) => enabledMethods[m.id]),
    [enabledMethods]
  );

  const [activeId, setActiveId] = useState<PayflowMethodId>("card");

  useEffect(() => {
    if (!visibleMethods.length) return;
    if (!visibleMethods.some((m) => m.id === activeId)) {
      setActiveId(visibleMethods[0].id);
    }
  }, [visibleMethods, activeId]);

  const r = Math.max(0, Math.min(24, radiusPx));
  const isPhoneScroll = compact && mobileScrollLayout;

  const pad = isPhoneScroll
    ? "px-3.5 py-3.5"
    : compact
      ? "px-3 py-2.5"
      : "px-4 py-3.5";
  const gap = isPhoneScroll ? "gap-2.5" : compact ? "gap-2" : "gap-3";
  const titleClass = isPhoneScroll
    ? "text-[15px] font-semibold leading-tight"
    : compact
      ? "text-sm font-semibold leading-tight"
      : "text-[15px] font-semibold leading-tight";
  const subClass = isPhoneScroll
    ? "text-[11px] text-white/85"
    : compact
      ? "text-[10px] text-white/80"
      : "text-[11px] text-white/85";

  const listPad = isPhoneScroll ? "p-1" : compact ? "p-0.5" : "p-1";
  const rowPad = isPhoneScroll ? "px-3 py-3" : compact ? "px-2.5 py-2" : "px-3 py-2.5";
  const labelClass = isPhoneScroll
    ? "text-[13px] font-medium text-[#111827]"
    : compact
      ? "text-xs font-medium text-[#111827]"
      : "text-[13px] font-medium text-[#111827]";

  const outerR = r > 0 ? `${Math.min(r + 2, 20)}px` : "0";
  const hasWideLogo = preferLogo && !!logoUrl;
  const showDivider = hasWideLogo && showLogoBrandDivider;

  const showBottomPay = activeId !== "card" || !enabledMethods.card;

  /** In the phone preview, avoid a second “floating card” — let the parent screen clip the corners */
  const shellRadius = compact ? "0px" : outerR;

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full bg-white font-sans text-[#111827] antialiased",
        /* Let the phone scroll parent own vertical scroll — avoid clipping tall checkout */
        isPhoneScroll ? "max-w-full overflow-x-hidden pb-2" : "max-w-full overflow-hidden",
        !isPhoneScroll && compact ? "flex min-h-0 flex-1 flex-col pb-0" : "",
        !isPhoneScroll && !compact ? "pb-2 shadow-sm" : ""
      )}
      style={
        {
          borderRadius: shellRadius,
          ["--pf-accent" as string]: accentColor,
          ["--pf-brand" as string]: brandColor,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className={cn("flex shrink-0 items-start justify-between", pad)} style={{ backgroundColor: brandColor }}>
        <div
          className={cn(
            "flex min-w-0 flex-1",
            gap,
            hasWideLogo ? "items-center" : "items-start"
          )}
        >
          <div className="shrink-0">
            {preferLogo && logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className={cn(
                  "object-contain object-left brightness-0 invert",
                  isPhoneScroll ? "h-7 max-w-[120px]" : compact ? "h-6 max-w-[88px]" : "h-7 max-w-[120px]"
                )}
              />
            ) : iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt=""
                className={cn(
                  "rounded-md border border-white/35 object-cover",
                  isPhoneScroll ? "h-9 w-9" : compact ? "h-8 w-8" : "h-9 w-9"
                )}
                style={{ borderRadius: r > 0 ? `${Math.min(r, 8)}px` : 0 }}
              />
            ) : (
              <span
                className={cn(
                  "flex items-center justify-center rounded-md bg-white font-bold text-[#111827]",
                  isPhoneScroll ? "h-9 w-9 text-xs" : compact ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs"
                )}
                style={{ borderRadius: r > 0 ? `${Math.min(r, 8)}px` : 0 }}
              >
                {merchantName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          {showDivider ? (
            <div
              className={cn(
                "w-px shrink-0 self-stretch bg-white/35",
                isPhoneScroll ? "min-h-[1.75rem]" : compact ? "min-h-[1.5rem]" : "min-h-[1.75rem]"
              )}
              aria-hidden
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className={cn(titleClass, "text-white")}>{merchantName}</p>
            <p className={cn(subClass, "mt-0.5")}>{MOCK_TXN}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center text-white/90" aria-hidden>
          <X className={isPhoneScroll ? "h-[18px] w-[18px]" : compact ? "h-4 w-4" : "h-[18px] w-[18px]"} strokeWidth={2} />
        </div>
      </div>

      {/* Amount bar */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-[#f3f4f6]",
          isPhoneScroll ? "px-3.5 py-3" : compact ? "px-3 py-2.5" : "px-4 py-3"
        )}
      >
        <span className={cn("text-[#374151]", isPhoneScroll ? "text-sm" : compact ? "text-xs" : "text-sm")}>
          Total Amount
        </span>
        <span
          className={cn(
            "font-semibold tabular-nums text-[#111827]",
            isPhoneScroll ? "text-base" : compact ? "text-sm" : "text-base"
          )}
        >
          {MOCK_AMOUNT}
        </span>
      </div>

      <div
        className={cn(
          "bg-white",
          isPhoneScroll
            ? "space-y-4 px-3.5 pb-8 pt-4"
            : compact
              ? "flex min-h-0 flex-1 flex-col space-y-3 px-3 pb-4 pt-3"
              : "space-y-4 px-4 pb-7 pt-4"
        )}
      >
        {/* Express */}
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn("font-semibold text-[#111827]", isPhoneScroll ? "text-sm" : compact ? "text-xs" : "text-sm")}
              >
                Express checkout
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 font-semibold",
                  isPhoneScroll ? "text-[11px]" : "text-[10px]"
                )}
                style={{
                  color: accentColor,
                  backgroundColor: `color-mix(in srgb, ${accentColor} 18%, white)`,
                  borderRadius: r > 0 ? 999 : 0,
                }}
              >
                Fastest
              </span>
            </div>
            <PaymentIconRow icons={[...PAYFLOW_ICONS.express]} compact={compact && !isPhoneScroll} />
          </div>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-center gap-2 bg-black font-medium text-white",
              isPhoneScroll ? "py-3.5" : "py-2.5"
            )}
            style={{ borderRadius: r > 0 ? `${Math.min(r + 2, 14)}px` : 0 }}
          >
            <svg
              className={isPhoneScroll ? "h-6 w-6" : compact ? "h-5 w-5" : "h-6 w-6"}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.55-1.31 3.07-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className={isPhoneScroll ? "text-sm tracking-tight" : compact ? "text-xs tracking-tight" : "text-sm tracking-tight"}>
              Pay
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[#e5e7eb]" />
          <span
            className={cn(
              "font-semibold uppercase tracking-wider text-[#9ca3af]",
              isPhoneScroll ? "text-[10px]" : "text-[9px]"
            )}
          >
            Or pay with
          </span>
          <div className="h-px flex-1 bg-[#e5e7eb]" />
        </div>

        {/* Methods */}
        <div
          className={cn("border border-[#e5e7eb] bg-white", listPad)}
          style={{ borderRadius: r > 0 ? `${Math.min(r + 4, 16)}px` : 0 }}
        >
          {visibleMethods.map((row, i) => {
            const selected = activeId === row.id;
            return (
              <div key={row.id} className={cn(i > 0 ? "border-t border-[#e5e7eb]" : "")}>
                <button
                  type="button"
                  onClick={() => setActiveId(row.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 text-left transition-colors hover:bg-[#fafafa]",
                    rowPad
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <p className={cn(labelClass, "shrink-0")}>{row.label}</p>
                      <div className="min-w-0 shrink">
                        <PaymentIconRow icons={row.icons} more={row.more} compact={compact && !isPhoneScroll} />
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border-2",
                      isPhoneScroll ? "h-5 w-5" : "h-4 w-4"
                    )}
                    style={{
                      borderColor: selected ? accentColor : "#d1d5db",
                      backgroundColor: selected ? accentColor : "transparent",
                    }}
                    aria-hidden
                  />
                </button>
                {row.id === "card" && selected ? (
                  <PayflowCardMethodExpanded
                    accentColor={accentColor}
                    radiusPx={radiusPx}
                    amountLabel={MOCK_AMOUNT}
                    compact={compact && !isPhoneScroll}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {showBottomPay ? (
          <button
            type="button"
            className={cn(
              "w-full font-semibold text-white shadow-sm",
              isPhoneScroll ? "py-3.5 text-base" : "py-2.5 text-sm"
            )}
            style={{
              backgroundColor: accentColor,
              borderRadius: r > 0 ? `${Math.min(r + 2, 14)}px` : 0,
            }}
          >
            Pay {MOCK_AMOUNT}
          </button>
        ) : null}

        {!isPhoneScroll && compact ? <div className="min-h-2 flex-1 shrink-0" aria-hidden /> : null}

        {/* Footer — same asset as nav; sized for legibility inside scaled preview */}
        <div className={cn("text-center", isPhoneScroll ? "pt-3" : compact ? "mt-auto shrink-0 pt-1" : "pt-1.5")}>
          <p
            className={cn(
              "font-medium tracking-wide text-[#9ca3af]",
              isPhoneScroll ? "text-xs" : compact ? "text-[11px]" : "text-xs"
            )}
          >
            Powered by
          </p>
          <div className={cn("flex justify-center px-1", isPhoneScroll ? "mt-2 pb-1" : compact ? "mt-1.5 pb-0.5" : "mt-2 pb-1")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/payglocal-logo.png"
              alt="PayGlocal"
              width={120}
              height={28}
              className={cn(
                "w-auto object-contain object-center",
                isPhoneScroll
                  ? "h-6 max-w-[min(100%,124px)]"
                  : compact
                    ? "h-5 max-w-[min(100%,108px)]"
                    : "h-6 max-w-[min(100%,124px)] sm:h-[26px] sm:max-w-[132px]"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
