import type { SimpleIcon } from "simple-icons";
import {
  siAlipay,
  siAmericanexpress,
  siApplepay,
  siAxisbank,
  siDiscover,
  siGooglepay,
  siHdfcbank,
  siIcicibank,
  siKlarna,
  siMastercard,
  siPaypal,
  siPaytm,
  siPhonepe,
  siVisa,
} from "simple-icons";
import { cn } from "@/lib/utils";

/** Official Mastercard mark (29×20 viewBox); replaces Simple Icons glyph in payflow mocks. */
export function PayflowMastercardMark({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mastercard.v2.svg"
      alt=""
      width={29}
      height={20}
      className={cn("w-auto shrink-0 object-contain", compact ? "h-3.5" : "h-4", className)}
    />
  );
}

/** Brand SVGs from the Simple Icons library (simpleicons.org) — CC0 */
export function BrandIcon({ icon, size = 16, className }: { icon: SimpleIcon; size?: number; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{icon.title}</title>
      <path fill={`#${icon.hex}`} d={icon.path} />
    </svg>
  );
}

export function PaymentIconRow({
  icons,
  more,
  compact,
}: {
  icons: readonly SimpleIcon[];
  more?: string;
  compact?: boolean;
}) {
  const s = compact ? 14 : 16;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {icons.map((ic) =>
        ic.slug === "mastercard" ? (
          <PayflowMastercardMark key={ic.slug} compact={compact} />
        ) : (
          <BrandIcon key={ic.slug} icon={ic} size={s} />
        )
      )}
      {more ? (
        <span className="rounded border border-[#e5e7eb] bg-[#f9fafb] px-1 py-0.5 text-[9px] font-semibold text-[#6b7280]">
          {more}
        </span>
      ) : null}
    </div>
  );
}

export const PAYFLOW_ICONS = {
  express: [siVisa, siMastercard] as const,
  card: [siVisa, siMastercard, siAmericanexpress, siDiscover] as const,
  upi: [siGooglepay, siPhonepe, siPaytm] as const,
  netBanking: [siHdfcbank, siIcicibank, siAxisbank] as const,
  paypal: [siPaypal] as const,
  global: [siAlipay, siKlarna, siApplepay] as const,
} as const;
