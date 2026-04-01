"use client";

import Link from "next/link";
import { Github, Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { DESIGN_DOCS_NAV } from "@/components/design-system/design-docs-nav";
import {
  ATLAS_NAME,
  ATLAS_SUBTITLE,
  getAtlasGitHubUrl,
  getMainAppUrl,
} from "@/components/design-system/atlas-config";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function DesignDocsTopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const githubUrl = getAtlasGitHubUrl();
  const mainAppUrl = getMainAppUrl();

  const docsActive = pathname === "/design" || pathname === "/design/foundations";
  const componentsActive =
    pathname === "/design/components" ||
    (pathname.startsWith("/design/") && pathname !== "/design/foundations" && pathname !== "/design");

  const navLinkClass = (active: boolean) =>
    cn(
      "hidden rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:inline-flex sm:items-center",
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
    );

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls="design-docs-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-4 w-4" aria-hidden />
          <span className="sr-only">Open navigation</span>
        </button>
        <Link href="/design" className="flex min-w-0 flex-col truncate sm:flex-row sm:items-baseline sm:gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{ATLAS_NAME}</span>
          <span className="hidden truncate text-xs font-normal text-muted-foreground sm:inline">{ATLAS_SUBTITLE}</span>
        </Link>
        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Atlas sections">
          <Link href="/design" className={navLinkClass(docsActive)}>
            Docs
          </Link>
          <Link href="/design/components" className={navLinkClass(componentsActive)}>
            Components
          </Link>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative hidden max-w-[14rem] md:block">
          <label htmlFor="atlas-docs-search" className="sr-only">
            Search documentation
          </label>
          <input
            id="atlas-docs-search"
            readOnly
            placeholder="Search documentation…"
            className="h-9 w-full cursor-not-allowed rounded-lg border border-border bg-muted/40 px-3 text-xs text-muted-foreground placeholder:text-muted-foreground/70"
            title="Search is not wired yet"
          />
        </div>
        {githubUrl ? (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Atlas on GitHub"
          >
            <Github className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
        {mainAppUrl ? (
          <a
            href={mainAppUrl}
            className="hidden rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:inline-block"
          >
            Back to app
          </a>
        ) : null}
        <ThemeToggle />
      </div>
      {open ? (
        <div
          id="design-docs-mobile-nav"
          className="absolute left-0 right-0 top-14 max-h-[min(70vh,24rem)] overflow-y-auto border-b border-border bg-card p-4 shadow-lg lg:hidden"
        >
          <div className="mb-4 flex gap-2 border-b border-border pb-4">
            <Link
              href="/design"
              onClick={() => setOpen(false)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium",
                docsActive ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              Docs
            </Link>
            <Link
              href="/design/components"
              onClick={() => setOpen(false)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium",
                componentsActive ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              Components
            </Link>
          </div>
          <nav className="space-y-4" aria-label="Design documentation mobile">
            {DESIGN_DOCS_NAV.map((section) => (
              <div key={section.label}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                          onClick={() => setOpen(false)}
                          className={cn(
                            "block rounded-md px-2 py-2 text-sm",
                            active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
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
            {mainAppUrl ? (
              <a
                href={mainAppUrl}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-sm font-medium text-primary"
              >
                Back to app
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
