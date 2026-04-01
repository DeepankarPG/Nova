"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESIGN_DOCS_NAV } from "@/components/design-system/design-docs-nav";
import { cn } from "@/lib/utils";

export function DesignDocsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card lg:block">
      <div className="sticky top-0 flex h-[calc(100dvh-0px)] flex-col gap-6 overflow-y-auto px-4 py-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Atlas</p>
          <p className="mt-1 text-xs text-muted-foreground">PayGlocal UI</p>
        </div>
        <nav className="flex flex-col gap-6" aria-label="Design documentation">
          {DESIGN_DOCS_NAV.map((section) => (
            <div key={section.label}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/design"
                      ? pathname === "/design"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
