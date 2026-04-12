"use client";

import Link from "next/link";
import { Package, RefreshCw, Sparkles, Wand2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const cardClass = cn(
  "group flex shrink-0 flex-col items-start gap-2 rounded-xl border border-border bg-card text-left",
  "px-3.5 pb-2.5 pt-3.5 shadow-sm transition-shadow duration-150",
  "hover:bg-muted/40 hover:shadow",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "w-[9rem] sm:w-[9.25rem]"
);

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/ai-storefront/setup", label: "Setup wizard", icon: Wand2 },
  { href: "/ai-storefront/catalogue", label: "Catalogue", icon: Package },
  { href: "/ai-storefront/inventory", label: "Inventory", icon: RefreshCw },
  { href: "/ai-storefront/settings", label: "Store & AI", icon: Sparkles },
];

export function AiStorefrontQuickAccess() {
  return (
    <div className="w-full">
      <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.02em] text-foreground sm:text-base">
        Quick access
      </h2>
      <div className="w-fit max-w-full">
        <div className="flex flex-wrap gap-2.5">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cardClass}>
              <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
              <span className="text-left text-[11px] font-medium leading-snug text-foreground sm:text-xs">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
