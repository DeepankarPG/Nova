"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDocsNavSections } from "@/lib/docs-nav";
import { UI_DOCS_NAME } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();
  const sections = getDocsNavSections();

  return (
    <aside className="hidden w-[15.5rem] shrink-0 border-r border-border bg-card lg:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-6 overflow-y-auto px-4 py-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Docs</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{UI_DOCS_NAME}</p>
        </div>
        <nav className="flex flex-col gap-6" aria-label="Documentation">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/docs"
                      ? pathname === "/docs"
                      : item.href === "/docs/components"
                        ? pathname === "/docs/components"
                        : item.href === "/docs/foundations"
                          ? pathname === "/docs/foundations"
                          : item.href === "/docs/patterns"
                            ? pathname === "/docs/patterns"
                            : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
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
