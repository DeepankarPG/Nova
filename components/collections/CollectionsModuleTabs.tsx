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
        className="inline-flex w-full sm:w-auto flex-col sm:flex-row gap-1.5 p-1 rounded-xl bg-muted border border-border/70 dark:border-border"
        role="tablist"
      >
        <Link
          href={mcaHref}
          role="tab"
          aria-selected={isMca}
          className={cn(
            "flex items-center justify-center min-h-10 px-5 rounded-lg text-sm font-medium transition-all duration-150",
            isMca
              ? "bg-card text-foreground shadow-sm dark:bg-muted dark:border dark:border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
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
              ? "bg-card text-foreground shadow-sm dark:bg-muted dark:border dark:border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
          )}
        >
          Platform withdrawals
        </Link>
      </div>
    </div>
  );
}
