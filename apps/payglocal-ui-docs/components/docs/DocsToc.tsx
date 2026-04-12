"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STATIC_DOCS_TOC } from "@/lib/docs-toc";
import { COMPONENT_BY_SLUG } from "@/lib/component-registry";
import { cn } from "@/lib/utils";

function tocForPath(pathname: string | null) {
  if (!pathname) return undefined;
  if (pathname.startsWith("/docs/components/") && pathname !== "/docs/components") {
    const slug = pathname.slice("/docs/components/".length).split("/")[0];
    return COMPONENT_BY_SLUG[slug]?.toc;
  }
  return STATIC_DOCS_TOC[pathname];
}

export function DocsToc() {
  const pathname = usePathname();
  const items = tocForPath(pathname);

  if (!items?.length) {
    return null;
  }

  return (
    <aside className="hidden w-[13.5rem] shrink-0 xl:block">
      <div className="sticky top-14 space-y-6 py-8 pl-6 pr-2">
        <div>
          <p className="text-xs font-semibold text-foreground">On this page</p>
          <ul className="mt-3 space-y-2 text-sm">
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
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold text-foreground">Ship with PayGlocal UI</p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Install with npm and own the source in your repo.
          </p>
          <Link
            href="/docs/installation"
            className="mt-3 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
          >
            Installation
          </Link>
        </div>
      </div>
    </aside>
  );
}
