import { cn } from "@/lib/utils";
import type { SkuType } from "@/lib/mock-data/sku-management";

const skuTypeStyle: Record<SkuType, string> = {
  service: "bg-emerald-50 text-emerald-700 border-emerald-200",
  good: "bg-blue-50 text-blue-700 border-blue-200",
};

const skuTypeLabel: Record<SkuType, string> = {
  service: "Service",
  good: "Good",
};

export function SkuTypeBadge({ type }: { type: SkuType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        skuTypeStyle[type]
      )}
    >
      {skuTypeLabel[type]}
    </span>
  );
}
