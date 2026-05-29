"use client";

import { CreditCard, Lock, Shield } from "lucide-react";
import { BrandIcon, PayflowMastercardMark } from "@/components/settings/branding/payflow-brand-icons";
import { siVisa } from "simple-icons";
import { cn } from "@/lib/utils";

export function PayflowCardMethodExpanded({
  accentColor,
  radiusPx,
  amountLabel,
  compact,
}: {
  accentColor: string;
  radiusPx: number;
  amountLabel: string;
  compact?: boolean;
}) {
  const r = Math.max(0, Math.min(24, radiusPx));
  const innerR = r > 0 ? `${Math.min(r, 10)}px` : "0";
  const btnR = r > 0 ? `${Math.min(r + 2, 14)}px` : "0";
  const iconSize = compact ? 12 : 14;

  return (
    <div className={cn("border-t border-[#e5e7eb] bg-white", compact ? "px-2.5 pb-3 pt-2" : "px-3 pb-3.5 pt-2.5")}>
      <p className={cn("text-[#9ca3af]", compact ? "mb-1.5 text-[10px]" : "mb-2 text-xs")}>Enter card details</p>

      <div className="overflow-hidden border border-[#e5e7eb] bg-white" style={{ borderRadius: innerR }}>
        <div
          className={cn(
            "flex items-center gap-2 border-b border-[#e5e7eb] bg-white text-[#9ca3af]",
            compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"
          )}
        >
          <span className="min-w-0 flex-1 truncate">1234 1234 1234 1234</span>
          <div className="flex shrink-0 items-center gap-1">
            <BrandIcon icon={siVisa} size={iconSize} />
            <PayflowMastercardMark compact={compact} />
          </div>
        </div>
        <div className="flex min-h-0">
          <div
            className={cn(
              "min-w-0 flex-1 border-r border-[#e5e7eb] text-[#9ca3af]",
              compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"
            )}
          >
            MM / YY
          </div>
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center justify-between gap-1.5 text-[#9ca3af]",
              compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"
            )}
          >
            <span>CVC</span>
            <CreditCard className="h-3.5 w-3.5 shrink-0 text-[#d1d5db]" aria-hidden />
          </div>
        </div>
      </div>

      <label
        className={cn(
          "mt-3 flex cursor-default items-start gap-2 text-left text-[#374151]",
          compact ? "text-[10px] leading-snug" : "text-xs leading-snug"
        )}
      >
        <span
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border border-[#d1d5db] bg-white"
          aria-hidden
        />
        <span>
          By continuing, you agree to the{" "}
          <span className="font-medium" style={{ color: accentColor }}>
            T&C
          </span>{" "}
          and{" "}
          <span className="font-medium" style={{ color: accentColor }}>
            Privacy Policy
          </span>
          .
        </span>
      </label>

      <button
        type="button"
        className="mt-3 w-full py-2.5 text-sm font-semibold text-white shadow-sm"
        style={{ backgroundColor: accentColor, borderRadius: btnR }}
      >
        Pay {amountLabel}
      </button>

      <div
        className={cn(
          "mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[#9ca3af]",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        <span className="inline-flex items-center gap-1">
          <Shield className="h-3 w-3 shrink-0" aria-hidden />
          256-bit encryption
        </span>
        <span className="inline-flex items-center gap-1">
          <Lock className="h-3 w-3 shrink-0" aria-hidden />
          PCI DSS Compliant
        </span>
      </div>
    </div>
  );
}
