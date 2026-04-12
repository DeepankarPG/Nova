"use client";

import Link from "next/link";
import { Github, Menu } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { PayGlocalLogo } from "@/components/docs/PayGlocalLogo";
import { ThemeToggle } from "@/components/docs/ThemeToggle";
import { getDocsNavSections } from "@/lib/docs-nav";
import { getGitHubUrl, UI_DOCS_NAME, UI_DOCS_TAGLINE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function DocsTopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const githubUrl = getGitHubUrl();
  const sections = getDocsNavSections();

  const docsActive =
    pathname === "/docs" ||
    pathname === "/docs/guidelines" ||
    pathname === "/docs/installation" ||
    pathname === "/docs/theming";
  const componentsActive = pathname === "/docs/components" || pathname.startsWith("/docs/components/");

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
          aria-controls="ui-docs-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-4 w-4" aria-hidden />
          <span className="sr-only">Open navigation</span>
        </button>
        <Link
          href="/docs"
          className="flex min-w-0 max-w-[min(100%,28rem)] items-center gap-3 truncate sm:max-w-none"
        >
          <PayGlocalLogo size="sm" className="shrink-0" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-foreground">{UI_DOCS_NAME}</span>
            <span className="hidden truncate text-xs text-muted-foreground sm:block">{UI_DOCS_TAGLINE}</span>
          </span>
        </Link>
        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          <Link href="/docs" className={navLinkClass(docsActive)}>
            Docs
          </Link>
          <Link href="/docs/components" className={navLinkClass(componentsActive)}>
            Components
          </Link>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative hidden max-w-[14rem] md:block">
          <label htmlFor="ui-docs-search" className="sr-only">
            Search documentation
          </label>
          <input
            id="ui-docs-search"
            readOnly
            placeholder="Search documentation…"
            className="h-9 w-full cursor-not-allowed rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground shadow-sm placeholder:text-muted-foreground/70"
            title="Search coming soon"
          />
        </div>
        {githubUrl ? (
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="View on GitHub"
          >
            <Github className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
        <ThemeToggle />
      </div>
      {open ? (
        <div
          id="ui-docs-mobile-nav"
          className="absolute left-0 right-0 top-14 max-h-[min(75vh,28rem)] overflow-y-auto border-b border-border bg-card p-4 shadow-lg lg:hidden"
        >
          <div className="mb-4 flex gap-2 border-b border-border pb-4">
            <Link
              href="/docs"
              onClick={() => setOpen(false)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium",
                docsActive ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              Docs
            </Link>
            <Link
              href="/docs/components"
              onClick={() => setOpen(false)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium",
                componentsActive ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              Components
            </Link>
          </div>
          <nav className="space-y-4" aria-label="Mobile documentation">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{section.label}</p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active =
                      item.href === "/docs"
                        ? pathname === "/docs"
                        : item.href === "/docs/components"
                          ? pathname === "/docs/components"
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
          </nav>
        </div>
      ) : null}
    </header>
  );
}
