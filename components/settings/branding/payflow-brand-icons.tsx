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
      {icons.map((ic) => (
        <BrandIcon key={ic.slug} icon={ic} size={s} />
      ))}
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
