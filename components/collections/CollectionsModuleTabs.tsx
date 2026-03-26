"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  clientReceivingLocations,
  platformPayoutGuides,
} from "@/lib/mock-data";

const firstLocation = clientReceivingLocations[0]?.id ?? "usa";
const firstPlatform = platformPayoutGuides[0]?.id ?? "amazon";

export function CollectionsModuleTabs() {
  const pathname = usePathname();
  const isMca = pathname.includes("/international-accounts/mca");
  const isPlatform = pathname.includes("/international-accounts/platform-withdrawals");

  const mcaHref = `/payment-products/international-accounts/mca/${firstLocation}`;
  const platformHref = `/payment-products/international-accounts/platform-withdrawals/${firstPlatform}`;

  return (
    <div className="mb-5">
      <div
        className="inline-flex w-full sm:w-auto flex-col sm:flex-row gap-1.5 p-1 rounded-xl bg-gray-100"
        style={{ border: "1px solid #e5e7eb" }}
        role="tablist"
      >
        <Link
          href={mcaHref}
          role="tab"
          aria-selected={isMca}
          className={cn(
            "flex items-center justify-center min-h-10 px-5 rounded-lg text-sm font-medium transition-all duration-150",
            isMca
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
          )}
          style={isMca ? { border: "1px solid #e5e7eb" } : undefined}
        >
          Multi-currency accounts
        </Link>
        <Link
          href={platformHref}
          role="tab"
          aria-selected={isPlatform}
          className={cn(
            "flex items-center justify-center min-h-10 px-5 rounded-lg text-sm font-medium transition-all duration-150",
            isPlatform
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
          )}
          style={isPlatform ? { border: "1px solid #e5e7eb" } : undefined}
        >
          Platform withdrawals
        </Link>
      </div>
    </div>
  );
}
