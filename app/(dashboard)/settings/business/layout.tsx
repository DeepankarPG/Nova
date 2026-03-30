"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/business/account", label: "Account details" },
  { href: "/settings/business/details", label: "Business details" },
  { href: "/settings/business/banking", label: "Banking & currencies" },
  { href: "/settings/business/tax", label: "Tax details" },
  { href: "/settings/business/branding", label: "Branding" },
] as const;

export default function BusinessSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Business</h2>
        <p className="text-sm text-muted-foreground">
          Legal entity, money movement, tax, and how customers see your brand.{" "}
          <Link href="/client-management" className="font-medium text-primary underline-offset-4 hover:underline">
            Manage team
          </Link>
        </p>
      </div>

      <div className="-mx-1 overflow-x-auto border-b border-border">
        <div className="flex min-w-min gap-0 px-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative whitespace-nowrap px-3 pb-3 pt-1 text-sm transition-colors",
                  active ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {active ? (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-foreground" aria-hidden />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
