"use client";

import { usePathname } from "next/navigation";
import { DESIGN_DOCS_TOC } from "@/components/design-system/design-docs-toc";
import { cn } from "@/lib/utils";

export function DesignDocsToc() {
  const pathname = usePathname();
  const items = pathname ? DESIGN_DOCS_TOC[pathname] : undefined;

  if (!items?.length) {
    return null;
  }

  return (
    <aside className="hidden w-[13.5rem] shrink-0 xl:block">
      <div className="sticky top-14 space-y-3 py-8 pl-6 pr-2">
        <p className="text-xs font-semibold text-foreground">On this page</p>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "block text-muted-foreground transition-colors hover:text-foreground",
                  "underline-offset-4 hover:underline"
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
